const express = require('express'),
      passportService = require('./config/passport'),
      passport = require('passport'),
      ChatController = require('./controllers/chat'),
      UserController = require('./controllers/user'),
      jwt = require('jsonwebtoken'),
      { authenticate } = require('ldap-authentication');
// Middleware for login/auth
const requireAuth = passport.authenticate('jwt', { session: false });

const ldap = require('ldapjs');

const client = ldap.createClient({
    url: ['ldap://127.0.0.1:10389'],
    reconnect: true,
    idleTimeout: 259200000
});

client.on('connect', (err) => {
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

const searchUsers = () => {
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
            filter: '(objectClass=*)',
            scope: 'sub',
            attributes: ['sn', 'cn']
        };

        client.search('ou=users,ou=system', opts, (err, res) => {
            if(err) {
                console.log("==========================")
                console.log('Search Error')
                console.log(err)
                console.log("==========================")
            }

            res.on('searchEntry', (entry) => {
                console.log('entry: ' + JSON.stringify(entry.object));
            });
            res.on('searchReference', (referral) => {
                console.log('referral: ' + referral.uris.join());
            });
            res.on('error', (err) => {
                console.error('error: ' + err.message);
            });
            res.on('end', (result) => {
                console.log('status: ' + result.status);
            });
        });
    }
});
}

function generateToken(user) {
    return jwt.sign(user, config.secret, {
        expiresIn: 7200
    });
}

async function auth(username, password) {
    // auth with admin
    let user = await authenticate({
        ldapOpts: { url: 'ldap://127.0.0.1:10389' },
        userDn: `cn=${username},ou=users,ou=system`,
        userPassword: password,
    })
}

module.exports = function(app) {
  const apiRoutes = express.Router(),
        authRoutes = express.Router(),
        chatRoutes = express.Router(),
        userRoutes = express.Router();

        // Auth Routes
        apiRoutes.use('/auth', authRoutes);

        // Registration Route
        authRoutes.post('/register', (req, response, next) => {
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
                    console.log(req.body);
                    const { card, name, lastName, username, password, email } = req.body;

                    const opts = {
                        filter: `|(employeeNumber=${card})(sn=${username})`,
                        scope: 'sub',
                        attributes: ['sn', 'cn']
                    };
                    let i = 0;
                    // search if there is a user with the same card num or username
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
                                i++;
                            }
                        });
                        res.on('searchReference', (referral) => {
                            console.log('referral: ' + referral.uris.join());
                        });
                        res.on('error', (err) => {
                            console.error('error: ' + err.message);
                        });
                        res.on('end', (result) => {
                            console.log('status: ' + result.status);
                            // if the user exists return 403 response
                            if(i !== 0) {
                                response.status(403).send({ error: "a user with the same credentials already exists"})
                            }
                        });
                    });

                    const entry = {
                        sn: username,
                        employeeNumber: card,
                        mail: email,
                        userPassword: password,
                        objectClass: 'inetOrgPerson'
                    }
                    // add user
                    client.add(`cn=${username},ou=users,ou=system`, entry, function (err) {
                        if(err) {
                            console.log("err in new user", err);
                        } else {
                            console.log("added user");
                        }
                    });
                    // generate jwt
                    response.status(200).json({
                        token: 'JWT ' + generateToken({username: username}),
                        user: {username: username}
                    })
                }
            });
        });

        authRoutes.post('/login', (req, response, next) => {
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

                    const { username, password } = req.body;

                    const opts = {
                        filter: `(sn=${username})`,
                        scope: 'sub',
                        attributes: ['sn', 'cn']
                    };
                    let i = 0;
                    let sn = '';
                    // search if there is a user with the same username
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
                                sn = entry.object.sn;
                                i++;
                            }
                        });
                        res.on('searchReference', (referral) => {
                            console.log('referral: ' + referral.uris.join());
                        });
                        res.on('error', (err) => {
                            console.error('error: ' + err.message);
                        });
                        res.on('end', (result) => {
                            console.log('status: ' + result.status);
                            if(i === 0) {
                                // return invalid credentials if username doesn't exist
                                return response.status(401).send({ error: "LOGIN FAILED"})
                            } else {
                                console.log("======================== LOGIN PART ============================")
                                auth(username, password).then(() => {
                                    console.log('success login');
                                    console.log("======================== LOGIN PART ============================")
                                    // generate token if everything is okay
                                    return response.status(200).json({
                                        token: 'JWT ' + generateToken({username: username}),
                                        user: {username: username}
                                    });
                                }).catch(err => {
                                    console.log('this happened')
                                    i=0;
                                    //return invalid credentials if password is incorrect
                                    return response.status(401).send({ error: "LOGIN FAILED"})
                                });
                            }
                        });
                    })
                }
            });
        });

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
