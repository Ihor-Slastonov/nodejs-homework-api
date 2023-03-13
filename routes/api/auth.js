const express = require('express');
const ctrl = require('../../controllers/auth');
const { authenticate, upload } = require('../../middlewares');

const router = express.Router();

router.post('/signup', ctrl.singup);

router.post('/login', ctrl.login);

router.get('/logout', authenticate, ctrl.logout);

router.get('/current', authenticate, ctrl.getCurrent);

router.patch('/', authenticate, ctrl.updateUserSubscription);

router.patch('/avatars', authenticate, upload.single('avatar'), ctrl.updateUserAvatar )

module.exports = router;
