package response

import (
	"net/http"
	"plmg/models"
)

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
		resp["item"] = map[string]interface{}{"characters": searchResultChars, "histories": searchResultHists}
	}
	return resp
}
