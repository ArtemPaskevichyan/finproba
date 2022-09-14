setCorrectMessage()

function setCorrectMessage() {
	var email = window.sessionStorage.getItem('email')
	if (email != null) {
		var messageContainer = document.getElementById("message")
		if (document.title == "Подтвердите Email") {
			messageContainer.innerText = `На вашу почту ${email} было отправлено письмо с ссылкой для подтверждения введенного адреса. Пройдите по ней, чтобы начать играть`
		}
		if (document.title == "Смените пароль") {
			messageContainer.innerText = `На вашу почту ${email} было отправлено письмо с ссылкой для подтверждения введенного адреса. Пройдите по ней, чтобы сменить пароль`
		}
	}
	
}

function replaceEmail() {
	window.history.back()
}
