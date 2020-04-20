package site

import (
	"errors"
	"html/template"
	"log"
	"net/http"
	"strings"
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
}

func renderTemplate(w http.ResponseWriter, tmpl string, data map[string]interface{}) {
	err := templates.ExecuteTemplate(w, tmpl+".html", data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func SiteHandler(fn func(w http.ResponseWriter, r *http.Request) map[string]interface{}) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		response := fn(w, r)
		if !response["status"].(bool) {
			http.Error(w, response["message"].(string), http.StatusInternalServerError)
			return
		}
		tmpl := response["item"].(string)
		log.Println(r.Method)

		if r.Method == "GET" {
			params := r.URL.Query()
			response["params"] = params
		} else if r.Method == "POST" {
			var i int
			url := r.URL.Path
			location := r.FormValue("location")
			switch location {
			case "..":
				i = strings.LastIndex(url, "/")
				break
			case "../../":
				last := strings.LastIndex(url, "/")
				i = strings.LastIndex(url[:last], "/")
				break
			default:
				i = len(url)
			}
			http.Redirect(w, r, url[:i], http.StatusFound)
			return
		}
		renderTemplate(w, tmpl, response)
	}
}

func MainPageHandler(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "/characters", http.StatusFound)
}
