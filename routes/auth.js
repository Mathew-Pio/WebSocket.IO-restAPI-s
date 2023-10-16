const express = require('express');
const { check } = require('express-validator');

const router = express.Router();
const authController = require('../controllers/auth')

router.post('/signup', [
    check('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
    check('password')
    .trim().isLength({min:5}),
    check('name').trim().not().isEmpty()
], authController.postSignup);

router.post('/login', authController.login)

module.exports = router;