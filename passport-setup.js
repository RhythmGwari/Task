var passport = require("passport");
var GoogleStrategy = require('passport-google-oauth20').Strategy;
// const {Google} = require("googleapis");
// const key = require("./client_secret_301563813308-n8fd1i7sou50ii008huqvd0vu7uq5el1.apps.googleusercontent.com.json");
passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
passport.deserializeUser(function(id, done) {
User.findById(id, function(err, user) {
    done(err, user);
});
});


// const client = new google.auth.JWT(
//   key.clientID, null, key.clientSecret, []
// );

passport.use(new GoogleStrategy({
    clientID: "301563813308-n8fd1i7sou50ii008huqvd0vu7uq5el1.apps.googleusercontent.com",
    clientSecret: "sJeNSHsWY0roEvd6a9r0Nu-T",
    callbackURL: "http://localhost:3000/google/callback",
    passReqToCallback:true
  },
  function(request, accessToken, refreshToken, profile, done) {
    console.log(profile);
    // User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return done(null, profile);
    // });
  }
));