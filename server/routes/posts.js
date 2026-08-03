const express = require("express");
const { protect, adminOnly } = require("../middleware/auth");
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  addComment,
  deleteComment,
  toggleLike,
  toggleSave,
  markResolved,
  getUserPosts,
  getSavedPosts
} = require("../controllers/postController");

const router = express.Router();

// ─── Public routes (but require auth) ───
router.get("/", protect, getPosts);
router.get("/saved", protect, getSavedPosts);
router.get("/:postId", protect, getPostById);
router.get("/user/:userId", protect, getUserPosts);

// ─── Post CRUD ───
router.post("/", protect, createPost);
router.put("/:postId", protect, updatePost);
router.delete("/:postId", protect, deletePost);

// ─── Comments ───
router.post("/:postId/comments", protect, addComment);
router.delete("/:postId/comments/:commentId", protect, deleteComment);

// ─── Engagement ───
router.post("/:postId/like", protect, toggleLike);
router.post("/:postId/save", protect, toggleSave);

// ─── Resolution ───
router.post("/:postId/resolve", protect, markResolved);

// ─── Admin routes ───
router.delete("/:postId/admin", protect, adminOnly, deletePost);

module.exports = router;