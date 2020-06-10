package response

import (
	"net/http"
	"plmg/models"
	u "plmg/utils"
)

const ITEM_COMMENT string = "comment"

var ViewComment = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	comment := models.GetComment(getPathParams(r)["comm_id"])
	var resp map[string]interface{}

	if comment.ID == 0 {
		return notExMsg(ITEM_COMMENT)
	}
	resp = u.Message(u.SUCCESS, "Comment has been gotten")
	resp[ITEM_COMMENT] = comment
	resp["item"] = ITEM_COMMENT
	return resp
}

var EditComment = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	comment := models.GetComment(getPathParams(r)["comm_id"])
	var resp map[string]interface{}

	if comment.ID == 0 {
		return notExMsg(ITEM_COMMENT)
	}
	if err := decodeRequest(r, comment); err != nil {
		return invalidRequestMsg()
	}
	resp = comment.Edit() //Обновить персонажа
	resp["item"] = ITEM_COMMENT
	return resp
}

var CreateComment = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	user_id, err := u.Stou(getUserIDFromReq(r))
	if err != nil {
		return u.Message(u.ERROR, "Invalid comment's id")
	}
	comment := &models.Comment{UserID: user_id}
	if err := decodeRequest(r, comment); err != nil {
		return invalidRequestMsg()
	}
	resp := comment.Create() //Создать персонажа
	resp["item"] = ITEM_COMMENT
	return resp
}

var DeleteComment = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	comment := models.GetComment(getPathParams(r)["comm_id"])
	var resp map[string]interface{}

	if comment.ID == 0 {
		return notExMsg(ITEM_COMMENT)
	}

	resp = comment.Delete() //Удалить персонажа
	resp["item"] = ITEM_COMMENT
	return resp
}

var GetAllComments = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	comments := models.GetAllCommByLoc(r.URL.Query().Get("location"))
	resp := u.Message(u.SUCCESS, "Comments has been gotten")
	item_name := ITEM_COMMENT + "s"
	resp[item_name] = comments
	resp["item"] = item_name
	return resp
}
