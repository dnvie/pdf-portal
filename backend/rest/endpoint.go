package rest

import (
	constants "PDFLib/data"
	"PDFLib/database"
	"PDFLib/utility"
	"bufio"
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"strings"
	"sync"

	"github.com/go-chi/chi"
	"github.com/google/uuid"
)

func UploadPDF(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(0)
	if err != nil {
		http.Error(w, "Failed to parse multipart form data", http.StatusInternalServerError)
		return
	}

	if r.MultipartForm == nil {
		http.Error(w, "Multipart form data not available", http.StatusBadRequest)
		return
	}

	files := r.MultipartForm.File["pdfFile"]

	if len(files) == 0 {
		http.Error(w, "No files uploaded", http.StatusBadRequest)
		return
	}

	var wg sync.WaitGroup
	for _, fileHeader := range files {
		wg.Add(1)
		go func(fileHeader *multipart.FileHeader) {
			defer wg.Done()

			id := uuid.New()
			file, err := fileHeader.Open()
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

			fileReader := bufio.NewReader(file)
			dstWriter := bufio.NewWriter(dst)

			_, err = io.Copy(dstWriter, fileReader)
			if err != nil {
				http.Error(w, "Failed to copy the file to storage", http.StatusInternalServerError)
				return
			}

			err = dstWriter.Flush()
			if err != nil {
				http.Error(w, "Failed to flush the file buffer", http.StatusInternalServerError)
				return
			}

			tags := strings.Split(r.FormValue("tags"), ",")

			pdfInfo := utility.GetPdfInfo(id.String(), file, fileHeader)
			if database.CheckIfFilenameExists(pdfInfo.Filename) {
				err := os.Remove(constants.PDF_PATH + id.String() + ".pdf")
				if err != nil {
					panic(err)
				}
				http.Error(w, "File already exists on server", http.StatusBadRequest)
			} else {
				database.AddPdfFile(pdfInfo)
				database.AddTags(id.String(), tags)
				w.WriteHeader(200)
			}
		}(fileHeader)
	}
	wg.Wait()
}

func GetPDF(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if database.CheckIfFileExists(id) {
		pdf := database.GetPdfData(id)
		w.Header().Set("Content-Type", "application/json")
		pdfJSON, err := json.Marshal(pdf)
		if err != nil {
			io.WriteString(w, "Received Invalid PDF JSON Object")
		} else {
			w.Write(pdfJSON)
		}
	} else {
		http.Error(w, "File does not exist on server", http.StatusBadRequest)
	}
}

func GetAllPDFs(w http.ResponseWriter, r *http.Request) {

	pdfs := database.GetAllPdfData()
	w.Header().Set("Content-Type", "application/json")
	pdfJSON, err := json.Marshal(pdfs)
	if err != nil {
		io.WriteString(w, "Received Invalid PDFs JSON Object")
	} else {
		w.Write(pdfJSON)
	}
}
