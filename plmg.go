package main

import (
	"log"
	"net/http"
	"os"
	"plmg/app"
	"plmg/controllers/api"
	contr "plmg/controllers/response"
	"plmg/controllers/site"

	"github.com/gorilla/mux"
)

func main() {
	r := mux.NewRouter()
	var url string
	pattern := "[0-9]+}"

	url = "/api/characters"
	r.HandleFunc(url+"/{id}", api.ApiHandler(contr.ViewCharacter)).Methods("GET")
	r.HandleFunc(url+"/{id}", api.ApiHandler(contr.EditCharacter)).Methods("PUT")
	r.HandleFunc(url+"/{id}", api.ApiHandler(contr.DeleteCharacter)).Methods("DELETE")
	r.HandleFunc(url, api.ApiHandler(contr.GetAllCharacters)).Methods("GET")
	r.HandleFunc(url, api.ApiHandler(contr.CreateCharacter)).Methods("POST")
	url += "/{id}/histories"
	r.HandleFunc(url+"/{h_id:"+pattern, api.ApiHandler(contr.ViewHistory)).Methods("GET")
	r.HandleFunc(url+"/{h_id:"+pattern, api.ApiHandler(contr.EditHistory)).Methods("PUT")
	r.HandleFunc(url+"/{h_id:"+pattern, api.ApiHandler(contr.DeleteHistory)).Methods("DELETE")
	r.HandleFunc(url, api.ApiHandler(contr.GetAllHistories)).Methods("GET")
	r.HandleFunc(url, api.ApiHandler(contr.CreateHistory)).Methods("POST")
	url += "/{h_id:" + pattern + "/chapters"
	r.HandleFunc(url+"/{c_id:"+pattern, api.ApiHandler(contr.ViewChapter)).Methods("GET")
	r.HandleFunc(url+"/{c_id:"+pattern, api.ApiHandler(contr.EditChapter)).Methods("PUT")
	r.HandleFunc(url+"/{c_id:"+pattern, api.ApiHandler(contr.DeleteChapter)).Methods("DELETE")
	r.HandleFunc(url, api.ApiHandler(contr.GetAllChapters)).Methods("GET")
	r.HandleFunc(url, api.ApiHandler(contr.CreateChapter)).Methods("POST")

	url = "/api/profile/{u_id:" + pattern
	r.HandleFunc(url, api.ApiHandler(contr.ViewAccount)).Methods("GET")
	r.HandleFunc(url, api.ApiHandler(contr.EditAccount)).Methods("PUT")
	r.HandleFunc(url, api.ApiHandler(contr.DeleteAccount)).Methods("DELETE")
	r.HandleFunc(url, api.ApiHandler(contr.CreateAccount)).Methods("POST")
	url = "/api/comments"
	r.HandleFunc(url+"/{comm_id:"+pattern, api.ApiHandler(contr.ViewComment)).Methods("GET")
	r.HandleFunc(url+"/{comm_id:"+pattern, api.ApiHandler(contr.EditComment)).Methods("PUT")
	r.HandleFunc(url+"/{comm_id:"+pattern, api.ApiHandler(contr.DeleteComment)).Methods("DELETE")
	r.HandleFunc(url, api.ApiHandler(contr.GetAllComments)).Methods("GET")
	r.HandleFunc(url, api.ApiHandler(contr.CreateComment)).Methods("POST")

	r.HandleFunc("/api/search", api.ApiHandler(contr.SearchHandler)).Methods("POST")

	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	r.PathPrefix("/data/").Handler(http.StripPrefix("/data/", http.FileServer(http.Dir("data"))))
	r.HandleFunc("/", site.MainPageHandler)

	url = "/characters"
	r.HandleFunc(url+"/{id}", site.SiteHandler(contr.ViewCharacter)).Methods("GET")
	r.HandleFunc(url+"/{id}/edit", site.SiteHandler(contr.EditCharacter)).Methods("POST")
	r.HandleFunc(url+"/{id}", site.SiteHandler(contr.DeleteCharacter)).Methods("POST")
	r.HandleFunc(url, site.SiteHandler(contr.GetAllCharacters)).Methods("GET")
	r.HandleFunc(url, site.SiteHandler(contr.CreateCharacter)).Methods("POST")
	url += "/{id}/histories"
	r.HandleFunc(url+"/{h_id:"+pattern, site.SiteHandler(contr.ViewHistory)).Methods("GET")
	r.HandleFunc(url+"/{h_id:"+pattern+"/edit", site.SiteHandler(contr.EditHistory)).Methods("POST")
	r.HandleFunc(url+"/{h_id:"+pattern, site.SiteHandler(contr.DeleteHistory)).Methods("POST")
	r.HandleFunc(url, site.SiteHandler(contr.GetAllHistoriesWithChaps)).Methods("GET")
	r.HandleFunc(url, site.SiteHandler(contr.CreateHistory)).Methods("POST")
	url += "/{h_id:" + pattern + "/chapters"
	// r.HandleFunc(url+"/{c_title:"+pattern, site.SiteHandler(contr.ViewChapter)).Methods("GET")
	r.HandleFunc(url+"/{c_id:"+pattern+"/edit", site.SiteHandler(contr.EditChapter)).Methods("POST")
	r.HandleFunc(url+"/{c_id:"+pattern, site.SiteHandler(contr.DeleteChapter)).Methods("POST")
	r.HandleFunc(url, site.SiteHandler(contr.GetAllChapters)).Methods("GET")
	r.HandleFunc(url, site.SiteHandler(contr.CreateChapter)).Methods("POST")
	r.HandleFunc("/search", site.SiteHandler(contr.SearchHandler))
	r.HandleFunc("/profile/{u_id:"+pattern, site.SiteHandler(contr.ViewAccount)).Methods("GET")
	r.HandleFunc("/login", site.AuthenticationHandler).Methods("POST")
	r.HandleFunc("/logout", site.SiteHandler(contr.Logout)).Methods("POST")
	r.HandleFunc("/registration", site.RegistrationHandler).Methods("GET", "POST")

	r.HandleFunc("/admin", site.AdminPageHandler).Methods("GET", "POST")

	r.Use(app.WebJwtAuth)
	//r.Use(app.JwtAuthentication)
	port := ":" + os.Getenv("PORT")
	log.Fatal(http.ListenAndServe(port, r))
}
