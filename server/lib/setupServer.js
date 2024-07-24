import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import path from 'path';
import { dirname } from './utilities.js';
const setupServer = () => {
  // ES modules compatible way to get __dirname
  const app = express();
  const httpServer = createServer(app);
  const pathToBuild = path.join(dirname(), '../../', 'client', 'dist')

  // express.static is a built-in middleware function in Express. It serves static files and is based on serve-static.
  //https://expressjs.com/en/starter/static-files.html
  app.use(express.static(pathToBuild));

  // Heroku passes the PORT env into the environment
  let port = process.env.PORT || 3000;

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  return { port, io, httpServer}

}

export default setupServer;