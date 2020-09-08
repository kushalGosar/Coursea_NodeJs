const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const authenticate = require("../authenticate");
const Favorites = require("../models/favorite");

const favoritesRouter = express.Router();

favoritesRouter.use(bodyParser.json());

favoritesRouter
  .route("/")
  .get(authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
      .populate("user")
      .populate("dishes")
      .then(
        favourites => {
          // extract favourites that match the req.user.id
          if (favourites) {
            user_favourites = favourites.filter(
              fav => fav.user._id.toString() === req.user.id.toString()
            )[0];
            if (!user_favourites) {
              var err = new Error("You have no favourites!");
              err.status = 404;
              return next(err);
            }
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(user_favourites);
          } else {
            var err = new Error("There are no favourites");
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
      .populate("user")
      .populate("dishes")
      .then(favourites => {
        var user;
        if (favourites)
          user = favourites.filter(
            fav => fav.user._id.toString() === req.user.id.toString()
          )[0];
        if (!user) user = new Favorites({ user: req.user.id });
        for (let i of req.body) {
          if (
            user.dishes.find(d_id => {
              if (d_id._id) {
                return d_id._id.toString() === i._id.toString();
              }
            })
          )
            continue;
          user.dishes.push(i._id);
        }
        user
          .save()
          .then(
            userFavs => {
              res.statusCode = 201;
              res.setHeader("Content-Type", "application/json");
              res.json(userFavs);
              console.log("Favorites Created");
            },
            err => next(err)
          )
          .catch(err => next(err));
      })
      .catch(err => next(err));
  })

  .put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation is not supported on /favourites");
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
      .populate("user")
      .populate("dishes")
      .then(
        favourites => {
          var favToRemove;
          if (favourites) {
            favToRemove = favourites.filter(
              fav => fav.user._id.toString() === req.user.id.toString()
            )[0];
          }
          if (favToRemove) {
            favToRemove.remove().then(
              result => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(result);
              },
              err => next(err)
            );
          } else {
            var err = new Error("You do not have any favourites");
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

favoritesRouter
  .route("/:dishId")
  .get(authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
      .populate("user")
      .populate("dishes")
      .then(
        favourites => {
          if (favourites) {
            const favs = favourites.filter(
              fav => fav.user._id.toString() === req.user.id.toString()
            )[0];
            const dish = favs.dishes.filter(
              dish => dish.id === req.params.dishId
            )[0];
            if (dish) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(dish);
            } else {
              var err = new Error("You do not have dish " + req.params.dishId);
              err.status = 404;
              return next(err);
            }
          } else {
            var err = new Error("You do not have any favourites");
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
      .populate("user")
      .populate("dishes")
      .then(favourites => {
        var user;
        if (favourites)
          user = favourites.filter(
            fav => fav.user._id.toString() === req.user.id.toString()
          )[0];
        if (!user) user = new Favorites({ user: req.user.id });
        if (
          !user.dishes.find(d_id => {
            if (d_id._id)
              return d_id._id.toString() === req.params.dishId.toString();
          })
        )
          user.dishes.push(req.params.dishId);

        user
          .save()
          .then(
            userFavs => {
              res.statusCode = 201;
              res.setHeader("Content-Type", "application/json");
              res.json(userFavs);
              console.log("Favorites Created");
            },
            err => next(err)
          )
          .catch(err => next(err));
      })
      .catch(err => next(err));
  })

  .put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation is not supported on /favourites/:dishId");
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
      .populate("user")
      .populate("dishes")
      .then(
        favourites => {
          var user;
          if (favourites)
            user = favourites.filter(
              fav => fav.user._id.toString() === req.user.id.toString()
            )[0];
          if (user) {
            user.dishes = user.dishes.filter(
              dishid => dishid._id.toString() !== req.params.dishId
            );
            user.save().then(
              result => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(result);
              },
              err => next(err)
            );
          } else {
            var err = new Error("You do not have any favourites");
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

module.exports = favoritesRouter;
