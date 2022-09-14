const mainURL = "https://api.finproba.ru"
const stackLimit = 3
var responsed = true
var cardToLoad = ''
var firstFrame = true

var cardStack = []

// setProgressOfUser(0)
checkToken(configureGame)


// get current card id for player & immedietly get content of this card & display it
// fill queue up to limit
// next -> show next card & remove previous & fill queue up to limit

function exitFromGame() {
	console.log("EXIT");
	window.location.href = "/ChapterSelectorPage"
}

function configureGame() {
	var xhr = new XMLHttpRequest()

	var token = getCookie("token")
	if (token == null) {
  	window.location.href = "/LoginPage"
  	return
	}

	const id = fetchModuleIdFromURL()
	const fc = fetchFCFromURL()
	var URL = mainURL + `/get_user_progress?module_id=${id}`

	xhr.onreadystatechange = function (e) {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				console.log(xhr.responseText, 'dfg');
				cardToLoad = JSON.parse(xhr.responseText)["progress_last_card"]
				if (cardToLoad == "") {
					cardToLoad = fc;
					// console.log('HAVE TO SHOW TEST');
					// var URLParams = new URLSearchParams(window.location.search)
					// if (URLParams.has("st")) { cardToLoad = fc; console.log("SETTEN FC");}
					// else {
					//  	window.location.href = `/TestPage?moduleId=${id}&isBegin=true&fc=${fc}`
					//  }
				}
				
				fillQueue()
			}
		}
	}

	xhr.open("POST", URL)
	xhr.setRequestHeader('token', token)
	xhr.send()
}

function loadCard(id) {
	responsed = false
	var xhr = new XMLHttpRequest()

	var token = getCookie("token")
	if (token == null) {
  	window.location.href = "/LoginPage"
  	return
	}
	var URL = mainURL + `/get_card?card=${id}`

	xhr.onreadystatechange = function (e) {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				var card = JSON.parse(xhr.responseText)
				if (!card["contains_question"]) {
					try {
						cardToLoad = card["next_card"]
					} catch(e) { console.log(e); cardToLoad = null }
					
				} else { cardToLoad = null }

				var img = new Image()
				img.src = `static/imgs/frames/modul${card["module_id"]}/${card["img"]}`
				card["img"] = img
				cardStack.push(card)
				responsed = true

				fillQueue()
				if (firstFrame) {
					console.log(cardStack);
					displayCard(0)
					firstFrame = false
				}
			}
		}
  }

	xhr.open("POST", URL)
	xhr.setRequestHeader("token", token)
	xhr.send()
}

function displayCard(index) {
	var model = cardStack[index]
	var img = model["img"]
	var text = model["text"]
	console.log(model, "MODEL");

	var background = document.getElementById("backgroundImage")
	var scene = document.getElementById("gameScene")
	var textField = document.getElementById("textToMakeTyping")

	background.style.backgroundImage = `url("${img.src}")`
	scene.src = img.src
	textField.innerText = text

	var qList = document.querySelector(".gameControls__variants")
	qList.innerHTML = ''
	if (model["contains_question"]) {
		for (var item of model["questions"]) {
			var element = document.createElement("button")
			element.classList.add("gameControls__nextButton")
			if (item["cost"] == 0) {
				element.innerHTML = item["text"]
				element.onclick = (function(i) { return function() {answerToQuestion(i)} })(item["next_card"])
			} else {
				element.innerHTML = `${item["text"]}<br><i class="icon-coin"></i>${item["cost"]}`
				element.onclick = (function(i) { return function() {buyBranchPrevious(i)} })(item["next_card"])
			}
			qList.appendChild(element)
		}
	} else {
		var element = document.createElement("button")
		element.classList.add("gameControls__nextButton")
		element.innerHTML = `Далее <i class="icon-arrowRight"></i>`
		element.onclick = function() { goToNextCard() }
		qList.appendChild(element)
	}

	// setProgressOfUser(model["currentCardUUID"])
	// clearProgress()
	animateText()
}

