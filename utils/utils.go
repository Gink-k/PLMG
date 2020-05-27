package utils

import (
	"encoding/json"
	"net/http"
	"strconv"
)

const (
	ERROR   int = -1
	WARNING int = 0
	SUCCESS int = 1
)

func Message(status int, message string) map[string]interface{} {
	return map[string]interface{}{"status": status, "message": message}
}

func Respond(w http.ResponseWriter, data map[string]interface{}) {
	w.Header().Add("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

// func GetFormVal(form map[string][]string, name string) string {
// 	arr := form[name]
// 	return MakeLine(arr)
// }

func Stou(sid string) (uint, error) {
	id, err := strconv.Atoi(sid)
	return uint(id), err
}

func MakeLine(arr []string) string {
	var result string
	for i, str := range arr {
		if i < len(arr)-1 {
			result += str + " "
		} else {
			result += str
		}
	}
	return result
}

func ArrContain(arr []string, value string) bool {
	for _, val := range arr {
		if val == value {
			return true
		}
	}
	return false
}
