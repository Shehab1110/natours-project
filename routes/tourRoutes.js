const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const tourRouter = express.Router();

// tourRouter.param('id', tourController.checkID);

tourRouter.use('/:tourID/reviews', reviewRouter);

tourRouter
  .route('/tours-stats')
  .get(authController.protect, tourController.getToursStats);

tourRouter
  .route('/monthly-plan/:year')
  .get(authController.protect, tourController.getMonthlyPlan);

tourRouter
  .route('/top-cheap-5')
  .get(
    authController.protect,
    tourController.topCheap5,
    tourController.getAllTours
  );

tourRouter
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

tourRouter
  .route('/distances/:latlng/unit/:unit')
  .get(tourController.getDistances);

tourRouter
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(authController.protect, tourController.createTour);

tourRouter
  .route('/:id')
  .get(authController.protect, tourController.getTourByID)
  .patch(authController.protect, tourController.updateTour)
  .delete(
    authController.protect,
    authController.permitOnly('admin', 'lead-guide'),
    tourController.deleteTour
  );

// tourRouter
//   .route('/:tourID/reviews')
//   .post(authController.protect, reviewController.createReview);

module.exports = tourRouter;
