const mainURL = "https://api.finproba.ru"
const requestTimeout = 2000
var cookies = document.cookie


if (document.title == "Вход") { checkForEmailVerification() }


/* 
Checks if any of fields are empty
Checks if passwords are the same
*/

function fieldsPreviousCheckUp() {
  var title = document.title
  if (title == "Регистрация") {
    registrationPageFieldsPreviousCheck()
  } else if (title == "Вход") {
    loginPageFieldsPreviousCheck()
  } else if (title == "Забыли пароль") {
    returnPasswordPageFieldsPreviousCheck()
  } else if (title == "Новый пароль") {
    returnPasswordPageFieldsSecondaryCheck()
  }
}


function registrationPageFieldsPreviousCheck() {
  var email = document.getElementById("email")
  var emailError = document.getElementById("emailError")
  var name = document.getElementById("name")
  var nameError = document.getElementById("nameError")
  var password = document.getElementById("password")
  var passwordError = document.getElementById("passwordError")
  var passwordRepeat = document.getElementById("passwordR")
  var passwordRError = document.getElementById("passwordRError")

  if (email.value== "") {
    email.parentNode.classList.add("error")
    emailError.innerText = "Введите адрес электронной почты"
    return
  } else {
    email.parentNode.classList.remove("error")
  }
  if (name.value== "") {
    name.parentNode.classList.add("error")
    nameError.innerText = "Придумайте игровое имя"
    return
  } else {
    name.parentNode.classList.remove("error")
  }
  if (password.value == "") {
    password.parentNode.parentNode.classList.add("error")
    passwordError.innerText = "Введите пароль"
    return
  } else {
    password.parentNode.parentNode.classList.remove("error")
  }
  if (passwordRepeat.value == "") {
    passwordRepeat.parentNode.parentNode.classList.add("error")
    passwordRError.innerText = "Введите снова тот же пароль"
    return
  } else {
    passwordRepeat.parentNode.parentNode.classList.remove("error")
  }

  if (password.value != passwordRepeat.value) {
    passwordRepeat.parentNode.parentNode.classList.add("error")
    passwordRError.innerText = "Пароли не совпадают"
    return
  }

  try {
    signUpUser(email.value, name.value, password.value)
  } catch(e) {
    handleErrorOnPage("Проблемы с работой сервера, повторите попытку позже")
  }
}

function loginPageFieldsPreviousCheck() {
  var email = document.getElementById("email")
  var emailError = document.getElementById("emailError")
  var password = document.getElementById("password")
  var passwordError = document.getElementById("passwordError")

  if (email.value== "") {
    email.parentNode.classList.add("error")
    emailError.innerText = "Введите адрес электронной почты"
    return
  } else {
    email.parentNode.classList.remove("error")
  }
  if (password.value == "") {
    password.parentNode.parentNode.classList.add("error")
    passwordError.innerText = "Введите пароль"
    return
  } else {
    password.parentNode.parentNode.classList.remove("error")
  }

  try {
    signInUser(email.value, password.value)
  } catch(e) {
    handleErrorOnPage("Проблемы с работой сервера, повторите попытку позже")
  }
}

function returnPasswordPageFieldsPreviousCheck() {
  var email = document.getElementById("email")
  var emailError = document.getElementById("emailError")

  email.parentNode.classList.remove("error")
  if (email.value == "") {
    email.parentNode.classList.add("error")
    emailError.innerText = "Введите адрес электронной почты"
    return
  }

  var xhr = new XMLHttpRequest()
  var URL = mainURL + `/forgot_password?email=${email.value}`

  xhr.open("POST", URL)
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.timeout = requestTimeout

  xhr.onreadystatechange = function(e) {
    if (xhr.readyState == 4) {
      if (xhr.status != 200) {
        handleErrorOnPage("Проблемы с подключением, повторите попытку позже")
        console.log(xhr.status, xhr.responseText);
        return
      }
      if (xhr.responseText == 'user does not exist') {
        handleErrorOnPage("Этот email не зарегистрирован")
        return
      }
      if (xhr.responseText == 'message not send') {
        handleErrorOnPage("Сообщение не отправлено")
        return
      }
      if (xhr.responseText == 'OK') {
        window.sessionStorage.setItem('email', email.value)
        window.location.href = "/CheckEmailPage"
      }
    }
  }

  xhr.send()

}

