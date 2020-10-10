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

func genericAppender(arr1 []models.PlmgObject, arr2 []models.PlmgObject) []models.PlmgObject {
	return append(arr1, arr2...)
}
