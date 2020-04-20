package response

import (
	"net/http"
	"plmg/models"
	u "plmg/utils"
)

func getChapterIdentif(w http.ResponseWriter, r *http.Request) (string, string, uint, error) {
	params := getPathParams(r)

	char_id, err := getUintCharID(params["id"])
	if err != nil {
		return "", "", 0, err
	}

	if err = charExist(char_id); err != nil {
		return "", "", 0, err
	}

	hist_title := params["h_title"]

	if err = histExist(hist_title, char_id); err != nil {
		return "", "", 0, err
	}

	chapter_title := params["c_title"]

	return chapter_title, hist_title, char_id, nil
}

var ViewChapter = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	chap_title, hist_title, char_id, err := getChapterIdentif(w, r)
	if err != nil {
		return u.Message(false, "Invalid request")
	}
	chapter := models.GetChapter(chap_title, hist_title, char_id)
	resp := u.Message(true, "Chapter has been gotten")
	resp["chapter"] = chapter
	resp["item"] = "chapter"
	return resp
}

var EditChapter = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	chap_title, hist_title, char_id, err := getChapterIdentif(w, r)
	if err != nil {
		return u.Message(false, "Invalid request")
	}
	chapter := models.GetChapter(chap_title, hist_title, char_id)

	if err = decodeRequest(w, r, chapter); err != nil {
		return u.Message(false, "Invalid request")
	}
	resp := chapter.Edit() //Обновить историю
	resp["item"] = "chapter"
	return resp
}

var CreateChapter = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	params := getPathParams(r)

	char_id, err := getUintCharID(getPathParams(r)["id"])
	if err != nil {
		return u.Message(false, "Invalid character's id")
	}
	chapter := &models.Chapter{
		HistoryTitle: params["h_title"],
		CharacterID:  char_id,
	}

	if err = decodeRequest(w, r, chapter); err != nil {
		return u.Message(false, "Invalid request")
	}
	resp := chapter.Create() //Создать персонажа
	resp["item"] = "chapter"
	return resp
}

var DeleteChapter = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	chap_title, hist_title, char_id, err := getChapterIdentif(w, r)
	if err != nil {
		return nil
	}

	var resp map[string]interface{}
	chapter := models.GetChapter(chap_title, hist_title, char_id)

	if chapter.ID == 0 {
		resp = u.Message(false, "Invalid request: Chapter doesn't exists")
		u.Respond(w, resp)
		return nil
	}

	resp = chapter.Delete() //Удалить персонажа
	resp["item"] = "chapter"
	return resp
}

var GetAllChapters = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	_, hist_title, char_id, err := getChapterIdentif(w, r)
	if err != nil {
		return u.Message(false, "Invalid request")
	}
	chapters := models.GetAllChapBy(char_id, hist_title)
	history := models.GetHistory(hist_title, char_id)
	resp := u.Message(true, "Chapters has been gotten")
	resp["chapters"] = chapters
	resp["history"] = history
	resp["item"] = "chapters"
	return resp
}
