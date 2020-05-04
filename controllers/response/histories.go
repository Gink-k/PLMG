package response

import (
	"fmt"
	"net/http"
	"plmg/models"
	u "plmg/utils"
)

func getHistoryIdentif(w http.ResponseWriter, r *http.Request) (string, string, error) {
	params := getPathParams(r)
	char_id := params["id"]
	if err := charExist(char_id); err != nil {
		return "", "", err
	}
	hist_id := params["h_id"]

	return hist_id, char_id, nil
}

const ITEM_HISTORY = "history"

var ViewHistory = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	hist_id, char_id, err := getHistoryIdentif(w, r)
	if err != nil {
		return u.Message(u.ERROR, "Invalid request")
	}
	history := models.GetHistory(hist_id, char_id)
	if history.ID == 0 {
		return notExMsg(ITEM_HISTORY)
	}
	resp := u.Message(u.SUCCESS, "History has been gotten")
	resp["history"] = history
	resp["item"] = ITEM_HISTORY
	return resp
}

var EditHistory = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	hist_id, char_id, err := getHistoryIdentif(w, r)
	if err != nil {
		return u.Message(u.ERROR, "Invalid request")
	}
	history := models.GetHistory(hist_id, char_id)
	if history.ID == 0 {
		return notExMsg(ITEM_HISTORY)
	}
	if err = decodeRequest(w, r, history); err != nil {
		return u.Message(u.ERROR, "Invalid request")
	}
	resp := history.Edit() //Обновить историю
	resp["item"] = ITEM_HISTORY
	return resp
}

var CreateHistory = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	char_id, err := stou(getPathParams(r)["id"])
	if err != nil {
		return u.Message(u.ERROR, "Invalid character's id")
	}
	history := &models.History{CharacterID: char_id}
	if err = decodeRequest(w, r, history); err != nil {
		return u.Message(u.ERROR, "Invalid request")
	}

	resp := history.Create() //Создать персонажа
	resp["item"] = ITEM_HISTORY
	return resp
}

var DeleteHistory = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	hist_id, char_id, err := getHistoryIdentif(w, r)
	if err != nil {
		return u.Message(u.ERROR, "Invalid request")
	}

	var resp map[string]interface{}
	history := models.GetHistory(hist_id, char_id)

	if history.ID == 0 {
		return u.Message(u.ERROR, "Invalid request: History doesn't exists")
	}

	resp = history.Delete() //Удалить историю
	resp["item"] = ITEM_HISTORY
	return resp
}

type historyObject struct {
	History  models.History
	Chapters []models.Chapter
}

var GetAllHistories = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	_, char_id, err := getHistoryIdentif(w, r)
	if err != nil {
		return u.Message(u.ERROR, "Invalid character's id")
	}

	histories := models.GetAllHistBy(char_id)
	finHistories := make([]historyObject, len(histories))

	for i, history := range histories {
		finHistories[i].History = history
		finHistories[i].Chapters = models.GetAllChapBy(char_id, fmt.Sprint(history.ID))
	}

	resp := u.Message(u.SUCCESS, "Histories has been gotten")
	resp["histories"] = finHistories
	resp["item"] = "histories"
	return resp
}
