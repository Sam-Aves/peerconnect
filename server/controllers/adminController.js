const User = require("../models/User");
const Post = require("../models/Post");


// Get pending users
const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({
      verified: false
    }).select("-password");

    res.json(users);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Verify user
const verifyUser = async (req, res) => {
  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }


    user.verified = true;

    await user.save();


    res.json({
      message:"User verified successfully"
    });


  } catch(error){

    res.status(500).json({
      message:error.message
    });

  }
};



// Reject user
const rejectUser = async(req,res)=>{
  try{

    await User.findByIdAndDelete(req.params.id);

    res.json({
      message:"User rejected"
    });


  }catch(error){

    res.status(500).json({
      message:error.message
    });

  }
};



// Get moderation posts
const getModerationPosts = async(req,res)=>{
  try{

    const posts = await Post.find();

    res.json(posts);


  }catch(error){

    res.status(500).json({
      message:error.message
    });

  }
};



// Delete post
const adminDeletePost = async(req,res)=>{
  try{

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      message:"Post deleted"
    });


  }catch(error){

    res.status(500).json({
      message:error.message
    });

  }
};



module.exports = {
  getPendingUsers,
  verifyUser,
  rejectUser,
  getModerationPosts,
  adminDeletePost
};