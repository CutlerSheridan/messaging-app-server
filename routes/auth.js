const { Router } = require('express');
const router = Router();
const asyncHandler = require('express-async-handler');
const passport = require('../configs/passport_config');
const jwt = require('jsonwebtoken');
require('dotenv/config');

router.post(
  '/signup',
  passport.authenticate('signup', { session: false }),
  async (req, res, next) => {
    res.json({
      message: 'Signup successful',
      user: req.user,
    });
  }
);
router.post(
  '/login',
  asyncHandler(async (req, res, next) => {
    passport.authenticate('login', async (err, userResponse, info) => {
      if (err || !userResponse) {
        const error = new Error(info.message);
        return next(error);
      }
      req.login(userResponse, { session: false }, async (error) => {
        if (error) return next(error);
        const tokenBody = {
          _id: userResponse._id,
          username: userResponse.username,
        };
        const token = jwt.sign(tokenBody, process.env.JWT_KEY);
        return res.json({ token });
      });
    })(req, res, next);
  })
);

module.exports = router;
