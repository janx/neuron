import { WITHDRAW_EPOCHS } from 'utils/const'

export interface CompensationPeriodParams {
  currentEpochValue: number
  endEpochValue: number
}

const getCompensationPeriod = ({ currentEpochValue, endEpochValue }: CompensationPeriodParams) => {
  const pastEpochs = currentEpochValue - endEpochValue + WITHDRAW_EPOCHS
  const totalHours = Math.ceil((WITHDRAW_EPOCHS - pastEpochs) * 4)
  const leftDays = Math.floor(totalHours / 24)
  const leftHours = totalHours % 24

  return {
    pastEpochs: +pastEpochs.toFixed(1),
    leftTime: {
      totalHours,
      days: leftDays,
      hours: leftHours,
    },
  }
}
export default getCompensationPeriod
