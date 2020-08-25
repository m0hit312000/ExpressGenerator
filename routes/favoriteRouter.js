const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorites');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOPtions, (req, res) => { res.sendStatus(200);})
.get(cors.cors, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .exec((err, favorites) => {
        if(err) return next(err);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(user_favorite);
    });    
})
.post(cors.corsWithOPtions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id}, (err, favorite) => {
        if(err) return next(err);

        if(!favorite) {
            Favorites.create({user: req.user._id})
            .then((favorite) => {  // since favorite here is newly created so it is null so no need to check
                for( i=0; i < req.body.length; i++) {
                    if(favorite.dishes.indexOf(req.body[i]._id) < 0)
                      favorite.dishes.push(req.body[i]);
                }
                favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                })
                .catch((err) => {
                    return next(err);
                });
            })
            .catch((err) => {
                return next(err);
            })    
        }
        else {
            for( i=0; i < req.body.length; i++) {
                if(favorite.dishes.indexOf(req.body[i]._id) < 0)
                      favorite.dishes.push(req.body[i]);
            }
            favorite.save()
            .then((favorite) => {
                Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes')
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
            })
            .catch((err) => {
                return next(err);
            });
        }
    });
})
.put(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOPtions, authenticate.verifyUser, (req, res, next) => {
    var favToRem;
    Favorites.find({})
    .then((favorite) => {
        if(favorite) {
            favToRem = favorite.filter(fav => fav.user._id.equals(req.user._id));
            if(favToRem) {
                favToRem.remove()
                .then((result) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(result);
                }, (err) => next(err));
            }
            else {
                var err = new Error('You do not have any favourites');
                err.status = 404;
                return next(err);
            }
        }      
    }, (err) => next(err))
    .catch((err) => next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOPtions, (req, res) => { res.sendStatus(200);})
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if(!favorites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'applicaction/json');
            return res.json({"exists": false, "favorites": favorites})
        }
        else {
            if(favorites.dishes.indexOf(req.params.dishId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'applicaction/json');
                return res.json({"exists": false, "favorites": favorites})
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'applicaction/json');
                return res.json({"exists": true, "favorites": favorites})
            }
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})
.post(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id}, (err, favorite) => {
        if(err) return next(err);

        if(!favorite) {
            Favorites.create({user: req.user._id})
            .then((favorite) => { 
                      favorite.dishes.push({"_id": req.params._id});
                favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                })
                .catch((err) => {
                    return next(err);
                });
            })
            .catch((err) => {
                return next(err);
            })    
        }
        else {
            if(favorite.dishes.indexOf(req.params.dishId) < 0) {
                favorite.dishes.push({"_id": req.params._id});
                favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                })
                .catch((err) => {
                    return next(err);
                })
            }
            else {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Dish ' + req.params.dishId + ' already present');
            }
        }
    });
})
.put(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    req.setHeader('Content-Type', 'text/plain');
    res.end('PUT operation not supported on /favorites/' + req.params.dishId);
})
.delete(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id}, (err, favorite) => {
        if(err) return next(err);
        
        console.log(favorite);
        var index = favorite.dishes.indexOf((req.params.dishId))
        if(index >= 0) {
           favorite.dishes.splice(index,1);
           favorite.save()
           .then((favorite) => {
                Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes')
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }) 
           })
           .catch((err) => {
            return next(err);
           })
        }
        else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Dish ' + req.params.dishId + ' not present in your favorites');
        }
    });
});

module.exports = favoriteRouter;