const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
var apperiance = "LIGHT"
var myStorage = window.sessionStorage

checkTheme()
if (document.querySelector("#moneyCountInHeader") != null) {
  checkToken(fetchUserInfo, {fetch: ["coins"], mthd: updateUserCoins})
  checkToken(profileRefreshing)
}

// animateText();
horizontalSelectorCoufiguration("horizontalSelector")
configureAds("#FNAdsBanner")
var NextInput = 0


/*
Sets Correct web apperiance on load page
Saves apperiance at logal varibles to keep it on pther pages
*/ 

function checkTheme() {
  if (myStorage.getItem('theme') == null) {
    if (darkThemeMq.matches) {
      switchTheme()
    }
  } else {
    if (apperiance != myStorage.getItem('theme')){
      switchTheme()
    }
  }
}



/*
Switches css file which contains a color ctyles for all elements
Uses id=webSiteApperiance of css link and changes href to file depending on selected apperiance
Uses id=themeSwitcher to get state of apperiance
*/
//---------------------------------------------------------------------

function switchTheme() {
	var switcher = document.getElementById("themeSwitcher")
	var cssFile = document.getElementById("webSiteApperiance")
	if (apperiance == "LIGHT") {
		switcher.classList.add("switched")
		cssFile.href = "../static/DarkModeColors.css"
		apperiance = "DARK"
    myStorage.setItem('theme','DARK')
	} else  {
		switcher.classList.remove("switched")
		cssFile.href = "../static/LightModeColors.css"
		apperiance = "LIGHT"
    myStorage.setItem('theme','LIGHT')
	}
}

// Redirect Function
//---------------------------------------------------------------------


function redirect(url) {
  document.location.href = url
}


/*
Stepperly animates text displaying making a typing animation
Uses id=textToMakeTyping to find a text to animate
*/
//---------------------------------------------------------------------

function animateStepper(options) {
  var start = performance.now();

  requestAnimationFrame(function animate(time) {
    // timeFraction от 0 до 1
    var timeFraction = (time - start) / options.duration;
    if (timeFraction > 1) timeFraction = 1;

    // текущее состояние анимации
    var progress = options.timing(timeFraction)
    options.draw(progress);
    if (timeFraction < 1) {
      requestAnimationFrame(animate);
    }
  });
}

function animateText() {
  try {
    var container = document.getElementById("textToMakeTyping")
  } catch(e) {
    return
  }

  try {
    var text = container.innerText;
  } catch(e) {
    return
  }

	let to = text.length,
  from = 0;

	animateStepper({
  	duration: to*18,
  	timing: bounce,
  	draw: function(progress) {
    		let result = (to - from) * progress + from;
    		container.innerText = text.substr(0, Math.ceil(result))
  	}
	});
}


function bounce(timeFraction) {
      return timeFraction
}


// Header work
//----------------------------------------------------------------------

function showHideHeader() {
  var header = document.querySelector(".header")
  var headerButton = document.querySelector(".header__unfoldButton")
  if (header.classList.contains("active")) {
    header.classList.remove("active")
    headerButton.innerHTML = '<i class="icon-list"><i>'
  } else {
    header.classList.add("active")
    headerButton.innerHTML = '<i class="icon-cross"><i>'
  }
}



// Profile Block Work
//---------------------------------------------------------------------

function profileRefreshing() {
  const token = getCookie('token')
  var xhr = new XMLHttpRequest()
  const URL = mainURL + '/user_info'

  xhr.onreadystatechange = function(e) {
    if (xhr.readyState == 4) {
      console.log("PROFILE_REFRESH", xhr);
      if (xhr.status == 200) {
        var json = JSON.parse(xhr.responseText)

        profileBlock.querySelector("#PB-title").innerText = json["name"]
        profileBlock.querySelector("#PB-email").innerText = json["email"]
      }
    }
  }

  xhr.open("POST", URL)
  xhr.setRequestHeader('token', token)
  xhr.send()
}

function profileOpenClose() {  
  var profileBlock = document.getElementById("profileBlock")
  if (profileBlock.classList.contains("active")) {
    profileBlock.classList.remove("active")
  } else { profileBlock.classList.add("active") }
}

function displayProfileSettings() {
  var profileBlock = document.getElementById("profileBlock")
  var settingsCenter = profileBlock.querySelector("#PB-settingsCenter")
  if (settingsCenter.classList.contains("active")) {
    return
  } else {
    for (var element of profileBlock.querySelector("#profileBlockContent").children) {
      element.classList.remove("active")
    }

    settingsCenter.classList.add("active")
  }
}

