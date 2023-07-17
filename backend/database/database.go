/*package database

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
	statement, _ = database.Prepare("CREATE TABLE IF NOT EXISTS tags (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, color TEXT)")
	statement.Exec()
	statement, _ = database.Prepare("CREATE TABLE IF NOT EXISTS pdf_tags (pdf_id TEXT, tag_id INTEGER, FOREIGN KEY (pdf_id) REFERENCES pdf(id), FOREIGN KEY (tag_id) REFERENCES tags(id), PRIMARY KEY (pdf_id, tag_id))")
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

func getTagIdByName(name string) int {
	var id int
	statement := `SELECT id FROM tags WHERE name = ?`
	err := Database.QueryRow(statement, name).Scan(&id)
	if err != nil {
		if err != sql.ErrNoRows {
			panic(err)
		}
		return -1
	}
	return id
}

func AddPdfFile(pdf structs.PDFInfo) {
	statement, _ := Database.Prepare("INSERT INTO pdf (id, filename, title, author, creation_date, size, number_of_pages, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
	statement.Exec(pdf.Uuid, pdf.Filename, pdf.Title, pdf.Author, pdf.CreationDate, pdf.Size, pdf.NumPages, pdf.Image)
}

func AddTags(id string, tags []string) {
	for _, tag := range tags {
		if CheckIfTagExists(tag) {
			tag_id := getTagIdByName(tag)
			statement, _ := Database.Prepare("INSERT INTO pdf_tags (pdf_id, tag_id) VALUES (?, ?)")
			statement.Exec(id, tag_id)
		} else {
			statement, _ := Database.Prepare("INSERT INTO tags (name) VALUES (?)")
			statement.Exec(tag)
			tag_id := getTagIdByName(tag)
			statement, _ = Database.Prepare("INSERT INTO pdf_tags (pdf_id, tag_id) VALUES (?, ?)")
			statement.Exec(id, tag_id)
		}
	}
}

func getTags(id string) []string {
	var tags []string

	statement, _ := Database.Prepare("SELECT tags.name FROM tags JOIN pdf_tags ON tags.id = pdf_tags.tag_id WHERE pdf_tags.pdf_id = ?")
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
	var size, numPages int64

	statement := `SELECT id, title, author, image, size, number_of_pages FROM pdf WHERE id = ?`
	err := Database.QueryRow(statement, uuid).Scan(&id, &title, &author, &image, &size, &numPages)
	if err != nil {
		panic(err)
	}
	res.Uuid, res.Title, res.Author, res.Image, res.Size, res.NumPages = id, title, author, image, size, numPages
	res.Tags = getTags(id)

	return res
}

func GetAllPdfData() []structs.PDFpreview {
	var pdfs []structs.PDFpreview
	var id, title, author, image string
	var size, numPages int64

	statement, _ := Database.Prepare(`SELECT id, title, author, image, size, number_of_pages FROM pdf`)
	rows, err := statement.Query()
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	for rows.Next() {
		var pdf structs.PDFpreview
		if err := rows.Scan(&id, &title, &author, &image, &size, &numPages); err != nil {
			panic(err)
		}
		pdf.Uuid, pdf.Title, pdf.Author, pdf.Image, pdf.Size, pdf.NumPages = id, title, author, image, size, numPages
		pdf.Tags = getTags(id)
		pdfs = append(pdfs, pdf)
	}
	return pdfs
}*/

package database

import (
	structs "PDFLib/data"
	"database/sql"
	"sync"
	"time"

	_ "github.com/lib/pq"
)

var Database *sql.DB
var tagMutex sync.Mutex

