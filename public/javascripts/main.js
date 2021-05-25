var socket = io();

var graficoDiscos;
var graficoCPU;
var graficoMem;
var graficoInt;
var graficoProc;

$("document").ready(function () {

  $("#logo").fadeIn(1000);
  $("#menu_ini").fadeIn(3000);
  setTimeout(function () {
    $("#username").fadeIn(1500);
    $("#password").fadeIn(1500);
    $("#username_reg").fadeIn(1500);
    $("#password_reg").fadeIn(1500);
  }, 1000);


  var labelsDiscos = ["Espacio Libre", "Espacio Usado",];
  var dataDiscos = {
    labels: labelsDiscos,
    datasets: [
      {
        label: "% de Uso",
        backgroundColor: ["rgb(0, 224, 255)", "rgb(255, 0, 0)"],
        data: [0,0],
      }
    ]
  };

  var configDiscos = {
    type: "doughnut",
    data: dataDiscos,
    options: {responsive: true},
  };

  graficoDiscos = new Chart(document.getElementById("graficoDiscos"), configDiscos);
  
  var labelsCPU = ["CPU Libre", "Uso de CPU",];
  var dataCPU = {
    labels: labelsCPU,
    datasets: [
      {
        label: "% de Uso",
        backgroundColor: ["rgb(0, 224, 255)", "rgb(255, 0, 0)"],
        data: [0, 0],
      }
    ]
  };

  var configCPU = {
    type: "doughnut",
    data: dataCPU,
    options: {responsive: true},
  };

  graficoCPU = new Chart(document.getElementById("graficoCPU"), configCPU);

  var labelsMem = ["RAM Libre", "Uso de RAM",];
  var dataMem = {
    labels: labelsMem,
    datasets: [
      {
        label: "GB de Uso",
        backgroundColor: ["rgb(0, 224, 255)", "rgb(255, 0, 0)"],
        data: [0, 0],
      }
    ]
  };

  var configMem = {
    type: "doughnut",
    data: dataMem,
    options: {responsive: true},
  };

  graficoMem = new Chart(document.getElementById("graficoMem"), configMem);

  var labelsEth = ["Descarga", "Subida",];
  var dataEth = {
    labels: labelsEth,
    datasets: [
      {
        label: "MB/s",
        backgroundColor: ["rgb(0, 224, 255)", "rgb(255, 0, 0)"],
        data: [0, 0],
      }
    ]
  };

  var configEth = {
    type: "bar",
    data: dataEth,
    options: {responsive: true},
  };

  graficoInt = new Chart(document.getElementById("graficoInternet"), configEth);

  var labelsProc = ["Totales", "Zombies",];
  var dataProc = {
    labels: labelsProc,
    datasets: [
      {
        label: "Nº de procesos",
        backgroundColor: ["rgb(0, 224, 255)", "rgb(255, 0, 0)"],
        data: [0, 0],
      }
    ]
  };

  var configProc = {
    type: "doughnut",
    data: dataProc,
    options: {responsive: true},
  };

  graficoProc = new Chart(document.getElementById("graficoProcesos"), configProc);
});



socket.on("regCorreo_ok", (email) => {
  document.getElementById(
    "alertaCorreo"
  ).innerText = `Se ha añadido el correo ${email} para TogoAdmin`;
  $("#alertaCorreo").fadeToggle(500, () => {
    setTimeout(() => {
      $("#alertaCorreo").fadeToggle(500);
    }, 1500);
  });
});

