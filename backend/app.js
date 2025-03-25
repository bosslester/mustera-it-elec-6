const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const postsRoutes = require("./routes/posts");
const Post = require("./models/post");

mongoose.connect("mongodb+srv://07206844:lesteremil003@lester17.kbov0.mongodb.net/?retryWrites=true&w=majority&appName=lester17")
    .then(() => {
        console.log("✅ Connected to MongoDB");
    })
    .catch((err) => {
        console.error("❌ MongoDB connection failed:", err);
    });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS, PUT");
    next();
});

app.use("/api/posts", postsRoutes);
module.exports = app;

app.get("/api/posts", (req, res, next) => {
    Post.find()
        .then(posts => {
            res.status(200).json({
                message: "Posts fetched successfully!",
                posts: posts
            });
        })
        .catch(error => {
            res.status(500).json({ message: "Fetching posts failed!", error: error.message });
        });
});

app.get("/api/posts/:id", (req, res, next) => {
    Post.findById(req.params.id)
        .then(post => {
            if (!post) {
                return res.status(404).json({ message: "Post not found!" });
            }
            res.status(200).json(post);
        })
        .catch(error => {
            res.status(500).json({ message: "Fetching post failed!", error: error.message });
        });
});
app.post("/api/posts", (req, res, next) => {
    const post = new Post({  
        title: req.body.title,
        content: req.body.content
    });

    post.save()
        .then(result => {
            res.status(201).json({
                message: "Post added successfully",
                postId: result._id
            });
        })
        .catch(err => {
            res.status(500).json({ message: "Creating a post failed!", error: err });
        });
});

app.put("/api/posts/:id", (req, res, next) => {
    Post.findByIdAndUpdate(req.params.id, 
        { title: req.body.title, content: req.body.content }, 
        { new: true }
    ).then(updatedPost => {
        if (!updatedPost) {
            return res.status(404).json({ message: "Post not found!" });
        }
        res.status(200).json({ message: "Post updated successfully!", post: updatedPost });
    }).catch(error => {
        res.status(500).json({ message: "Updating post failed!", error: error.message });
    });
});

app.delete("/api/posts/:id", (req, res, next) => {
    Post.deleteOne({ _id: req.params.id })
        .then(result => {
            if (result.deletedCount > 0) {
                res.status(200).json({ message: "Post deleted" });
            } else {
                res.status(404).json({ message: "Post not found" });
            }
        })
        .catch(err => {
            res.status(500).json({ message: "Deleting post failed!", error: err });
        });
});

module.exports = app;