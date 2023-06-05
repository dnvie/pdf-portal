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
	Author       string
	Tags         []string
	Md5          string
	Image        string
}

type PDFpreview struct {
	Uuid   string
	Title  string
	Author string
	Tags   []string
	Image  string
}
