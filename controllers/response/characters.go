package response

import (
	"net/http"
	"plmg/models"
	u "plmg/utils"
)

var ViewCharacter = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {

	char_id, err := getUintCharID(getPathParams(r)["id"])
	if err != nil {
		return u.Message(false, "Invalid request: id doesn't exists")
	}
	character := models.GetCharacter(char_id)

	var resp map[string]interface{}

	if character.ID == 0 {
		resp = u.Message(false, "Invalid request: Character doesn't exists")
		return resp
	}

	resp = u.Message(true, "Character has been gotten")
	resp["character"] = character
	resp["item"] = "character"
	return resp
}

var CreateCharacter = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	character := &models.Character{}
	if err := decodeRequest(w, r, character); err != nil {
		return u.Message(false, "Invalid request")
	}
	resp := character.Create() //Создать персонажа
	resp["item"] = "character"
	return resp
}

var EditCharacter = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	char_id, err := getUintCharID(getPathParams(r)["id"])
	if err != nil {
		return u.Message(false, "Invalid request: id doesn't exists")
	}
	character := models.GetCharacter(char_id)

	if err := decodeRequest(w, r, character); err != nil {
		return u.Message(false, "Invalid request")
	}
	resp := character.Edit() //Обновить персонажа
	resp["item"] = "character"
	return resp
}

var DeleteCharacter = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	char_id, err := getUintCharID(getPathParams(r)["id"])
	if err != nil {
		return u.Message(false, "Invalid request: id doesn't exists")
	}
	character := models.GetCharacter(char_id)

	var resp map[string]interface{}

	if character.ID == 0 {
		resp = u.Message(false, "Invalid request: Character doesn't exists")
		return resp
	}

	resp = character.Delete() //Удалить персонажа
	resp["item"] = "character"
	return resp
}

var GetAllCharacters = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	characters := models.GetAllCharacters()
	resp := u.Message(true, "Characters has been gotten")
	resp["characters"] = characters
	resp["item"] = "characters"
	return resp
}
