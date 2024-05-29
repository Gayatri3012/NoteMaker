const express = require('express');

const User = require('../models/user')

const router = express.Router();
const { validationResult, body } = require('express-validator');

const authController = require('../controllers/auth');


router.get('/login', authController.getLogin);

router.post('/login', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address.'),
    body('password', 'Password has to be valid.')
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim()
], authController.postLogin);

router.get('/signup', authController.getSignup);

router.post('/signup', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address.')
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('E-mail exists already, please pick a different one.')
                    }
                })
        })
        .normalizeEmail(),
    body('password', 'Please enter a password with only numbers and text and at least 5 characters.')
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim(),
    body('confirmPassword')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords have to match!')
            }
            return true;
        })
], authController.postSignup)

router.post('/logout', authController.postLogout)

module.exports = router;