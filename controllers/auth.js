const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');

const User = require('../models/user');
const {
  usersRegJoiSchema,
  usersLoginJoiSchema,
  usersUpdateSubsriptionJoiSchema,
  HttpError,
  ctrlWrapper,
  uploadUserAvatar,
} = require('../utils');

require('dotenv').config();
const { SECRET_KEY } = process.env;

const singup = async (req, res) => {
  const { email, password } = req.body;
  const { error } = usersRegJoiSchema.validate(req.body);
  if (error) {
    throw HttpError(400, error.message);
  }

  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, 'Email in use');
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
  });

  res.status(201).json({
    status: 'success',
    code: '201',
    data: {
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const { error } = usersLoginJoiSchema.validate(req.body);
  if (error) {
    throw HttpError(400, error.message);
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, 'Email or password is wrong');
  }
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, 'Email or password is wrong');
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '23h' });
  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    status: 'success',
    code: 200,
    data: {
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    },
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });
  res.status(204).json({ message: 'No content' });
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;
  res.json({
    status: 'success',
    code: 200,
    data: {
      email,
      subscription,
    },
  });
};

const updateUserSubscription = async (req, res) => {
  const { _id } = req.user;
  const { error } = usersUpdateSubsriptionJoiSchema.validate(req.body);
  if (error) {
    throw HttpError(400, error.message);
  }
  const user = await User.findByIdAndUpdate(_id, req.body, { new: true });
  res.json({
    status: 'success',
    code: 200,
    data: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const updateUserAvatar = async (req, res) => {
  const { _id } = req.user;
  const avatarURL = uploadUserAvatar(_id, req.file);
  await User.findByIdAndUpdate(_id, { avatarURL });
  res.json({
    status: 'success',
    code: 200,
    data: {
      avatarURL,
    },
  });
};

module.exports = {
  singup: ctrlWrapper(singup),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  getCurrent: ctrlWrapper(getCurrent),
  updateUserSubscription: ctrlWrapper(updateUserSubscription),
  updateUserAvatar: ctrlWrapper(updateUserAvatar),
};
