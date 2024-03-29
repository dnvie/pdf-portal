package data

import (
	"github.com/google/uuid"
)

type PDFInfo struct {
	Uuid         uuid.UUID
	Filename     string
	Size         int64
	NumPages     int64
	Title        string
	CreationDate string
	UploadDate   string
	Author       string
	Tags         []string
	Image        string
	Folder       string
}

type PDFFile struct {
	File string
}

type PDFpreview struct {
	Uuid     string
	Title    string
	Author   string
	Tags     []string
	Image    string
	Size     int64
	NumPages int64
}

type PDFPreviews struct {
	Previews   []PDFpreview
	TotalCount int64
}

type HomeData struct {
	RecentlyViewed   []PDFpreview
	RecentlyUploaded []PDFpreview
	Folders          []string
}
