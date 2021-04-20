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
  join_date? : Date;
}

export interface Message {
  room_idx: string;
  images?: Array<string>;
  text: string;
}

export interface PrivateMessage {
  to_idx: Number;
  user: UserInfo
  images?: string;
  text: string;
  date_time: string;
}

export interface Room {
  idx: string;
  users: Array<UserInfo>;
}