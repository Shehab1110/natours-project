const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// This is the Stripe secret key that we need to use the Stripe API
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
// This is the error handling function that we created

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId); // This is the tour that the user is trying to book
  // 2) Create checkout session
  console.log(tour);
  const session = await stripe.checkout.sessions.create({
    // We only want to accept card payments
    payment_method_types: ['card'],
    // This is the URL that the user will be redirected to when the payment is successful
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    // This is the URL that the user will be redirected to when the payment is cancelled
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    // This is the email of the user who is making the payment
    customer_email: req.user.email,
    // This is the ID of the tour that the user is trying to book
    client_reference_id: req.params.tourId,
    // This is the list of items that the user is trying to purchase
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });
  console.log(session);
  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });
  res.redirect(req.originalUrl.split('?')[0]);
});

exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
