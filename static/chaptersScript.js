/*
Changes position of slide on number row
*/


const mainURL = "https://api.finproba.ru"
var swiper = new Swiper()

checkToken(loadModules)


/*
Configuration of slider
*/
function sliderConfigure() {
  swiper = new Swiper('.swiper', {
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    },

    slideToClickedSlide: true,

    slidesPerView: 'auto',

    watchOverflow: true,

    spaceBetween: 300,

    centeredSlides: true,

    preloadImages: false,

    lazy: {
      enabled: true,
      loadPrevNext: true,
      loadPrevNextAmount: 3
    }
  })

  swiper.on('slideChange', function () {
    console.log("c1");
    setBubbleOn(swiper.activeIndex)
  })
}


function setSlideOn(index) {
	setChapterOn(index)
}

function setBubbleOn(index) {
  console.log("c2", index);
	var bubbleHolder = document.getElementById("bubbleHolder");
	bubbleHolder.style.width = `${(index+1)*58}px`;
	var numbersArray = document.getElementsByClassName("navigationBlock__number")

	for (var elementIndex = 0; elementIndex < numbersArray.length; elementIndex++) {
		numbersArray[elementIndex].classList.remove("active")
	}

	var newNumber = document.getElementById(`number${index}`)
	newNumber.classList.add("active")
}

function setChapterOn(index) {
	swiper.slideTo(index)
}


/*
Loads modules
*/

function loadModules() {
  var xhr = new XMLHttpRequest()
  var URL = mainURL + "/get_modules"

  var token = getCookie("token")
  if (token == null) {
    window.location.href = "/LoginPage"
    return
  }

  xhr.onreadystatechange = function (e) {
    if (xhr.readyState == 4) {
      if (xhr.status == 403) {
        window.location.href = "/LoginPage"
        return
      }
      if (xhr.status == 200) {
        console.log(xhr.responseText);
        var json = JSON.parse(xhr.responseText)
        addNewModules(json)
        configureNavigation(json.length)
        sliderConfigure()
        return
      }
      else {
        console.log("status", xhr.status);
      }
    }
  }

  xhr.open("POST", URL)
  xhr.setRequestHeader("Token", token)
  xhr.send()
}


function addNewModules(jsonList) {
  var admin = decodeToken(getCookie("token"))["admin"]
  var slider = document.querySelector(".swiper-wrapper")
  slider.innerHTML = ""
  console.log(jsonList);
  var lockedSlidesCount = jsonList.length
  var slidesCount = jsonList.length

  for (var i = 0; i < jsonList.length; i++) {
    var json = jsonList[i]
    var slide = document.createElement('div')
    slide.classList.add("swiper-slide")
    try {
      var locked = json["is_locked"]
      if (locked) {
        slide.classList.add("blocked")
      }
    } catch (e) { console.log(e) }
    

    slide.style.background = `no-repeat center/100% url('../static/imgs/chapterImagesLight/${json["img"]}')`
    var inner = `<img class="swiper-lazy" data-src="../static/imgs/chapterImages/${json["img"]}">`
    if (admin) {
      inner +=  `<div class="swiper-slide__controlBlock">
                  <div class="swiper-slide__status">${json["public"] ? "<span class='mark-success'><i class='icon-success'></i></span>ОПУБЛИКОВАНО" : "<span class='mark-exclamation'><i class='icon-exclamation'></i></span>НЕ ОПУБЛИКОВАНО"}</div>
                  <div class="swiper-slide__buttons">
                    <button class="swiper-slide__options" onclick="showOptions(${json['public']}, ${json['id']}, '${json["first_card"]}')">...</button>
                    <button class="swiper-slide__button" onclick="runModule(${json["id"]}, '${json["first_card"]}')">
                        Играть
                    </button>
                  </div>
                </div>`
    } else { 
      inner += `<div class="swiper-slide__controlBlock">
                  <div class="swiper-slide__status"></div>
                  <div class="swiper-slide__buttons">
                    <button class="swiper-slide__button" onclick="runModule(${json["id"]}, '${json["first_card"]}')">
                        Играть
                    </button>
                  </div>
                </div>`
    }
    inner += `<div class="slideWall">
                <div class="slideWall__sheetHolder">
                    <div class="slideWall__sheet">
                        <div class="slideWall__topBlock">
                            <div class="slideWall__titleHolder">
                                <div class="slideWall__lock">
                                    <i class="icon-lock"></i>
                                </div>
                                <span class="slideWall__title">
                                    Этот модуль пока <br> не доступен
                                </span>
                            </div>
                            <div class="slideWall__subtitle">
                                Вы разблокировали ${lockedSlidesCount}/${slidesCount}
                            </div>
                        </div>

                        <div class="slideWall__bottomBlock">
                            <div class="slideWall__insideTitle">
                                Разблокировать
                            </div>
                            <div class="slideWall__buttonHolder">
                                <button class="slideWall__button primary" onclick="unlockModuleWithCoinsPreviously(${json["id"]})">
                                    <i class="icon-coin"></i> ${json["cost"]}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`
    slide.innerHTML = inner

    slider.appendChild(slide)
  }

  if (decodeToken(getCookie("token"))["admin"]) {
    var slide = document.createElement('div')
    slide.classList.add("swiper-slide")
    slide.classList.add("addNew")

    slide.innerHTML = `<a href="https://finproba.ru/api/addModule"><img src='static/imgs/addChapter.png'></a>`

    slider.appendChild(slide)
  }
}

