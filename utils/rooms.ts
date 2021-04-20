import { Room } from './types'

export const rooms : Array<Room> = []

export const getRoomUsers = (room_idx : string) => {
  return rooms.find(room => room.idx === room_idx)?.users
}