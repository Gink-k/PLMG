package response

import (
	"net/http"
	"plmg/models"
	u "plmg/utils"
)

func getChapterIdentif(w http.ResponseWriter, r *http.Request) (string, string, string, error) {
	params := getPathParams(r)

	char_id := params["id"]

	if err := charExist(char_id); err != nil {
		return "", "", "", err
	}

	hist_id := params["h_id"]

	if err := histExist(hist_id, char_id); err != nil {
		return "", "", "", err
	}

	chapter_id := params["c_id"]

	return chapter_id, hist_id, char_id, nil
}

const ITEM_CHAPTER = "chapter"

var ViewChapter = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	chap_id, hist_id, char_id, err := getChapterIdentif(w, r)
	if err != nil {
		return u.Message(u.ERROR, "Invalid request")
	}
	chapter := models.GetChapter(chap_id, hist_id, char_id)
	if chapter.ID == 0 {
		return notExMsg(ITEM_CHAPTER)
	}
	resp := u.Message(u.SUCCESS, "Chapter has been gotten")
	resp[ITEM_CHAPTER] = chapter
	resp["item"] = ITEM_CHAPTER
	return resp
}

var EditChapter = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	chap_id, hist_id, char_id, err := getChapterIdentif(w, r)
	if err != nil {
		return u.Message(u.ERROR, "Invalid request")
	}
	chapter := models.GetChapter(chap_id, hist_id, char_id)
	if chapter.ID == 0 {
		return notExMsg(ITEM_CHAPTER)
	}
	if err = decodeRequest(r, chapter); err != nil {
		return u.Message(u.ERROR, "Invalid request")
	}
	resp := chapter.Edit() //Обновить историю
	resp["item"] = ITEM_CHAPTER
	return resp
}

var CreateChapter = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	params := getPathParams(r)

	char_id, err := stou(getPathParams(r)["id"])
	if err != nil {
		return u.Message(u.ERROR, "Invalid character's id")
	}
	hist_id, err := stou(params["h_id"])
	if err != nil {
		return u.Message(u.ERROR, "Invalid character's id")
	}
	chapter := &models.Chapter{
		HistoryID:   hist_id,
		CharacterID: char_id,
	}

	if err = decodeRequest(r, chapter); err != nil {
		return u.Message(u.ERROR, "Invalid request")
	}
	resp := chapter.Create() //Создать персонажа
	resp["item"] = ITEM_CHAPTER
	return resp
}

var DeleteChapter = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	chap_id, hist_id, char_id, err := getChapterIdentif(w, r)
	if err != nil {
		return nil
	}
	var resp map[string]interface{}
	chapter := models.GetChapter(chap_id, hist_id, char_id)

	if chapter.ID == 0 {
		resp = u.Message(u.ERROR, "Invalid request: Chapter doesn't exists")
		u.Respond(w, resp)
		return nil
	}
	resp = chapter.Delete() //Удалить персонажа
	resp["item"] = ITEM_CHAPTER
	return resp
}

var GetAllChapters = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	_, hist_id, char_id, err := getChapterIdentif(w, r)
	if err != nil {
		return u.Message(u.ERROR, "Invalid request")
	}
	chapters := models.GetAllChapBy(char_id, hist_id)
	history := models.GetHistory(hist_id, char_id)
	resp := u.Message(u.SUCCESS, "Chapters has been gotten")
	item_name := ITEM_CHAPTER + "s"
	resp[item_name] = chapters
	resp["history"] = history
	resp["item"] = item_name
	return resp
}
