const express = require('express');
const router = express.Router();
const PostModel = require("../models/post");

router.post("/api/posts", async (req, res) => {  
    try {
        const post = new PostModel({  
            title: req.body.title,  
            content: req.body.content  
        });

        const result = await post.save();  
        res.status(201).json({  
            message: "Post added successfully",  
            postId: result._id  
        });
    } catch (error) {
        res.status(500).json({ message: "Creating post failed!", error: error.message });
    }
});  

router.put("/api/posts/:id", async (req, res) => {  
    try {
        const result = await PostModel.updateOne(
            { _id: req.params.id },
            { title: req.body.title, content: req.body.content }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Post not found!" });
        }

        res.status(200).json({ message: "Update Successful!" });
    } catch (error) {
        res.status(500).json({ message: "Updating post failed!", error: error.message });
    }
});  

router.get("/api/posts", async (req, res) => {  
    try {
        const documents = await PostModel.find();
        res.status(200).json({  
            message: "Posts fetched successfully",  
            posts: documents  
        });
    } catch (error) {
        res.status(500).json({ message: "Fetching posts failed!", error: error.message });
    }
});  
router.get("/api/posts/:id", async (req, res) => {  
    try {
        const post = await PostModel.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found!" });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: "Fetching post failed!", error: error.message });
    }
});  

router.delete("/api/posts/:id", async (req, res) => {  
    try {
        const result = await PostModel.deleteOne({ _id: req.params.id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Post not found!" });
        }

        res.status(200).json({ message: "Post deleted!" });
    } catch (error) {
        res.status(500).json({ message: "Deleting post failed!", error: error.message });
    }
});  

module.exports = router;