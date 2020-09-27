package response

import (
	"net/http"
	"plmg/models"
	u "plmg/utils"
	"time"
)

const ITEM_ACCOUNT string = "account"

var ViewAccount = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	id, err := u.Stou(getPathParams(r)["u_id"])
	if err != nil {
		return u.Message(u.ERROR, "Invalid user id")
	}
	account := models.GetUser(id)
	var resp map[string]interface{}

	if account.ID == 0 {
		return notExMsg(ITEM_ACCOUNT)
	}

	resp = u.Message(u.SUCCESS, "Account has been gotten")
	resp["item"] = account
	resp["type"] = ITEM_ACCOUNT
	return resp
}

var EditAccount = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	id, err := u.Stou(r.FormValue("id"))
	if err != nil {
		return u.Message(u.ERROR, "Invalid user id")
	}
	account := models.GetUser(id)
	err = decodeRequest(r, account)
	if err != nil {
		return invalidRequestMsg()
	}
	//
	decodeFormPhoto(r, account)
	//
	resp := account.Edit()
	resp["type"] = ITEM_ACCOUNT
	return resp
}

var CreateAccount = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	account := &models.Account{}
	err := decodeRequest(r, account) //декодирует тело запроса в struct и завершается неудачно в случае ошибки
	if err != nil {
		return invalidRequestMsg()
	}
	r_password := r.FormValue("r_password")
	if r_password != account.Password {
		return u.Message(u.WARNING, "Password mismatch")
	}
	resp := account.Create() //Создать аккаунт
	//
	decodeFormPhoto(r, account)
	account.SavePhotoName()
	//
	resp["type"] = ITEM_ACCOUNT
	return resp
}

var DeleteAccount = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	id, err := u.Stou(r.FormValue("id"))
	if err != nil {
		return u.Message(u.ERROR, "Invalid user id")
	}
	account := models.GetUser(id)
	resp := account.Delete() //Удалить персонажа
	resp["type"] = ITEM_ACCOUNT
	return resp
}

var Authenticate = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	account := &models.Account{}
	err := decodeRequest(r, account) //декодирует тело запроса в struct и завершается неудачно в случае ошибки
	if err != nil {
		return invalidRequestMsg()
	}
	resp := models.Login(account.Email, account.Password)
	resp["type"] = ITEM_ACCOUNT
	return resp
}

var Logout = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	expires := time.Now().Add(time.Second * -1)
	cookie1 := &http.Cookie{Name: "X-Session-Token", Value: "logout", Expires: expires, HttpOnly: false}
	http.SetCookie(w, cookie1)
	resp := u.Message(u.SUCCESS, "Logged out")
	resp["type"] = ITEM_ACCOUNT
	return resp
}

var SetUserAsAdmin = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	id, err := u.Stou(r.FormValue("id"))
	if err != nil {
		return u.Message(u.ERROR, "Invalid user id")
	}
	account := models.GetUser(id)
	err = decodeRequest(r, account) //декодирует тело запроса в struct и завершается неудачно в случае ошибки
	if err != nil {
		return invalidRequestMsg()
	}
	account.Group = models.ADMIN
	resp := account.Edit()
	resp["type"] = ITEM_ACCOUNT
	return resp
}

var GetAllAccounts = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	users := models.GetAllUsers()
	resp := u.Message(u.SUCCESS, "Users has been gotten")
	item_key := ITEM_ACCOUNT + "s"
	resp["item"] = users
	resp["type"] = item_key
	return resp
}
