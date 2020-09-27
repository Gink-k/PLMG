package response

import (
	"net/http"
	"plmg/models"
	u "plmg/utils"
)

const ITEM_CHARACTER = "character"

var ViewCharacter = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	character := models.GetCharacter(getPathParams(r)["id"])

	var resp map[string]interface{}

	if character.ID == 0 {
		return notExMsg(ITEM_CHARACTER)
	}

	resp = u.Message(u.SUCCESS, "Character has been gotten")
	resp["item"] = character
	resp["type"] = ITEM_CHARACTER
	return resp
}

var EditCharacter = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	character := models.GetCharacter(getPathParams(r)["id"])
	var resp map[string]interface{}

	if character.ID == 0 {
		return notExMsg(ITEM_CHARACTER)
	}

	if err := decodeRequest(r, character); err != nil {
		return invalidRequestMsg()
	}
	//
	decodeFormPhoto(r, character)
	//
	resp = character.Edit() //Обновить персонажа
	resp["type"] = ITEM_CHARACTER
	return resp
}

var CreateCharacter = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	user_id, err := u.Stou(getUserIDFromReq(r))
	if err != nil {
		return u.Message(u.ERROR, "Invalid character's id")
	}
	character := &models.Character{UserID: user_id}
	if err := decodeRequest(r, character); err != nil {
		return invalidRequestMsg()
	}
	resp := character.Create() //Создать персонажа
	//
	decodeFormPhoto(r, character)
	character.SavePhotoName()
	//
	resp["type"] = ITEM_CHARACTER
	return resp
}

var DeleteCharacter = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	character := models.GetCharacter(getPathParams(r)["id"])
	var resp map[string]interface{}

	if character.ID == 0 {
		return notExMsg(ITEM_CHARACTER)
	}

	resp = character.Delete() //Удалить персонажа
	resp["type"] = ITEM_CHARACTER
	return resp
}

var GetAllCharacters = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	characters := models.GetAllCharBy(getUserIDFromReq(r))
	resp := u.Message(u.SUCCESS, "Characters has been gotten")
	item_name := ITEM_CHARACTER + "s"
	resp["item"] = characters
	resp["type"] = item_name
	return resp
}
