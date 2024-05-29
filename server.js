const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const User = require('./models/user');
require('dotenv').config();

const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongodb-session')(session);
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;

const app = express();
const store = new MongoDBStore({
    uri: MONGO_URI,
    collection: 'sessions'
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: store
}))

app.set('view engine', 'ejs');
app.set('views', 'views');

const noteBoardRoutes = require('./routes/noteboard');
const authRoutes = require('./routes/auth');

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    next();
})


app.use('/', noteBoardRoutes);
app.use(authRoutes);

app.use((error, req, res, next) => {
    console.log(error)
    res.render('error', {
        pageTitle: 'Error!'
    });
});


mongoose.connect(MONGO_URI)
    .then(result => {
        app.listen(PORT, () => {
            console.log('Server is running fine...');
        });
    })
    .catch(err => {
        console.log(err);
    })