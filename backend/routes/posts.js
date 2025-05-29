const express = require('express');
const multer = require('multer');
const router = express.Router();
const Post = require('../models/post');
const checkAuth = require('../middleware/check-auth');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('_');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  }
});

// GET all posts
router.get('', (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const searchQuery = req.query.search;
  
  let postQuery = Post.find();
  
  if (searchQuery) {
    postQuery = postQuery.find({
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { content: { $regex: searchQuery, $options: 'i' } }
      ]
    });
  }

  let fetchedPosts;

  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }

  postQuery
    .then(documents => {
      fetchedPosts = documents;
      return Post.countDocuments();
    })
    .then(count => {
      res.status(200).json({
        message: 'Posts fetched successfully!',
        posts: fetchedPosts,
        maxPosts: count
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Fetching Posts Failed!"
      });
    });
});

// GET single post
router.get('/:id', (req, res, next) => {
  Post.findById(req.params.id)
    .then(post => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({ message: 'Post not found!' });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: "Fetching Posts Failed!"
      });
    });
});

// POST new post
router.post('', checkAuth, multer({storage: storage}).single("image"), (req, res, next) => {
  const url = req.protocol + '://' + req.get("host");
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId
  });
  
  post.save()
    .then(createdPost => {
      res.status(201).json({
        message: 'Post added successfully',
        post: {
          ...createdPost.toObject(),
          id: createdPost._id
        }
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Creating A Post Failed!"
      });
    });
});

// PUT update post
router.put("/:id", checkAuth, multer({storage: storage}).single("image"), (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + '://' + req.get("host");
    imagePath = url + "/images/" + req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  });
  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post)
    .then(result => {
      if (result.modifiedCount > 0) {
        res.status(200).json({
          message: "Update successful!",
          imagePath: imagePath
        });
      } else {
        res.status(401).json({ message: "Not authorized!" });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: "Couldn't Update Post!"
      });
    });
});

// DELETE post
router.delete('/:id', checkAuth, (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then(result => {
      if (result.deletedCount > 0) {
        res.status(200).json({ message: 'Post deleted!' });
      } else {
        res.status(401).json({ message: 'Not authorized!' });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: "Deletion Not Done!"
      });
    });
});

// Temporary route to delete all posts (remove this after use)
router.delete('/all', checkAuth, (req, res, next) => {
  Post.deleteMany({})
    .then(() => {
      res.status(200).json({ message: 'All posts deleted successfully!' });
    })
    .catch(error => {
      res.status(500).json({
        message: 'Deleting all posts failed!',
        error: error.message
      });
    });
});

// Add a comment to a post
router.post('/:id/comments', checkAuth, (req, res) => {
  const comment = {
    text: req.body.text,
    creator: req.userData.userId,
    createdAt: new Date(),
    reactions: { like: 0, love: 0, laugh: 0, sad: 0 }
  };
  Post.findById(req.params.id)
    .then(post => {
      if (!post) return res.status(404).json({ message: 'Post not found!' });

      post.comments.push(comment);

      return post.save(); // Explicitly save the post after adding the comment
    })
    .then(updatedPost => {
      // Find the newly added comment in the updated post to return it
      const newComment = updatedPost.comments[updatedPost.comments.length - 1];
      res.status(201).json({ message: 'Comment added!', comment: newComment });
    })
    .catch(error => {
      console.error('Adding comment failed:', error);
      res.status(500).json({ message: 'Adding comment failed!' });
    });
});

// Delete a comment from a post
router.delete('/:postId/comments/:commentId', checkAuth, (req, res) => {
  Post.findByIdAndUpdate(
    req.params.postId,
    { $pull: { comments: { _id: req.params.commentId, creator: req.userData.userId } } },
    { new: true }
  )
    .then(post => {
      if (!post) return res.status(404).json({ message: 'Post or comment not found!' });
      res.status(200).json({ message: 'Comment deleted!' });
    })
    .catch(() => res.status(500).json({ message: 'Deleting comment failed!' }));
});

// React to a post (toggle and switch)
router.post('/:id/reactions', checkAuth, async (req, res) => {
  const { type } = req.body; // type: like, love, laugh, sad
  const userId = req.userData.userId;
  if (!['like', 'love', 'laugh', 'sad', 'angry'].includes(type)) {
    return res.status(400).json({ message: 'Invalid reaction type!' });
  }
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found!' });
    // Find if user already reacted
    const existing = post.userReactions.find(r => r.user.toString() === userId);
    if (existing) {
      if (existing.type === type) {
        // Remove reaction
        post.reactions[type] = Math.max(0, post.reactions[type] - 1);
        post.userReactions = post.userReactions.filter(r => r.user.toString() !== userId);
      } else {
        // Switch reaction
        post.reactions[existing.type] = Math.max(0, post.reactions[existing.type] - 1);
        post.reactions[type] = (post.reactions[type] || 0) + 1;
        existing.type = type;
      }
    } else {
      // Add new reaction
      post.reactions[type] = (post.reactions[type] || 0) + 1;
      post.userReactions.push({ user: userId, type });
    }
    await post.save();
    res.status(200).json({ message: 'Reaction updated!', reactions: post.reactions, userReaction: post.userReactions.find(r => r.user.toString() === userId)?.type || null });
  } catch (e) {
    res.status(500).json({ message: 'Reacting to post failed!' });
  }
});

// React to a comment (toggle and switch)
router.post('/:postId/comments/:commentId/reactions', checkAuth, async (req, res) => {
  const { type } = req.body;
  const userId = req.userData.userId;
  if (!['like', 'love', 'laugh', 'sad'].includes(type)) {
    return res.status(400).json({ message: 'Invalid reaction type!' });
  }
  try {
    const post = await Post.findOne({ _id: req.params.postId, 'comments._id': req.params.commentId });
    if (!post) return res.status(404).json({ message: 'Post or comment not found!' });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found!' });

    // Find if user already reacted
    const existing = comment.userReactions.find(r => r.user.toString() === userId);

    if (existing) {
      if (existing.type === type) {
        // Remove reaction
        comment.reactions[type] = Math.max(0, comment.reactions[type] - 1);
        comment.userReactions = comment.userReactions.filter(r => r.user.toString() !== userId);
      } else {
        // Switch reaction
        comment.reactions[existing.type] = Math.max(0, comment.reactions[existing.type] - 1);
        comment.reactions[type] = (comment.reactions[type] || 0) + 1;
        existing.type = type;
      }
    } else {
      // Add new reaction
      comment.reactions[type] = (comment.reactions[type] || 0) + 1;
      comment.userReactions.push({ user: userId, type });
    }

    // Use findOneAndUpdate to explicitly update the comment subdocument
    const updatedPost = await Post.findOneAndUpdate(
      { _id: req.params.postId, 'comments._id': req.params.commentId },
      { $set: { 'comments.$.reactions': comment.reactions, 'comments.$.userReactions': comment.userReactions } },
      { new: true }
    );

    if (!updatedPost) return res.status(404).json({ message: 'Post or comment not found during update!' });

    const updatedComment = updatedPost.comments.id(req.params.commentId);

    res.status(200).json({ message: 'Reaction updated!', reactions: updatedComment.reactions, userReaction: updatedComment.userReactions.find(r => r.user.toString() === userId)?.type || null });

  } catch (e) {
    console.error('Reacting to comment failed:', e);
    res.status(500).json({ message: 'Reacting to comment failed!' });
  }
});

module.exports = router;