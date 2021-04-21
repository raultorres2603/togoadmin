// Framework express
const express = require("express");
const app = express();
// Require de la librería de parseado de path
var path = require("path");
var fs = require("fs");
// Require de HTTP
const http = require("https").createServer({
  key: fs.readFileSync('/etc/ssl/private/togo-certificado.key'),
  cert: fs.readFileSync('/etc/ssl/certs/togo-certificado.crt')
},app);
// Libreria de socket
const io = require("socket.io")(http);
// Require de la libreria O.S
const os = require("os");
// Require de las variables de sesión de express
var session = require("express-session");
// Require de la libreria que nos proporciona acceso a MySQL
var mysql = require("mysql");
// Librería de compresión de respuestas
var compression = require("compression");
// Utlización de variables enmascaradas en .env
require("dotenv").config();
// Parser de formularios
const bodyParser = require("body-parser");
// Encriptación de datos
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const port = 3000;

var con_togo = mysql.createPool({
  host: `${process.env.IP_SERV}`,
  user: `${process.env.US}`,
  password: `${process.env.PAS}`,
  database: `${process.env.DB}`,
});

app.use(express.static(__dirname + "/public"));
app.use(
  session({
    secret: "T0g04Dm1N",
    resave: false,
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.set("views", path.join(__dirname, "/public/views"));
app.set("view engine", "pug");
app.use(compression());

// GET
app.get("/", (req, res) => {
  if (typeof req.session.user == "undefined") {
    res.render(__dirname + "/public/views/login");
  } else {
    res.redirect("/inicio");
  }
});

app.get("/register", (req, res) => {
  if (typeof req.session.user == "undefined") {
    res.render(__dirname + "/public/views/register");
  } else {
    res.render(__dirname + "/public/views/inicio");
  }
});

app.get("/inicio", (req, res) => {
  if (typeof req.session.user == "undefined") {
    res.redirect("/");
  } else {
    // Envío de información del servidor
    let arquitectura = os.arch(); //x
    let cpus = os.cpus(); //x
    let endianess = os.endianness(); //x
    let freeMemory = os.freemem();
    let totalMemory = os.totalmem();
    let hostname = os.hostname();
    let interfaces = os.networkInterfaces();
    let plataforma = os.platform(); //x
    let release = os.release();
    let uptime = os.uptime();

    res.render(__dirname + "/public/views/inicio", {
      arch: arquitectura,
      cpus: cpus,
      endianess: endianess,
      freeMem: freeMemory,
      totalMem: totalMemory,
      hostname: hostname,
      interfaces: interfaces,
      plataforma: plataforma,
      release: release,
      uptime: uptime
    });
  }
});
// FIN GET

// POST
app.post("/register", (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  var password_hashed;

  con_togo.query(
    `SELECT COUNT(*) as contador FROM usu_adm WHERE user_usu = '${username}'`,
    (err, results) => {
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
          con_togo.query(
            `INSERT INTO usu_adm(user_usu,pass_usu) VALUES ('${username}', '${hash}')`,
            (err, result) => {
              if (err) console.log(err);
              res.redirect("/");
            }
          );
        });
      } else {
        res.render(__dirname + "/public/views/register", {
          error: 1,
        });
      }
    }
  );
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  var pass_db = new Promise((resolve, reject) => {
    con_togo.query(
      `SELECT pass_usu FROM usu_adm WHERE user_usu = '${username}'`,
      (err, result) => {
        if (err) reject(err);
        resolve(result[0].pass_usu);
      }
    );
  });

  pass_db.then((pass_db) => {
    bcrypt.compare(password, pass_db).then(function (result) {
      if (result == true) {
        con_togo.query(
          `SELECT idusu FROM usu_adm WHERE user_usu = '${username}'`,
          (err, result) => {
            if (err) console.log(err);
            if (result.length > 0) {
              req.session.user = result[0].idusu;
              console.log(req.session.user);
              res.redirect("/");
            } else {
              res.render(__dirname + "/public/views/login", {
                error: 1,
              });
            }
          }
        );
      } else {
        console.log("ERROR_COMPARAR");
        res.render(__dirname + "/public/views/login", {
          error: 1,
        });
      }
    });
  });
});
//FIN POST

http.listen(port, () => {
  console.log(`TogoAdmin escuchando en el puerto ${port}`);
});