function runModule(id, firstCard) {
  console.log(`/GamePage.html?moduleId=${id}&fc=${firstCard}`);
  var link = `/GamePage?moduleId=${id}&fc=${firstCard}`
  window.location.assign(link) 
}

function configureNavigation(length_) {
  var admin = decodeToken(getCookie("token"))["admin"]
  var navigation = document.getElementById("navigationBlock__numbers")
  navigation.innerHTML = `<div class="navigationBlock__bubbleHolder" id="bubbleHolder">
                            <span class="navigationBlock__bubble bubble"></span>
                          </div>`

  const iterations = admin ? length_+1 : length_
  for (var ind = 0; ind < iterations; ind++) {
    var element = document.createElement("button")
    element.classList.add("navigationBlock__number")
    if (admin && ind == length_) { element.innerHTML = "<i class='icon-plus'><i>" } else { element.innerHTML = ind }
    element.id = `number${ind}`
    element.onclick = (function(i) {
      return function() {
        setSlideOn(i)
      }
    })(ind);

    navigation.appendChild(element) 
  }

  navigation.children[1].classList.add("active")
}






// Options
//---------------------------------------------------------------------


function showOptions(published, idOfModule, fc) {
  FNAlertCall({
    title: `Модуль ${idOfModule}`,
    buttons: [
      {text: published ? "Снять с публикации":"Опубликовать", method: publishModulePrevious, arguments: [published, idOfModule], cancelButtonText: "Отмена"},
      {text: "Обнулить прогресс", method: clearModuleProgressPrevious, arguments: idOfModule},
      {text: "Открыть тест", method: showModuleTest, arguments: [idOfModule, fc]},
      {text: "Удалить", method: deleteModule, arguments: idOfModule, style: "destructive"},
    ],
    cancelButtonText: "Отмена"
    })
}

function publishModulePrevious(args) {
  var published = args[0]
  var idOfModule = args[1]

  if (published) {
    FNAlertCall({
      title: "Снятие с публикации модуля",
      text: `Вы уверены, что хотите снять модуль ${idOfModule} с публикации?`,
      buttons: [
        {text: "Снять с публикации", style: "primary", method: unpublishModule, arguments: idOfModule}
      ],
      cancelButtonText: "Отмена"
    })
  } else {
    FNAlertCall({
      title: "публикация модуля",
      text: `Вы уверены, что хотите опубликовать модуль ${idOfModule}?`,
      buttons: [
        {text: "Опубликовать", style: "primary", method: publishModule, arguments: idOfModule}
      ],
      cancelButtonText: "Отмена"
    })

  }
}

function publishModule(id) {
  FNAlertClose()
  var token = getCookie('token')
  var xhr = new XMLHttpRequest()
  var URL = mainURL + `/module_publishing?module_id=${id}&public=true`

  xhr.onreadystatechange = function(e) {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        FNNotificationCall({title: `Модуль ${id} опубликован`, imagePath: "static/imgs/bubbleSuccess.png"})
        checkToken(loadModules)
      } else if (xhr.status == 403) {
        checkToken()
      } else {
        FNAlertCall({text: xhr.responseText})
      }
    }
  }

  xhr.open("POST", URL)
  xhr.setRequestHeader('Token', token)
  xhr.send()
}

function unpublishModule(id) {
  FNAlertClose()
  var token = getCookie('token')
  var xhr = new XMLHttpRequest()
  var URL = mainURL + `/module_publishing?module_id=${id}&public=false`

  xhr.onreadystatechange = function(e) {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        FNNotificationCall({title: `Модуль ${id} снят с публикации`, imagePath: "static/imgs/bubbleSuccess.png"})
        checkToken(loadModules)
      } else if (xhr.status == 403) {
        checkToken()
      } else {
        FNAlertCall({text: xhr.responseText})
      }
    }
  }

  xhr.open("POST", URL)
  xhr.setRequestHeader('Token', token)
  xhr.send()
}

function clearModuleProgressPrevious(id) {
  FNAlertCall({
    title: "Обнуление прогресса",
    text: `Вы уверены что хотите обнулить прогресс ${id} модуля?`,
    buttons: [
      {text: "Обнулить", method: clearModuleProgress, arguments: id, style: "primary"}
    ],
    cancelButtonText: "Отмена"
  })
}

function clearModuleProgress(id) {
  FNAlertClose()
  var token = getCookie('token')
  var xhr = new XMLHttpRequest()
  var URL = mainURL + `/delete_progress?module_id=${id}`

  xhr.onreadystatechange = function(e) {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        FNNotificationCall({title: "Прогресс модуля обнулен", message: `Ваш прогресс модуля ${id} обнулен`, imagePath: "static/imgs/bubbleSuccess.png"})
      } else if (xhr.status == 403) {
        checkToken()
      } else {
        FNAlertCall({title: xhr.responseText})
      }
    }
  }

  xhr.open("POST", URL)
  xhr.setRequestHeader('token', token)
  xhr.send()
}

