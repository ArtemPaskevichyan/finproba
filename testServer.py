from flask import Flask, render_template
app = Flask(__name__)

@app.route("/")
def basePage():
    return render_template("LoginPage.html")


@app.route("/registration")
def registrationPage():
    return render_template("RegistrationPage.html")

if __name__ == "__main__":
    app.run()