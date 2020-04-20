package models

import (
	"fmt"
	u "plmg/utils"
)

//структура для персонажа
type History struct {
	LitItem     `gorm:"embedded"`
	Title       string `json:"title"`
	CharacterID uint
}

func (history *History) Create() map[string]interface{} {

	GetDB().Create(history)

	if history.ID <= 0 {
		return u.Message(false, "Failed to create history, connection error.")
	}

	response := u.Message(true, "History has been created")
	response["history"] = history
	return response
}

func (history *History) Edit() map[string]interface{} {
	GetDB().Save(history)

	response := u.Message(true, "History has been edited")
	response["history"] = history
	return response
}

func (history *History) Delete() map[string]interface{} {
	chapters := GetAllChapBy(history.CharacterID, history.Title)
	for _, chapter := range chapters {
		chapter.Delete()
	}
	GetDB().Delete(history)
	removePhoto(history.Photo)
	response := u.Message(true, "History has been deleted")
	response["history"] = history
	return response
}

func (history *History) BuildPhotoName(extension string) string {
	return fmt.Sprintf(
		"history_photo%d_%s.%s",
		history.CharacterID,
		history.Title,
		extension,
	)
}

func (history *History) SavePhotoName(photoName string) {
	history.Photo = photoName
}

func GetHistory(title string, char_id uint) *History {
	history := &History{}
	GetDB().Table("histories").Where(
		"title = ? AND character_id = ?", title, char_id).First(history)
	return history
}

func GetAllHistories() []History {
	var all []History
	getAllItems("histories", &all)
	return all
}

func GetAllHistBy(char_id uint) []History {
	var all []History
	GetDB().Table("histories").Where("character_id = ?", char_id).Find(&all)
	return all
}
