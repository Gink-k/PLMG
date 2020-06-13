package models

import (
	"fmt"
	u "plmg/utils"
)

//структура для персонажа
type Character struct {
	LitItem `gorm:"embedded"`
	Name    string `json:"name"`
	About   string `json:"about"`
	Excerpt string `json:"excerpt"`
	UserID  uint   `gorm:"default:0"`
}

func (character *Character) Create() map[string]interface{} {

	GetDB().Create(character)

	if character.ID <= 0 {
		return u.Message(u.ERROR, "Failed to create character, connection error.")
	}

	response := u.Message(u.SUCCESS, "Character has been created")
	response["character"] = character
	return response
}

func (character *Character) Edit() map[string]interface{} {
	GetDB().Save(character)

	response := u.Message(u.SUCCESS, "Character has been edited")
	response["character"] = character
	return response
}

func (character *Character) Delete() map[string]interface{} {
	histories := GetAllHistBy(fmt.Sprint(character.ID))
	for _, history := range histories {
		history.Delete()
	}
	GetDB().Delete(character)
	removePhoto(character.Photo)
	response := u.Message(u.SUCCESS, "Character has been deleted")
	response["character"] = character
	return response
}

func (character *Character) GetID() uint {
	return character.ID
}

func (character *Character) BuildPhotoName(extension string) string {
	return fmt.Sprintf(
		"character_photo%d.%s",
		character.ID,
		extension,
	)
}

func (character *Character) SetPhotoName(photoName string) {
	character.Photo = photoName
}

func (character *Character) SavePhotoName() {
	GetDB().Model(character).Update("photo", character.Photo)
}

func (character *Character) deletePhoto() {
	removePhoto(character.Photo)
}

func GetCharacter(id string) *Character {
	char := &Character{}
	GetDB().Table("characters").Where("id = ?", id).First(char)
	return char
}

func GetAllCharByName(name string) []Character {
	var all []Character
	GetDB().Table("characters").Where("lower(name) like lower(?)", "%"+name+"%").Find(&all)
	return all
}

func GetAllCharBy(user_id string) []Character {
	var all []Character
	GetDB().Table("characters").Where("user_id = ?", user_id).Find(&all)
	return all
}

func GetAllCharacters() []Character {
	var all []Character
	getAllItems("characters", &all)
	return all
}
