package response

import (
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"plmg/models"
	u "plmg/utils"
	"strconv"
	"strings"

	"github.com/golang/gddo/httputil/header"
	"github.com/gorilla/mux"
	"github.com/mitchellh/mapstructure"
)

func convertMap(form map[string][]string) map[string]string {
	map_model := make(map[string]string)
	for key, value := range form {
		map_model[key] = u.MakeLine(value)
	}
	return map_model
}

func decodeRequest(r *http.Request, model models.PlmgObject) error {
	if r.Header.Get("Content-Type") != "" {
		value, _ := header.ParseValueAndParams(r.Header, "Content-Type")
		if value != "application/json" {
			modForm := convertMap(r.Form)
			// decode form to model
			decode_error := mapstructure.Decode(modForm, model)
			decodeFormPhoto(r, model)
			return decode_error
		} else {
			return json.NewDecoder(r.Body).Decode(model)
		}
	}
	msg := "Content-Type header is not application/json"
	return errors.New(msg)
}

func decodeFormPhoto(r *http.Request, model models.PlmgObject) {
	r.ParseMultipartForm(2 << 20)
	file, handler, err := r.FormFile("photo_file")
	if err == nil {
		defer file.Close()
		i := strings.LastIndex(handler.Filename, ".")
		extension := handler.Filename[i+1:]
		photoName := model.BuildPhotoName(extension) // how to build photo name if model.ID == 0 (new empty model)
		fileName, err := filepath.Abs("data/images/" + photoName)

		if err == nil {
			f, err := os.OpenFile(fileName, os.O_WRONLY|os.O_CREATE, 0666)
			if err == nil {
				defer f.Close()
				model.SavePhotoName(photoName) // save same name
				io.Copy(f, file)
			}
		}
	}
	if err != nil {
		log.Println(err.Error())
	}
}

func getPathParams(r *http.Request) map[string]string {
	return mux.Vars(r)
}

func getPathFragment(url string, pos int) string {
	sections := strings.Split(url, "/")
	path := sections[len(sections)+pos]
	return path
}

func stou(sid string) (uint, error) {
	id, err := strconv.Atoi(sid)
	return uint(id), err
}

func charExist(char_id string) error {
	character := models.GetCharacter(char_id)
	if character.ID == 0 {
		return errors.New("Character doesn't exsist")
	}
	return nil
}

func histExist(hist_id string, char_id string) error {
	history := models.GetHistory(hist_id, char_id)
	if history.ID == 0 {
		return errors.New("History doesn't exsist")
	}
	return nil
}

func notExMsg(itemName string) map[string]interface{} {
	return u.Message(u.ERROR, "Invalid request: "+itemName+" doesn't exists")
}
