var express = require('express');
var apiRouter = express.Router();
var User = require('../models/User');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken')
var config = require('../../config/database');


validateUser = (req) => {
  let errors = {};
  let countErrors = 0;

  if (req.body.username == null || req.body.username == '') {
    errors['username'] = 'Username is required';
    countErrors++;
  }
  if (req.body.email == null || req.body.email == '') {
    errors['email'] = 'Email is required';
    countErrors++;
  }
  if (req.body.password == null || req.body.password == '') {
    errors['password'] = 'Password is reqiured';
    countErrors++;
  }

  if (countErrors > 0)
    return {success: false, errors}
  return {success: true}

}

apiRouter.post('/users', (req, res) => {
  validationResponse = validateUser(req);

  if (!validationResponse.success) {
    res.status(400).json(validationResponse);
  } else {
    let user = new User();
    user.name = req.body.name;
    user.username = req.body.username;
    user.email = req.body.email;
    user.password = req.body.password;
    user.permission = req.body.permission;
    console.log('user', user);

    user.save((err) => {
      if (err){
        console.log('err', err)
        res.status(409).json({success: false, message: 'Email or username already exists'});
      } else
        res.status(201).json({success: true, message:'User created'});
    });
  }
});

apiRouter.post('/authenticate', (req, res) => {
  if (req.body.username == '' || req.body.username == null || req.body.password == '' || req.body.password == null) {
    return res.status(400).json({success: false, message: 'Please provide the correct username and password'});
  }

  User.findOne({username: req.body.username}).select('username password').exec( (err, user) => {
    if (err) return res.status(500).json({success: false, message: err})

    if (user) {
      const validPassword = user.comparePassword(req.body.password);
      if (validPassword) {
        const token = jwt.sign({userId:user._id}, config.secret, {expiresIn:86400}); 
        return res.json({success:true, message:'Success!', token, user:{username:user.username}});
      }
    }
    return res.status(404).json({success: false, message: 'Invalid username or password'});
  })
});

// check username
apiRouter.post('/checkusername', (req, res) => {
  User.findOne({username: req.body.username}).select('username').exec( (err, user) => {
    if (err) throw(err);

    if (user) {
      res.status(409).json({success:false, message:'Username already exists'});
    } else {
      res.status(200).json({success: true, message: 'Valid username'});
    }
  })
});

// check username
apiRouter.post('/checkemail', (req, res) => {
  User.findOne({email: req.body.email}).select('email').exec( (err, user) => {
    if (err) throw(err);

    if (user) {
      res.status(409).json({success:false, message:'Email already exists'});
    } else {
      res.status(200).json({success: true, message: 'Valid email'});
    }
  })
});

apiRouter.use((req, res, next) => {
  let token = req.headers['x-access-token'];
  if(!token) {
    return res.status(401).json({success: false, token: false, message: 'No token provided'});
  } else {
    jwt.verify(token, config.secret, (err, decoded) => {
      if(err) return res.status(401).json({success: false, token: false, message: 'Token is invalid'});

      req.decoded = decoded;

      next();
    })
  }
})

apiRouter.get('/me', (req, res) => {
  User.findOne({_id: req.decoded.userId},'-__v', function(err, user) {
    if (err) return res.status(500).json({success: false, message: err});
    if(user && user !== null)
      return res.status(200).json({success: true, user});
    return res.status(404).json({success: false, message: 'User not found'});
  })
})

apiRouter.get('/permission', (req, res) => {
  User.findOne({_id: req.decoded.userId},'-__v', function(err, user) {
    if (err) return res.status(500).json({success: false, message: err});
    if(user && user !== null)
      return res.status(200).json({success: true, permission: user.permission});
    return res.status(404).json({success: false, message: 'User not found'});
  })
})

apiRouter.get('/users', (req, res) => {
  User.findOne({_id: req.decoded.userId},'-__v', function(err, user) {
    if (err) return res.status(500).json({success: false, message: err});
    if(user && user !== null){
      if (user.permission === 'admin' || user.permission === 'moderator') {
        User.find({}, (err, users) => {
          if (err) {
            res.status(500).json({success: false, message: err});
          } else {
            res.status(200).json({success: true, users, permission: user.permission});
          }
        })
      } else {
        res.status(401).json({success: false, message: 'Unauthorized access'});
      }

    } else {
      res.status(404).json({success: false, message: 'User not found'});
    }
    
  });
});

module.exports = apiRouter