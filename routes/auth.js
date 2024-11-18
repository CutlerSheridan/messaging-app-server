const { Router } = require('express');
const router = Router();
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const passport = require('../configs/passport_config');
const jwt = require('jsonwebtoken');
require('dotenv/config');

router.post('/signup', [
  body('username')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Username is required')
    .bail()
    .custom(async (value) => {
      const existingUser = await userController.findOne({ username: value });
      if (existingUser) {
        throw new Error('Username is taken');
      }
    })
    .bail()
    .isAlphanumeric()
    .withMessage('Username may only contain letters and numbers'),
  body('password')
    .trim()
    .blacklist(/[<>]/)
    .notEmpty()
    .withMessage('Password is required')
    .bail()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least 1 uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(){}[\].?-_+=`]/)
    .withMessage(
      'Password must contain at least 1 of the following: ! @ # $ % ^ & * ( ) { } [ ] . ? - _ + = `'
    ),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      passport.authenticate('signup', async (err, userResponse, info) => {
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
    } else {
      res.json(errors.array());
    }
  }),
]);
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
