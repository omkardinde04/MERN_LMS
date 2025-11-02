import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket = null;

export const getSocket = (token) => {
    if (!socket || !socket.connected) {
        socket = io(SOCKET_URL, {
            auth: {
                token: token
            },
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('✅ Socket.io connected:', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('❌ Socket.io disconnected');
        });

        socket.on('connect_error', (error) => {
            console.error('Socket.io connection error:', error);
        });
    }

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log('🔌 Socket.io disconnected');
    }
};

