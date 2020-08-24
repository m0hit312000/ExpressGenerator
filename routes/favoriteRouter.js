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
            Favorites.create(req.user._id)
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
            for(var i in req.body) {
                favorite.dishes.push(req.body[i]);
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
    Favorites.remove({user: req.user._id})
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
        if(!(favorites.user._id.equals(req.user._id))) {
            var err = new Error(`You are not authorized`);
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
     Favorites.findById(req.params.dishId)
     .populate('user')
     .populate('dishes')
     .then((dish) => {
         if(dish!=null && dish.user.id(req.params.dishId) && req.user._id.equals(dish.user.id(req.params.dishId).user)) {
            dish.dishes.push(req.body); 
         }  
         else {
            var err = new Error(`No Such Dish`);
            err.status = 401;
            return next(err);
         }
     }, (err) => next(err))
     .catch((err) => next(err)); 
})
.put(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findById({user: req.user._id})
    .populate('user')
    .populate('dishes')    
    .then((dish) => {
        if(dish != null && dish.user.id(req.params.dishId) != null && req.user._id.equals(dish.user.id(req.params.dishId).user)) {
            dish.user.id(req.params.dishId).remove(); 
            dish.save()
                .then((dish) => {
                    Dishes.findById(dish._id)
                    .populate('user')
                    .populate('dishes')
                    .then((dish) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish);  
                    })               
                }, (err) => next(err));
        }
        else {
            var err = new Error('Not Authorized');
            err.status = 401;
            return next(err);
        }   
    }, (err) => next(err))
    .catch((err) => next(err));
});