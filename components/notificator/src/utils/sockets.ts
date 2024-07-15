import type { Socket } from 'socket.io'
import { Server } from 'socket.io'

// eslint-disable-next-line node/prefer-global/process
const PORT = Number(process.env.SOCKET_PORT)

export const io: Server = new Server()

io.on('connection', (socket: Socket) => {
  console.log('WS-клиент подключен', socket.id)

  socket.on('disconnect', () => {
    console.log('WS-клиент отключен', socket.id)
  })
})

export function startSocketServer() {
  io.listen(PORT)
  console.log(`WS-cервер запущен на http://localhost:${PORT}`)
}

export function stopSocketServer() {
  io.close()
  console.log('WS-cервер остановлен.')
}
