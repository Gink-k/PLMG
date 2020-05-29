package response

import (
	"net/http"
	"plmg/models"
	u "plmg/utils"
)

var DefaultHandler = func(w http.ResponseWriter, r *http.Request, itemName string) map[string]interface{} {
	resp := u.Message(u.SUCCESS, itemName+" has been gotten")
	resp["item"] = itemName
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
