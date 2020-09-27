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
		return invalidRequestMsg()
	}
	chapter := models.GetChapter(chap_id, hist_id, char_id)
	if chapter.ID == 0 {
		return notExMsg(ITEM_CHAPTER)
	}
	resp := u.Message(u.SUCCESS, "Chapter has been gotten")
	resp["item"] = chapter
	resp["type"] = ITEM_CHAPTER
	return resp
}

var EditChapter = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	chap_id, hist_id, char_id, err := getChapterIdentif(w, r)
	if err != nil {
		return invalidRequestMsg()
	}
	chapter := models.GetChapter(chap_id, hist_id, char_id)
	if chapter.ID == 0 {
		return notExMsg(ITEM_CHAPTER)
	}
	if err = decodeRequest(r, chapter); err != nil {
		return invalidRequestMsg()
	}
	//
	decodeFormPhoto(r, chapter)
	//
	resp := chapter.Edit() //Обновить историю
	resp["type"] = ITEM_CHAPTER
	return resp
}

var CreateChapter = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	params := getPathParams(r)

	char_id, err := u.Stou(getPathParams(r)["id"])
	if err != nil {
		return u.Message(u.ERROR, "Invalid character's id")
	}
	hist_id, err := u.Stou(params["h_id"])
	if err != nil {
		return u.Message(u.ERROR, "Invalid character's id")
	}
	chapter := &models.Chapter{
		HistoryID:   hist_id,
		CharacterID: char_id,
	}

	if err = decodeRequest(r, chapter); err != nil {
		return invalidRequestMsg()
	}
	resp := chapter.Create() //Создать персонажа
	//
	decodeFormPhoto(r, chapter)
	chapter.SavePhotoName()
	//
	resp["type"] = ITEM_CHAPTER
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
		return notExMsg(ITEM_CHAPTER)
	}
	resp = chapter.Delete() //Удалить персонажа
	resp["type"] = ITEM_CHAPTER
	return resp
}

var GetAllChapters = func(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	_, hist_id, char_id, err := getChapterIdentif(w, r)
	if err != nil {
		return invalidRequestMsg()
	}
	chapters := models.GetAllChapBy(char_id, hist_id)
	history := models.GetHistory(hist_id, char_id)
	resp := u.Message(u.SUCCESS, "Chapters has been gotten")
	item_name := ITEM_CHAPTER + "s"
	resp["item"] = chapters
	resp["history"] = history
	resp["type"] = item_name
	return resp
}
