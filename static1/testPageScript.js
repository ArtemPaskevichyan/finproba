const mainURL = "https://api.finproba.ru"
var firstCard = ""


loadTest()
// document.body.onload = function() { setTitle() }

function exitFromGame() {
	console.log("EXIT");
	window.location.href = "/ChapterSelectorPage"
}

function setTitle() {
	var params = fetchParamsFromURL()
	var titleOfTest = document.querySelector(".quiz__title")
	titleOfTest.innerHTML = `${titleOfTest.innerHTML} ${params.moduleId} UUID`
}

function loadTest() {
	var xhr = new XMLHttpRequest()
	var token = getCookie('token')
	var params = fetchParamsFromURL()

	var URL = mainURL + `/get_test?module_id=${params.moduleId}`

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {

			if (xhr.status == 200) {
				var json = JSON.parse(xhr.responseText)
				fillPage(json)
			} else if (xhr.status == 403) {
				checkToken(loadTest)
			}
		}
	}

	xhr.open("POST", URL)
	xhr.setRequestHeader('token', token)
	xhr.send()
}

function generateTestQuestion(index_, model) {
	var question = document.createElement("div")
	question.classList.add("question")
	question.innerText = model["text"]
	if (model["questions"] == null) {
		return null
	}
	for (var i = 0; i < model["questions"].length; i++) {
		var index = `${index_}${i}`
		var input = document.createElement("input")
		input.id = index
		input.type = "radio"
		input.value = model["questions"][i]["scores"]
		input.name = model["card_uid"]

		var label = document.createElement("label")
		label.htmlFor = index
		label.innerText = model["questions"][i]["text"]

		var variant = document.createElement("div")
		variant.appendChild(input)
		variant.appendChild(label)
		question.appendChild(variant)
	}

	return question

}

function fillPage(model) {
	var content = document.getElementById("testContent")
	try {
		var itemsLength = model["items"].length
	} catch(e) {
		FNAlertCall({
			title: "Ошибка загрузки теста",
			text: e,
			buttons: [
				{text: "Выйти", style: "destructive", method: exitFromGame}
			]
		})
		return
	}

	for (var i = 0; i < itemsLength; i++ ) {
		var card = generateTestQuestion(i, model["items"][i])
		try {
			content.appendChild(card)
		} catch(e) { console.log(e); }
	}
	var submitButton = document.createElement("button")
	submitButton.innerText = "Отправить"
	submitButton.onclick = function() { submitTestPreload() }
	content.appendChild(submitButton)
}

function submitTestPreload() {
	checkToken(getTransactionKey, submitTest)
}

function submitTest(transaction_key, public_key) {
	var form = document.querySelector('.quiz');
	var score = 0
	for (var q of form.children) {
		for (var vb of q.children) {
			var v = vb.children[0]
			console.log(v);
			try {
				if (v.selected) {
					try {
						score = score + parseint(v.value)
					} catch(e) {}
				}
			} catch (e) { console.log(e); }
		}
	}

	var params = fetchParamsFromURL()
	var token = getCookie('token')
	var URL = mainURL + `/write_test_result`
	var xhr = new XMLHttpRequest()

	xhr.onreadystatechange = function(e) {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				if (params.isBegin == "true") {
					setProgressOfUser(params.fc)
				} else if (params.isBegin == "free") {
					window.location.href = "/ChapterSelectorPage"
				} else {
					setProgressOfUser(params.fc)
					FNNotificationCall({
						title: `Вы прошли модуль ${params.moduleId}`,
						message: "Поздравляем с успешным прохождением модуля! Вам начислено 10 монет"
					})
				}
			}
		}
	}

	xhr.open("POST", URL)
	xhr.setRequestHeader("token", token)
	xhr.send(JSON.stringify({
		"module_id": params.moduleId,
		"score": score,
		"is_begin":params.isBegin,
		"transaction_key": transaction_key
	}))
}

function fetchParamsFromURL() {
	var URLParams = new URLSearchParams(window.location.search)
	if (!URLParams.has("moduleId")) { window.location.href = "/ChapterSelectorPage"; return }
	if (!URLParams.has("isBegin")) { window.location.href = "/ChapterSelectorPage"; return }
	if (!URLParams.has("fc")) { window.location.href = "/ChapterSelectorPage"; return }
	return {
		moduleId: URLParams.get("moduleId"),
		isBegin: URLParams.get("isBegin"),
		fc: URLParams.get("fc")
	}
}

function setProgressOfUser(idOfProgressCard) {
	var xhr = new XMLHttpRequest()

	var params = fetchParamsFromURL()
	var token = getCookie("token")
  	if (token == null) {
    	window.location.href = "/LoginPage"
    	return
  	}

	xhr.onreadystatechange = function(e) {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				console.log("WILL MOVE TO", idOfProgressCard);
				if (params.isBegin == "true") {
					window.location.href = `/GamePage?moduleId=${params.moduleId}&fc=${params.fc}&st=true`
				} else { window.location.href = "/ChapterSelectorPage" }
			} else {
				FNAlertCall({title: "Не удалось учесть прогресс", text: xhr.responseText})
			}
		}
	}

	var URL = mainURL + `/set_user_progress?module_id=${params.moduleId}&card=${(idOfProgressCard == null) ? '' : idOfProgressCard}&fast=true`
	xhr.open("POST", URL)
	xhr.setRequestHeader("token", token)
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
