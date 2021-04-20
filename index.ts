import { Server } from "socket.io";
import express from 'express'
import http from 'http'
import redis from 'redis'
import secret from './secret'
import { promisify } from 'util'
import { formatMessage } from "./utils/messages";
import {JoinInfo, Message, PrivateMessage, UserInfo} from './utils/types'
import { joinUser, getCurrentUser } from './utils/users'
import { getRoomUsers } from './utils/rooms'

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
    joinUser(joinInfo.userInfo, joinInfo.roomInfo.idx)
    socket.join(joinInfo.roomInfo.idx)

    socket.emit('message', formatMessage(joinInfo.userInfo.name, '환영합니다.'));

    socket.broadcast.to(joinInfo.roomInfo.idx).emit('message', formatMessage(joinInfo.userInfo.name, `${joinInfo.userInfo.name} 님이 ${joinInfo.roomInfo.name}방에 입장하셨습니다`));

    io.to(joinInfo.roomInfo.idx).emit('roomUsers', {
      users: getRoomUsers(joinInfo.roomInfo.idx)
    });
    // 참여 상태인 유저를 찾아서 기존에 있던 히스토리를 다시 보여준다.
    // const usersData = await redisGetAsync(`${joinInfo.roomInfo.idx.toString()}-users`)
    // const messagesData = await redisGetAsync(`${joinInfo.roomInfo.idx.toString()}-messages`)
    // if(usersData){
    //   const usersJson = JSON.parse(usersData)
    //   usersJson.some((user: UserInfo) => {
    //     if(user.idx === joinInfo.userInfo.idx){
    //       if(user.join_date) {
    //         const messagesJson = JSON.parse(messagesData)

    //       }
    //       return true
    //     }
    //   })
    // }else{
    //   const json = JSON.stringify(joinInfo.userInfo)
    //   client.lpush(`${joinInfo.roomInfo.idx.toString()}-users`, json)
    // }
    // if(messageData){
    //   const json = JSON.parse(messageData)
    //   socket.emit('history', json)
    // }
    
  })

  socket.on('chatMessage', (message: Message) => {
    const user : UserInfo | null = getCurrentUser(socket.id, message.room_idx)
    // saveMessage(message) // redis 에 메시지 인서트
    // socket.broadcast.to(message.room_idx.toString()).emit('message', message);
    if(user){
      io.to(message.room_idx).emit("message", formatMessage(user.name, message.text))
    }
  })

  socket.on('disconnect', () => {

  })

  
})
const saveMessage = async(message: Message) => {
  const room_idx = message.room_idx.toString();

  const data = await redisGetAsync(room_idx)

  if(!data){
    client.set(room_idx, "[]")
    return
  }

  const json = JSON.parse(data)
  json.push(message);

  client.set(room_idx, JSON.stringify(json))
}