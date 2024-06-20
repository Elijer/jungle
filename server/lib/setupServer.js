import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const setupServer = () => {
  // ES modules compatible way to get __dirname
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  console.log("The dirname is", __dirname)

  const app = express();
  const httpServer = createServer(app);
  const pathToBuild = path.join(__dirname, '..', 'client', 'dist')
  console.log("The path to build is", pathToBuild)

  // express.static is a built-in middleware function in Express. It serves static files and is based on serve-static.
  //https://expressjs.com/en/starter/static-files.html
  app.use(express.static(pathToBuild));

  // Heroku passes the PORT env into the environment
  let port = process.env.PORT || 3000;
  console.log("THE PORT IS", port)

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