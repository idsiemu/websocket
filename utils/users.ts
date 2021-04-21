import { UserInfo } from './types'
import { rooms } from './rooms'

export const users: Array<UserInfo> = []

export const joinUser = (userInfo: UserInfo, room_idx: string) => {
  rooms.some(room => {
    if(room.idx === room_idx){
      const index = room.users.findIndex(user => user.idx === userInfo.idx)
      if(index === -1){
        room.users.push(userInfo)
        room.users.sort(function(a, b) {
          return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
        });
      }else{
        room.users[index] = userInfo
      }
      return true
    }
  })
}

export const getCurrentUser = (socket_idx: string, room_idx: string) : (UserInfo | null) => {
  let currentUser = null
  rooms.some(room => {
    if(room.idx === room_idx){
      room.users.some(user => {
        if(user.socket_idx === socket_idx){
          currentUser = user
          return true
        }
      })
      return true
    }
  })
  return currentUser
}