func ConnectDatabase() {
	database, err := sql.Open("postgres", "postgres://dnvie:password@localhost/PDFLib?sslmode=disable")
	if err != nil {
		panic(err)
	}

	statement2 := `DROP TABLE pdf_tags`
	_, err = database.Exec(statement2)
	if err != nil {
		panic(err)
	}
	statement1 := `DROP TABLE tags`
	_, err = database.Exec(statement1)
	if err != nil {
		panic(err)
	}
	statement3 := `DROP TABLE pdf`
	_, err = database.Exec(statement3)
	if err != nil {
		panic(err)
	}

	statement := `CREATE TABLE IF NOT EXISTS pdf (
		id TEXT PRIMARY KEY NOT NULL,
		filename TEXT NOT NULL,
		title TEXT NOT NULL,
		author TEXT,
		creation_date TEXT,
		upload_date TEXT,
		last_viewed TEXT,
		size INTEGER,
		number_of_pages INTEGER,
		image TEXT
	)`
	_, err = database.Exec(statement)
	if err != nil {
		panic(err)
	}

	statement = `CREATE TABLE IF NOT EXISTS tags (
		id SERIAL PRIMARY KEY,
		name TEXT UNIQUE,
		background_color TEXT,
		text_color TEXT
	)`
	_, err = database.Exec(statement)
	if err != nil {
		panic(err)
	}

	statement = `CREATE TABLE IF NOT EXISTS pdf_tags (
		pdf_id TEXT,
		tag_id INTEGER,
		FOREIGN KEY (pdf_id) REFERENCES pdf(id),
		FOREIGN KEY (tag_id) REFERENCES tags(id),
		PRIMARY KEY (pdf_id, tag_id)
	)`
	_, err = database.Exec(statement)
	if err != nil {
		panic(err)
	}

	Database = database
}

func CheckIfFilenameExists(filename string) bool {
	statement := `SELECT filename FROM pdf WHERE filename = $1`
	var result string
	err := Database.QueryRow(statement, filename).Scan(&result)
	if err != nil {
		if err != sql.ErrNoRows {
			panic(err)
		}
		return false
	}
	return true
}

func CheckIfFileExists(id string) bool {
	statement := `SELECT id FROM pdf WHERE id = $1`
	var result string
	err := Database.QueryRow(statement, id).Scan(&result)
	if err != nil {
		if err != sql.ErrNoRows {
			panic(err)
		}
		return false
	}
	return true
}

func CheckIfTagExists(name string) bool {
	statement := `SELECT name FROM tags WHERE name = $1`
	var result string
	err := Database.QueryRow(statement, name).Scan(&result)
	if err != nil {
		if err != sql.ErrNoRows {
			panic(err)
		}
		return false
	}
	return true
}

func getTagIDByName(name string) int {
	var id int
	statement := `SELECT id FROM tags WHERE name = $1`
	err := Database.QueryRow(statement, name).Scan(&id)
	if err != nil {
		if err != sql.ErrNoRows {
			panic(err)
		}
		return -1
	}
	return id
}

func AddPdfFile(pdf structs.PDFInfo) {
	statement := `INSERT INTO pdf (id, filename, title, author, creation_date, upload_date, last_viewed, size, number_of_pages, image)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`
	_, err := Database.Exec(statement, pdf.Uuid, pdf.Filename, pdf.Title, pdf.Author, pdf.CreationDate, pdf.UploadDate, nil, pdf.Size, pdf.NumPages, pdf.Image)
	if err != nil {
		panic(err)
	}
}

func AddTags(id string, tags []string) {
	tagMutex.Lock()
	defer tagMutex.Unlock()

	for _, tag := range tags {
		if CheckIfTagExists(tag) {
			tagID := getTagIDByName(tag)
			statement := `INSERT INTO pdf_tags (pdf_id, tag_id) VALUES ($1, $2)`
			_, err := Database.Exec(statement, id, tagID)
			if err != nil {
				panic(err)
			}
		} else {
			statement := `INSERT INTO tags (name) VALUES ($1) RETURNING id`
			var tagID int
			err := Database.QueryRow(statement, tag).Scan(&tagID)
			if err != nil {
				panic(err)
			}

			statement = `INSERT INTO pdf_tags (pdf_id, tag_id) VALUES ($1, $2)`
			_, err = Database.Exec(statement, id, tagID)
			if err != nil {
				panic(err)
			}
		}
	}
}

