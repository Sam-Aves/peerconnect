const express = require("express");

const {
  getPendingUsers,
  verifyUser,
  rejectUser,
  getModerationPosts,
  adminDeletePost
} = require("../controllers/adminController");

const {
  protect,
  adminOnly
} = require("../middleware/auth");

const User = require("../models/User");
const Post = require("../models/Post");

const router = express.Router();


// =======================
// DASHBOARD STATS
// =======================

router.get(
  "/stats",
  protect,
  adminOnly,
  async (req,res)=>{
    try {

      const totalUsers = await User.countDocuments();

      const pendingVerification =
        await User.countDocuments({
          verified:false
        });

      const activePosts =
        await Post.countDocuments();


      const flaggedPosts =
        await Post.countDocuments({
          status:"reported"
        });


      res.json({
        totalUsers,
        pendingVerification,
        verifiedToday:0,
        activePosts,
        flaggedPosts,
        resolvedToday:0,
        newToday:0
      });


    } catch(err){
      res.status(500).json({
        message:err.message
      });
    }
  }
);



// =======================
// USERS
// =======================

router.get(
  "/users",
  protect,
  adminOnly,
  async(req,res)=>{

    try {

      const status=req.query.status;

      let users;


      if(status==="pending"){

        users = await User.find({
          verified:false
        }).select("-password");

      }
      else{

        users = await User.find()
        .select("-password");

      }


      res.json(users);


    }catch(err){

      res.status(500).json({
        message:err.message
      });

    }

  }
);



// VERIFY USER

router.patch(
  "/users/:id/verify",
  protect,
  adminOnly,
  verifyUser
);



// DELETE USER

router.delete(
  "/users/:id",
  protect,
  adminOnly,
  rejectUser
);



// =======================
// POSTS
// =======================


router.get(
  "/posts",
  protect,
  adminOnly,
  getModerationPosts
);


router.delete(
  "/posts/:id",
  protect,
  adminOnly,
  adminDeletePost
);



module.exports = router;