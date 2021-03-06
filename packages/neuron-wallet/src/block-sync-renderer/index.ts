import { BrowserWindow } from 'electron'
import path from 'path'
import { Network, EMPTY_GENESIS_HASH } from 'models/network'
import { Address } from 'database/address/address-dao'
import DataUpdateSubject from 'models/subjects/data-update'
import AddressCreatedSubject from 'models/subjects/address-created-subject'
import SyncedBlockNumberSubject from 'models/subjects/node'
import SyncedBlockNumber from 'models/synced-block-number'
import NetworksService from 'services/networks'
import AddressService from 'services/addresses'
import logger from 'utils/logger'
import CommonUtils from 'utils/common'
import MultiSign from 'models/multi-sign'

let backgroundWindow: BrowserWindow | null
let network: Network | null

const updateAllAddressesTxCount = async () => {
  const addresses = AddressService.allAddresses().map(addr => addr.address)
  await AddressService.updateTxCountAndBalances(addresses)
}

AddressCreatedSubject.getSubject().subscribe(async (addresses: Address[]) => {
  const hasUsedAddresses = addresses.some(address => address.isImporting === true)
  killBlockSyncTask()
  await createBlockSyncTask(hasUsedAddresses)
})

export const switchToNetwork = async (newNetwork: Network, reconnected = false, shouldSync = true) => {
  const previousNetwork = network
  network = newNetwork

  if (previousNetwork && !reconnected) {
    if (previousNetwork.id === newNetwork.id || previousNetwork.genesisHash === newNetwork.genesisHash) {
      // There's no actual change. No need to reconnect.
      return
    }
  }

  if (reconnected) {
    logger.info('Network:\treconnected to:', network)
  } else {
    logger.info('Network:\tswitched to:', network)
  }

  killBlockSyncTask()
  if (shouldSync) {
    await createBlockSyncTask()
  } else {
    SyncedBlockNumberSubject.getSubject().next('-1')
  }
}

export const createBlockSyncTask = async (rescan = false) => {
  await CommonUtils.sleep(2000) // Do not start too fast

  if (rescan) {
    await new SyncedBlockNumber().setNextBlock(BigInt(0))
  }

  if (backgroundWindow) {
    return
  }

  logger.info('Sync:\tstarting background process')
  backgroundWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, './preload.js')
    }
  })

  backgroundWindow.on('ready-to-show', async () => {
    if (!network) {
      network = NetworksService.getInstance().getCurrent()
    }

    const startBlockNumber = (await new SyncedBlockNumber().getNextBlock()).toString()
    SyncedBlockNumberSubject.getSubject().next(startBlockNumber)
    logger.info('Sync:\tbackground process started, scan from block #' + startBlockNumber)

    DataUpdateSubject.next({
      dataType: 'transaction',
      actionType: 'update',
    })

    if (network.genesisHash !== EMPTY_GENESIS_HASH) {
      if (backgroundWindow) {
        const lockHashes = AddressService.allLockHashes()
        const blake160s = AddressService.allAddresses().map(address => address.blake160)
        const multiSign = new MultiSign()
        const multiSignBlake160s = blake160s.map(blake160 => multiSign.hash(blake160))
        backgroundWindow.webContents.send(
          "block-sync:start",
          network.remote,
          network.genesisHash,
          lockHashes,
          startBlockNumber,
          multiSignBlake160s
        )
      }
      // re init txCount in addresses if switch network
      await updateAllAddressesTxCount()
    }
  })

  backgroundWindow.on('closed', () => {
    backgroundWindow = null
  })

  backgroundWindow.loadURL(`file://${path.join(__dirname, 'index.html')}`)
}

export const killBlockSyncTask = () => {
  if (backgroundWindow) {
    logger.info('Sync:\tkill background process')
    backgroundWindow.close()
  }
}
