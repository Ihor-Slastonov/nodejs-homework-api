const express = require('express');
const ctrl = require('../../controllers/auth');
const { authenticate, upload } = require('../../middlewares');

const router = express.Router();

// signup
router.post('/signup', ctrl.singup);

router.get('/verify/:verificationToken', ctrl.verifyUserEmail);

router.post('/verify', ctrl.resendingUserVerifyEmail);

// signin
router.post('/login', ctrl.login);

router.get('/logout', authenticate, ctrl.logout);

router.get('/current', authenticate, ctrl.getCurrent);

router.patch('/', authenticate, ctrl.updateUserSubscription);

router.patch(
  '/avatars',
  authenticate,
  upload.single('avatar'),
  ctrl.updateUserAvatar
);

module.exports = router;
