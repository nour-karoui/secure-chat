const AuthenticationController = require('./controllers/authentication'),
      express = require('express'),
      passportService = require('./config/passport'),
      passport = require('passport'),
      ChatController = require('./controllers/chat'),
      UserController = require('./controllers/user');

// Middleware for login/auth
const requireAuth = passport.authenticate('jwt', { session: false });
const requireLogin = passport.authenticate('local', { session: false });

const ldap = require('ldapjs');

const client = ldap.createClient({
    url: ['ldap://127.0.0.1:10389'],
    reconnect: true,
    idleTimeout: 259200000
});

client.on('connect', (data) => {
    console.log('success');

});

client.on('error', (err) => {
      // handle connection error
    console.log('errrooooorrrr')
      console.log(err)
})

client.on('destroy', (err) => {
    console.log('disconnect')
    console.log(err)
})

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
        // const opts = {
        //     filter: '|(uid=1)(sn=karoui)',
        //     scope: 'sub',
        //     attributes: ['sn', 'cn']
        // };
        //
        // client.search('ou=users,ou=system', opts, (err, res) => {
        //     if(err) {
        //         console.log("==========================")
        //         console.log('Search Error')
        //         console.log(err)
        //         console.log("==========================")
        //     }
        //
        //     res.on('searchEntry', (entry) => {
        //         console.log('entry: ' + JSON.stringify(entry.object));
        //     });
        //     res.on('searchReference', (referral) => {
        //         console.log('referral: ' + referral.uris.join());
        //     });
        //     res.on('error', (err) => {
        //         console.error('error: ' + err.message);
        //     });
        //     res.on('end', (result) => {
        //         console.log('status: ' + result.status);
        //     });
        // });
        const entry = {
            sn: 'bari',
            objectClass: 'inetOrgPerson'
        }
        client.add('cn=bari,ou=users,ou=system', entry, function (err) {
           if(err) {
               console.log("err in new user", err);
           } else {
               console.log("added user");
           }
        })
    }
});

module.exports = function(app) {
  const apiRoutes = express.Router(),
        authRoutes = express.Router(),
        chatRoutes = express.Router(),
        userRoutes = express.Router();

      // test routes
      apiRoutes.post('/test', (req, res, next) => {
            console.log('i got heere')
      });

        // Auth Routes
        apiRoutes.use('/auth', authRoutes);

        // Registration Route
        authRoutes.post('/register', AuthenticationController.register);

        authRoutes.post('/login', requireLogin, AuthenticationController.login);

        authRoutes.post('/guest', AuthenticationController.guestSignup);

        // Chat Routes
        apiRoutes.use('/chat', chatRoutes);

        // View messages from users
        chatRoutes.get('/', requireAuth, ChatController.getConversations);

        // Gets individual conversations
      //   chatRoutes.get('/:conversationId', requireAuth, ChatController.getConversation);

        // Gets Private conversations
        chatRoutes.get('/privatemessages/:recipientId', requireAuth, ChatController.getPrivateMessages);
        
        // Start new conversation
        chatRoutes.post('/new', requireAuth, ChatController.newConversation);
        
        chatRoutes.post('/leave', requireAuth, ChatController.leaveConversation);

        // Reply to conversations
        chatRoutes.post('/reply', requireAuth, ChatController.sendReply);
        
        // View Chat Channel messages
        chatRoutes.get('/channel/:channelName', ChatController.getChannelConversations);

        // Post to Channel
        chatRoutes.post('/postchannel/:channelName', requireAuth, ChatController.postToChannel);

        // User Routes
        apiRoutes.use('/user', userRoutes);

        // Gets user's joined channels
        userRoutes.get('/getchannels', requireAuth, UserController.getChannels);

        // Add to user's channels
        userRoutes.post('/addchannel', requireAuth, UserController.addChannel);

        // Remove from user's channels
        userRoutes.post('/removechannel', requireAuth, UserController.removeChannel)

        // Set URL for API groups
        app.use('/api', apiRoutes);

}
