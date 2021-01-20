
const express = require('express');
const app = express();
var path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
var session = require('express-session');
const mysql = require("mysql");
const port = 3000;

app.use(express.static(__dirname + '/public'));
app.use(session({
  secret: 'T0g04Dm1N',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))
app.set('views', path.join(__dirname, '/public/views'));

app.get('/', (req, res) => {
  if (typeof req.session.user == "undefined") {
    res.render(__dirname + '/public/views/login.pug');
  } else {
    res.render(__dirname + '/public/views/inicio.pug');
  }
})

http.listen(port, () => {
  console.log(`TogoAdmin escuchando en el puerto ${port}`);
})