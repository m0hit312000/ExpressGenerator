var express = require('express');
var User = require('../models/user');
const bodyParser = require('body-parser');
var passport = require('passport');
var authenticate = require('../authenticate');
var cors = require('./cors');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.options('*', cors.corsWithOPtions, (req, res) => { res.sendStatus(200);})
router.get('/', cors.corsWithOPtions, authenticate.verifyUser, authenticate.verifyAdmin, function(req, res, next) {
  User.find({})
  .then((user) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(user);
  }, (err) => next(err))
  .catch((err) => next(err));
});


router.post('/signup', cors.corsWithOPtions, (req, res, next) => {
  User.register(new User({username: req.body.username}), req.body.password, (err, user) =>{
    if(err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({err: err})
    }
    else {
        if(req.body.firstname)
         user.firstname = req.body.firstname;
        if(req.body.lastname)
         user.lastname = req.body.lastname;
        user.save((err, user) => {
          if(err){
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({err: err});
            return ;
          }
          passport.authenticate('local')(req, res, () => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({success: true, status: 'Registration Successfull!'});  
          });
        });  
    }
  });
});

router.post('/login', cors.corsWithOPtions, (req, res, next) => {

  passport.authenticate('local', (err, user, info) => {
      if(err)
      return next(err);

      if(!user) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, status: 'Login Failed', err: info});   
      }
      req.logIn(user, (err) => {
        if(err) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: false, status: 'Login Failed', err: 'Could not login user'});     
        }
        var token = authenticate.getToken({_id: req.user._id});
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Login Successfull', token: token});   
      });
  }) (req, res, next);

   
})

router.get('/logout', cors.corsWithOPtions, (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  if (req.user) {
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in!'});
  }
});

router.get('/checkJWTToken', cors.corsWithOPtions, (req, res) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if(err)
      return next(err);

    if(!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.json({status: 'JWT invalid', success: false, err: info});   
    } 
    else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.json({status: 'JWT valid', success: true, user: user});         
    } 
  }) (req, res);
})

module.exports = router;
