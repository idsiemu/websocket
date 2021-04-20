import { UserInfo } from './types'
import { rooms } from './rooms'

export const joinUser = (userInfo: UserInfo, room_idx: string) => {
  rooms.some(room => {
    if(room.idx === room_idx){
      userInfo.join_date = new Date()
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
  if(currentUser){
    return currentUser
  }
  return null
}
// export const leaveUser = (socket_idx : string) => {
//   const index = users.findIndex(user => user.socket_idx === socket_idx);
//   if(index !== -1) {
//       return users.splice(index, 1)[0];
//   }
// }