import { Room } from './types'

export const rooms : Array<Room> = []

export const setRoom = (room_idx : string) => {
  let cnt = 0
  rooms.some(room => {
    if(room.idx === room_idx){
      cnt++
    }
    return true
  })
  if(cnt === 0){
    rooms.push({idx: room_idx, users: []});
    rooms.sort(function (a, b) {
      if (a.idx > b.idx) {
        return 1;
      }
      if (a.idx < b.idx) {
        return -1;
      }
      return 0;
    });
  }
}

export const getRoomUsers = (room_idx : string) => {
  return rooms.find(room => room.idx === room_idx)?.users
}

export const leaveRoom = (socket_idx : string) : string => {
  let room_idx = '';
  rooms.some(room => {
    const index = room.users.findIndex(user => user.socket_idx === socket_idx)
    if(index !== -1){
      room_idx = room.idx
      room.users.splice(index, 1)
      return true
    }
  })
  return room_idx
}