func getTags(id string) []string {
	statement := `SELECT tags.name FROM tags JOIN pdf_tags ON tags.id = pdf_tags.tag_id WHERE pdf_tags.pdf_id = $1`
	rows, err := Database.Query(statement, id)
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	var tags []string
	for rows.Next() {
		var tag string
		err := rows.Scan(&tag)
		if err != nil {
			panic(err)
		}
		tags = append(tags, tag)
	}

	return tags
}

func GetPdfData(uuid string) structs.PDFInfo {
	statement := `SELECT id, filename, title, author, image, size, number_of_pages, creation_date, upload_date FROM pdf WHERE id = $1`
	var res structs.PDFInfo
	err := Database.QueryRow(statement, uuid).Scan(&res.Uuid, &res.Filename, &res.Title, &res.Author, &res.Image, &res.Size, &res.NumPages, &res.CreationDate, &res.UploadDate)
	if err != nil {
		panic(err)
	}

	res.Tags = getTags(res.Uuid.String())

	return res
}

func GetAllPdfData(page int) structs.PDFPreviews {
	var res structs.PDFPreviews

	pageSize := 48
	offset := (page) * pageSize
	limit := pageSize

	statement := `SELECT id, title, author, image, size, number_of_pages FROM pdf ORDER BY upload_date, pdf.id DESC OFFSET $1 LIMIT $2`
	rows, err := Database.Query(statement, offset, limit)
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	var pdfs []structs.PDFpreview
	for rows.Next() {
		var pdf structs.PDFpreview
		err := rows.Scan(&pdf.Uuid, &pdf.Title, &pdf.Author, &pdf.Image, &pdf.Size, &pdf.NumPages)
		if err != nil {
			panic(err)
		}
		pdf.Tags = getTags(pdf.Uuid)
		pdfs = append(pdfs, pdf)
	}
	res.Previews = pdfs

	statement = `SELECT COUNT(*) FROM pdf`
	var count int64
	err = Database.QueryRow(statement).Scan(&count)
	if err != nil {
		panic(err)
	}
	res.TotalCount = count

	return res
}

func GetAllPdfDataByTag(page int, tagname string) structs.PDFPreviews {
	var res structs.PDFPreviews

	pageSize := 48
	offset := (page) * pageSize
	limit := pageSize

	statement := `
	SELECT pdf.id, pdf.title, pdf.author, pdf.image, pdf.size, pdf.number_of_pages
	FROM pdf
	INNER JOIN pdf_tags ON pdf.id = pdf_tags.pdf_id
	INNER JOIN tags ON pdf_tags.tag_id = tags.id
	WHERE REPLACE(tags.name, ' ', '') ILIKE '%' || REPLACE($1, ' ', '') || '%'
	ORDER BY pdf.upload_date, pdf.id DESC OFFSET $2 LIMIT $3
	`
	rows, err := Database.Query(statement, tagname, offset, limit)
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	var pdfs []structs.PDFpreview
	for rows.Next() {
		var pdf structs.PDFpreview
		err := rows.Scan(&pdf.Uuid, &pdf.Title, &pdf.Author, &pdf.Image, &pdf.Size, &pdf.NumPages)
		if err != nil {
			panic(err)
		}
		pdf.Tags = getTags(pdf.Uuid)
		pdfs = append(pdfs, pdf)
	}
	res.Previews = pdfs

	statement = `
	SELECT COUNT(*)
	FROM pdf
	INNER JOIN pdf_tags ON pdf.id = pdf_tags.pdf_id
	INNER JOIN tags ON pdf_tags.tag_id = tags.id
	WHERE REPLACE(tags.name, ' ', '') ILIKE '%' || REPLACE($1, ' ', '') || '%'
	`
	var count int64
	err = Database.QueryRow(statement, tagname).Scan(&count)
	if err != nil {
		panic(err)
	}
	res.TotalCount = count

	return res
}

