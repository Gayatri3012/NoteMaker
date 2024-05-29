const User = require('../models/user');

const bcrypt = require('bcryptjs');

const { validationResult } = require('express-validator');

const {clearUser} = require('../middleware/clearUser.js');


exports.getLogin = (req, res, next) => {
    res.render('login', {
        pageTitle: 'Login',
        errorMessage: [],
        oldInput: {
            email: '',
            password: ''
        },
        validationErrors: []
    })
}

exports.getSignup = (req, res, next) => {
    res.render('signup', {
        pageTitle: 'Signup',
        oldInput: {
            email: '',
            password: '',
            confirmPassword: ''
        },
        errorMessage: '',
        validationErrors: []
    });
}

exports.postLogin = (req, res, next) => {  
    const email = req.body.email;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('login', {
            pageTitle: 'Login',
            oldInput: {
                email: email,
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        })
    }
  
    const password = req.body.password;

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                return res.render('login', {
                    pageTitle: 'Login',
                    errorMessage: 'Invalid email or password!',
                    oldInput: {
                        email: email,
                        password: password
                    },
                    validationErrors: []
                })
            }
            bcrypt
                .compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            if(err) console.log(err);
                            res.redirect('dashboard');
                        })
                    } else {
                        return res.render('login', {
                            pageTitle: 'Login',
                            errorMessage: 'Invalid email or password!',
                            oldInput: {
                                email: email,
                                password: password
                            },
                            validationErrors: [{ path: 'email', path: 'password' }]
                        })
                    }

                })
                .catch(err => {
                    console.log(err);
                    res.redirect('login');
                })
        })
        .catch(err => console.log(err));


}

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.render('signup', {
            pageTitle: 'Signup',
            oldInput: {
                email: email,
                name: req.body.name
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        })
    }

    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email: email,
                name: req.body.name,
                password: hashedPassword,
                notes: []
            })
            return user.save();
        })
        .then(result => {
            res.redirect('/login');
        })
        .catch(err => {
            console.log(err);
        })

}

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        if(err){
            console.log(err);
            next(err);
        } else {
            console.log('Session destroyed successfully');
            clearUser(req, res, next);
            res.redirect('/'); 
        }
       
    });
};
