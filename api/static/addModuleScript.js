const mainURL = "https://api.finproba.ru"


configureDropField("#moduleInputBlock", (selector, event) => {
	moduleDropHandle(selector, event)
})


function configureDropField(selector, ondrop) {
	var inputBlock = document.querySelector(selector)
	inputBlock.addEventListener('dragover', (event) => {
		event.preventDefault()
		inputBlock.classList.add("drop")
	})
	inputBlock.addEventListener('dragleave', () => {
		inputBlock.classList.remove("drop")
	})
	inputBlock.addEventListener('drop', (event) => {
		event.preventDefault()
		inputBlock.classList.remove("drop")
		ondrop(selector, event)
		return false
	})
}


function moduleDropHandle(selector, event) {
	var item = event.dataTransfer.items[0]
	var label = document.querySelector(selector);
	var input = document.querySelector(selector.split("Block")[0])

	if (item.kind === "file") {
		const file = item.getAsFile();
		console.log("Module got file", file);

		var resList = file.name.split(".")
		var res = resList[resList.length - 1]
		if (res == "csv" || res == "mm") {
			label.innerHTML = 
			`<div class="fileBlock__fileSign">
				<div class="fileBlock__crossHolder"><button"></button></div>
				<div class="fileBlock__resHolder">${file.name}</div>
			</div>`

			var dt = new DataTransfer()
			dt.items.add(file)
			input.files = dt.files
		} else {
			FNNotificationCall({
				title: "Недопустимый формат файла",
				message: "Файл не был добавлен, так как его формат не .mm или не .csv"
			})
		}
	}
}

function sendTest(id) {
	let file = document.getElementById("testInput").files[0]
	let token = getCookie('token')
	let xhr = new XMLHttpRequest();
	let URL = mainURL + '/load_test?module_id=' + id

	xhr.onreadystatechange = function(e) {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				FNNotificationCall({title: "Успешная загрузка", imagePath: "static/imgs/bubbleSuccess.png"})
			}
		}
	}
	
	xhr.open("POST", URL)
	xhr.setRequestHeader('token', token)
	xhr.send(file)
}

function sendModule(sendTestAfterModule=false) {
	let file = document.getElementById("moduleInput").files[0]
	var resList = file.name.split(".")
	var res = resList[resList.length - 1]

	let token = getCookie('token')
	let xhr = new XMLHttpRequest();
	let URL = ""

	if (res == "csv") {
		URL = mainURL + "/load_module_csv"
	} else if (res == "mm") {
		URL = mainURL + "/load_module"
	} else { FNNotificationCall({title: "Ошибка загрузки", message: "Файл имеет неверный формат, поэтому загрузка отменена"}); return }

	xhr.onreadystatechange = function(e) {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				FNNotificationCall({title: "Модуль загружен"})

				if (sendTestAfterModule) {
					// SEND TEST HERE
				}
			} else {
				FNAlertCall({title: xhr.responseText})
			}
		}
	}
	
	xhr.open("POST", URL)
	xhr.setRequestHeader("token", token)
	xhr.send(file)
}

function uploadModule() {
  let file = document.getElementById("file-uploader").files[0]
  let req = new XMLHttpRequest();

  req.onreadystatechange = function() {
        if (req.readyState === 4) {
          console.log(req.response);
        }
    }
    console.log("Загрузка " + file.name);
  // req.open("POST", "http://127.0.0.1:8080" + '/load_test?module_id=15');
  req.open("POST", "https://api.finproba.ru" + '/load_module_csv');
  let token = document.getElementById("tokenField").value
  req.setRequestHeader("token", token);
  req.send(file);
}

function sendData() {
	let moduleInput = document.getElementById("moduleInput")
	let testInput = document.getElementById("testInput")

	console.log("content of moduleInput.files/testInput.files", moduleInput.files, testInput.files);
	if (moduleInput.files.length == 1 && testInput.files.length == 1) {
		sendModule(true)
	} else if (moduleInput.files.length == 1) {
		sendModule()
	} else if (testInput.files.length == 1) {
		idOfTest = document.getElementById("testIdSelector").innerText
		sendTest(idOfTest)
	} else {
		// NOT NESESARY HANDLER
		FNNotificationCall({title: "Ошибка загрузки"})
	}
}	


function exitFromGame() {
	console.log("EXIT");
	window.location.href = "/ChapterSelectorPage"
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