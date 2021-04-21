import moment from 'moment'

export const formatMessage = (name: string, text: string, date: Date, avatar? : string, images? : Array<string>) => {
  return {
    avatar,
    name,
    text,
    images,
    date_time: moment(date).format('h:mm a')
  }
}