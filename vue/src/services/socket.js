/**
 * socket.js — No-op stub for demo mode.
 * No WebSocket connections are made in demo mode.
 */

class SocketStub {
    on()   { return () => {} }
    off()  {}
    send() {}
    connect()    {}
    disconnect() {}
}

export const socket = new SocketStub()
export default socket
