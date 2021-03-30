const ExtractJwt = require("passport-jwt").ExtractJwt;
const JwtStrategy = require("passport-jwt").Strategy;
const config = require("../config/config.json");
const opts = {};
const mysql = require('mysql');
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.JWT_KEY;

module.exports = passport => {
    passport.use(
        new JwtStrategy(opts, async(jwt_payload, done) => {
            return done(null , jwt_payload)
        })

    );
};
