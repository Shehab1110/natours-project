const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getTourReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ tour: req.params.tourID });
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: reviews,
  });
});

exports.preReviewCreation = (req, res, next) => {
  const { review, rating } = req.body;
  req.body.user = req.user;
  req.body.tour = req.params.tourID;
  if (!review || !rating || !req.body.tour)
    return next(
      new AppError('Please provide rating, review and a valid tourID', 400)
    );
  next();
};

exports.createReview = factory.createOne(Review);

exports.getReview = factory.getOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);
