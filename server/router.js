const express = require('express'),
    passportService = require('./config/passport'),
    passport = require('passport'),
    User = require('./models/user'),
    ChatController = require('./controllers/chat'),
    AuthController = require('./controllers/authentication');

// Middleware for login/auth
const requireAuth = passport.authenticate('jwt', {session: false});



module.exports = function (app) {
    const apiRoutes = express.Router(),
        authRoutes = express.Router(),
        chatRoutes = express.Router();

    // Auth Routes
    apiRoutes.use('/auth', authRoutes);

    // Registration Route
    authRoutes.post('/register', AuthController.register);

    authRoutes.post('/login', AuthController.login);

    // get user certificate
    authRoutes.get('/certif/:username', AuthController.getUserCertificate)

    // Chat Routes
    apiRoutes.use('/chat', chatRoutes);

    // View messages from users
    chatRoutes.get('/', requireAuth, ChatController.getConversations);

    // Gets Private conversations
    chatRoutes.get('/privatemessages/:recipientId', requireAuth, ChatController.getPrivateMessages);

    // Start new conversation
    chatRoutes.post('/new', requireAuth, ChatController.newConversation);

    chatRoutes.post('/leave', requireAuth, ChatController.leaveConversation);

    // Reply to conversations
    chatRoutes.post('/reply', requireAuth, ChatController.sendReply);

    // Set URL for API groups
    app.use('/api', apiRoutes);

}
