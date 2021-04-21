import { Server } from "socket.io";
import express from 'express'
import http from 'http'
import redis from 'redis'
import secret from './secret'
import { promisify } from 'util'
import { formatMessage } from "./utils/messages";
import {JoinInfo, Message, UserInfo} from './utils/types'
import { joinUser, getCurrentUser } from './utils/users'
import { getRoomUsers, leaveRoom, setRoom } from './utils/rooms'

const app = express();

const PORT = process.env.PORT || 6001;

const server = http.createServer(app)

server.listen(PORT, () => console.log(PORT))

// 3.0 이상부터 디폴트 사용안됨
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:1234',
  }
});

const client = redis.createClient(secret)

const redisGetAsync = promisify(client.get).bind(client)

io.on('connect', (socket) => {
  socket.on('joinRoom', async(joinInfo : JoinInfo) => {
    joinInfo.userInfo.socket_idx = socket.id;
    setRoom(joinInfo.roomInfo.idx)
    joinUser(joinInfo.userInfo, joinInfo.roomInfo.idx)
    socket.join(joinInfo.roomInfo.idx)

    socket.emit('message', formatMessage(joinInfo.userInfo.name, '환영합니다.', new Date()));

    socket.broadcast.to(joinInfo.roomInfo.idx).emit('message', formatMessage(joinInfo.userInfo.name, `${joinInfo.userInfo.name} 님이 ${joinInfo.roomInfo.name}방에 입장하셨습니다`, new Date()));

    io.to(joinInfo.roomInfo.idx).emit('roomUsers', {
      users: getRoomUsers(joinInfo.roomInfo.idx)
    });
    const messagesData = await redisGetAsync(joinInfo.roomInfo.idx)
    if(messagesData){
      const messages : Array<{message: Message, user: UserInfo}> = JSON.parse(messagesData)
      const filter = messages.filter(list => list.message.date >= joinInfo.userInfo.join_date)
      socket.emit('history', filter)
    }
  })

  socket.on('chatMessage', (message: Message) => {
    const user : UserInfo | null = getCurrentUser(socket.id, message.room_idx)
    if(user){
      saveMessage(message, user) // redis 에 메시지 인서트
      io.to(message.room_idx).emit("message", formatMessage(user.name, message.text, message.date, user.avatar, message.images ))
    }
  })

  socket.on('disconnect', () => {
    const room_idx = leaveRoom(socket.id);
    io.to(room_idx).emit('roomUsers', {
      users: getRoomUsers(room_idx)
    });
  })
})
const saveMessage = async(message: Message, user : UserInfo) => {
  const room_idx = message.room_idx

  const data = await redisGetAsync(room_idx)

  if(data){
    const json = JSON.parse(data)
    json.push({message, user});
    // redis에 각 방마다 40개의 메시지를 가지고 있는다
    if(json.length > 50){
      json.shift()
    }
    client.set(room_idx, JSON.stringify(json))
  }else{
    const json = [{message, user}]
    client.set(room_idx, JSON.stringify(json))
  }
  // api 로 실제 디비에 인스트요청 아마 파이어베이스
}