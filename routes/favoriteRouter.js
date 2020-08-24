const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorites');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOPtions, use, (req, res) => { res.sendStatus(200);})
.get(cors.cors, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOPtions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findById({user: req.user._id})
    .then((favorite) => {
        if(favorite == null) {
            Favorites.create({user: req.user._id})
            .populate('user')
            .populate('dishes')
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                for(var i in req.body) {
                    favorite.dishes.push(req.body[i]);
                }
                favorite.save()
                res.json(favorite);
            }, (err) => next(err));
        }
        else {
            for(var i in req,body) {
                Favorites.findById(favorite._id)                 
                .then((favorite) => {
                    if(favorite == null) {
                        favorite.dishes.push(req.body[i]);
                    }
                });
            }
            favorite.save();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json')
            res.json(favorite);
        }
    }).catch((err) => next(err));
})
.put(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOPtions, authenticate.verifyUser, (req, res, next) => {
    Favorites.deleteOne({user: req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOPtions, use, (req, res) => { res.sendStatus(200);})
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findById(req.params.dishId)
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
        if(!(favorites.user.equals(req.user._id))) {
            var err = new Error('Only creator can perform this');
            err.status = 401;
            return next(err);
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err)); 
})
.post(cors.cors, authenticate.verifyUser, (req, res, next) => {
     Favorites.findById({user: req.user._id})
     .populate('user')
     .populate('dishes')
     .then((dish) => {
           
     })
})
.put(cors.cors, authenticate.verifyUser, (req, res, next) => {

})
.delete(cors.cors, authenticate.verifyUser, (req, res, next) => {

});