socket.on("enviarInfo", (freeDisco, usedDisco, freeCPU, usedCPU, freeMems, usedMems, subInt, descInt, procTotales, procZombies) => {
  // Actualizar grafico discos
  graficoDiscos.data.datasets[0].data[0] = freeDisco;
  graficoDiscos.data.datasets[0].data[1] = usedDisco;

  graficoDiscos.update();

  //Actualizar grafico CPU
  graficoCPU.data.datasets[0].data[0] = freeCPU;
  graficoCPU.data.datasets[0].data[1] = usedCPU;

  graficoCPU.update();

  // Actualizar gráfico RAM
  graficoMem.data.datasets[0].data[0] = freeMems;
  graficoMem.data.datasets[0].data[1] = usedMems;

  graficoMem.update();

  // Actualizar gráfico Int
  graficoInt.data.datasets[0].data[0] = descInt;
  graficoInt.data.datasets[0].data[1] = subInt;

  graficoInt.update();

  // Actualizar gráfico Procesos
  graficoProc.data.datasets[0].data[0] = procTotales;
  graficoProc.data.datasets[0].data[1] = procZombies;

  graficoProc.update();
});

socket.on("enviarCorreo_ok", () => {
  document.getElementById(
    "alertaCorreo"
  ).innerText = `Se ha enviado el correo correctamente.`;
  $("#alertaCorreo").fadeToggle(500, () => {
    setTimeout(() => {
      $("#alertaCorreo").fadeToggle(500);
    }, 1500);
  });
});

socket.on("enviarCorreo_error", () => {
  document.getElementById(
    "alertaCorreoError"
  ).innerText = `Ha habido un error al enviar el correo.`;
  $("#alertaCorreoError").fadeToggle(500, () => {
    setTimeout(() => {
      $("#alertaCorreoError").fadeToggle(500);
    }, 1500);
  });
});

function compLog(username, password) {
  if (username.length > 0 && password.length > 0) {
    $("#entrar").fadeIn(1000);
  } else {
    $("#entrar").fadeOut(1000);
  }
}

function compEmail(email, password) {
  if (email.length > 0 && password.length > 0) {
    $("#regCorreo").attr("disabled", false);
  } else {
    $("#regCorreo").attr("disabled", true);
  }
}

function ocultarImg(img) {
  $("#" + img).fadeToggle(1000, () => {
    if (img == "cliente") {
      $("#desc_servidor").fadeToggle(500);
    } else {
      $("#desc_cliente").fadeToggle(500);
      informCliente();
    }
  });
}

function informCliente() {
  let userAgent = window.navigator.userAgent;
  let numeroNucleos = window.navigator.hardwareConcurrency;
  let javaEnabled;
  if (window.navigator.javaEnabled() == true) {
    javaEnabled = "Sí";
  } else {
    javaEnabled = "No";
  }
  let lenguajeNav = window.navigator.language;
  let plataformaNavegador = window.navigator.platform;
  let cookiesEnabled;
  if (window.navigator.cookieEnabled == true) {
    cookiesEnabled = "Sí";
  } else {
    cookiesEnabled = "No";
  }
  let pluginNavegador = window.navigator.plugins;
  let vibrar = window.navigator.vibrate(500);

  // Integración de las variables en HTML
  $("#codigoNav").text(`${userAgent}`);
  $("#javaEn").text(`Java activado: ${javaEnabled}`);
  $("#lenguajeNav").text(`Lenguaje: ${lenguajeNav}`);
  $("#plataformaNav").text(`Plataforma: ${plataformaNavegador}`);
  $(`#cookiesEnabled`).text(`Cookies: ${cookiesEnabled}`);
  $("#cpus").text(`Nº de CPU's: ${numeroNucleos}`);
  document.getElementById("pluginsNav").innerText = "";
  for (let i = 0; i < pluginNavegador.length; i++) {
    const element = pluginNavegador[i].name;
    document.getElementById("pluginsNav").innerText =
      document.getElementById("pluginsNav").innerText + " " + element;
  }
}

function logout() {
  window.location.href = "/logout";
}

function mostrarModal(modal) {
  $(modal).modal("show");
}

function regCorreo(email, pass) {
  socket.emit("regCorreo", email, pass);
}

function enviarBack(email) {
  socket.emit("enviarCorreo", email);
}
