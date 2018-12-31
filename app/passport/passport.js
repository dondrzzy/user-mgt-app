var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var session = require('express-session');
var User              = require('../models/User');
var jwt = require('jsonwebtoken')
var config = require('../../config/database');

module.exports = function(app, passport) {
  
  
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cooke: { secure: false  }
  }));

  passport.serializeUser(function(user, done) {
    token = jwt.sign({userId:user._id}, config.secret, {expiresIn:86400}); 
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
  

  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOne({email: profile._json.emails[0].value}, '-__v', (err, user) => {
        if (err) done(err)
        if (user && user !== null) {
          done(null, user);
        } else {
          done(err);
        }
      })
    }
  ));

  app.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.profile.emails.read'] }));

  app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/google-error' }),
    function(req, res) {
      res.redirect('/google/' + token);
    });


  return passport;
}