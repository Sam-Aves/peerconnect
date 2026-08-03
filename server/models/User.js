const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  university: { type: String, required: true },
  district:   { type: String, required: true },
  role:       { type: String, required: true },

  email:      { type: String, required: true, unique: true },
  password:   { type: String, required: true },

  bio:        { type: String, default: "" },

  // Profile enrichment fields
  interests:  { type: [String], default: [] },
  likes:      { type: [String], default: [] },
  dislikes:   { type: [String], default: [] },

  savedPosts:    [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  profile_photo: { type: String, default: "" },
  id_card_photo: { type: String, default: "" },

  verified:   { type: Boolean, default: false },
  isAdmin:    { type: Boolean, default: false },

  contribution: { type: Number, default: 0 },

  // Social counts (optional - can be computed or tracked)
  followers:  { type: Number, default: 0 },
  following:  { type: Number, default: 0 },
  postsCount: { type: Number, default: 0 },

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);