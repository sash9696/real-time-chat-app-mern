//Real time chat app

//MERN
//websockets layer for real time case scenarios
//redux toolkit
//tailwind css

//Requirements/Features

//Real-time chat => users can send an recieve messages in real time
//User authentication: users can sign up, login, logout using jwt and also provide google auth
//Responsive design: website should be optimized for different screen and sizes
//Groups creation: users can create chat rooms and invite others to join
//Notifications: user will reciev notifications on new messages
//Emojis
//Profile page: users cn update their profile details like avatar , display name etc
//Users can create a room to chat with others
//Search functionality

import express from "express";
import dotenv from "dotenv/config";
import mongoDBConnect from "./mongoDB/connections.js";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/user.js";
import chatRoutes from "./routes/chat.js";
import messageRoutes from "./routes/message.js";
import * as Server from "socket.io";

//routes
//user routes
//chat routes
// message routes

const app = express();
const corsConfig = {
  origin: process.env.BASE_URL,
  credentials: true,
};
const PORT = process.env.PORT || 8000;
app.use(express.json());

app.use(cors(corsConfig));
app.use("/", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
mongoose.set("strictQuery", false);
mongoDBConnect();
const server = app.listen(PORT, () => {
  console.log(`Server Listening at PORT - ${PORT}`);
});
const io = new Server.Server(server, {
  pingTimeout: 60000,
  cors: {
    // origin: "http://localhost:3000",
    origin: "http://localhost:5173",

    
},
});
io.on("connection", (socket) => {
  socket.on("setup", (userData) => {
    socket.join(userData.id);
    socket.emit("connected");
  });
  socket.on("join room", (room) => {
    socket.join(room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieve) => {
    var chat = newMessageRecieve.chatId;
    if (!chat.users) console.log("chats.users is not defined");
    chat.users.forEach((user) => {
      if (user._id == newMessageRecieve.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieve);
    });
  });
});
