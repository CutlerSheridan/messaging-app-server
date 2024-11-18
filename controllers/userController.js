const User = require('../models/User');
const { db } = require('../configs/mongodb_config');
const bcrypt = require('bcryptjs');

const saveToDB = async (user) => {
  try {
    const userExists = await db
      .collection('users')
      .findOne({ username: user.username });
    if (!userExists) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      user.password = hashedPassword;
      await db.collection('users').insertOne(user);
      return user;
    }
    return null;
  } catch (err) {
    throw new Error('saveToDB err: ' + err);
  }
};
const isCorrectPassword = async (user, inputPassword) => {
  const passwordIsCorrect = await bcrypt.compare(inputPassword, user.password);
  return passwordIsCorrect;
};
const findOne = async (searchFields) => {
  try {
    const userDoc = await db.collections('users').findOne(searchFields);
    if (!userDoc) {
      return null;
    }
    return User(userDoc);
  } catch (err) {
    throw new Error('findOne err: ' + err);
  }
};

module.exports = {
  saveToDB,
  isCorrectPassword,
  findOne,
};
