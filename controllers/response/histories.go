package response

import (
	"log"
	"net/http"
	"plmg/models"
	u "plmg/utils"
)

func getTitleAndCharID(w http.ResponseWriter, r *http.Request) (string, uint, error) {
	params := getPathParams(r)
	char_id, err := getUintCharID(params["id"])
	if err != nil {
		return "", 0, err
	}
	if err = charExist(char_id); err != nil {
		return "", 0, err
	}
	hist_title := params["h_title"]

	return hist_title, char_id, nil
}

var ViewHistory = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	hist_title, char_id, err := getTitleAndCharID(w, r)
	if err != nil {
		return u.Message(false, "Invalid request")
	}
	history := models.GetHistory(hist_title, char_id)
	resp := u.Message(true, "History has been gotten")
	resp["history"] = history
	resp["item"] = "history"
	return resp
}

var EditHistory = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	hist_title, char_id, err := getTitleAndCharID(w, r)
	if err != nil {
		return u.Message(false, "Invalid request")
	}
	history := models.GetHistory(hist_title, char_id)

	if err = decodeRequest(w, r, history); err != nil {
		return u.Message(false, "Invalid request")
	}
	resp := history.Edit() //Обновить историю
	resp["item"] = "history"
	return resp
}

var CreateHistory = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	char_id, err := getUintCharID(getPathParams(r)["id"])
	if err != nil {
		return u.Message(false, "Invalid character's id")
	}
	log.Println(char_id)
	history := &models.History{CharacterID: char_id}
	if err = decodeRequest(w, r, history); err != nil {
		return u.Message(false, "Invalid request")
	}

	resp := history.Create() //Создать персонажа
	resp["item"] = "history"
	return resp
}

var DeleteHistory = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	hist_title, char_id, err := getTitleAndCharID(w, r)
	if err != nil {
		return u.Message(false, "Invalid request")
	}

	var resp map[string]interface{}
	history := models.GetHistory(hist_title, char_id)

	if history.ID == 0 {
		resp = u.Message(false, "Invalid request: History doesn't exists")
		return resp
	}

	resp = history.Delete() //Удалить историю
	resp["item"] = "history"
	return resp
}

type historyObject struct {
	History  models.History
	Chapters []models.Chapter
}

var GetAllHistories = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	_, char_id, err := getTitleAndCharID(w, r)
	if err != nil {
		return u.Message(false, "Invalid character's id")
	}

	histories := models.GetAllHistBy(char_id)
	finHistories := make([]historyObject, len(histories))

	for i, history := range histories {
		finHistories[i].History = history
		finHistories[i].Chapters = models.GetAllChapBy(char_id, history.Title)
	}

	resp := u.Message(true, "Histories has been gotten")
	resp["histories"] = finHistories
	resp["item"] = "histories"
	return resp
}
