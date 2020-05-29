package response

import (
	"net/http"
	"plmg/models"
	u "plmg/utils"
)

var DefaultHandler = func(w http.ResponseWriter, r *http.Request, temptaleName string) map[string]interface{} {
	resp := u.Message(u.SUCCESS, temptaleName+" has been gotten")
	resp["item"] = temptaleName
	return resp
}

var SearchHandler = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	resp := DefaultHandler(w, r, "search")
	if r.Method == "POST" {
		searchReq := r.FormValue("search")
		searchResult := models.GetAllCharByName(searchReq)
		resp["search"] = searchResult
	}
	return resp
}
