package rest

import (
	"net/http"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/cors"
)

func Serve() {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Accept", "Content-Type", "X-CSRF-Token", "enctype"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	r.Get("/pdf/{id}", GetPDF)
	r.Get("/pdfs", GetAllPDFs)
	r.Get("/pdf/file/{id}", GetPDFFile)
	r.Get("/pdfs/tag/{tag}", GetAllPDFsByTag)
	r.Get("/pdfs/author/{author}", GetAllPDFsByAuthor)
	r.Get("/pdfs/search", GetAllPDFsBySearch)
	r.Get("/folders", GetFolders)
	r.Get("/folder/{name}", CreateFolder)
	r.Get("/folders/{name}", GetAllPDFsByFolder)
	r.Get("/home", GetHomeData)

	r.Post("/upload", UploadPDF)

	r.Put("/pdf/file/{id}", UpdatePDFFile)
	r.Put("/folders/{old}", UpdateFolder)

	r.Delete("/pdf/delete/{id}", DeletePDFFile)
	r.Delete("/folders/{name}", DeleteFolder)

	http.ListenAndServe(":3000", r)
}
