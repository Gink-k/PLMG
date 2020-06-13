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
		return u.Message(u.ERROR, "Failed to create history, connection error.")
	}

	response := u.Message(u.SUCCESS, "History has been created")
	response["history"] = history
	return response
}

func (history *History) Edit() map[string]interface{} {
	GetDB().Save(history)

	response := u.Message(u.SUCCESS, "History has been edited")
	response["history"] = history
	return response
}

func (history *History) Delete() map[string]interface{} {
	chapters := GetAllChapBy(fmt.Sprint(history.ID), history.Title)
	for _, chapter := range chapters {
		chapter.Delete()
	}
	GetDB().Delete(history)
	removePhoto(history.Photo)
	response := u.Message(u.SUCCESS, "History has been deleted")
	response["history"] = history
	return response
}

func (history *History) GetID() uint {
	return history.ID
}

func (history *History) BuildPhotoName(extension string) string {
	return fmt.Sprintf(
		"history_photo%d_%d.%s",
		history.CharacterID,
		history.ID,
		extension,
	)
}

func (history *History) SetPhotoName(photoName string) {
	history.Photo = photoName
}

func (history *History) SavePhotoName() {
	GetDB().Model(history).Update("photo", history.Photo)
}

func GetHistory(hist_id string, char_id string) *History {
	history := &History{}
	GetDB().Table("histories").Where(
		"id = ? AND character_id = ?", hist_id, char_id).First(history)
	return history
}

func GetAllHistories() []History {
	var all []History
	getAllItems("histories", &all)
	return all
}

func GetAllHistBy(char_id string) []History {
	var all []History
	GetDB().Table("histories").Where("character_id = ?", char_id).Find(&all)
	return all
}

func GetAllHistByName(name string) []History {
	var all []History
	GetDB().Table("histories").Where("lower(title) like lower(?)", "%"+name+"%").Find(&all)
	return all

}
