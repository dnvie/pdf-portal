package rest

import (
	"PDFLib/data"
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

			dst, err := os.Create(data.PDF_PATH + id.String() + ".pdf")
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

			jsonFolder := r.FormValue("folder")
			var folder string
			_ = json.Unmarshal([]byte(jsonFolder), &folder)

			pdfInfo := utility.GetPdfInfo(id.String(), file, fileHeader)
			pdfInfo.Folder = folder
			if database.CheckIfFilenameExists(pdfInfo.Filename) {
				err := os.Remove(data.PDF_PATH + id.String() + ".pdf")
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
		fileContent, err := utility.ReadPDFFile(data.PDF_PATH + id + ".pdf")
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

func GetAllPDFsByTag(w http.ResponseWriter, r *http.Request) {
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

	tag := chi.URLParam(r, "tag")

	pdfs := database.GetAllPdfDataByTag(page, tag)
	w.Header().Set("Content-Type", "application/json")
	pdfJSON, err := json.Marshal(pdfs)
	if err != nil {
		io.WriteString(w, "Received Invalid PDFs JSON Object")
	} else {
		w.Write(pdfJSON)
	}
}

func GetAllPDFsByAuthor(w http.ResponseWriter, r *http.Request) {
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

	author := chi.URLParam(r, "author")

	pdfs := database.GetAllPdfDataByAuthor(page, author)
	w.Header().Set("Content-Type", "application/json")
	pdfJSON, err := json.Marshal(pdfs)
	if err != nil {
		io.WriteString(w, "Received Invalid PDFs JSON Object")
	} else {
		w.Write(pdfJSON)
	}
}

func GetAllPDFsBySearch(w http.ResponseWriter, r *http.Request) {
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

	title := r.URL.Query().Get("title")
	author := r.URL.Query().Get("author")
	tag := r.URL.Query().Get("tag")

	pdfs := database.GetAllPdfDataBySearch(page, title, author, tag)
	w.Header().Set("Content-Type", "application/json")
	pdfJSON, err := json.Marshal(pdfs)
	if err != nil {
		io.WriteString(w, "Received Invalid PDFs JSON Object")
	} else {
		w.Write(pdfJSON)
	}
}

func GetAllPDFsByFolder(w http.ResponseWriter, r *http.Request) {
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

	name := chi.URLParam(r, "name")

	pdfs := database.GetAllPdfsInFolder(page, name)
	w.Header().Set("Content-Type", "application/json")
	pdfJSON, err := json.Marshal(pdfs)
	if err != nil {
		io.WriteString(w, "Received Invalid PDFs JSON Object")
	} else {
		w.Write(pdfJSON)
	}
}

func UpdatePDFFile(w http.ResponseWriter, r *http.Request) {
	var updatedPdf data.PDFInfo
	id := chi.URLParam(r, "id")
	if database.CheckIfFileExists(id) {
		err := json.NewDecoder(r.Body).Decode(&updatedPdf)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		database.UpdatePdfData(updatedPdf)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
	} else {
		http.Error(w, "File does not exist on server", http.StatusBadRequest)
	}
}

func DeletePDFFile(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	if database.CheckIfFileExists(id) {
		database.DeletePdfData(id)
		err := os.Remove(data.PDF_PATH + id + ".pdf")
		if err != nil {
			panic(err)
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
	} else {
		http.Error(w, "File does not exist on server", http.StatusBadRequest)
	}
}

func GetFolders(w http.ResponseWriter, r *http.Request) {
	folders := database.GetFolders()
	w.Header().Set("Content-Type", "application/json")
	pdfJSON, err := json.Marshal(folders)
	if err != nil {
		io.WriteString(w, "Received Invalid PDFs JSON Object")
	} else {
		w.Write(pdfJSON)
	}
}

func CreateFolder(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")

	if !database.CheckIfFolderExists(name) {
		database.AddFolder(name)
		w.WriteHeader(http.StatusOK)
	} else {
		http.Error(w, "A Folder with this name already exists!", http.StatusConflict)
	}
}

func UpdateFolder(w http.ResponseWriter, r *http.Request) {
	old := chi.URLParam(r, "old")

	var newFolder struct {
		Name string `json:"name"`
	}

	err := json.NewDecoder(r.Body).Decode(&newFolder)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	new := newFolder.Name

	if database.CheckIfFolderExists(old) {
		if !database.CheckIfFolderExists(new) {
			database.UpdateFolderName(old, new)
			w.WriteHeader(http.StatusOK)
		} else {
			http.Error(w, "A Folder with this name already exists!", http.StatusConflict)
		}
	} else {
		http.Error(w, "This folder does not exist!", http.StatusConflict)
	}
}

func DeleteFolder(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")

	if database.CheckIfFolderExists(name) {
		database.DeleteFolder(name)
		w.WriteHeader(http.StatusOK)
	} else {
		http.Error(w, "This folder does not exist!", http.StatusConflict)
	}
}

func GetHomeData(w http.ResponseWriter, r *http.Request) {
	homeData := database.GetHomeData()
	w.Header().Set("Content-Type", "application/json")
	pdfHome, err := json.Marshal(homeData)
	if err != nil {
		io.WriteString(w, "Received Invalid PDFs JSON Object")
	} else {
		w.Write(pdfHome)
	}
}
