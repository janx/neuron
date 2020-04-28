import SyncedBlockNumber from 'models/synced-block-number'
import { createBlockSyncTask, killBlockSyncTask } from 'block-sync-renderer'
import ChainCleaner from 'database/chain/cleaner'
import { ResponseCode } from 'utils/const'
import AddressDao from 'database/address/address-dao'

export default class SyncController {
  public async clearCache() {
    killBlockSyncTask()
    AddressDao.resetAddresses()
    await ChainCleaner.clean()
    await createBlockSyncTask(true)

    return {
      status: ResponseCode.Success,
      result: true
    }
  }

  public async restart() {
    killBlockSyncTask()
    await createBlockSyncTask(true)

    return {
      status: ResponseCode.Success,
      result: true
    }
  }

  public async currentBlockNumber() {
    const blockNumber = new SyncedBlockNumber()
    const current: bigint = await blockNumber.getNextBlock()

    return {
      status: ResponseCode.Success,
      result: {
        currentBlockNumber: current.toString(),
      },
    }
  }
}
