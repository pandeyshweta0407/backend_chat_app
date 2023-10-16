const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes"); 
const messageRoutes = require("./routes/messagesRoute");
const socket = require("socket.io");
const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
}).then(()=>{
    console.log("DB Connected");
}).catch((error)=>{
    console.log( error.message); 
});


app.use("/api/auth" , userRoutes);
app.use("/api/messages" , messageRoutes);

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, ()=>{
  console.log(`Server started on PORT ${process.env.PORT}`);
});


const io = socket(server,{
    cors:{
        origin:process.env.ORIGIN,
        Credentials:true,
    },
});

global.onlineUsers=new Map();

io.on("connection" , (socket)=>{
    global.chatSocket = socket;
    socket.on("add-user",(userId)=>{
        onlineUsers.set(userId,socket.id);
    });
    socket.on("send-msg" , (data)=>{
        const sendUserSocket = onlineUsers.get(data.io);
        if(sendUserSocket){
            socket.to(sendUserSocket).emit("msg-recieve" ,data.msg);
        }
    });
});
