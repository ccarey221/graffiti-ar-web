const userRouter = require('./resources/user/userRoute');
const placeRouter = require('./resources/place/placeRoute');
const artRouter = require('./resources/art/artRoute');
const artPlaceRouter = require('./resources/artPlace/artPlaceRoute');
const authRouter = require('./auth/authRoute');
const testRouter = require('./test/testRoute');
const isAuthenticated = require('./auth/authService').isAuthenticated;
// TODO: Add login / logout path

module.exports = (app) => {
  app.use('/user', isAuthenticated(), userRouter);
  app.use('/place', isAuthenticated(), placeRouter);
  app.use('/art', isAuthenticated(), artRouter);
  app.use('/artPlace', isAuthenticated(), artPlaceRouter);
  app.use('/auth', authRouter);
  // TODO: Remove / comment out for deployment
  app.use('/test', testRouter);
};
