const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const { v4: uuidv4 } = require('uuid');

const User = require('../models/user');
const {
  usersRegJoiSchema,
  usersLoginJoiSchema,
  usersUpdateSubsriptionJoiSchema,
  usersVerifyEmailJoiSchema,
  HttpError,
  ctrlWrapper,
  uploadUserAvatar,
  sendEmail,
} = require('../utils');

require('dotenv').config();
const { SECRET_KEY, BASE_URL } = process.env;

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
  const verificationToken = uuidv4();

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: 'Verify email',
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Click here to verify email and complete registration</a>`,
  };

  await sendEmail(verifyEmail);

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

const verifyUserEmail = async (req, res) => {
  const { verificationToken } = req.params;

  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw HttpError(404, 'User not found');
  }
  await User.findByIdAndUpdate(user._id, {
    verificationToken: null,
    verify: true,
  });
  res.json({
    status: 'success',
    code: 200,
    data: {
      message: 'Verification successful',
    },
  });
};

const resendingUserVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const { error } = usersVerifyEmailJoiSchema.validate(req.body);
  if (error) {
    throw HttpError(400, error.message);
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(404, 'Email not found ');
  }
  if (user.verify) {
    throw HttpError(400, 'Verification has already been passed');
  }

  const verifyEmail = {
    to: email,
    subject: 'Verify email',
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${user.verificationToken}">Click here to verify email and complete registration</a>`,
  };

  await sendEmail(verifyEmail);

  res.json({
    status: 'succes',
    code: 200,
    data: {
      message: 'Verification email sent',
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
  if (!user.verify) {
    throw HttpError(401, 'Email not verified');
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
  verifyUserEmail: ctrlWrapper(verifyUserEmail),
  resendingUserVerifyEmail: ctrlWrapper(resendingUserVerifyEmail),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  getCurrent: ctrlWrapper(getCurrent),
  updateUserSubscription: ctrlWrapper(updateUserSubscription),
  updateUserAvatar: ctrlWrapper(updateUserAvatar),
};
