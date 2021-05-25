const passport = require('passport'),
      config = require('./main'),
      JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt;

const ldap = require('ldapjs');

const client = ldap.createClient({
  url: ['ldap://127.0.0.1:10389'],
  reconnect: true,
  idleTimeout: 259200000
});

client.on('connect', (err) => {
  console.log('success');
});

const jwtOptions = {
  // Tells passport to check authorization headers for JWT
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
  // Tells passport where to find secret
  secretOrKey: config.secret
};

// JWT login strategy setup
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
  console.log(payload);
  console.log('heeeeerreee');
  client.bind('uid=admin,ou=system', 'secret', (err) => {
    if(err) {
      console.log("==========================")
      console.log('Binding Error')
      console.log(err)
      console.log("==========================")
    } else {
      console.log("==========================")
      console.log("binding went great")
      console.log("==========================")
      const opts = {
        filter: `(sn=${payload.username})`,
        scope: 'sub',
        attributes: ['sn', 'cn']
      };
      let user = null;

      client.search('ou=users,ou=system', opts, (err, res) => {
        if(err) {
          console.log("==========================")
          console.log('Search Error')
          console.log(err)
          console.log("==========================")
        }

        res.on('searchEntry', (entry) => {
          console.log('entry: ' + JSON.stringify(entry.object));
          if (JSON.stringify(entry.object) !== '') {
            user = entry.object;
          }
        });
        res.on('searchReference', (referral) => {
          console.log('referral: ' + referral.uris.join());
        });
        res.on('error', (err) => {
          console.error('error: ' + err.message);
          return done(err, false);
        });
        res.on('end', (result) => {
          console.log('status: ' + result.status);
          if (user) {
            done(null, user);
          }else {
            done(null, false);
          }
        });
      });
    }
  });
});

passport.use(jwtLogin);