function displayProfileProgress() {
  var profileBlock = document.getElementById("profileBlock")
  var progressCenter = profileBlock.querySelector("#PB-progressCenter")
  if (progressCenter.classList.contains("active")) {
    return
  } else {
    for (var element of profileBlock.querySelector("#profileBlockContent").children) {
      element.classList.remove("active")
    }

     progressCenter.classList.add("active")
  }
}

function displayProfileNotifications() {
  var profileBlock = document.getElementById("profileBlock")
  var notificationCenter = profileBlock.querySelector("#PB-notificationCenter")
  if (notificationCenter.classList.contains("active")) {
    return
  } else {
    for (var element of profileBlock.querySelector("#profileBlockContent").children) {
      element.classList.remove("active")
    }

    notificationCenter.classList.add("active")
  }
}

function leaveOutOfWebsite() {
  document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });  
  window.sessionStorage.clear()
  window.location.href = "/LoginPage.html"
}

function decodeToken(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}


document.body.onload = function() {
  try {
    document.addEventListener('keyup',  listener)
  } catch (e) { console.log(e);}
}



// Token updating
//---------------------------------------------------------------------


function checkToken(mthd=null, args=null) {
  var token = getCookie("token")
  if (token == null) {
    var refreshToken_ = getCookie("refresh_token")
    if (refreshToken_ == null) {
      document.location.href = "/LoginPage.html"
      return
    }
    refreshToken(mthd, args)
  }
  else {
    if (args == null) { mthd() } else { mthd(args)}
  }
}

function refreshToken(mthd=null, args=null) {
  var refreshToken = getCookie("refresh_token")
  if (refreshToken == null) {
    console.log("REFRESH TOKEN IS NULL");
    // document.location.href = "/LoginPage"
    return
  }

  var xhr = new XMLHttpRequest()
  var URL = mainURL + "/refresh_token"

  xhr.onreadystatechange = function(e) {
    if (xhr.readyState == 4) {
      console.log("RFRESH_TOKEN", xhr.responseText);
      if (xhr.status == 200) {
        try {
          var json = JSON.parse(xhr.responseText)
        } catch(e) { return }
        
        if (json["status"] == "Success") {
          var decodedToken = decodeToken(json["token"])
          var expireForMainToken = decodedToken["exp"]
          var expireForRefreshToken = decodeToken(json["refresh_token"])["exp"]

          console.log("TOKEN_DECODE", decodedToken);
          setCookie("token", json["token"], expireForMainToken)
          setCookie("refresh_token", json["refresh_token"], expireForRefreshToken)

          if (args == null) { mthd() } else { mthd(args) }
        } else {
          console.log("RESPONSE IS", xhr.responseText);
          // document.location.href = "/LoginPage"
          return
        }
      }
    }
  }

  xhr.open("POST", URL)
  xhr.setRequestHeader("token", refreshToken)
  xhr.send()

}

/*
Transaction key generator
*/

function getTransactionKey(mthd=null, args=null) {
  var xhr = new XMLHttpRequest()
  var URL = mainURL + "/get_verify_keys"
  var token = getCookie("token")
  console.log("TREEEE", mthd, args);

  xhr.onreadystatechange = function(e) {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        console.log(xhr.responseText);

        var json = JSON.parse(xhr.responseText)
        if (typeof(mthd) == 'object') {mthd[0](mthd[1], json["transaction_key"], json["public_key"]); return } else if (args == null) { mthd(json["transaction_key"], json["public_key"]) } else { mthd(args) }

        } else {
          FNAlertCall({
            title: "Ошибка верификации",
            text: xhr.responseText
        })
      }
    }
  }

  xhr.open("POST", URL)
  xhr.setRequestHeader('token', token)
  xhr.send()
}

/*
User info scrab
*/

function updateUserCoins(args) {
  var moneyLabel = document.getElementById("moneyCountInHeader")
  moneyLabel.innerHTML = `<i class="icon-coin"></i> ${args.coins}`
}

function fetchUserInfo(args) {
  var xhr = new XMLHttpRequest()
  var URL = mainURL + "/user_info"
  var token = getCookie("token")

  xhr.onreadystatechange = function(e) {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        var json = JSON.parse(xhr.responseText)
        var responseList = {}
        for (var key of args.fetch) {
          responseList[key] = json[key]
        }
        args.mthd(responseList)
      } else {
        FNAlertCall("Ошибка с данными сервера")
      }
    }
  }

  xhr.open("POST", URL)
  xhr.setRequestHeader('token', token)
  xhr.send()
}



//TEST FUNCTIONS
//---------------------------------------------------------------------

function baseScriptTest(args=null) {
  if (args == null) {
    console.log("base script works good with no arguments");
  } else {
    console.log("base script works good with", args);
  }
}

