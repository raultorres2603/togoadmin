$(document).ready(function(){
    $("#logo").fadeIn(1000);
    setTimeout(function() {
        $('#username').fadeIn(1500);
        $('#password').fadeIn(1500);
        $('#username_reg').fadeIn(1500);
        $('#password_reg').fadeIn(1500);
    },1000);
});

function compLog(username, password) {
    if (username.length > 0 && password.length > 0) {
        $('#entrar').fadeIn(1000);
    } else {
        $('#entrar').fadeOut(1000);
    }
}