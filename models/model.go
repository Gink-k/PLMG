package models

import (
	"log"
	"os"
	"path/filepath"

	"github.com/jinzhu/gorm"
)

type PlmgObject interface {
	Create() map[string]interface{}
	Edit() map[string]interface{}
	Delete() map[string]interface{}
	GetID() uint
	BuildPhotoName(extension string) string
	SavePhotoName(photoName string)
}

type LitItem struct {
	gorm.Model
	Photo string `json:"photo"`
}

func getSupposedID(model PlmgObject) uint {
	GetDB().Save(model)
	return model.GetID()
}

func removePhoto(photoName string) {
	if photoName != "" {
		fileName, err := filepath.Abs("data/images/" + photoName)
		if err == nil {
			if err := os.Remove(fileName); err != nil {
				log.Println(err)
			}
		} else {
			log.Println(err)
		}
	}
}

func getAllItems(tableName string, i interface{}) {
	GetDB().Table(tableName).Find(i)
}
