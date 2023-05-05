/* eslint-disable import/no-extraneous-dependencies */
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const emailSender = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expiresIn: 90 * 3600 * 1000 * 24,
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('JWT', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token: token,
    data: {
      user: user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  await emailSender(
    newUser,
    'Welcome to the Natours Family!',
    'Start your journey with us!',
    '<h1> Welcome to the Natours Family! </h1>'
  );
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError('Please provide email and password!', 400));
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.JWT) {
    token = req.cookies.JWT;
  }
  if (!token)
    return next(
      new AppError('You are not logged in, please login to get access.', 401)
    );

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);
  if (!user)
    return next(
      new AppError('The user of this token does not exist anymore!', 401)
    );
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed the password, please login again!',
        401
      )
    );
  }
  req.user = user;
  next();
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  // 1) Check if the token exists
  if (req.cookies.JWT) {
    const decoded = await promisify(jwt.verify)(
      req.cookies.JWT,
      process.env.JWT_SECRET
    );
    // 2) Check if the user still exists
    const user = await User.findById(decoded.id);
    if (!user) return next();
    // 3) Check if the user changed the password after the token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return next();
    }
    // There is a logged in user
    res.locals.user = user;
    next();
  }
  next();
});

exports.permitOnly =
  (...roles) =>
  (req, res, next) => {
    if (roles.includes(req.user.role)) return next();
    return next(new AppError('You do not have permission!', 403));
  };

exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('The user with that email does not exist!', 404));

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/${resetToken}`;

  try {
    // await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token has been sent to your email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email, try again later!',
        500
      )
    );
  }
};

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiry: { $gt: Date.now() },
  });
  if (!user) return next(new AppError('Token is invalid or has expired', 400));
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiry = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ _id: req.user.id }).select('+password');
  if (!(await user.checkPassword(req.body.password, user.password)))
    return next(new AppError(`You've entered a wrong password!`));
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  await user.save();

  createSendToken(user, 200, res);
});
