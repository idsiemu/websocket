import moment from 'moment'

export const formatMessage = (name: string, text: string) => {
  return {
    name,
    text,
    date_time: moment().format('h:mm a')
  }
}