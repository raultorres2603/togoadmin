// Framework express
const express = require("express");
const app = express();
// Require de la librería de parseado de path
var path = require("path");
var fs = require("fs");
// Require de HTTP
const http = require("https").createServer(
  {
    key: fs.readFileSync("/etc/ssl/private/togo-certificado.key"),
    cert: fs.readFileSync("/etc/ssl/certs/togo-certificado.crt"),
  },
  app
);
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
// Libreria con uso de componentes
var osu = require('node-os-utils');
var cpu = osu.cpu;
var drive = osu.drive;
var mem = osu.mem;
var netstat = osu.netstat;
var proc = osu.proc;

var freeDisco;
var usedDisco;
var freeCPU;
var usedCPU;
var usedMem;
var freeMem;
var descInt;
var subInt;
var procTotales;
var procZombies;

// Encriptación de datos
const bcrypt = require("bcryptjs");
const { connect } = require("http2");
const saltRounds = 10;
const port = 3000;
var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");

var con_togo = mysql.createPool({
  host: `${process.env.IP_SERV}`,
  user: `${process.env.US}`,
  password: `${process.env.PAS}`,
  database: `${process.env.DB}`,
});

var emailTogo;
var passTogo;

con_togo.query(`SELECT * FROM correo_togo`, (err, result) => {
  if (err) console.log(err);
  emailTogo = result[0].email_admin;
  passTogo = result[0].pass_admin;
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

// TIEMPO REAL STATS

  setInterval(() => {
    var freeDrive = drive.free().then((infoDriveFree) => {
      freeDisco = infoDriveFree.freePercentage;
    })
    var usedDrive = drive.used().then((infoDriveUsed) => {
      usedDisco = infoDriveUsed.usedPercentage;
    })

    var freeCPUs = cpu.free().then((freeCPUss) => {
      freeCPU = freeCPUss;
    })

    var usedCPUs = cpu.usage().then((usedCPUss) => {
      usedCPU = usedCPUss;
    })

    var freeMems = mem.free().then((freeMemm) => {
      freeMem = freeMemm.freeMemMb;
    })

    var usedMems = mem.used().then((usedMemm) => {
      usedMem = usedMemm.usedMemMb;
    })

    var subidaInter = netstat.inOut().then((infoNet) => {
      subInt = infoNet.total.outputMb;
      descInt = infoNet.total.inputMb;
    })

    var procZom = proc.zombieProcesses().then((zombProc) => {
      procZombies = zombProc;
    })

    var procTot = proc.totalProcesses().then((totPro) => {
      procTotales = totPro - procZombies;
    })

    io.emit('enviarInfo', freeDisco, usedDisco, freeCPU, usedCPU, freeMem, usedMem, subInt, descInt, procTotales, procZombies);
  }, 1000)


// SOCKETS

io.on("connection", (socket) => {
  socket.on("regCorreo", (email, pass) => {
    con_togo.query(
      `SELECT COUNT(*) as contador, email_admin FROM correo_togo`,
      (err, result) => {
        if (err) console.log(err);
        if (result[0].contador > 0) {
          con_togo.query(`TRUNCATE TABLE correo_togo`, (err, result) => {
            if (err) console.log(err);

            con_togo.query(
              `INSERT INTO correo_togo VALUES ('${email}','${pass}')`,
              (err, result) => {
                if (err) console.log(err);
                socket.emit("regCorreo_ok", email);
              }
            );
          });
        } else {
          con_togo.query(
            `INSERT INTO correo_togo VALUES ('${email}','${pass}')`,
            (err, result) => {
              if (err) console.log(err);
              emailTogo = email;
              passTogo = pass;

              console.log(`EmailTogo: ${emailTogo} | PassTogo: ${passTogo}`);
              socket.emit("regCorreo_ok", email);
            }
          );
        }
      }
    );
  });

  socket.on("enviarCorreo", (emailTo) => {
    var mailOptions = {
      from: `${emailTogo}`,
      to: `${emailTo}`,
      subject: "Backups TogoAdmin",
      text: `Hola administrador/a, aquí tienes las backups del dia y hora ${new Date().toLocaleString(
        "en-GB"
      )}`,
      attachments: [
        {
          filename: "50-cloud-init-yaml",
          path: "/etc/netplan/50-cloud-init.yaml",
        },
      ],
    };

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: `${emailTogo}`,
        pass: `${passTogo}`,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        console.log(emailTogo);
        console.log(passTogo);
        socket.emit("enviarCorreo_error");
      } else {
        console.log("Email sent");
        socket.emit("enviarCorreo_ok");
      }
    });
  });
});

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
      uptime: uptime,
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

app.get("/logout", (req, res) => {
  delete req.session.user;
  res.redirect("/");
});
//FIN POST

http.listen(port, () => {
  console.log(`TogoAdmin escuchando en el puerto ${port}`);
});