function showModuleTest(args) {
  var id = args[0]
  var fc = args[1]
  window.location.href = `/TestPage?moduleId=${id}&isBegin=free&fc=${fc}`
}

function deleteModule(id) {
  FNAlertCall({title: "Функция пока не доступна", cancelButtonText: "ОК"})
} 




// Transactions
//---------------------------------------------------------------------

function unlockModuleWithCoinsPreviously(id) {
  FNAlertCall({
    title: "Покупка модуля",
    text: "Модуль стоимостью 20 монет.<br>При подтверждении покупки с вашего аккаунта будет списано 20 монет",
    buttons: [
    {
      style: "primary",
      method: (function(i) {return function(){ checkToken(getTransactionKey, [unlockModuleWithCoins, i]) }})(id)
    }
    ],
    cancelButtonText: "Отмена"
  })
}

function unlockModuleWithCoins(id, transaction_key, public_key) {

  var xhr = new XMLHttpRequest()
  var URL = mainURL + "/buy_module"
  var token = getCookie("token")

  xhr.onreadystatechange = function(e) {
    if (xhr.readyState == 4) {
      console.log("UNLOCK", xhr.responseText);
      if (xhr.status == 200) {
        if (xhr.responseText == "OK") {
          // addNotificationToQueue("Модуль", `Модуль ${id} куплен. Начните играть уже сейчас!`)
          // addNotificationToQueue({title: "Модуль"})
          FNNotificationCall({
              title: "Модуль",
              message: `Модуль ${id} куплен. Начните играть уже сейчас!`,
              buttons: [{
                text: "Играть",
                method: runModule,
                arguments: id,
                style: 'primary',
              }]})
          checkToken(loadModules)
          checkToken(fetchUserInfo, {fetch: ["coins"], mthd: updateUserCoins})
        } else {
          FNAlertCall({
            title: xhr.responseText,
          })
        }
      } else {
        FNAlertCall({
          title: "Не удалось совершить покупку",
        })
      }
    }
  }

  var json = JSON.stringify({
    "module_id": id,
    "transaction_key": transaction_key
  })

//   var encrypt = new JSEncrypt()
//   encrypt.setPublicKey(public_key)
//   var sign = encrypt.sign(json, CryptoJS.SHA1, "sha1")
//   var encryptedMessage = encrypt.encrypt(json)
//   console.log(sign, "SIGN");


//   var verify = new JSEncrypt();
// verify.setPublicKey(public_key);
// var verified = verify.verify(json, sign, CryptoJS.SHA1);
// console.log(verify, "vvv");


//   console.log("ENCRYPTED", encryptedMessage, transaction_key, public_key, id);
  
  xhr.open("POST", URL)
  xhr.setRequestHeader('token', token)
  xhr.send(json)
  // addNotificationToQueue("Модуль", `Модуль ${id} куплен. Начните играть уже сейчас!`)
}





// Token updating
//---------------------------------------------------------------------


function checkToken(mthd=null, args=null) {
  var token = getCookie("token")
  if (token == null) {
    var refreshToken_ = getCookie("refresh_token")
    if (refreshToken_ == null) {
      window.location.href = "/LoginPage"
      return
    }
    refreshToken(mthd, args)
  }
  else {
    if (args == null) { mthd() } else { mthd(args) }
  }
}

function refreshToken(mthd=null, args=null) {
  var refreshToken = getCookie("refresh_token")
  if (refreshToken == null) {
    window.location.href = "/LoginPage"
    return
  }

  var xhr = new XMLHttpRequest()
  var URL = mainURL + "/refresh_token"

  xhr.onreadystatechange = function(e) {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        console.log(xhr.responseText);
        try {
          var json = JSON.parse(xhr.responseText)
        } catch(e) { return }
        
        if (json["status"] == "Success") {
          var expireForMainToken = decodeToken(json["token"])["exp"]
          var expireForRefreshToken = decodeToken(json["refresh_token"])["exp"]

          setCookie("name", decodeToken(json["token"])["user"], expireForRefreshToken)
          setCookie("token", json["token"], expireForMainToken)
          setCookie("refresh_token", json["refresh_token"], expireForRefreshToken)

          if (args == null) { mthd() } else { mthd(args) }
        } else { window.location.href = "/LoginPage"; return }
      }
    }
  }

  xhr.open("POST", URL)
  xhr.setRequestHeader("token", refreshToken)
  xhr.send()

}


/*
Methods for work with cookies
*/

function setCookie(cName, cValue, expDate) {
  const expires = "expires=" + new Date(expDate*1000).toUTCString();
  console.log(expires);
  document.cookie = cName + "=" + cValue + "; " + expires + "; path=/";
  console.log(cName + "=" + cValue + "; " + expires + "; path=/");
}

function getCookie(cName) {
  const name = cName + "=";
  const cDecoded = decodeURIComponent(document.cookie); //to be careful
  const cArr = cDecoded .split('; ');
  let res = null
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


