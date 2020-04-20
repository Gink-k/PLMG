package models

import (
	"fmt"
	u "plmg/utils"
)

type Chapter struct {
	LitItem      `gorm:"embedded"`
	Title        string `json:"title"`
	Text         string `json:"text"`
	Number       uint
	CharacterID  uint
	HistoryTitle string
}

func (chapter *Chapter) Create() map[string]interface{} {

	GetDB().Create(chapter)

	if chapter.ID <= 0 {
		return u.Message(false, "Failed to create chapter, connection error.")
	}

	response := u.Message(true, "Chapter has been created")
	response["chapter"] = chapter
	return response
}

func (chapter *Chapter) Edit() map[string]interface{} {
	GetDB().Save(chapter)

	response := u.Message(true, "Chapter has been edited")
	response["chapter"] = chapter
	return response
}

func (chapter *Chapter) Delete() map[string]interface{} {
	GetDB().Delete(chapter)
	removePhoto(chapter.Photo)
	response := u.Message(true, "Chapter has been deleted")
	response["chapter"] = chapter
	return response
}

func (chapter *Chapter) BuildPhotoName(extension string) string {
	return fmt.Sprintf(
		"chapter_photo%d_%s_%s.%s",
		chapter.CharacterID,
		chapter.HistoryTitle,
		chapter.Title,
		extension,
	)
}

func (chapter *Chapter) SavePhotoName(photoName string) {
	chapter.Photo = photoName
}

func GetChapter(title string, hist_title string, char_id uint) *Chapter {
	chapter := &Chapter{}
	GetDB().Table("chapters").Where(
		"title = ? AND history_title = ? AND character_id = ?", title, hist_title, char_id).First(chapter)
	return chapter
}

func GetAllChapters() []Chapter {
	var all []Chapter
	getAllItems("chapters", &all)
	return all
}

func GetAllChapBy(char_id uint, hist_title string) []Chapter {
	var all []Chapter
	GetDB().Table("chapters").Where(
		"character_id = ? AND history_title = ?", char_id, hist_title).Find(&all)
	return all
}
