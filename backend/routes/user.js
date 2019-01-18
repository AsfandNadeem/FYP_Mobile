const express = require("express");
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
const Post = require("../models/post");
const User = require('../models/user');

const router = express.Router();
const checkAuth = require("../middleware/check-auth");


router.post('/signup', (req,res,next) => {

  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user  = new User({
        email: req.body.email,
        password: hash,
        username: req.body.username,
        department: req.body.department,
        registrationno: req.body.registration
      });
      user.save()
        .then(result => {
          res.status(201).json({
            message: 'User Created',
            result: result,
          });
          console.log(user);
        })
        .catch(err => {
          res.status(500).json({
            error:err
          })
        });
    });


});






// router.get("/:id", (req, res, next) => {
//   User.findById(req.params.id).then(user => {
//     if (user) {
//       res.status(200).json(user);
//     } else {
//       res.status(404).json({ message: "User not found!"});
//     }
//   });
// });

router.post("/login", (req,res,next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then( user => {
      if ( !user ) {
       return res.status(401).json({
          message: "Auth failed"
        });
      }
      fetchedUser= user;
      return bcrypt.compare(req.body.password, user.password);
          })
    .then(result => {
      if(!result) {
        return res.status(401).json({
          message: "Auth failed"
        });
      }
      console.log(fetchedUser+"\nafter login");
      const token = jwt.sign({email: fetchedUser.email, userId: fetchedUser._id, username: fetchedUser.username},
        'secret_this_should_be_longer',
        {expiresIn: '1h'}
        );
      res.status(200).json({
        token: token,
        expiresIn: 3600,
        userId: fetchedUser._id,
        username: fetchedUser.username
      });
    })
    .catch(err => {
      console.log(err);
      return res.status(401).json({
        message: "Auth Failed"
      });
    });
});


router.put("/edit",checkAuth,(req,res,next) => {
  let fetcheduser;
  console.log("editing user---------------------------"+req.body.username+req.body.password+"---------------------------");
  bcrypt.hash(req.body.password,10)
    .then(hash => {
    const user = ({
      username: req.body.username,
      password: hash
    });
      console.log(user);
      let fetchedUser;
      User.findOneAndUpdate({_id: req.userData.userId},user,{new:true}, (err,doc) => {
        if (err){
          res.status(401).json({message: "Not authorized to update!"});
          console.log(err);
        } else {
          fetchedUser = doc;
          // const token = jwt.sign({email: fetchedUser.email, userId: fetchedUser._id, username:fetchedUser.username},
          //           'secret_this_should_be_longer',
          //           {expiresIn: '1h'});
          const post = ({
            username: fetchedUser.username,
          });
          Post.updateMany({ creator: req.userData.userId}, post).then(result => {

            if (result.nModified > 0) {
              console.log(result);

            } else {
              console.log("Not authorized to update!");
            }
          });
          res.status(200).json({
                    message:"user updated",
                    // token: token,
                    // expiresIn: 3600,
                    userId: fetchedUser._id,
                    username: fetchedUser.username,
                  });
          console.log(doc);
        }
      });
      // User.findOneAndUpdate({_id: req.userData.userId},user, {new:true},)
      //   .then(user1 => {
      //     console.log(user1);
      //     if(user1.nModified>0) {
      //       fetchedUser = user1;
      //       const token = jwt.sign({email: fetchedUser.email, userId: fetchedUser._id, username:fetchedUser.username},
      //         'secret_this_should_be_longer',
      //         {expiresIn: '1h'}
      //       );
      //       res.status(200).json({
      //         message:"user updated",
      //         token: token,
      //         expiresIn: 3600,
      //         userId: fetchedUser._id,
      //         username: fetchedUser.username,
      //       });
      //
      //     } else {
      //       res.status(401).json({message: "Not authorized to update!"});
      //     }
      //
      //     console.log("newuser"+fetchedUser.username);
      //   });

});



});


module.exports = router;
