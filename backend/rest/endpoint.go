package rest

import (
	constants "PDFLib/data"
	"PDFLib/database"
	"PDFLib/utility"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/google/uuid"
)

func UploadPDF(w http.ResponseWriter, r *http.Request) {
	id := uuid.New()
	file, header, err := r.FormFile("pdfFile")
	if err != nil {
		http.Error(w, "Failed to retrieve the file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	dst, err := os.Create(constants.PDF_PATH + id.String() + ".pdf")
	if err != nil {
		http.Error(w, "Failed to create the file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	_, err = io.Copy(dst, file)
	if err != nil {
		http.Error(w, "Failed to copy the file to storage", http.StatusInternalServerError)
		return
	}

	tags := strings.Split(r.FormValue("tags"), ",")

	pdfInfo := utility.GetPdfInfo(id.String(), file, header)
	if database.CheckIfFilenameExists(pdfInfo.Filename) {
		err := os.Remove(constants.PDF_PATH + id.String() + ".pdf")
		if err != nil {
			panic(err)
		}
		http.Error(w, "File already exists on server", http.StatusBadRequest)
	} else {
		database.AddPdfFile(pdfInfo)
		database.AddTags(id.String(), tags)
	}

	w.WriteHeader(200)
}

func GetPDF(w http.ResponseWriter, r *http.Request) {

}
