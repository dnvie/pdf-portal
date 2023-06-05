package utility

import (
	structs "PDFLib/data"
	"crypto/md5"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"time"

	"github.com/google/uuid"
	"github.com/h2non/bimg"
	"github.com/unidoc/unipdf/v3/model"
)

func GetPdfInfo(id string, file multipart.File, header *multipart.FileHeader) structs.PDFInfo {
	var PdfInfo structs.PDFInfo

	PdfInfo.Uuid = uuid.MustParse(id)
	PdfInfo.Filename = header.Filename

	reader, err := model.NewPdfReader(file)
	if err != nil {
		log.Fatalf("Failed to create PDF reader: %v", err)
	}

	pdfData, err := reader.GetPdfInfo()
	if err != nil {
		PdfInfo.Author = ""
		PdfInfo.Title = header.Filename[:len(header.Filename)-4]
		PdfInfo.CreationDate = ""
		PdfInfo.NumPages = -1
		PdfInfo.Md5, _ = hash_file_md5(file)
		PdfInfo.Image, _ = ConvertPDFToImage(id)
		return PdfInfo
	}

	fmt.Println(pdfData)

	numPages, err := reader.GetNumPages()
	if err != nil {
		numPages = -1
	}

	if pdfData.Author != nil {
		PdfInfo.Author = pdfData.Author.String()
	} else {
		PdfInfo.Author = ""
	}

	if pdfData.Title != nil {
		PdfInfo.Title = pdfData.Title.String()
	} else {
		PdfInfo.Title = header.Filename[:len(header.Filename)-4]
	}

	if pdfData.CreationDate != nil {
		dateString := pdfData.CreationDate.ToGoTime().Format(time.RFC3339)
		PdfInfo.CreationDate = dateString
		fmt.Println(dateString)
	} else {
		PdfInfo.CreationDate = ""
	}

	PdfInfo.NumPages = int64(numPages)
	PdfInfo.Size = header.Size
	PdfInfo.Md5, _ = hash_file_md5(file)
	PdfInfo.Image, _ = ConvertPDFToImage(id)

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

func hash_file_md5(file multipart.File) (string, error) {

	var returnMD5String string

	hash := md5.New()

	if _, err := io.Copy(hash, file); err != nil {
		return returnMD5String, err
	}

	hashInBytes := hash.Sum(nil)[:16]

	returnMD5String = hex.EncodeToString(hashInBytes)
	return returnMD5String, nil
}