function returnPasswordPageFieldsSecondaryCheck() {
  var password = document.getElementById("password")
  var passwordError = document.getElementById("passwordError")

  password.parentNode.parentNode.classList.remove("error")
  if (password.value == "") {
    handleErrorOnPage("Введите новый пароль", "password", true)
    return
  }

  var URLParams = new URLSearchParams(window.location.search)
  if (!URLParams.has('uuid')) {
    handleErrorOnPage("Вы прошли по некорректной ссылке", "password", true)
    return
  }
  const uuid = URLParams.get('uuid')

  var xhr = new XMLHttpRequest()
  var URL = mainURL + "/password_recovery"

  xhr.open("POST", URL)
  xhr.timeout = requestTimeout

  xhr.onreadystatechange = function(e) {
    if (xhr.readyState == 4) {
      if (xhr.status != 200) {
        handleErrorOnPage("Проблемы с подключением, повторите попытку позже", "password", true)
        return
      }
      if (xhr.responseText == "Time expired") {
        handleErrorOnPage("Время верификации истекло, повторите попытку", "password", true)
        return
      }
      if (xhr.responseText == "OK") {
        window.location.href = "/SuccessPasswordChange"
      } else {
        console.log(xhr.responseText);
      }
    }
  }

  xhr.send(JSON.stringify({
    "uuid": uuid,
    "new_password": password.value
  }))
}

//---------------------------------------------------------------------

/*
Shows/hides password in text field
*/

function switchPasswordState(id) {
  var field = document.getElementById(id)
  var button = document.getElementById(id+"Button")

  if (field.type == "password") {
    field.type = "text"
    button.src = "../static/imgs/password_eye_slash.png"
  } else if (field.type == "text") {
    field.type = "password"
    button.src = "../static/imgs/password_eye.png"
  }
}


/* 
Methods which are working with API
*/

function signUpUser(email, name, password) {
  xhr = new XMLHttpRequest()
  var URL = mainURL + "/signup"

  xhr.timeout = requestTimeout

  xhr.onreadystatechange = function(e) {
    if (xhr.readyState == 4) {
      console.log(xhr.status);

      if (xhr.status == 200) {
        console.log(xhr.responseText);
        if (xhr.responseText == "This name is taken") {
          handleErrorOnPage("Это имя уже используется", "name")
          return
        } 
        if (xhr.responseText == "This email is taken") {
          handleErrorOnPage("Эта почта уже используется")
          return
        } 
        if (xhr.responseText == "Email does not exist"){
          handleErrorOnPage("Некорректный email")
          return
        }
        if (xhr.responseText == "OK") {
          onRegistrationSuccess()
        }
      } else {
        handleErrorOnPage("Проблемы с подключением, повторите попытку позже")
      }
    }
  }

  // timeout handler

  xhr.open("POST", URL)

  xhr.send(JSON.stringify({
    "Name": name,
    "Email": email,
    "Password": password
  }))
}

function signInUser(email, password) {
  xhr = new XMLHttpRequest()
  var URL = mainURL + "/signin"

  xhr.timeout = requestTimeout

  xhr.onreadystatechange = function(e) {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        if (xhr.responseText == "Email not verifed") {
          handleErrorOnPage("Аккаунт не верифицирован")
          return
        }
        try {
          var json = JSON.parse(xhr.responseText)
          console.log(json["status"])
          if (json["status"] == "Success") {
            var decodedToken = decodeToken(json["token"])
            var expireForMainToken = decodedToken["exp"]
            var expireForRefreshToken = decodeToken(json["refresh_token"])["exp"]

            setCookie("profileStatusAdmin", json["status"])
            setCookie("token", json["token"], expireForMainToken)
            setCookie("refresh_token", json["refresh_token"], expireForRefreshToken)

            window.location.href = "/ChapterSelectorPage"
          } else {
            handleErrorOnPage("Неправильный логин или пароль")
          }
        } catch(e) {
          console.log(e.message)
          handleErrorOnPage("Проблемы с данными сервера, повторите попытку позже")
        }
      } else {
        handleErrorOnPage("Проблемы с подключением, повторите попытку позже")
      }
    }
  }
  xhr.open("POST", URL)

  xhr.send(JSON.stringify({
    "Email": email,
    "Password": password
  }))
}

