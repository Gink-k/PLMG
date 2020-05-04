package site

import (
	"log"
	"net/http"
	"plmg/models"
	u "plmg/utils"

	rawContr "plmg/controllers/response"
)

const (
	LOGIN_WARNING        string = "LoginWarning"
	REGISTRATION_WARNING string = "RegistrationWarning"
	ADMINPAGE_WARNING    string = "AdminPageWarning"
	X_SESSION_TOKEN      string = "X-Session-Token"
)

const IMMEDIATE_TIME int = 1

func SiteHandler(fn func(w http.ResponseWriter, r *http.Request) map[string]interface{}) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		response := fn(w, r)
		if response["status"].(int) == u.ERROR {
			http.Error(w, response["message"].(string), http.StatusInternalServerError)
			return
		}
		tmpl := response["item"].(string)
		user := getUser(r)
		response["user"] = user

		log.Println("Log: ", r.Method)

		if !user.IsLogged() {
			cookie, err := r.Cookie(LOGIN_WARNING)
			if err == nil {
				response[LOGIN_WARNING] = cookie.Value
			}
		}
		if r.Method == "GET" {
			response["params"] = r.URL.Query()
		} else if r.Method == "POST" {
			http.Redirect(w, r, getLocation(r), http.StatusFound)
			return
		}
		renderTemplate(w, tmpl, response)
	}
}

func MainPageHandler(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "/characters", http.StatusFound)
}

func RegistrationHandler(w http.ResponseWriter, r *http.Request) {
	response := make(map[string]interface{})
	user := getUser(r)
	if user.IsLogged() {
		http.Redirect(w, r, "/", http.StatusFound)
		return
	} else {
		if r.Method == "GET" {
			cookie, err := r.Cookie(REGISTRATION_WARNING)
			if err == nil {
				response[REGISTRATION_WARNING] = cookie.Value
			}
			response["user"] = user // user == guest
			renderTemplate(w, "registration", response)
			return
		} else if r.Method == "POST" {
			response = rawContr.CreateAccount(w, r)
			status := response["status"]
			if status == u.SUCCESS {
				saveTokenInCookie(w, response["account"].(*models.Account).Token)
				http.Redirect(w, r, "/", http.StatusFound)
				return
			} else if status == u.WARNING {
				setCookie(w, REGISTRATION_WARNING, response["message"].(string), IMMEDIATE_TIME)
				http.Redirect(w, r, r.URL.Path, http.StatusFound)
				return
			}
		}
	}
}

func AuthenticationHandler(w http.ResponseWriter, r *http.Request) {
	response := rawContr.Authenticate(w, r)
	status := response["status"]
	if status == u.SUCCESS {
		saveTokenInCookie(w, response["account"].(*models.Account).Token)
	} else if status == u.WARNING {
		setCookie(w, LOGIN_WARNING, response["message"].(string), IMMEDIATE_TIME)
	}
	http.Redirect(w, r, getLocation(r), http.StatusFound)
	return
}

func AdminPageHandler(w http.ResponseWriter, r *http.Request) {
	var response map[string]interface{}
	user := getUser(r)
	location := getLocation(r)
	if user.IsAdmin() {
		if r.Method == "POST" {
			action := r.FormValue("action")
			switch action {
			case "edit":
				response = rawContr.EditAccount(w, r)
				break
			case "delete":
				response = rawContr.DeleteAccount(w, r)
				break
			case "set-admin":
				response = rawContr.SetUserAsAdmin(w, r)
				break
			}
			status := response["status"]
			if status == u.SUCCESS {
				http.Redirect(w, r, location, http.StatusFound)
				return
			} else if status == u.WARNING {
				setCookie(w, ADMINPAGE_WARNING, response["message"].(string), IMMEDIATE_TIME)
				http.Redirect(w, r, location, http.StatusFound)
				return
			} else if status == u.ERROR {
				http.Error(w, response["message"].(string), http.StatusBadRequest)
				return
			}
		}
		if r.Method == "GET" {
			section := r.URL.Query().Get("section")
			switch section {
			case "comments":
				//
				response = u.Message(u.SUCCESS, "Section not implemented")
				break
			case "arts":
				//
				response = u.Message(u.SUCCESS, "Section not implemented")
				break
			default:
				response = rawContr.GetAllAccounts(w, r)
			}
			cookie, err := r.Cookie(ADMINPAGE_WARNING)
			if err == nil {
				response[ADMINPAGE_WARNING] = cookie.Value
			}
			response["user"] = user
			response["params"] = r.URL.Query()
			tmpl := "adminpage"
			renderTemplate(w, tmpl, response)
		}
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}
