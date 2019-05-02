import React, { useEffect, useReducer } from 'react'
import { useTranslation } from 'react-i18next'
import { history } from 'components/Router'
import NeuronWalletContext from 'contexts/NeuronWallet'

import UILayer, { NetworksMethod, TransactionsMethod, WalletsMethod } from 'services/UILayer'
import { Channel, ConnectStatus, Routes } from 'utils/const'
import { initProviders, ProviderActions, ProviderDispatch, reducer } from './reducer'

const withProviders = (Comp: React.ComponentType<{ providerDispatch: ProviderDispatch }>) => (
  props: React.Props<any>,
) => {
  const [providers, dispatch] = useReducer(reducer, initProviders)
  const { chain } = providers
  const [, i18n] = useTranslation()
  useEffect(() => {
    UILayer.on(
      Channel.Initiate,
      (
        _e: Event,
        args: ChannelResponse<{
          networks: any
          activeNetworkId: string
          wallets: any
          activeWallet: any
          locale: string
        }>,
      ) => {
        if (args.status) {
          const { locale, networks, activeNetworkId: networkId, wallets, activeWallet: wallet } = args.result
          if (locale !== i18n.language) {
            i18n.changeLanguage(locale)
          }
          if (networks.length) {
            dispatch({
              type: ProviderActions.Initiate,
              payload: { networks, networkId, wallet, wallets },
            })
          }
        } else {
          // TODO: better prompt
          window.alert(i18n.t('messages.failed-to-initiate,-please-reopen-Neuron'))
          window.close()
        }
      },
    )

    UILayer.on(Channel.NavTo, (_e: Event, args: ChannelResponse<{ router: string }>) => {
      history.push(args.result.router)
    })

    UILayer.on(Channel.GetBalance, (_e: Event, args: ChannelResponse<number>) => {
      if (args.status) {
        dispatch({
          type: ProviderActions.Wallet,
          payload: { balance: args.result },
        })
      }
    })

    UILayer.on(Channel.Transactions, (_e: Event, method: TransactionsMethod, args: ChannelResponse<any>) => {
      if (args.status) {
        switch (method) {
          case TransactionsMethod.GetAll: {
            dispatch({
              type: ProviderActions.Chain,
              payload: { transactions: { ...chain.transactions, ...args.result } },
            })
            break
          }
          case TransactionsMethod.Get: {
            dispatch({
              type: ProviderActions.Chain,
              payload: { transaction: { ...chain.transaction, ...args.result } },
            })
            break
          }
          default: {
            break
          }
        }
      } else {
        // TODO: handle error
      }
    })

    UILayer.on(Channel.Wallets, (_e: Event, method: WalletsMethod, args: ChannelResponse<any>) => {
      if (args.status) {
        switch (method) {
          case WalletsMethod.ImportMnemonic:
          case WalletsMethod.Update: {
            const content =
              method === WalletsMethod.ImportMnemonic
                ? i18n.t('messages.wallet-imported-successfully', { name: args.result.name })
                : i18n.t('messages.wallet-updated-successfully', { name: args.result.name })
            const time = new Date().getTime()
            dispatch({
              type: ProviderActions.AddMessage,
              payload: {
                category: 'success',
                title: 'Wallet',
                content,
                actions: [],
                time,
                dismiss: () => {
                  dispatch({
                    type: ProviderActions.DismissMessage,
                    payload: time,
                  })
                },
              },
            })
            // TODO: so imperative, better refactor
            history.push(Routes.SettingsWallets)
            break
          }
          case WalletsMethod.GetAll: {
            dispatch({
              type: ProviderActions.Settings,
              payload: { wallets: args.result },
            })
            break
          }
          case WalletsMethod.GetActive: {
            dispatch({
              type: ProviderActions.Wallet,
              payload: args.result,
            })
            break
          }
          case WalletsMethod.Delete: {
            dispatch({
              type: ProviderActions.Settings,
              payload: { wallets: args.result.allWallets },
            })
            dispatch({
              type: ProviderActions.Wallet,
              payload: args.result.activeWallet,
            })
            break
          }
          default: {
            break
          }
        }
      } else {
        const time = new Date().getTime()
        if (method === WalletsMethod.GetActive) {
          // don't show this error in wizard view
          return
        }

        dispatch({
          type: ProviderActions.AddMessage,
          payload: {
            category: 'danger',
            title: 'Wallet',
            content: args.msg,
            time,
            actions: [],
            dismiss: () => {
              dispatch({
                type: ProviderActions.DismissMessage,
                payload: time,
              })
            },
          },
        })
      }
    })

    UILayer.on(Channel.Networks, (_e: Event, method: NetworksMethod, args: ChannelResponse<any>) => {
      if (args.status) {
        switch (method) {
          case NetworksMethod.GetAll: {
            dispatch({
              type: ProviderActions.Settings,
              payload: { networks: args.result },
            })
            break
          }
          case NetworksMethod.ActiveId: {
            dispatch({
              type: ProviderActions.Chain,
              payload: { networkId: args.result },
            })
            break
          }
          case NetworksMethod.Create:
          case NetworksMethod.Update: {
            // TODO: so imperative, better refactor
            history.push(Routes.SettingsNetworks)
            break
          }
          case NetworksMethod.Activate: {
            dispatch({
              type: ProviderActions.Chain,
              payload: { network: args.result },
            })
            break
          }
          case NetworksMethod.Status: {
            dispatch({
              type: ProviderActions.Chain,
              payload: {
                connectStatus: args.result ? ConnectStatus.Online : ConnectStatus.Offline,
              },
            })
            break
          }
          default: {
            break
          }
        }
      } else {
        const time = new Date().getTime()
        dispatch({
          type: ProviderActions.AddMessage,
          payload: {
            category: 'danger',
            title: 'Networks',
            content: args.msg,
            time,
            actions: [
              {
                label: 'view',
                action: Routes.SettingsNetworks,
              },
            ],
            dismiss: () => {
              dispatch({
                type: ProviderActions.DismissMessage,
                payload: time,
              })
            },
          },
        })
      }
    })
  }, [i18n, chain])

  return (
    <NeuronWalletContext.Provider value={providers}>
      <Comp {...props} providerDispatch={dispatch} />
    </NeuronWalletContext.Provider>
  )
}

export default withProviders
