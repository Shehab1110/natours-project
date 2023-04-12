const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const tourRouter = express.Router();

// tourRouter.param('id', tourController.checkID);

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

module.exports = tourRouter;
