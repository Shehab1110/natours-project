const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // This is the tour that the user is trying to book
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'A booking must belong to a tour!'],
  },
  // This is the user who is trying to book the tour
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A booking must belong to a user!'],
  },
  // This is the price of the tour at the time of booking
  price: {
    type: Number,
    required: [true, 'A booking must have a price!'],
  },
  // This is the date when the user booked the tour
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  // This is the status of the booking
  paid: {
    type: Boolean,
    default: true,
  },
});

// This is the query middleware that we will use to populate the tour and user fields
bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
