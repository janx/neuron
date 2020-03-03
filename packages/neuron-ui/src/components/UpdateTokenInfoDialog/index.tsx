import React, { useReducer, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import TextField from 'widgets/TextField'
import Button from 'widgets/Button'
import { ReactComponent as Copy } from 'widgets/Icons/Copy.svg'
import styles from './updateTokenInfoDialog.module.scss'

export interface BasicInfo {
  name: string
  symbol: string
  decimal: string | undefined
}

export interface TokenInfo extends BasicInfo {
  uuid: string
}

export interface UpdateTokenInfoDialogProps extends TokenInfo {
  onSubmit: (info: TokenInfo) => Promise<boolean>
  onCancel: () => void
  onUUIDCopy: () => void
}

const fields: (keyof BasicInfo)[] = ['name', 'symbol', 'decimal']

const reducer: React.Reducer<BasicInfo, { type: keyof BasicInfo; payload: string }> = (state, action) => {
  switch (action.type) {
    case 'name': {
      return { ...state, name: action.payload }
    }
    case 'symbol': {
      return { ...state, symbol: action.payload }
    }
    case 'decimal': {
      return { ...state, decimal: action.payload }
    }
    default: {
      return state
    }
  }
}

const UpdateTokenInfoDialog = ({
  uuid,
  name = '',
  symbol = '',
  decimal = '',
  onSubmit,
  onUUIDCopy,
  onCancel,
}: UpdateTokenInfoDialogProps) => {
  const [t] = useTranslation()
  const [info, dispatch] = useReducer(reducer, { name, symbol, decimal })

  const onCopy = useCallback(() => {
    window.navigator.clipboard.writeText(uuid)
    onUUIDCopy()
  }, [uuid])

  const onInput = useCallback(
    e => {
      const {
        value: payload,
        dataset: { field: type },
      } = e.target
      dispatch({
        type,
        payload,
      })
    },
    [dispatch]
  )

  const onConfirm = useCallback(() => {
    onSubmit({ ...info, uuid })
  }, [uuid, info, onSubmit, onUUIDCopy])

  const onDismiss = useCallback(() => {
    onCancel()
  }, [onCancel])

  const onDialogClick = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation()
    e.preventDefault()
  }, [])

  return (
    <div role="presentation" className={styles.container} onClick={onDismiss}>
      <div role="presentation" className={styles.dialogContainer} onClick={onDialogClick}>
        <div className={styles.title}>{t('s-udt.update-dialog.title')}</div>
        <div className={styles.uuidContainer}>
          UUID:
          <span>{uuid}</span>
          <button
            type="button"
            aria-label={t('s-udt.update-dialog.copy-uuid')}
            title={t('s-udt.update-dialog.copy-uuid')}
            onClick={onCopy}
          >
            <Copy />
          </button>
        </div>
        {fields.map(key => (
          <TextField
            key={key}
            label={t(`s-udt.update-dialog.${key}`)}
            onChange={onInput}
            field={key}
            value={info[key]}
          />
        ))}

        <div className={styles.footer}>
          <Button type="submit" label={t('s-udt.update-dialog.update')} onClick={onConfirm} />
        </div>
      </div>
    </div>
  )
}

UpdateTokenInfoDialog.displayName = 'UpdateTokenInfoDialog'

export default UpdateTokenInfoDialog
