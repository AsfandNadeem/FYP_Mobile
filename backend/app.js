const express = require("express");
const bodyParser = require("body-parser");
const mongoose =require("mongoose");
const path = require("path");

const postsRoutes=require("./routes/posts");
const userRoutes=require("./routes/user");
const groupRoutes=require("./routes/groups");
const eventRoutes=require("./routes/events");
const adminRoutes=require("./routes/admin");
const messageRoutes = require("./routes/messages");
const advertisementRoutes = require("./routes/advertisements");

const app = express();

// mongoose.connect(process.env.MLAB_CON)
//   .then(()=>{
//     console.log('Connected to database');
//   })
//   .catch(error =>{
//     console.log(error);
//     console.log("Connection failed");
//   });
mongoose.connect("mongodb://127.0.0.1/FYP_Social")
  .then(()=>{
    console.log('Connected to database');
  })
  .catch(error =>{
    console.log(error);
    console.log("Connection failed");
  });


// mongoose.connect("mongodb://asfand:Nj3atbLzmaV5WZHJ@comsatssocial-shard-00-00-y7oqn.mongodb.net:27017,comsatssocial-shard-00-01-y7oqn.mongodb.net:27017,comsatssocial-shard-00-02-y7oqn.mongodb.net:27017/socialdb?ssl=true&replicaSet=ComsatsSocial-shard-0&authSource=admin&retryWrites=true")
//   .then(()=>{
//     console.log('Connected to database');
//   })
//   .catch(error =>{
//     console.log(error);
//     console.log("Connection failed");
//   });
// mongoose.connect("mongodb+srv://asfand:Nj3atbLzmaV5WZHJ@comsatssocial-y7oqn.mongodb.net/socialdb?retryWrites=true")
//   .then(()=>{
//     console.log('Connected to database');
//   })
//   .catch(error =>{
//     console.log(error);
//     console.log("Connection failed");
//   });z

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join("backend/images")));
app.use("/profileimgs", express.static(path.join("backend/profileimgs")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  next();
});


app.use("/api/posts",postsRoutes);
app.use("/api/user",userRoutes);
app.use("/api/groups",groupRoutes);
app.use("/api/events",eventRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/chat",messageRoutes);
app.use("/api/advertise",advertisementRoutes);


module.exports = app;
