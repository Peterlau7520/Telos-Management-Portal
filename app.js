//----------------PACKAGES----------------
const express = require('express');
const app = express();
var path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const exphbs = require('express-handlebars');
var hbs = require('hbs');
const flash = require('connect-flash');

//----------------MODELS----------------
const models = require('./models/models');



//----------------ROUTES----------------
const meetingManagement = require('./routes/meeting_management');
const accountManagement = require('./routes/account_management');
const searchMeetings = require('./routes/search_meetings');
const estateManagement = require('./routes/estate');

const index = require('./routes/index');
const auth = require('./routes/auth');
const Estate = models.Estate;

//----------------MIDDLEWARES----------------
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerHelper('stringify', function (context) {
    return JSON.stringify(context);
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//----------------AUTH----------------
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy
app.use(session({ secret: 'telos production' }));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  Estate.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    // Find the user with the given username
    Estate.findOne({ 'username': username }, function (err, estate) {
      // if there's an error, finish trying to authenticate (auth failed)
      if (err) {
        console.error(err);
        return done(err);
      }
      // if no user present, auth failed
      if (!estate) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      // if passwords do not match, auth failed
      if (estate.password !== password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      // auth has has succeeded
      return done(null, estate);
    });
  }
));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());



//----------------ROUTING----------------
app.use('/', auth(passport));
app.use('/', index);
app.use('/', meetingManagement);
app.use('/', accountManagement)
app.use('/', searchMeetings)
app.use('/', estateManagement)

//----------------ERRORS----------------
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error', {layout: 'errorLayout.hbs'});
  });


//----------------START----------------
app.listen(process.env.PORT || 3000, function () {
    console.log('server successfully started on Port 3000');
})
