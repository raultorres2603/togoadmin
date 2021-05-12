var socket = io();


socket.on('regCorreo_ok', (email) => {
  document.getElementById('alertaCorreo').innerText = `Se ha añadido el correo ${email} para TogoAdmin`;
  $('#alertaCorreo').fadeToggle(500, () => {
    setTimeout(() => {
      $('#alertaCorreo').fadeToggle(500);
    }, 1500)
  })
})



$(document).ready(function () {
  $("#logo").fadeIn(1000);
  $("#menu_ini").fadeIn(3000);
  setTimeout(function () {
    $("#username").fadeIn(1500);
    $("#password").fadeIn(1500);
    $("#username_reg").fadeIn(1500);
    $("#password_reg").fadeIn(1500);
  }, 1000);
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
    $('#regCorreo').attr('disabled', false);
  } else {
    $('#regCorreo').attr('disabled', true);
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
  $(modal).modal('show');
}

function regCorreo(email, pass) {
  socket.emit('regCorreo', email, pass);
}

function enviarBack(valores) {
  console.log(valores);
  
}