package models

import (
	"fmt"
	u "plmg/utils"
)

type Chapter struct {
	LitItem     `gorm:"embedded"`
	Title       string `json:"title"`
	Text        string `json:"text"`
	Number      uint
	CharacterID uint
	HistoryID   uint
}

func (chapter *Chapter) Create() map[string]interface{} {

	GetDB().Create(chapter)

	if chapter.ID <= 0 {
		return u.Message(u.ERROR, "Failed to create chapter, connection error.")
	}

	response := u.Message(u.SUCCESS, "Chapter has been created")
	response["chapter"] = chapter
	return response
}

func (chapter *Chapter) Edit() map[string]interface{} {
	GetDB().Save(chapter)

	response := u.Message(u.SUCCESS, "Chapter has been edited")
	response["chapter"] = chapter
	return response
}

func (chapter *Chapter) Delete() map[string]interface{} {
	GetDB().Delete(chapter)
	removePhoto(chapter.Photo)
	response := u.Message(u.SUCCESS, "Chapter has been deleted")
	response["chapter"] = chapter
	return response
}

func (chapter *Chapter) GetID() uint {
	return chapter.ID
}

func (chapter *Chapter) BuildPhotoName(extension string) string {
	return fmt.Sprintf(
		"chapter_photo%d_%d_%d.%s",
		chapter.CharacterID,
		chapter.HistoryID,
		chapter.ID,
		extension,
	)
}

func (chapter *Chapter) SetPhotoName(photoName string) {
	chapter.Photo = photoName
}

func (chapter *Chapter) SavePhotoName() {
	chapter.Edit()
}

func GetChapter(id string, hist_id string, char_id string) *Chapter {
	chapter := &Chapter{}
	GetDB().Table("chapters").Where(
		"id = ? AND history_id = ? AND character_id = ?", id, hist_id, char_id).First(chapter)
	return chapter
}

func GetAllChapters() []Chapter {
	var all []Chapter
	getAllItems("chapters", &all)
	return all
}

func GetAllChapBy(char_id string, hist_id string) []Chapter {
	var all []Chapter
	GetDB().Table("chapters").Where(
		"character_id = ? AND history_id = ?", char_id, hist_id).Find(&all)
	return all
}
