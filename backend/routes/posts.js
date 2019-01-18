const express = require("express");
const multer = require("multer");

const Post = require("../models/post");
const User = require('../models/user');
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg"
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
    const name = file.originalname
      .toLowerCase()
      .split(" ")
      .join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  }
});

router.post(
  "",
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    console.log(url.toString());
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      username: req.body.username,
      createdAt : Date.now(),
      creator: req.userData.userId,
      imagePath: url + "/images/" + req.file.filename
    });
    post.save().then(createdPost => {
      res.status(201).json({
        message: "Post added successfully",
        post: {
          ...createdPost,
          id: createdPost._id
        }
      });
    });
  }
);

router.put(
  "/:id",
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {

    let imagePath = req.body.imagePath;
    if (req.file) {
      const url = req.protocol + "://" + req.get("host");
      console.log(url);
      imagePath = url + "/images/" + req.file.filename;
    }


    const post =({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      username: req.body.username,
      creator: req.userData.userId,
      createdAt : Date.now(),
      imagePath: imagePath
    });
    console.log(post);
    Post.updateOne({ _id: req.params.id, creator: req.userData.userId}, post).then(result => {
      if (result.nModified > 0) {
        console.log(result);
        res.status(200).json({message: "Update successful!"});
      } else {
        res.status(401).json({message: "Not authorized to update!"});
      }
    });
  }
);

router.get("", (req, res, next) => {
  const pageSize = +req.query.pagesize;// like query parmaetres /?abc=1$xyz=2 , + is for converting to numbers
  const currentPage = +req.query.page;

  const postQuery = Post.find().sort({ '_id': -1 });
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }

  postQuery
    .then(documents => {
      fetchedPosts = documents;
      return Post.count();
    })
    .then(count => {
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: fetchedPosts,
        maxPosts: count
      });
    });
});

router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Post not found!" });
    }
  });
});

router.delete("/:id", checkAuth, (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId }).then(result => {
    console.log(result);
    if (result.n> 0) {
      res.status(200).json({message: "Deleted successful!"});
    } else {
      res.status(401).json({message: "Not authorized to delete!"});
    }
  });
});


router.put("/likePost/:id",checkAuth,(req,res) =>{
  console.log("liking-----------------------\n"+req.params.id+"\n----------------------------");
    if(!req.params.id){
      res.json({success: false, message:'no id provided'});
    } else {
      Post.findById({_id: req.params.id},(err,post) => {
        if(err){
          res.json({success:false, message:'invalid post id'});
        } else {
          if(!post){
            res.json({success: false, message:'post not found'});
          } else {
            User.findOne({_id: req.userData.userId}, (err, user) => {
              if (err) {
                res.json({success:false, message:'Something went wrong'});
              } else {
                if(!user) {
                  res.json({ success: false, message:'Could not find user'});
                } else {
                  if(user.username === post.username) {
                    res.json({ success: false, message: 'Cannot like own post'});
                  } else {
                    if(post.likedBy.includes(user.username)) {
                      res.json({success: false, message: 'You already liked this post'});
                    } else {
                      if(post.dislikedBy.includes(user.username)) {
                        post.dislikes--;
                        const arrayIndex = post.dislikedBy.indexOf(user.username);
                        post.dislikedBy.splice(arrayIndex,1);
                        post.likes++;
                        post.likedBy.push(user.username);
                        post.save((err) => {
                          if(err) {
                            res.json({ success: false, message:'something went wrong'});
                          } else {
                            res.json({ success: true, message: 'post liked!'});
                          }
                        });
                      } else {
                        post.likes++;
                        post.likedBy.push(user.username);
                        post.save((err) => {
                          if(err) {
                            res.json({ success: false, message:'something went wrong'});
                          } else {
                            console.log(post);
                            res.json({ success: true, message: 'post liked!'});
                          }
                        });

                      }

                    }
                  }
                }

              }
            });
          }
        }

      });
    }
  });

router.put("/dislikePost/:id",checkAuth,(req,res) =>{
  console.log("disliking-----------------------\n"+req.params.id+"\n----------------------------");
  if(!req.params.id){
    res.json({success: false, message:'no id provided'});
  } else {
    Post.findById({_id: req.params.id},(err,post) => {
      if(err){
        res.json({success:false, message:'invalid post id'});
      } else {
        if(!post){
          res.json({success: false, message:'post not found'});
        } else {
          User.findOne({_id: req.userData.userId}, (err, user) => {
            if (err) {
              res.json({success:false, message:'Something went wrong'});
            } else {
              if(!user) {
                res.json({ success: false, message:'Could not find user'});
              } else {
                if(user.username === post.username) {
                  res.json({ success: false, message: 'Cannot dislike own post'});
                } else {
                  if(post.dislikedBy.includes(user.username)) {
                    res.json({success: false, message: 'You already disliked this post'});
                  } else {
                    if(post.likedBy.includes(user.username)) {
                      post.likes--;
                      const arrayIndex = post.likedBy.indexOf(user.username);
                      post.likedBy.splice(arrayIndex,1);
                      post.dislikes++;
                      post.dislikedBy.push(user.username);
                      post.save((err) => {
                        if(err) {
                          res.json({ success: false, message:'something went wrong'});
                        } else {
                          res.json({ success: true, message: 'post disliked!'});
                        }
                      });
                    } else {

                      post.dislikes++;
                      post.dislikedBy.push(user.username);
                      post.save((err) => {
                        if(err) {
                          res.json({ success: false, message:'something went wrong'});
                        } else {
                          res.json({ success: true, message: 'post disliked!'});
                        }
                      });

                    }

                  }
                }
              }
            }
          });
        }
      }

    });
  }

});


router.put("/comment/:id",checkAuth, (req,res) => {
  console.log("commenting----------------------\n"+req.params.id+"\n----------------------------");
  if(!req.body.comment){
    res.json({ success: false, message: 'No Comment provided'});
  }
  else{
    if(!req.params.id){
      res.json({ success: false, message: 'ID not provided'});
    }else{
      Post.findById({ _id: req.params.id}, (err,post)=>{

        if(err) {
          res.json({ success: false, message: 'Invalid post id'});
        }
        else{
          if(!post){
            res.json({success: false,message:'blog not Found'});
          }else{
            User.findOne({_id: req.userData.userId}, (err, user) =>{
              if (err){
                res.json({success: false, message:'something went wrong'});
              }else{
                if(!user){
                  res.json({success: false, message:'user not found'});
                }else{
                  post.comments.push({
                    comment:req.body.comment,
                    commentator:user.username,
                    commentatorid: user._id
                  });
                  post.commentsNo++;

                  post.save((err) => {
                    if(err){
                      res.json({success: false, message:'something went wrong'});
                    }else{
                      res.json({success: true, message:'Comment added'});
                      console.log(post);
                    }
                  });
                }
              }
            });
          }
        }

      });
    }
  }

});

module.exports = router;
