const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: reviews,
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const { review, rating, tour } = req.body;
  if (!review || !rating || !tour)
    return next(new AppError('Please provide rating, review and tourID', 400));
  const newReview = await Review.create({
    review: review,
    rating: rating,
    tour: tour,
    user: req.user.id,
  });
  res.status(201).json({
    status: 'success',
    data: newReview,
  });
});
