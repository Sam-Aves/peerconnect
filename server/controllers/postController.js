const Post = require("../models/Post");
const User = require("../models/User");

// ─── GET ALL POSTS ───
const getPosts = async (req, res) => {
  try {
    const { category, type, status, search, limit = 20, page = 1 } = req.query;

    // Build filter
    const filter = { status: "active" };
    if (category && category !== "all") filter.category = category;
    if (type && type !== "all") filter.type = type;
    if (status && status !== "all") filter.status = status;

    // Search in title and description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get posts
    const posts = await Post.find(filter)
      .populate("author", "name university district profile_photo")
      .populate("matched_helper_id", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Post.countDocuments(filter);

    // Format posts for frontend
    const formattedPosts = posts.map((post) => {
      const isLiked = post.likes && post.likes.includes(req.user.id);
      const isSaved = post.savedBy && post.savedBy.includes(req.user.id);

      return {
        id: post._id,
        title: post.title,
        content: post.description,
        authorName: post.is_anonymous
          ? "Anonymous"
          : post.authorName || post.author?.name || "Unknown",
        authorId: post.author?._id || post.author,
        type: post.type,
        category: post.category,
        createdAt: post.createdAt,
        likes: post.likes ? post.likes.length : 0,
        likedByMe: isLiked,
        savedByMe: isSaved,
        commentCount: post.comments ? post.comments.length : 0,
        comments: post.comments
          ? post.comments.map((c) => ({
              id: c._id,
              authorName: c.authorName || "Unknown",
              content: c.content,
              createdAt: c.createdAt,
            }))
          : [],
        isAnonymous: post.is_anonymous,
        status: post.status,
        matchedHelper: post.matched_helper_id?.name || null,
        helpCount: post.helpCount || 0,
      };
    });

    res.json({
      posts: formattedPosts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: error.message || "Failed to fetch posts" });
  }
};

// ─── GET SINGLE POST ───
const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .populate("author", "name university district profile_photo")
      .populate("comments.author", "name")
      .populate("matched_helper_id", "name");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isLiked = post.likes && post.likes.includes(req.user.id);
    const isSaved = post.savedBy && post.savedBy.includes(req.user.id);

    res.json({
      id: post._id,
      title: post.title,
      content: post.description,
      // FIX: added fallback chain so older posts without stored authorName still resolve
      authorName: post.is_anonymous
        ? "Anonymous"
        : post.authorName || post.author?.name || "Unknown",
      author: post.author,
      type: post.type,
      category: post.category,
      createdAt: post.createdAt,
      likes: post.likes ? post.likes.length : 0,
      likedByMe: isLiked,
      savedByMe: isSaved,
      comments: post.comments || [],
      isAnonymous: post.is_anonymous,
      status: post.status,
      matchedHelper: post.matched_helper_id,
      helpCount: post.helpCount || 0,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: error.message || "Failed to fetch post" });
  }
};

// ─── CREATE POST ───
const createPost = async (req, res) => {
  try {
    const { title, description, type, category, is_anonymous } = req.body;

    if (!title || !description || !type || !category) {
      return res.status(400).json({
        message: "Title, description, type, and category are required",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.verified) {
      return res.status(403).json({
        message:
          "Your account is not verified yet. Please wait for admin verification.",
      });
    }

    const post = await Post.create({
      title: title.trim(),
      description: description.trim(),
      type,
      category,
      is_anonymous: is_anonymous || false,
      author: req.user.id,
      authorName: user.name,
      likes: [],
      comments: [],
      savedBy: [],
      status: "active",
      helpCount: 0,
    });

    if (type === "helping" || type === "both") {
      user.contribution = (user.contribution || 0) + 1;
      await user.save();
    }

    res.status(201).json({
      message: "Post created successfully",
      post: {
        id: post._id,
        title: post.title,
        content: post.description,
        authorName: post.is_anonymous ? "Anonymous" : post.authorName,
        type: post.type,
        category: post.category,
        createdAt: post.createdAt,
        likes: 0,
        likedByMe: false,
        savedByMe: false,
        comments: [],
        isAnonymous: post.is_anonymous,
        status: post.status,
      },
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: error.message || "Failed to create post" });
  }
};

// ─── UPDATE POST ───
const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, description, category, type, is_anonymous } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this post" });
    }

    if (title) post.title = title.trim();
    if (description) post.description = description.trim();
    if (category) post.category = category;
    if (type) post.type = type;
    if (is_anonymous !== undefined) post.is_anonymous = is_anonymous;

    await post.save();

    res.json({
      message: "Post updated successfully",
      post: {
        id: post._id,
        title: post.title,
        content: post.description,
        type: post.type,
        category: post.category,
        isAnonymous: post.is_anonymous,
      },
    });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: error.message || "Failed to update post" });
  }
};

// ─── DELETE POST ───
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user.id && !req.user.isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }

    await post.deleteOne();

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: error.message || "Failed to delete post" });
  }
};

