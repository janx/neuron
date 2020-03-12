import React from 'react'
import getCompensationPeriod from 'utils/getCompensationPeriod'
import { WITHDRAW_EPOCHS, CompensationPeriod } from 'utils/const'
import { uniformTimeFormatter } from 'utils/formatters'
import styles from './compensationPeriodTooltip.module.scss'

const HOUR = 3_600_000
const HOURS_PER_EPOCH = 4 * HOUR

const formatTime = (timestamp: number) => {
  return uniformTimeFormatter(timestamp).split(' ')[0]
}

export interface CompensationPeriodTooltipProps {
  currentEpochTimestamp: number
  currentEpochValue: number
  endEpochValue: number
}

const CompensationPeriodTooltip = ({
  currentEpochTimestamp,
  currentEpochValue,
  endEpochValue,
}: CompensationPeriodTooltipProps) => {
  const {
    pastEpochs,
    leftTime: { totalHours },
  } = getCompensationPeriod({
    currentEpochValue,
    endEpochValue,
  })
  const endEpochTimestamp = totalHours * HOUR + currentEpochTimestamp
  // TODO: the time in the design is ambiguous, more discussion needed
  const suggestStartEpochTimestamp =
    endEpochTimestamp - (1 - CompensationPeriod.SUGGEST_START) * WITHDRAW_EPOCHS * HOURS_PER_EPOCH
  const requestedStartEpochTimestamp =
    endEpochTimestamp - (1 - CompensationPeriod.REQUEST_START) * WITHDRAW_EPOCHS * HOURS_PER_EPOCH
  let stage = 'normal'
  if (currentEpochTimestamp > requestedStartEpochTimestamp) {
    stage = 'requested'
  } else if (currentEpochTimestamp > suggestStartEpochTimestamp) {
    stage = 'suggested'
  }

  return (
    <div className={styles.container} data-stage={stage}>
      <div className={styles.epochs}>
        <div className={styles.title}>Epoch</div>
        <div className={styles.percents}>
          <span>Progress</span>
          <span>{`${pastEpochs}/${WITHDRAW_EPOCHS}`}</span>
        </div>
        <div className={styles.current}>
          <span>Current</span>
          <span>{currentEpochValue}</span>
        </div>
        <div className={styles.end}>
          <span>End</span>
          <span>{endEpochValue}</span>
        </div>
      </div>
      <div className={styles.divider} />
      <div className={styles.times}>
        <div className={styles.normal}>Normal</div>
        <div className={styles.suggested}>
          <div className={styles.time}>
            {`${formatTime(suggestStartEpochTimestamp)} - ${formatTime(requestedStartEpochTimestamp)}`}
          </div>
          <div>blah</div>
        </div>
        <div className={styles.requested}>
          <div className={styles.time}>
            {`${formatTime(requestedStartEpochTimestamp)} - ${formatTime(endEpochTimestamp)}`}
          </div>
          <div>blah</div>
        </div>
      </div>
    </div>
  )
}

CompensationPeriodTooltip.displayName = 'CompensationPeriodTooltip'
export default CompensationPeriodTooltip
