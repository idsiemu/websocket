import { Server } from "socket.io";
import express from 'express'
import http from 'http'

const app = express();

const PORT = process.env.PORT || 6001;

const server = http.createServer(app)

server.listen(PORT, () => console.log(PORT))

// 3.0 이상부터 디폴트 사용안됨
const io = new Server(server);

io.on('connect', (socket) => {
  socket.on('room', (key: string) => {
    socket.join(key)
  })
  socket.on('message', (message: Message) => {
    socket.nsp.to(message.key).emit("message", message)
  })
})

type Message = {
  text: string;
  date: Date;
  key: string;
  image?: string;
}