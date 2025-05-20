const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const postsRoutes = require("./routes/posts");
const Post = require("./models/post");
const path = require("path");
const  userRoutes = require("./routes/user");
const rantsRouter = require('./routes/rants');

mongoose.connect('mongodb+srv://07206844:lesteremil003@lester17.kbov0.mongodb.net/?retryWrites=true&w=majority&appName=lester17',{
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Connection failed', err));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/api/posts", postsRoutes);
app.use("/api/user", userRoutes);
app.use('/api/rants', rantsRouter);

module.exports = app;