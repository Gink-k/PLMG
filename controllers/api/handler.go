package api

import (
	"net/http"
	u "plmg/utils"
)

func ApiHandler(fn func(w http.ResponseWriter, r *http.Request) map[string]interface{}) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		response := fn(w, r)
		u.Respond(w, response)
	}
}
