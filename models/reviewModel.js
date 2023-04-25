const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
      set: (val) => Math.round(val * 10) / 10,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour!'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user!'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Preventing duplicate reviews
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name -_id',
  });
  next();
});

reviewSchema.statics.calcRatingsAverage = async function (tourID) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourID },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourID, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourID, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};
// Document middleware for calculating average rating and quantity of ratings for a tour after a new review is created
reviewSchema.post('save', function () {
  this.constructor.calcRatingsAverage(this.tour);
});
// Query middleware for calculating average rating and quantity of ratings for a tour after a review is updated or deleted
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});
// Query middleware for calculating average rating and quantity of ratings for a tour after a review is updated or deleted
reviewSchema.post(/^findOneAnd/, async function () {
  this.r.constructor.calcRatingsAverage(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