function configureAds(selector) {
  var adsBlock = document.querySelector(selector);
}

//---------------------------------------------------------------------


    //\\     ||====\\  ====
   //  \\    ||    ||   ||
  //    \\   ||    ||   ||
 //======\\  ||====//   ||
//        \\ ||        ====


/*
FNModule's element's methods alows its correct work
*/

//

function generateButton(dataModel) {
  var button = document.createElement('button')
  console.log(dataModel, "DM");
  try {
    button.classList.add(dataModel.style)
  } catch {}
  try {
    button.innerText = dataModel.text
  } catch {}
  try {
    button.onclick = function(){dataModel.method(dataModel.arguments)}
  } catch {}
  return button
}

function FNNotificationCall(notificationModel) {
  var notification = document.getElementById("FNNotification")
  setTimeout(FNNotificationClose, 5000)

  if (!"title" in notificationModel || notificationModel.title == null) {
    console.log("Empty title");
    return
  } else {
    var titleN = notification.querySelector(".FNNotification__title")
    titleN.innerHTML = notificationModel.title
  }

  var img = notification.querySelector(".FNNotification__imageHolder")
  if ("imagePath" in notificationModel) {
    img.style.display = "block"
    img.children[0].src = notificationModel.imagePath
  } else { img.style.display = "none" }

  var text = notification.querySelector(".FNNotification__text")
  if ("message" in notificationModel) {
    text.style.display = "block"
    text.innerHTML = notificationModel.message
  } else {
    text.style.display = "none"
  }

  var buttonList = notification.querySelector(".FNNotification__buttonHolder")
  buttonList.innerHTML = ""
  if ("buttons" in notificationModel) {
    var buttons = notificationModel.buttons
    for (var i = 0; i < buttons.length; i++) {
      var dataModel = notificationModel.buttons[i]
      buttonList.appendChild(generateButton(dataModel))
    }
  }

  notification.classList.add("active")
}

function FNNotificationClose() {
  var notification = document.getElementById("FNNotification")
  notification.classList.remove("active")
}

/*
Horizontal selector work
*/

function horizontalSelectorCoufiguration(id) {
  try {
    var hs = document.getElementById(id)
    var backArea = hs.children[hs.children.length - 1]
  } catch { console.log("NO HZ"); return }
  var backBlockWidth = 100 / (hs.children.length - 1)
  // var backBlock = backArea.children[0]
  // backBlock.style.width = '100%'
  backArea.style.width = `${backBlockWidth}%`
  backArea.children[0].style.width = `100%`
}

function HSSelect(idOfHS, id, method=null, args=null) {
  var hs = document.getElementById(idOfHS)
  var backArea = hs.children[hs.children.length - 1]
  var backBlock = backArea.children[0]
  var backBlockWidth = 100 / (hs.children.length - 1)
  backArea.style.width = `${backBlockWidth * id}%`
  backBlock.style.width = `${100 / id}%`

  for (var i = 0; i < hs.children.length - 1; i++) {
    var element = hs.children[i]
    element.classList.remove("active")
  }
  hs.children[id - 1].classList.add("active")

  if (method != null) {
    if (args != null) {
      method(args)
    } else {
      method()
    }
  }
}

/*
FNAlert work
*/

function FNAlertClose() {
  var alert = document.getElementById("FNAlert")
  alert.querySelector(".FNAlert__title").innerText = ""
  alert.querySelector(".FNAlert__text").innerText = ""
  alert.querySelector(".FNAlert__buttonStack").innerHTML = `<button class="FNAlert__button closeButton" onclick="FNAlertClose()">OK</button>`
  console.log("CLOSEDDD");

  alert.classList.remove("active")
}

function FNAlertCall(alertModel) {
  var alert = document.getElementById("FNAlert")
  if (!"title" in alertModel) {
    console.log("Empty title");
    return
  }
  var buttonList = alert.querySelector(".FNAlert__buttonStack")
  buttonList.innerHTML = `<button class="FNAlert__button closeButton" onclick="FNAlertClose()">OK</button>`
  alert.querySelector(".FNAlert__title").innerText = alertModel.title
  alert.querySelector(".FNAlert__text").innerText = "text" in alertModel ? alertModel.text : ""
  alert.querySelector(".closeButton").innerText = "cancelButtonText" in alertModel ? alertModel.cancelButtonText : "Закрыть"

  if ("buttons" in alertModel) {
    for (var buttonModel of alertModel.buttons) {
      alert.querySelector(".FNAlert__buttonStack").appendChild(generateButton(buttonModel))
    }
  }

  alert.classList.add("active")
}

