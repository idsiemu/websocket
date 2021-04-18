import { Server } from "socket.io";
import express from 'express'
import http from 'http'
import redis from 'redis'
import secret from './secret'
import { promisify } from 'util'

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

const client = redis.createClient()

const redisGetAsync = promisify(client.get).bind(client)

io.on('connect', (socket) => {
  socket.on('room', async(key: string) => {
    socket.join(key)

    const messageData = await redisGetAsync(key)

    socket.emit('history', messageData)
  })
  socket.on('message', (message: Message) => {
    saveMessage(message)
    socket.nsp.to(message.key).emit("message", message)
  })
})

const saveMessage = async(message: Message) => {
  const { key } = message;

  const data = await redisGetAsync(key)

  if(!data){
    return client.set(key, "[]")
  }

  const json = JSON.parse(data)
  json.push(message);

  client.set(key, JSON.stringify(json))
}

type Message = {
  text: string;
  date: Date;
  key: string;
  image?: string;
}