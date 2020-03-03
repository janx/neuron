import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import UpdateTokenInfoDialog from 'components/UpdateTokenInfoDialog'

const stories = storiesOf('Update Token Info Dialog', module)

stories.add('Basic', () => {
  return (
    <UpdateTokenInfoDialog
      uuid="uuid"
      name="name"
      symbol="symbol"
      decimal="12"
      onSubmit={info => {
        return new Promise(resolve => {
          action('submit')(info)
          resolve(true)
        })
      }}
      onCancel={() => action('cancel')()}
      onUUIDCopy={action('copy')}
    />
  )
})
