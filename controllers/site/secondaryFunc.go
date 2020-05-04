package site

import (
	"errors"
	"html/template"
	"net/http"
	"plmg/models"
	"time"
)

var templates = template.Must(template.New("tmpl").Funcs(funcMap).ParseGlob("tmpl/*"))

var funcMap = template.FuncMap{
	// The name "inc" is what the function will be called in the template text.
	"inc": func(i int) int {
		return i + 1
	},

	"dict": func(values ...interface{}) (map[string]interface{}, error) {
		if len(values)%2 != 0 {
			return nil, errors.New("invalid dict call")
		}
		dict := make(map[string]interface{}, len(values)/2)
		for i := 0; i < len(values); i += 2 {
			key, ok := values[i].(string)
			if !ok {
				return nil, errors.New("dict keys must be strings")
			}
			dict[key] = values[i+1]
		}
		return dict, nil
	},

	"mkSlice": func(args ...interface{}) []interface{} {
		return args
	},
}

func renderTemplate(w http.ResponseWriter, tmpl string, data map[string]interface{}) {
	err := templates.ExecuteTemplate(w, tmpl+".html", data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func getUser(r *http.Request) *models.Account {
	id := r.Context().Value("user")
	if id != nil {
		return models.GetUser(id.(uint))
	} else {
		return &models.Account{Status: models.ANONYMOUS, Group: models.USER, Name: "Гость"}
	}
}

func getLocation(r *http.Request) string {
	location := r.FormValue("location")
	if location == "" {
		location = r.URL.Path
	}
	return location
}

func setCookie(w http.ResponseWriter, name string, value string, addtime int) {
	expires := time.Now().Add(time.Second * time.Duration(addtime))
	cookie1 := &http.Cookie{Name: name, Value: value, Expires: expires, HttpOnly: false}
	http.SetCookie(w, cookie1)
}

func saveTokenInCookie(w http.ResponseWriter, token string) {
	token = "Bearer " + token
	addtime := 24 * 60 * 60
	setCookie(w, X_SESSION_TOKEN, token, addtime)
}

func getAdminSection(form map[string][]string) string {
	sect := form["section"]
	var result string
	for i, str := range sect {
		if i < len(sect)-1 {
			result += str + " "
		} else {
			result += str
		}
	}
	return result
}
