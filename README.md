<h1 align="center">Welcome to Secure Chat 👋</h1>
<p>
  <a href="https://github.com/nour-karoui/secure-chat#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/nour-karoui/secure-chat/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/nour-karoui/secure-chat/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/bishkou/password-pwnd" />
  </a>
</p>

#### An end to end encrypted messaging Real time messaging app built using React, Express, Socket.io, Mongodb, Node.Js, LDAP & OpenSSL


### 🏠 [Homepage](https://github.com/nour-karoui/secure-chat)

![alt tag](https://user-images.githubusercontent.com/47257753/126567790-afcdae8b-27fc-4e9e-8b5b-efabcafb7067.png)

***NB: This work is heavily based on [Timothylp's work](https://github.com/TimothyIp/rr_challenge). Shout out to the amazing frontend he prepared.***   
<hr />

Features:
  - User Account Creation/Login using LDAP
  - Real-time chat using socket.io
  - Tokens for API calls to backend
  - Cookies for saved session on browser refresh
  - Private Messaging with other users, all messages are end to end encrypted using asymmetric encryption <br/>


### Installing
```
git clone https://github.com/nour-karoui/secure-chat .
npm install
npm start
cd server 
npm install
npm start
Go to http://localhost:3001/
```

***PS***: Before Starting the app, make sure:

 **1- you have apache directory studio installed and running.
You can download it from [HERE](https://directory.apache.org/studio/downloads.html).
After running the apache directory studio, make sure to link it to our project in the file *server/config/ldap-client*.**
 
 **2- you generate a self signed certificate that'll allow you to verify the identity of the users and generate their certificates, *(our self signed cetificate is saved in server/openssl/CA)*.**


### How Does it work

1. When creating the account, the user generates a public and private key, and saves them in localstorage. the user sends the public key to the server alongside with his credentials.
*NEVER SHARE THE PRIVATE KEY WITH ANYONE*.
2. The server receives the user's credentials and his public key, he generates a certificate out of the public key and saves the user in the LDAP server.
3. Each time userA wants to chat with userB, the server sends userB's certificate to userA and vice versa.
Each user saves the other's certificate in their localstorage to be able to encrypt messages and send them.
4. The *ENCRYPTED* messages are saved in Monge DB.

## Author

👤 **Nour**

* Github: [@nour-karoui](https://github.com/nour-karoui)
* LinkedIn: [@nourkaroui](https://www.linkedin.com/in/nourkaroui/)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/nour-karoui/Inbox-Ethereum/issues). You can also take a look at the [contributing guide](https://github.com/nour-karoui/Inbox-Ethereum/blob/master/CONTRIBUTING.md).

## Show your support

Give a [STAR](https://github.com/nour-karoui/secure-chat) if this project helped you!

## 📝 License

* Copyright © 2021 [Nour](https://github.com/nour-karoui).
* This project is [MIT](https://github.com/nour-karoui/secure-chat/blob/master/LICENSE) licensed.

***
_This README was generated with by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
