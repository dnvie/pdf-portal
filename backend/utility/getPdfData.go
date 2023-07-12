package utility

import (
	structs "PDFLib/data"
	"encoding/base64"
	"fmt"
	"log"
	"mime/multipart"
	"os"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/h2non/bimg"
	"github.com/unidoc/unipdf/v3/model"
)

func GetPdfInfo(id string, file multipart.File, header *multipart.FileHeader) structs.PDFInfo {
	var PdfInfo structs.PDFInfo

	PdfInfo.Uuid = uuid.MustParse(id)
	PdfInfo.Filename = strings.ToValidUTF8(header.Filename, "")

	reader, err := model.NewPdfReader(file)
	if err != nil {
		log.Fatalf("Failed to create PDF reader: %v", err)
	}

	pdfData, err := reader.GetPdfInfo()
	if err != nil {
		PdfInfo.Author = ""
		PdfInfo.Title = strings.ToValidUTF8(header.Filename[:len(header.Filename)-4], "")
		PdfInfo.CreationDate = ""
		PdfInfo.NumPages = -1
		PdfInfo.Image, _ = ConvertPDFToImage(id)
		return PdfInfo
	}

	numPages, err := reader.GetNumPages()
	if err != nil {
		numPages = -1
	}

	if pdfData.Author != nil {
		PdfInfo.Author = strings.ToValidUTF8(pdfData.Author.String(), "")
	} else {
		PdfInfo.Author = ""
	}

	if pdfData.Title != nil {
		PdfInfo.Title = strings.ToValidUTF8(pdfData.Title.String(), "")
	} else {
		PdfInfo.Title = strings.ToValidUTF8(header.Filename[:len(header.Filename)-4], "")
	}

	if pdfData.CreationDate != nil {
		dateString := pdfData.CreationDate.ToGoTime().Format(time.RFC3339)
		PdfInfo.CreationDate = dateString
	} else {
		PdfInfo.CreationDate = ""
	}

	PdfInfo.NumPages = int64(numPages)
	PdfInfo.Size = header.Size
	PdfInfo.Image, _ = ConvertPDFToImage(id)
	PdfInfo.UploadDate = time.Now().Format("2006-01-02T15:04:05-07:00")

	return PdfInfo
}

func ConvertPDFToImage(id string) (string, error) {

	pdfImage, err := bimg.Read("library/pdfs/" + id + ".pdf")
	if err != nil {
		return "", err
	}

	imageBuffer, err := bimg.NewImage(pdfImage).Convert(bimg.ImageType(2))
	if err != nil {
		return "", err
	}

	image := base64.StdEncoding.EncodeToString(imageBuffer)

	return image, nil
}

func ReadPDFFile(filePath string) ([]byte, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	fileInfo, err := file.Stat()
	if err != nil {
		return nil, err
	}
	fileSize := fileInfo.Size()

	fileContent := make([]byte, fileSize)
	_, err = file.Read(fileContent)
	if err != nil {
		return nil, err
	}

	fmt.Println(fileSize)

	return fileContent, nil
}
