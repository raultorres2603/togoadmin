
const express = require('express');
const app = express();
var path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
var session = require('express-session');
var mysql = require("mysql");
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
const bcrypt = require('bcrypt');
const saltRounds = 10;
const port = 3000;

var con_togo = mysql.createPool({
  host: '10.0.2.18',
  user: 'togoadmin',
  password: 'Togo123123!',
  database: 'togoadmin'
})

app.use(express.static(__dirname + '/public'));
app.use(session({
  secret: 'T0g04Dm1N',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))
app.set('views', path.join(__dirname, '/public/views'));

// GET
app.get('/', (req, res) => {
  if (typeof req.session.user == "undefined") {
    res.render(__dirname + '/public/views/login.pug');
  } else {
    res.render(__dirname + '/public/views/inicio.pug');
  }
})

app.get('/register', (req, res) => {
  if (typeof req.session.user == "undefined") {
    res.render(__dirname + '/public/views/register.pug');
  } else {
    res.render(__dirname + '/public/views/inicio.pug');
  }
})
// FIN GET

// POST
app.post('/register', (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  var password_hashed;

  con_togo.query(`SELECT COUNT(*) as contador FROM usu_adm WHERE user_usu = '${username}'`, (err, results) => {
    if (err) console.log(err);
    if (results[0].contador == 0) {
      var encriptar_contra = new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, function (err, salt) {
          bcrypt.hash(password, salt, function (err, hash) {
            if (err) reject(err);
            resolve(hash);
          });
        });
      });

      encriptar_contra.then((hash) => {
        con_togo.query(`INSERT INTO usu_adm(user_usu,pass_usu) VALUES ('${username}', '${hash}')`, (err, result) => {
          if (err) console.log(err);
          res.redirect('/');
        });
      })
    } else {
      res.render(__dirname + '/public/views/register.pug', {
        error: 1
      })
    }
  })
})
//FIN POST

http.listen(port, () => {
  console.log(`TogoAdmin escuchando en el puerto ${port}`);
})