func GetAllPdfDataByAuthor(page int, author string) structs.PDFPreviews {
	var res structs.PDFPreviews

	pageSize := 48
	offset := (page) * pageSize
	limit := pageSize

	statement := `
	SELECT pdf.id, pdf.title, pdf.author, pdf.image, pdf.size, pdf.number_of_pages
	FROM pdf
	WHERE REPLACE(pdf.author, ' ', '') ILIKE '%' || REPLACE($1, ' ', '') || '%'
	ORDER BY pdf.upload_date, pdf.id DESC OFFSET $2 LIMIT $3
	`
	rows, err := Database.Query(statement, author, offset, limit)
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	var pdfs []structs.PDFpreview
	for rows.Next() {
		var pdf structs.PDFpreview
		err := rows.Scan(&pdf.Uuid, &pdf.Title, &pdf.Author, &pdf.Image, &pdf.Size, &pdf.NumPages)
		if err != nil {
			panic(err)
		}
		pdf.Tags = getTags(pdf.Uuid)
		pdfs = append(pdfs, pdf)
	}
	res.Previews = pdfs

	statement = `
	SELECT COUNT(*)
	FROM pdf
	WHERE REPLACE(pdf.author, ' ', '') ILIKE '%' || REPLACE($1, ' ', '') || '%'
	`
	var count int64
	err = Database.QueryRow(statement, author).Scan(&count)
	if err != nil {
		panic(err)
	}
	res.TotalCount = count

	return res
}

func GetAllPdfDataBySearch(page int, title string, author string, tag string) structs.PDFPreviews {
	var res structs.PDFPreviews

	pageSize := 48
	offset := (page) * pageSize
	limit := pageSize

	statement := `
	SELECT DISTINCT pdf.id, pdf.title, pdf.author, pdf.image, pdf.size, pdf.number_of_pages, pdf.upload_date
	FROM pdf
	LEFT JOIN pdf_tags ON pdf.id = pdf_tags.pdf_id
	LEFT JOIN tags ON pdf_tags.tag_id = tags.id
	WHERE
		(REPLACE(pdf.title, ' ', '') ILIKE '%' || REPLACE($1, ' ', '') || '%' OR $1 = '')
		AND (REPLACE(pdf.author, ' ', '') ILIKE '%' || REPLACE($2, ' ', '') || '%' OR $2 = '')
		AND (REPLACE(tags.name, ' ', '') ILIKE '%' || REPLACE($3, ' ', '') || '%' OR $3 = '')
	ORDER BY pdf.upload_date, pdf.id DESC
	OFFSET $4 LIMIT $5
`
	rows, err := Database.Query(statement, title, author, tag, offset, limit)
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	var pdfs []structs.PDFpreview
	for rows.Next() {
		var pdf structs.PDFpreview
		var upload_date string
		err := rows.Scan(&pdf.Uuid, &pdf.Title, &pdf.Author, &pdf.Image, &pdf.Size, &pdf.NumPages, &upload_date)
		if err != nil {
			panic(err)
		}
		pdf.Tags = getTags(pdf.Uuid)
		pdfs = append(pdfs, pdf)
	}
	res.Previews = pdfs

	statement = `
	SELECT COUNT(*)
	FROM (
		SELECT DISTINCT pdf.id
		FROM pdf
		LEFT JOIN pdf_tags ON pdf.id = pdf_tags.pdf_id
		LEFT JOIN tags ON pdf_tags.tag_id = tags.id
		WHERE
			(REPLACE(pdf.title, ' ', '') ILIKE '%' || REPLACE($1, ' ', '') || '%' OR $1 = '')
			AND (REPLACE(pdf.author, ' ', '') ILIKE '%' || REPLACE($2, ' ', '') || '%' OR $2 = '')
			AND (REPLACE(tags.name, ' ', '') ILIKE '%' || REPLACE($3, ' ', '') || '%' OR $3 = '')
	) AS unique_pdfs
	`
	var count int64
	err = Database.QueryRow(statement, title, author, tag).Scan(&count)
	if err != nil {
		panic(err)
	}
	res.TotalCount = count

	return res
}

func SetLastViewed(uuid string) {
	if CheckIfFileExists(uuid) {
		currentTime := time.Now().Format("2006-01-02T15:04:05-07:00")
		statement := `UPDATE pdf SET last_viewed = $1 WHERE id = $2`
		_, err := Database.Exec(statement, currentTime, uuid)
		if err != nil {
			panic(err)
		}
	}
}
