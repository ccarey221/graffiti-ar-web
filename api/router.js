const userRouter = require('./resources/user/userRoute');
const placeRouter = require('./resources/place/placeRoute');
const artRouter = require('./resources/art/artRoute');
const artPlaceRouter = require('./resources/artPlace/artPlaceRoute');
const voteRouter = require('./resources/vote/voteRoute');
const authRouter = require('./auth/authRoute');
const testRouter = require('./test/testRoute');
const isAuthenticated = require('./auth/authService').isAuthenticated;

module.exports = (app) => {
  app.use('/user', isAuthenticated(), userRouter);
  app.use('/place', isAuthenticated(), placeRouter);
  app.use('/art', isAuthenticated(), artRouter);
  app.use('/artPlace', isAuthenticated(), artPlaceRouter);
  app.use('/vote', isAuthenticated(), voteRouter);
  app.use('/auth', authRouter);
  // Only adds the test route when testing locally or on CI
  if (process.env.HOST_MODE !== "PROD") {
    app.use('/test', testRouter);
  }
};
