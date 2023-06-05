package database

import (
	structs "PDFLib/data"
	"database/sql"

	_ "github.com/mattn/go-sqlite3"
)

var Database *sql.DB

func ConnectDatabase() {
	database, _ := sql.Open("sqlite3", "./database/pdflib.db")
	statement, _ := database.Prepare("CREATE TABLE IF NOT EXISTS pdf (id TEXT PRIMARY KEY NOT NULL, filename TEXT NOT NULL, title TEXT NOT NULL, author TEXT, creation_date TEXT, size INTEGER, number_of_pages INTEGER, image TEXT)")
	statement.Exec()
	//statement, _ = database.Prepare("CREATE TABLE IF NOT EXISTS pdf_tags (id INTEGER PRIMARY KEY AUTOINCREMENT, pdf_id TEXT NOT NULL, tag TEXT NOT NULL, FOREIGN KEY (pdf_id) REFERENCES pdf (id));")
	//statement.Exec()
	statement, _ = database.Prepare("CREATE TABLE IF NOT EXISTS tags (name TEXT PRIMARY KEY, color TEXT)")
	statement.Exec()
	statement, _ = database.Prepare("CREATE TABLE IF NOT EXISTS pdf_tags (pdf_id TEXT, tag_name TEXT, FOREIGN KEY (pdf_id) REFERENCES pdf(id), FOREIGN KEY (tag_name) REFERENCES tags(name), PRIMARY KEY (pdf_id, tag_name))")
	statement.Exec()

	Database = database
}

func CheckIfFilenameExists(filename string) bool {
	statement := `SELECT filename FROM pdf WHERE filename = ?`
	err := Database.QueryRow(statement, filename).Scan(&filename)
	if err != nil {
		if err != sql.ErrNoRows {
			panic(err)
		}
		return false
	}
	return true
}

func CheckIfFileExists(id string) bool {
	statement := `SELECT id FROM pdf WHERE id = ?`
	err := Database.QueryRow(statement, id).Scan(&id)
	if err != nil {
		if err != sql.ErrNoRows {
			panic(err)
		}
		return false
	}
	return true
}

func CheckIfTagExists(name string) bool {
	statement := `SELECT name FROM tags WHERE name = ?`
	err := Database.QueryRow(statement, name).Scan(&name)
	if err != nil {
		if err != sql.ErrNoRows {
			panic(err)
		}
		return false
	}
	return true
}

func AddPdfFile(pdf structs.PDFInfo) {
	statement, _ := Database.Prepare("INSERT INTO pdf (id, filename, title, author, creation_date, size, number_of_pages, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
	statement.Exec(pdf.Uuid, pdf.Filename, pdf.Title, pdf.Author, pdf.CreationDate, pdf.Size, pdf.NumPages, pdf.Image)
}

func AddTags(id string, tags []string) {
	for _, tag := range tags {
		if CheckIfTagExists(tag) {
			statement, _ := Database.Prepare("INSERT INTO pdf_tags (pdf_id, tag_name) VALUES (?, ?)")
			statement.Exec(id, tag)
		} else {
			statement, _ := Database.Prepare("INSERT INTO tags (name) VALUES (?)")
			statement.Exec(tag)
			statement, _ = Database.Prepare("INSERT INTO pdf_tags (pdf_id, tag_name) VALUES (?, ?)")
			statement.Exec(id, tag)
		}
	}
}

func getTags(id string) []string {
	var tags []string

	statement, _ := Database.Prepare("SELECT tags.* FROM tags JOIN pdf_tags ON tags.name = pdf_tags.tag_name WHERE pdf_tags.pdf_id = ?")
	rows, err := statement.Query(id)
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	for rows.Next() {
		var tag string
		if err := rows.Scan(&tag); err != nil {
			panic(err)
		}
		tags = append(tags, tag)
	}
	return tags
}

func GetPdfData(uuid string) structs.PDFpreview {
	var res structs.PDFpreview
	var id, title, author, image string

	statement := `SELECT id, title, author, image FROM pdf WHERE id = ?`
	err := Database.QueryRow(statement, uuid).Scan(&id, &title, &author, &image)
	if err != nil {
		panic(err)
	}
	res.Uuid, res.Title, res.Author, res.Image = id, title, author, image
	res.Tags = getTags(id)

	return res
}
