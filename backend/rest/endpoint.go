package rest

import (
	"PDFLib/data"
	constants "PDFLib/data"
	"PDFLib/database"
	"PDFLib/utility"
	"bufio"
	"encoding/base64"
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"strconv"
	"sync"

	"github.com/go-chi/chi"
	"github.com/google/uuid"
)

func UploadPDF(w http.ResponseWriter, r *http.Request) {
	includedDuplicates := false
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

			jsonTags := r.FormValue("tags")
			var tags []string
			_ = json.Unmarshal([]byte(jsonTags), &tags)
			tags = utility.RemoveDuplicateTags(tags)

			pdfInfo := utility.GetPdfInfo(id.String(), file, fileHeader)
			if database.CheckIfFilenameExists(pdfInfo.Filename) {
				err := os.Remove(constants.PDF_PATH + id.String() + ".pdf")
				if err != nil {
					panic(err)
				}
				includedDuplicates = true
			} else {
				database.AddPdfFile(pdfInfo)
				if len(tags) != 0 {
					database.AddTags(id.String(), tags)
				}
			}
		}(fileHeader)
	}
	wg.Wait()
	if includedDuplicates {
		w.WriteHeader(http.StatusConflict)
	} else {
		w.WriteHeader(http.StatusOK)
	}
}

func GetPDF(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if database.CheckIfFileExists(id) {
		database.SetLastViewed(id)
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

func GetPDFFile(w http.ResponseWriter, r *http.Request) {
	var file data.PDFFile
	id := chi.URLParam(r, "id")
	if database.CheckIfFileExists(id) {
		fileContent, err := utility.ReadPDFFile(constants.PDF_PATH + id + ".pdf")
		if err != nil {
			panic(err)
		}
		file.File = base64.StdEncoding.EncodeToString(fileContent)

		w.Header().Set("Content-Type", "application/json")

		fileJSON, err := json.Marshal(file)
		if err != nil {
			io.WriteString(w, "Received Invalid PDF JSON Object")
		} else {
			w.Write(fileJSON)
		}
	} else {
		http.Error(w, "File does not exist on server", http.StatusBadRequest)
	}
}

func GetAllPDFs(w http.ResponseWriter, r *http.Request) {
	pageStr := r.URL.Query().Get("page")

	if pageStr == "" {
		http.Error(w, "Page parameter is missing", http.StatusBadRequest)
		return
	}

	page, err := strconv.Atoi(pageStr)
	if err != nil {
		http.Error(w, "Invalid page parameter", http.StatusBadRequest)
		return
	}

	pdfs := database.GetAllPdfData(page)
	w.Header().Set("Content-Type", "application/json")
	pdfJSON, err := json.Marshal(pdfs)
	if err != nil {
		io.WriteString(w, "Received Invalid PDFs JSON Object")
	} else {
		w.Write(pdfJSON)
	}
}
