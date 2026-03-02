import connectDB from '../Share/config/db';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import http from 'http';
import { initializeSocketServer } from '../websocket/socket.server';

dotenv.config();

let dummyServer: http.Server;

beforeAll(async () => {
    await connectDB();

    // Initialize dummy socket server for tests to prevent "Socket.IO server not initialized" errors
    dummyServer = http.createServer();
    initializeSocketServer(dummyServer);
});

afterAll(async () => {
    await mongoose.connection.close();

    // Close dummy server if exists
    if (dummyServer) {
        dummyServer.close();
    }
});