// ─── ADD COMMENT ───
const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res
        .status(400)
        .json({ message: "Comment content is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const comment = post.addComment(req.user.id, user.name, content.trim());
    await post.save();

    // ─── NOTIFICATION ───
    const { createNotification } = require("./notificationController");
    await createNotification(
      post.author,
      req.user.id,
      "comment",
      postId,
      `${user.name} commented on your post: "${content.trim().substring(0, 30)}..."`
    );

    res.status(201).json({
      message: "Comment added successfully",
      comment: {
        id: comment._id,
        authorName: comment.authorName,
        content: comment.content,
        createdAt: comment.createdAt,
      },
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to add comment" });
  }
};

// ─── DELETE COMMENT ───
const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (
      comment.author.toString() !== req.user.id &&
      post.author.toString() !== req.user.id &&
      !req.user.isAdmin
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    comment.deleteOne();
    await post.save();

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to delete comment" });
  }
};

// ─── TOGGLE LIKE ───
const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const liked = post.toggleLike(userId);
    await post.save();

    // ─── NOTIFICATION ───
    if (liked) {
      try {
        const { createNotification } = require("./notificationController");
        const user = await User.findById(userId).select("name");
        if (user && post.author) {
          const contentPreview = (post.description || "a post").substring(0, 30);
          await createNotification(
            post.author,
            userId,
            "like",
            postId,
            `${user.name} liked your post: "${contentPreview}${
              post.description?.length > 30 ? "..." : ""
            }"`
          );
        }
      } catch (notifError) {
        console.error("Failed to create notification for like:", notifError);
        // Do not fail the request; just log the error
      }
    }

    res.json({
      message: liked ? "Post liked" : "Post unliked",
      liked,
      likes: post.likes.length,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to toggle like" });
  }
};

// ─── TOGGLE SAVE ───
const toggleSave = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const saved = post.toggleSave(userId);
    await post.save();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (saved) {
      if (!user.savedPosts) user.savedPosts = [];
      if (!user.savedPosts.includes(postId)) {
        user.savedPosts.push(postId);
      }
    } else {
      user.savedPosts = user.savedPosts.filter(
        (id) => id.toString() !== postId
      );
    }
    await user.save();

    res.json({
      message: saved ? "Post saved" : "Post unsaved",
      saved,
    });
  } catch (error) {
    console.error("Error toggling save:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to toggle save" });
  }
};

// ─── MARK POST AS RESOLVED ───
const markResolved = async (req, res) => {
  try {
    const { postId } = req.params;
    const { helperId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only the author can mark as resolved" });
    }

    const helper = await User.findById(helperId);
    if (!helper) {
      return res.status(404).json({ message: "Helper not found" });
    }

    post.markResolved(helperId);
    post.helpCount = (post.helpCount || 0) + 1;
    await post.save();

    helper.contribution = (helper.contribution || 0) + 1;
    await helper.save();

    res.json({
      message: "Post marked as resolved",
      post: {
        id: post._id,
        status: post.status,
        matchedHelper: helper.name,
        helpCount: post.helpCount,
      },
    });
  } catch (error) {
    console.error("Error marking resolved:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to mark as resolved" });
  }
};

// ─── GET USER'S POSTS ───
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    const filter = { author: userId };
    if (status && status !== "all") filter.status = status;

    const posts = await Post.find(filter)
      .populate("matched_helper_id", "name")
      .sort({ createdAt: -1 });

    const formattedPosts = posts.map((post) => ({
      id: post._id,
      title: post.title,
      content: post.description,
      type: post.type,
      category: post.category,
      createdAt: post.createdAt,
      status: post.status,
      likes: post.likes ? post.likes.length : 0,
      comments: post.comments ? post.comments.length : 0,
      matchedHelper: post.matched_helper_id?.name || null,
      helpCount: post.helpCount || 0,
    }));

    res.json({ posts: formattedPosts });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to fetch user posts" });
  }
};

// ─── GET SAVED POSTS ───
const getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "savedPosts",
      populate: { path: "author", select: "name" },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const formattedPosts = (user.savedPosts || []).map((post) => ({
      id: post._id,
      title: post.title,
      content: post.description,
      authorName: post.authorName || post.author?.name || "Unknown",
      type: post.type,
      category: post.category,
      createdAt: post.createdAt,
      likes: post.likes ? post.likes.length : 0,
      likedByMe: post.likes && post.likes.includes(req.user.id),
      savedByMe: true,
      comments: post.comments
        ? post.comments.map((c) => ({
            id: c._id,
            authorName: c.authorName || "Unknown",
            content: c.content,
            createdAt: c.createdAt,
          }))
        : [],
      status: post.status,
      helpCount: post.helpCount || 0,
    }));

    res.json({ posts: formattedPosts });
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to fetch saved posts" });
  }
};

// ─── GET USER PROFILE ───
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("savedPosts", "content type category createdAt");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
        district: user.district,
        role: user.role,
        bio: user.bio || "",
        verified: user.verified,
        isAdmin: user.isAdmin,
        contribution: user.contribution || 0,
        savedPosts: user.savedPosts || [],
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to fetch profile" });
  }
};

// ─── UPDATE USER PROFILE ───
const updateUserProfile = async (req, res) => {
  try {
    const { name, bio, district } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (district) user.district = district.trim();

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
        district: user.district,
        role: user.role,
        bio: user.bio,
        verified: user.verified,
        isAdmin: user.isAdmin,
        contribution: user.contribution,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to update profile" });
  }
};

module.exports = {
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
  getSavedPosts,
  getUserProfile,
  updateUserProfile,
};