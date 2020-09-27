package response

import (
	"net/http"
	"plmg/models"
	u "plmg/utils"
)

var DefaultHandler = func(w http.ResponseWriter, r *http.Request, itemName string) map[string]interface{} {
	resp := u.Message(u.SUCCESS, itemName+" has been gotten")
	resp["type"] = itemName
	return resp
}

var SearchHandler = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	resp := DefaultHandler(w, r, "search")
	if r.Method == "POST" {
		var searchResultChars []models.Character = nil
		var searchResultHists []models.History = nil
		searchReq := r.FormValue("search")
		ch_box_chars := r.FormValue("ch_box_chars")
		ch_box_hists := r.FormValue("ch_box_hists")
		if ch_box_chars != "" {
			searchResultChars = models.GetAllCharByName(searchReq)
		}
		if ch_box_hists != "" {
			searchResultHists = models.GetAllHistByName(searchReq)
		}
		charRes := map[string]interface{}{"item": "characters", "characters": searchResultChars}
		histRes := map[string]interface{}{"item": "histories", "histories": searchResultHists}
		resp["search"] = []map[string]interface{}{charRes, histRes}
	}
	return resp
}

func genericAppender(arr1 []models.PlmgObject, arr2 []models.PlmgObject) []models.PlmgObject {
	return append(arr1, arr2...)
}
