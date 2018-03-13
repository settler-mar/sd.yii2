
function getCookie(n) {
  return unescape((RegExp(n + '=([^;]+)').exec(document.cookie) || [1, ''])[1]);
}

function setCookie(name, value) {
  var cookie_string = name + "=" + escape ( value );
  document.cookie = cookie_string;
}

function eraseCookie(name){
  var cookie_string = name + "=0" +"; expires=Wed, 01 Oct 2017 00:00:00 GMT";
  document.cookie = cookie_string;
}
