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
	"strconv"
	"strings"

	"github.com/golang/gddo/httputil/header"
	"github.com/gorilla/mux"
	"github.com/mitchellh/mapstructure"
)

func convertMap(form map[string][]string) map[string]string {
	map_model := make(map[string]string)
	for key, value := range form {
		for i, str := range value {
			if i < len(value)-1 {
				map_model[key] += str + " "
			} else {
				map_model[key] += str
			}
		}
	}
	return map_model
}

func decodeRequest(w http.ResponseWriter, r *http.Request, model models.PlmgObject) error {
	if r.Header.Get("Content-Type") != "" {
		value, _ := header.ParseValueAndParams(r.Header, "Content-Type")
		if value != "application/json" {
			r.ParseMultipartForm(2 << 20)
			modForm := convertMap(r.Form)

			// decode form to model
			decode_error := mapstructure.Decode(modForm, model)

			file, handler, err := r.FormFile("photo_file")

			if err == nil {
				defer file.Close()
				i := strings.LastIndex(handler.Filename, ".")
				extension := handler.Filename[i+1:]
				photoName := model.BuildPhotoName(extension)
				fileName, err := filepath.Abs("data/images/" + photoName)

				if err == nil {
					f, err := os.OpenFile(fileName, os.O_WRONLY|os.O_CREATE, 0666)
					if err == nil {
						defer f.Close()
						model.SavePhotoName(photoName)
						io.Copy(f, file)
					}
				}
			}
			if err != nil {
				log.Println(err.Error())
			}
			return decode_error
		} else {
			return json.NewDecoder(r.Body).Decode(model)
		}
	}
	msg := "Content-Type header is not application/json"
	return errors.New(msg)
}

func getPathParams(r *http.Request) map[string]string {
	return mux.Vars(r)
}

func getPathFragment(url string, pos int) string {
	sections := strings.Split(url, "/")
	path := sections[len(sections)+pos]
	return path
}

func getUintCharID(char_id_string string) (uint, error) {
	char_id_int, err := strconv.Atoi(char_id_string)
	return uint(char_id_int), err
}

func charExist(char_id uint) error {
	character := models.GetCharacter(char_id)
	if character.ID == 0 {
		return errors.New("Character doesn't exsist")
	}
	return nil
}

func histExist(hist_title string, char_id uint) error {
	history := models.GetHistory(hist_title, char_id)
	if history.ID == 0 {
		return errors.New("History doesn't exsist")
	}
	return nil
}
