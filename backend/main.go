package main

import (
	"PDFLib/database"
	"PDFLib/rest"
)

func main() {
	database.ConnectDatabase()
	rest.Serve()
}
