const express = require('express');
const morgan = require('morgan');
// eslint-disable-next-line import/no-extraneous-dependencies
const rateLimit = require('express-rate-limit');
// eslint-disable-next-line import/no-extraneous-dependencies
const helmet = require('helmet');
// eslint-disable-next-line import/no-extraneous-dependencies
const mongoSanitize = require('express-mongo-sanitize');
// eslint-disable-next-line import/no-extraneous-dependencies
const xss = require('xss-clean');
// eslint-disable-next-line import/no-extraneous-dependencies
const hpp = require('hpp');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const app = express(); //function that upon calling adds a bunch of methods to app

// GLOBAL MIDDLEWARES

//1) SET SECURITY HTTP HEADERS
app.use(helmet());

//2) DEVELOPMENT LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //DETAILS LOGGED IN THE CONSOLE
}

//3) LIMIT REQUESTS FROM SAME IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

//4) BODY PARSER, READING DATA FROM BODY INTO req.body
app.use(express.json({ limit: '10kb' })); //MIDDLEWARE TO ATTACH BODY TO RES OBJECT
app.use((req, res, next) => {
  console.log('Hello from the middleware 👋🏻');
  next();
});

//Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data Sanitization against XSS
app.use(xss());

//Prevent parameter pollution
app.use(
  //array of properties that we want to allow duplicates
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);
//Serving static files
app.use(express.static(`${__dirname}/public`));

//5) TEST MIDDLEWARE
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter); //MOUNTING ROUTERS
app.use('/api/v1/users', userRouter); //MOUNTING ROUTERS
app.use('/api/v1/reviews', reviewRouter); //MOUNTING ROUTERS

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);
module.exports = app;
