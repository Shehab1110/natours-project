const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getTourReviews)
  .post(
    authController.protect,
    authController.permitOnly('user'),
    reviewController.preReviewCreation,
    reviewController.createReview
  );
router.get('/:id', reviewController.getReview);

router.patch('/updateReview/:id', reviewController.updateReview);

router.route('/deleteReview/:id').delete(reviewController.deleteReview);

module.exports = router;