function fillQueue() {
	console.log("CARD STACK", cardStack, cardStack.length, cardToLoad);

	if (cardStack.length < stackLimit) {
		if (cardToLoad != null) { 
			checkToken(loadCard, cardToLoad)
		} else {console.log("NULL ON CARD TO LOAD");}
	}
}

function goToNextCard() {
	console.log("go to next card", cardStack);
	if (cardStack.length == 1 && !cardStack[0]["contains_question"] && cardStack[0]["next_card"] == null) {
		window.location.href = `/TestPage?moduleId=${fetchModuleIdFromURL()}&isBegin=false&fc=${fetchFCFromURL()}`
		return
	}
	setProgressOfUser(cardStack[0]["next_card"])
	displayCard(1)
	cardStack.shift()
	fillQueue()
}

function answerToQuestion(idOfCard) {
	console.log("answer to next card");
	firstFrame = true
	cardStack.shift()
	cardToLoad = idOfCard
	checkToken(loadCard, cardToLoad)
	setProgressOfUser(idOfCard)
}

function buyBranchPrevious(idOfCard) {
	FNAlertCall({
		title: "Покупка ветки",
		text: "Вы хотите купить это ответление сюжета?",
		buttons: [
		{
			text: "Купить",
			style: "primary",
			method: (function(i) { return function() {checkToken(getTransactionKey, [buyBranch, i])} })(idOfCard)
		}
		],
		cancelButtonText: "Отмена"
	})
}

function buyBranch(idOfCard, transaction_key, public_key) {
	var json = JSON.stringify({
		"card": idOfCard,
		"transaction_key": transaction_key
	})
	const token = getCookie("token")
	var xhr = new XMLHttpRequest()
	const URL = mainURL + "/buy_branch"
	FNAlertClose()

	xhr.onreadystatechange = function(e) {
		if (xhr.readyState == 4) {
							console.log("BUY_BRANCH_RESPONSE_TEXT", xhr.responseText, xhr.status)
			if (xhr.status == 200) {
				if (xhr.responseText == "OK") {
					checkToken(fetchUserInfo, {fetch: ["coins"], mthd: updateUserCoins})
					answerToQuestion(idOfCard)
				} else if (xhr.responseText == "Bad request") {
					FNAlertCall({
						title: "Неудачный запрос"
					})
				} else if (xhr.responseText == "Not enought coins") {
					FNAlertCall({
						title: "Недостаточно монет для покупки"
					})
				} else if (xhr.responseText == "Already buyed") {
					answerToQuestion(idOfCard)
					FNNotificationCall({title: "Модуль уже куплен", imagePath: "static/imgs/bubbleSuccess.png"})
				} else {
					FNAlertCall({
						title: xhr.responseText
					})
				}
			}
		}
	}

	xhr.open("POST", URL)
	xhr.setRequestHeader('token', token)
	xhr.send(json)
}

function setProgressOfUser(idOfProgressCard=null) {
	var xhr = new XMLHttpRequest()

	const moduleId = fetchModuleIdFromURL()
	var token = getCookie("token")
  	if (token == null) {
    	window.location.href = "/LoginPage"
    	return
  	}

	xhr.onreadystatechange = function(e) {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				console.log("SETTEN", idOfProgressCard);
			}
		}
	}

	var URL = mainURL + `/set_user_progress?module_id=${moduleId}&card=${(idOfProgressCard == null) ? '' : idOfProgressCard}`
	xhr.open("POST", URL)
	xhr.setRequestHeader("token", token)
	xhr.send()
}

function clearProgress() {
	// setProgressOfUser("0")
}

// Supporting methods

function fetchModuleIdFromURL() {
	var URLParams = new URLSearchParams(window.location.search)
	if (!URLParams.has("moduleId")) { window.location.href = "/ChapterSelectorPage"; return }
	return URLParams.get("moduleId")
}

function fetchFCFromURL() {
	var URLParams = new URLSearchParams(window.location.search)
	if (!URLParams.has("fc")) { window.location.href = "/ChapterSelectorPage"; return }
	return URLParams.get("fc")
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
  const cArr = cDecoded.split('; ');
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
