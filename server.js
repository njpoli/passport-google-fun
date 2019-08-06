const express = require('express')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const mongoose = require('mongoose')
const cookieSession = require('cookie-session')
const User = require('./user')

const googleAuth = passport.authenticate('google',
  { scope: ['profile', 'email']
})

const app = express()

app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: ['helloworld']
  })
)

mongoose.connect('mongodb://localhost/google-passport-fun', {useNewUrlParser: true})

app.use(passport.initialize())
app.use(passport.session())


passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  done(null, id);
})

passport.use(
  new GoogleStrategy(
    {
      clientID: '1065805135559-2l94fb8h9ac2ouvid60anrbhnr9h1r4f.apps.googleusercontent.com',
      clientSecret: '7XqwDqtBAwoI7aYJdWX3g-lg',
      callbackURL: '/auth/google/callback'
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({googleId: profile.id})
        .then((res) => {
          if (res) {
            done(null, res);
          } else {
            let newUser = new User({
              googleId : profile.id,
              name: profile.displayName,
              email: profile.emails[0].value
            });
            newUser.save()
              .then(user => done(null, user));
          }
        })
      }
  )
)


app.get('/auth/google', googleAuth)

app.get('/auth/google/callback', googleAuth, (req, res) => {
  res.send('Your logged in via Google!')
})

app.get('/api/current_user', (req, res) => {
  res.send(req.user)
})

app.get('/api/logout', (req, res) => {
  req.logout()
  res.send(req.user)
})

app.listen(5000)