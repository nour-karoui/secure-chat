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
    console.log(err)
})

client.on('destroy', (err) => {
    console.log('disconnect')
    console.log(err)
})

module.exports = { client }
