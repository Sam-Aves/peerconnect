const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  // ─── Post Information ───
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 150 
  },
  description: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 2000 
  },
  category: { 
    type: String, 
    required: true,
    enum: ["housing", "transport", "study", "emergency", "campus", "food", "other"],
    default: "other"
  },
  type: {
    type: String,
    required: true,
    enum: ["seeking", "helping", "both"],
    default: "seeking"
  },
  is_anonymous: {
    type: Boolean,
    default: false
  },

  // ─── Relationships ───
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  matched_helper_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  // ─── Engagement ───
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  
  // ─── Comments ───
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    authorName: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // ─── Status ───
  status: {
    type: String,
    enum: ["active", "resolved", "expired", "reported"],
    default: "active"
  },

  // ─── Help Tracking ───
  helpCount: {
    type: Number,
    default: 0
  },
  resolvedAt: {
    type: Date,
    default: null
  }

}, { 
  timestamps: true 
});

// Indexes for better performance
postSchema.index({ createdAt: -1 });
postSchema.index({ category: 1 });
postSchema.index({ type: 1 });
postSchema.index({ author: 1 });
postSchema.index({ status: 1 });

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Methods
postSchema.methods.toggleLike = function(userId) {
  const index = this.likes.indexOf(userId);
  if (index > -1) {
    this.likes.splice(index, 1);
    return false; // Unliked
  } else {
    this.likes.push(userId);
    return true; // Liked
  }
};

postSchema.methods.toggleSave = function(userId) {
  const index = this.savedBy.indexOf(userId);
  if (index > -1) {
    this.savedBy.splice(index, 1);
    return false; // Unsaved
  } else {
    this.savedBy.push(userId);
    return true; // Saved
  }
};

postSchema.methods.addComment = function(userId, userName, content) {
  this.comments.push({
    author: userId,
    authorName: userName,
    content: content
  });
  return this.comments[this.comments.length - 1];
};

postSchema.methods.markResolved = function(helperId) {
  this.status = "resolved";
  this.matched_helper_id = helperId;
  this.resolvedAt = new Date();
};

// ─── Virtuals ───
postSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

postSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

module.exports = mongoose.model("Post", postSchema);