function requestForNewEmail() {
  var xhr = new XMLHttpRequest()
  var email = window.sessionStorage.getItem('email')

  if (email == null) {
    console.log("empty email");
    return
  }

  var URL = mainURL + `/resend_email_verify?sub=${email}`
  console.log(URL);

  xhr.open("POST", URL)
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.timeout = requestTimeout

  xhr.onreadystatechange = function(e) {
    if (xhr.readyState == 4) {
      if (xhr.status != 200) {
        console.log(xhr.status);
        return
      }
    }
  }

  xhr.send()
}

function handleErrorOnPage(error, idOfElementWithText="email", password=false) {
  try {
    var element = document.getElementById(idOfElementWithText)
    var elementError = document.getElementById(idOfElementWithText + "Error")
    if (password) {
      element.parentNode.parentNode.classList.add("error")
    } else {
      element.parentNode.classList.add("error")
    }
    elementError.innerText = error
  } catch(e) {
    alert(e.message)
  }
}

function onRegistrationSuccess() {
  var email = document.getElementById("email").value
  window.sessionStorage.setItem('email', email)
  window.location.href = "/ApproveEmailPage"
}

function checkForEmailVerification() {
  console.log(document.title);
  if (!document.title == "Вход") { return }
  else {
    var URLParams = new URLSearchParams(window.location.search)
    if (!URLParams.has("uuid")) { return }
    const uuid = URLParams.get("uuid")
    var xhr = new XMLHttpRequest()
    var URL = mainURL + `/email_verify?uuid=${uuid}`

    xhr.onreadystatechange = function(e) {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          console.log(xhr.responseText, "RERER");
          if (xhr.responseText == "Bad request") {
            FNAlertCall({title: "Некорректный UUID",
              text: "Пользователь уже прошёл аутентификацию или UUID неправильный",
              cancelButtonText: "ОК"})
          } else if (xhr.responseText == "Time expired") {
            FNAlertCall({
              title: "Время, отведённое на аутентификацию прошло",
              buttons: [{
              text: "Пройти регистрацию снова",
              style: "primary",
              method: function() { window.location.href = "/RegistrationPage"
              }}]
            })
          }
        }
      }
    }

    xhr.open("POST", URL)
    xhr.send()
  }
}

//-------------------------------------------------------------------------------


/*
Methods for work with cookies
*/

function setCookie(cName, cValue, expDate) {
  const expires = "expires=" + new Date(expDate*1000).toUTCString();
  // console.log(expires);
  document.cookie = cName + "=" + cValue + "; " + expires + "; path=/";
  // console.log(cName + "=" + cValue + "; " + expires + "; path=/");
}

function getCookie(cName) {
  const name = cName + "=";
  const cDecoded = decodeURIComponent(document.cookie); //to be careful
  const cArr = cDecoded .split('; ');
  let res;
  cArr.forEach(val => {
      if (val.indexOf(name) === 0) res = val.substring(name.length);
  })
  return res;
}

function padTo2Digits(num) {
  return num.toString().padStart(2, '0');
}

function formatDate(date) {
  return [
    padTo2Digits(date.getDate()),
    padTo2Digits(date.getMonth() + 1),
    date.getFullYear(),
  ].join('.') + ", " + 
  [padTo2Digits(date.getHours()),
  padTo2Digits(date.getMinutes()),
  padTo2Digits(date.getSeconds())].join(':');
}

/*
Token decoding method
*/

function decodeToken(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  console.log("DECODE_TOKEN", jsonPayload);
  return JSON.parse(jsonPayload);
}


document.body.onload = function() {
      document.addEventListener('keyup',  listener)

}



var listener = function(event) {
    if (event.keyCode === 13)
        {
            fieldsPreviousCheckUp()
        }

};