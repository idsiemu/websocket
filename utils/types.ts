export interface JoinInfo {
  roomInfo : RoomInfo;
  userInfo : UserInfo
}

export interface RoomInfo {
  idx: string,
  name: string
}

export interface UserInfo {
  socket_idx? : string;
  idx: Number;
  name : string;
  avatar? : string;
  join_date : Date;
}

export interface Message {
  room_idx: string;
  images?: Array<string>;
  text: string;
  date: Date;
}
export interface Room {
  idx: string;
  users: Array<UserInfo>;
}