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

function ocultarImg(img) {
  $("#" + img).fadeToggle(1000);
  if (img == "servidor") {
    $("#desc_cliente").fadeToggle(1500, () => {
      new Typed(".titulo_cliente", {
        strings: [`Cliente`],
        typeSpeed: 50,
        onComplete: function(self) {
            new Typed(".informacion_cli", {
                strings: ["Cargando..."],
                typeSpeed: 50,
                startDelay: 1000
            })
        }
      });
    });
  } else {
      $('.titulo_cliente').html(" ")
  }
}
