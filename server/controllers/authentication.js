const jwt = require('jsonwebtoken'),
    User = require('../models/user'),
    openssl = require('openssl-nodejs'),
    config = require('../config/main'),
    {client} = require('../config/ldap-client'),
    fs = require('fs'),
    {authenticate} = require('ldap-authentication');

const generateToken = (user) => {
    return jwt.sign(user, config.secret, {
        expiresIn: 7200
    });
}

const auth = async (username, password) => {
    // auth with admin
    let user = await authenticate({
        ldapOpts: {url: 'ldap://127.0.0.1:10389'},
        userDn: `cn=${username},ou=users,ou=system`,
        userPassword: password,
    })
}

const register = async (req, response, next) => {
    client.bind('uid=admin,ou=system', 'secret', async (err) => {
        if (err) {
            console.log("==========================")
            console.log('Binding Error')
            console.log(err)
            console.log("==========================")
        } else {
            console.log("==========================")
            console.log("binding went great")
            console.log("==========================")
            const {card, name, lastName, username, password, email, csr} = req.body;
            const opts = {
                filter: `|(employeeNumber=${card})(sn=${username})`,
                scope: 'sub',
                attributes: ['sn', 'cn']
            };
            let i = 0;
            // search if there is a user with the same card num or username
            client.search('ou=users,ou=system', opts, async (err, res) => {
                if (err) {
                    console.log("==========================")
                    console.log('Search Error')
                    console.log(err)
                    console.log("==========================")
                }

                res.on('searchEntry', (entry) => {
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
                    if (i !== 0) {
                        response.status(403).send({error: "a user with the same credentials already exists"})
                    }
                });
            });

            await fs.writeFile("openssl/client/csr", csr, function (err) {
                if (err) {
                    return console.log(err);
                }
            });

            await openssl(
                ['x509', '-req', '-in', 'client/csr', '-out', 'client/cert', '-CA', 'openssl/CA/myCA.crt', '-CAkey', 'openssl/CA/myCA.key', '-CAcreateserial', '-CAserial', 'openssl/client.srl', '-days', '825']
                , function (err, buffer) {
                    console.log(err.toString(), buffer.toString());
                    fs.readFile('openssl/client/cert', 'utf8', function (err, data) {
                        // Display the file content
                        const certificate = data;
                        const entry = {
                            sn: username,
                            employeeNumber: card,
                            mail: email,
                            userPassword: password,
                            description: data,
                            objectClass: 'inetOrgPerson'
                        }
                        // add user
                        client.add(`cn=${username},ou=users,ou=system`, entry, function (err) {
                            if (err) {
                                console.log("err in new user", err);
                                response.status(401).json({
                                    error: 'error in adding user'
                                })
                            } else {
                                console.log("added user");
                                let user = new User({
                                    username: username,
                                    password: password,
                                });

                                user.save(function (err, user) {
                                    if (err) {
                                        console.log("err in new user", err);
                                        response.status(401).json({
                                            error: 'error in adding user'
                                        })
                                    }
                                    // generate jwt
                                    response.status(200).json({
                                        token: 'JWT ' + generateToken({username: username}),
                                        user: {username: username},
                                        certificate: certificate
                                    })
                                });
                            }
                        });

                    });
                });
        }
    });
}

const login = async (req, response, next) => {
    client.bind('uid=admin,ou=system', 'secret', (err) => {
        if (err) {
            console.log("==========================")
            console.log('Binding Error')
            console.log(err)
            console.log("==========================")
        } else {
            console.log("==========================")
            console.log("binding went great")
            console.log("==========================")

            const {username, password} = req.body;

            const opts = {
                filter: `(sn=${username})`,
                scope: 'sub',
                attributes: ['sn', 'cn', 'description']
            };
            let i = 0;
            let sn = '';
            let certificate = '';
            // search if there is a user with the same username
            client.search('ou=users,ou=system', opts, (err, res) => {
                if (err) {
                    console.log("==========================")
                    console.log('Search Error')
                    console.log(err)
                    console.log("==========================")
                }

                res.on('searchEntry', (entry) => {
                    if (JSON.stringify(entry.object) !== '') {
                        certificate = entry.object.description;
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
                res.on('end', async (result) => {
                    console.log('status: ' + result.status);
                    if (i === 0) {
                        // return invalid credentials if username doesn't exist
                        return response.status(401).send({error: "LOGIN FAILED"})
                    } else {
                        console.log("======================== LOGIN PART ============================")
                        // verif certif
                        await fs.writeFile("openssl/client/certif", certificate, function (err) {
                            if (err) {
                                return console.log(err);
                            }
                            console.log("The file was saved!");
                        });
                        openssl(['verify', '-CAfile', './openssl/CA/myCA.crt', './openssl/client/certif'], function (err, buffer) {
                            if (err.toString() !== '') {
                                return response.status(401).send({error: "LOGIN FAILED"})
                            }
                            auth(username, password).then(() => {
                                console.log('success login');
                                console.log("======================== LOGIN PART ============================")
                                // generate token if everything is okay
                                return response.status(200).json({
                                    token: 'JWT ' + generateToken({username: username}),
                                    user: {username: username},
                                    certificate: certificate
                                });
                            }).catch(err => {
                                console.log('this happened')
                                i = 0;
                                //return invalid credentials if password is incorrect
                                return response.status(401).send({error: "LOGIN FAILED"})
                            });
                        });
                    }
                });
            })
        }
    });
}

const getUserCertificate = async (req, response, next) => {
    client.bind('uid=admin,ou=system', 'secret', (err) => {
        if (err) {
            console.log("==========================")
            console.log('Binding Error')
            console.log(err)
            console.log("==========================")
        } else {
            console.log("==========================")
            console.log("binding went great")
            console.log("==========================")

            const username = req.params.username;
            const opts = {
                filter: `(sn=${username})`,
                scope: 'sub',
                attributes: ['sn', 'cn', 'description']
            };
            let i = 0;
            let sn = '';
            let certificate = '';
            // search if there is a user with the same username and return certificate
            client.search('ou=users,ou=system', opts, (err, res) => {
                if (err) {
                    console.log("==========================")
                    console.log('Search Error')
                    console.log(err)
                    console.log("==========================")
                }

                res.on('searchEntry', (entry) => {
                    if (JSON.stringify(entry.object) !== '') {
                        certificate = entry.object.description;
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
                res.on('end', async (result) => {
                    console.log('status: ' + result.status);
                    if (i === 0) {
                        // return invalid credentials if username doesn't exist
                        return response.status(401).send({error: "GETTING CERTIF FAILED"})
                    } else {
                        return response.status(200).json({
                            certificate: certificate
                        });
                    }
                });
            })
        }
    });
}

module.exports = {
    register,
    login,
    getUserCertificate
}
