const express = require("express");
const router = express.Router();
const PostModel = require("../models/post");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error("Invalid mime type");
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, `${name}-${Date.now()}.${ext}`);
  }
});

// Create a post (with auth and image upload)
router.post(
  "",
  checkAuth,
  multer({ storage: storage }).single("image"),
  async (req, res) => {
    try {
      const url = `${req.protocol}://${req.get("host")}`;
      const post = new PostModel({
        title: req.body.title,
        content: req.body.content,
        imagePath: req.file ? `${url}/images/${req.file.filename}` : null
      });

      const result = await post.save();
      res.status(201).json({
        message: "Post added successfully",
        post: { ...result.toObject(), id: result._id }
      });
    } catch (error) {
      res.status(500).json({ message: "Creating post failed!", error: error.message });
    }
  }
);

// Update a post (with auth and image upload)
router.put(
  "/:id",
  checkAuth,
  multer({ storage: storage }).single("image"),
  async (req, res) => {
    try {
      let imagePath = req.body.imagePath;
      if (req.file) {
        const url = `${req.protocol}://${req.get("host")}`;
        imagePath = `${url}/images/${req.file.filename}`;
      }

      const post = {
        title: req.body.title,
        content: req.body.content,
        imagePath: imagePath
      };

      const result = await PostModel.updateOne({ _id: req.params.id }, post);

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Post not found!" });
      }

      res.status(200).json({
        message: "Update successful!",
        post: { ...post, id: req.params.id }
      });
    } catch (error) {
      res.status(500).json({ message: "Updating post failed!", error: error.message });
    }
  }
);

// Get paginated posts
router.get("/", async (req, res) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.currentpage;

  try {
    let postQuery = PostModel.find();
    if (pageSize && currentPage) {
      postQuery = postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
    }

    const posts = await postQuery;
    const totalPosts = await PostModel.countDocuments();

    res.status(200).json({
      message: "Posts fetched successfully!",
      posts: posts,
      totalPosts: totalPosts
    });
  } catch (error) {
    res.status(500).json({ message: "Fetching posts failed!", error: error.message });
  }
});

// Get single post by ID
router.get("/:id", async (req, res) => {
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

// Delete a post (with auth)
router.delete("/:id", checkAuth, (req, res, next) => {
  PostModel.deleteOne({ _id: req.params.id }).then(result => {
    console.log(result);
    res.status(200).json({ message: "Post deleted!" });
  }).catch(error => {
    res.status(500).json({ message: "Deleting post failed!", error: error.message });
  });
});

module.exports = router;