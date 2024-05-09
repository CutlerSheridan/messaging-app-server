const passport = require('passport');
const { Strategy: localStrategy } = require('passport-local');
const {
  Strategy: JWTstrategy,
  ExtractJwt: ExtractJWT,
} = require('passport-jwt');
const User = require('../models/User');
const userController = require('../controllers/userController');
const { ObjectId } = require('../configs/mongodb_config');

passport.use(
  'signup',
  new localStrategy(async (username, password, done) => {
    try {
      const user = await userController.saveToDB(User({ username, password }));
      if (user) {
        return done(null, user);
      }
      return done(null, false, { message: 'User already exists' });
    } catch (err) {
      done(err);
    }
  })
);

passport.use(
  'login',
  new localStrategy(async (username, password, done) => {
    try {
      const user = await userController.findOne({ username });
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }
      if (await userController.isCorrectPassword(user, password)) {
        return done(null, user, { message: 'Logged in successfully' });
      } else {
        return done(null, false, { message: 'Incorrect password' });
      }
    } catch (err) {
      return done(err);
    }
  })
);

passport.use(
  new JWTstrategy(
    {
      secretOrKey: process.env.JWT_KEY,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    },
    async (token, done) => {
      debug('token at start: ', token);
      try {
        const user = await userController.findOne({
          _id: new ObjectId(token._id),
        });
        if (user) {
          const { password, ...userMinusPassword } = user;
          return done(null, userMinusPassword);
        } else {
          return done(null, false);
        }
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

module.exports = passport;
