const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config/config');
const session = require('express-session');
const index = require('./routes/index');
const users = require('./routes/users');

const app = express();
const router = express.Router();

mongoose.connect(config.database);
mongoose.Promise = global.Promise;

mongoose.connection.once('open', () => {
    console.log('MongoDB connection has been made!');
}).on('error', (error) => {
    console.log('Connection error: ', error);
});

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(session({
    secret: 'ioasudhs',
    saveUninitialized: true,
    resave: true
}));

// local variables
app.use((req, res, next) => {
    res.locals.userLoggedIn = req.session.user;
    res.locals.flashMsg = null;
    next();
});

// set view engine to ejs
app.set('views', path.join(__dirname, 'app', 'views'));
app.set('view engine', 'ejs');

// set static files path
app.use(express.static(path.join(__dirname, 'public')))

// make sure the param id is valid
router.param('id', (req, res, next, id) => {
    if (!id.match(/^[a-f\d]{24}$/i)) {
        let err = new Error('Invalid ID!');
        err.status = 400;
        return res.render('error', {error: err});
    }

    next();
});

index(router);
users(router);
app.use(router);

// error handling
app.get('*', (req, res, next) => {
    let error = new Error('Page not found!');
    error.status = 404;
    res.render('error', {
        error: error
    });
});

app.use((err, req, res, next) => {
    res.render('error', {
        error: err
    });
});

app.listen(config.port, () => {
    console.log(`Server is listening to requests on port ${config.port}`)
});

module.exports = app;