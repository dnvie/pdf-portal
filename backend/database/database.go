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

	statement := `CREATE TABLE IF NOT EXISTS folders (
		id SERIAL PRIMARY KEY,
		name TEXT UNIQUE
	)`
	_, err = database.Exec(statement)
	if err != nil {
		panic(err)
	}

	statement = `CREATE TABLE IF NOT EXISTS pdf (
		id TEXT PRIMARY KEY NOT NULL,
		filename TEXT NOT NULL,
		title TEXT NOT NULL,
		author TEXT,
		creation_date TIMESTAMP WITH TIME ZONE,
		upload_date TIMESTAMP WITH TIME ZONE,
		last_viewed TIMESTAMP WITH TIME ZONE,
		size INTEGER,
		number_of_pages INTEGER,
		image TEXT,
		folder TEXT,
		FOREIGN KEY (folder) REFERENCES folders(name)
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

func CheckIfFolderExists(name string) bool {
	statement := `SELECT name FROM folders WHERE name = $1`
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
	if pdf.Folder == "" {
		statement := `INSERT INTO pdf (id, filename, title, author, creation_date, upload_date, last_viewed, size, number_of_pages, image, folder)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`
		_, err := Database.Exec(statement, pdf.Uuid, pdf.Filename, pdf.Title, pdf.Author, pdf.CreationDate, pdf.UploadDate, nil, pdf.Size, pdf.NumPages, pdf.Image, nil)
		if err != nil {
			panic(err)
		}
	} else {
		if !CheckIfFolderExists(pdf.Folder) {
			AddFolder(pdf.Folder)
		}
		statement := `INSERT INTO pdf (id, filename, title, author, creation_date, upload_date, last_viewed, size, number_of_pages, image, folder)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`
		_, err := Database.Exec(statement, pdf.Uuid, pdf.Filename, pdf.Title, pdf.Author, pdf.CreationDate, pdf.UploadDate, nil, pdf.Size, pdf.NumPages, pdf.Image, pdf.Folder)
		if err != nil {
			panic(err)
		}
	}

}

func AddFolder(name string) {
	tagMutex.Lock()
	defer tagMutex.Unlock()

	if !CheckIfFolderExists(name) {
		statement := `INSERT INTO folders (name) VALUES ($1)`
		_, err := Database.Exec(statement, name)
		if err != nil {
			panic(err)
		}
	}
}

func AddTags(id string, tags []string) {
	tagMutex.Lock()
	defer tagMutex.Unlock()

	statement := `DELETE FROM pdf_tags WHERE pdf_id = $1`
	_, err := Database.Exec(statement, id)
	if err != nil {
		panic(err)
	}

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

func GetFolders() []string {
	statement := `SELECT name FROM folders WHERE 1=1 ORDER BY name ASC`
	rows, err := Database.Query(statement)
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	var folders []string
	for rows.Next() {
		var folder string
		err := rows.Scan(&folder)
		if err != nil {
			panic(err)
		}
		folders = append(folders, folder)
	}
	return folders
}

func GetPdfData(uuid string) structs.PDFInfo {
	statement := `SELECT id, filename, title, author, image, size, number_of_pages, creation_date, upload_date, folder FROM pdf WHERE id = $1`
	var res structs.PDFInfo
	var folder sql.NullString
	err := Database.QueryRow(statement, uuid).Scan(&res.Uuid, &res.Filename, &res.Title, &res.Author, &res.Image, &res.Size, &res.NumPages, &res.CreationDate, &res.UploadDate, &folder)
	if err != nil {
		panic(err)
	}

	if folder.Valid {
		res.Folder = folder.String
	}

	res.Tags = getTags(res.Uuid.String())

	return res
}

func UpdatePdfData(pdf structs.PDFInfo) {
	tx, err := Database.Begin()
	if err != nil {
		panic(err)
	}
	defer tx.Rollback()

	if !CheckIfFolderExists(pdf.Folder) {
		if pdf.Folder != "" {
			AddFolder(pdf.Folder)
			statement := `
						UPDATE pdf
						SET title = $1, author = $2, folder = $3
						WHERE id = $4
						`
			_, err := Database.Exec(statement, pdf.Title, pdf.Author, pdf.Folder, pdf.Uuid)
			if err != nil {
				panic(err)
			}
		} else {
			statement := `
						UPDATE pdf
						SET title = $1, author = $2, folder = $3
						WHERE id = $4
						`
			_, err := Database.Exec(statement, pdf.Title, pdf.Author, nil, pdf.Uuid)
			if err != nil {
				panic(err)
			}
		}
	}
	AddTags(pdf.Uuid.String(), pdf.Tags)

	err = tx.Commit()
	if err != nil {
		panic(err)
	}
}

func DeletePdfData(uuid string) {
	statement := `DELETE FROM pdf_tags WHERE pdf_id = $1`
	_, err := Database.Exec(statement, uuid)
	if err != nil {
		panic(err)
	}

	statement = `DELETE FROM pdf WHERE id = $1`
	_, err = Database.Exec(statement, uuid)
	if err != nil {
		panic(err)
	}
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
	WHERE LOWER(REPLACE(tags.name, ' ', '')) = LOWER(REPLACE($1, ' ', ''))
	ORDER BY pdf.upload_date, pdf.id DESC
	OFFSET $2 LIMIT $3
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
	WHERE LOWER(REPLACE(tags.name, ' ', '')) = LOWER(REPLACE($1, ' ', ''))
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
	WHERE LOWER(REPLACE(pdf.author, ' ', '')) = LOWER(REPLACE($1, ' ', ''))
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
	WHERE LOWER(REPLACE(pdf.author, ' ', '')) = LOWER(REPLACE($1, ' ', ''))
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

func GetAllPdfsInFolder(page int, name string) structs.PDFPreviews {
	var res structs.PDFPreviews

	pageSize := 48
	offset := (page) * pageSize
	limit := pageSize

	statement := `
	SELECT DISTINCT pdf.id, pdf.title, pdf.author, pdf.image, pdf.size, pdf.number_of_pages, pdf.upload_date
	FROM pdf
	WHERE folder = $1
	ORDER BY pdf.upload_date, pdf.id DESC
	OFFSET $2 LIMIT $3
`
	rows, err := Database.Query(statement, name, offset, limit)
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
		SELECT DISTINCT pdf.id, pdf.title, pdf.author, pdf.image, pdf.size, pdf.number_of_pages, pdf.upload_date
	FROM pdf WHERE folder = $1
	) AS unique_pdfs
	`
	var count int64
	err = Database.QueryRow(statement, name).Scan(&count)
	if err != nil {
		panic(err)
	}
	res.TotalCount = count

	return res
}

func UpdateFolderName(old string, new string) {
	tx, err := Database.Begin()
	if err != nil {
		panic(err)
	}
	defer tx.Rollback()

	var pdfsToUpdate []string
	statement := `SELECT id FROM pdf WHERE folder = $1`
	rows, err := Database.Query(statement, old)
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	for rows.Next() {
		var pdfID string
		if err := rows.Scan(&pdfID); err != nil {
			panic(err)
		}
		pdfsToUpdate = append(pdfsToUpdate, pdfID)
	}

	statement = `UPDATE pdf SET folder = NULL WHERE folder = $1`
	_, err = Database.Exec(statement, old)
	if err != nil {
		panic(err)
	}

	statement = `UPDATE folders SET name = $1 WHERE name = $2`
	_, err = Database.Exec(statement, new, old)
	if err != nil {
		panic(err)
	}

	statement = `UPDATE pdf SET folder = $1 WHERE id = $2`
	for _, pdfID := range pdfsToUpdate {
		_, err := Database.Exec(statement, new, pdfID)
		if err != nil {
			panic(err)
		}
	}

	err = tx.Commit()
	if err != nil {
		panic(err)
	}
}

func DeleteFolder(name string) {
	tx, err := Database.Begin()
	if err != nil {
		panic(err)
	}

	updatePDFStatement := `UPDATE pdf SET folder = NULL WHERE folder = $1`
	_, err = tx.Exec(updatePDFStatement, name)
	if err != nil {
		tx.Rollback()
		panic(err)
	}

	deleteFolderStatement := `DELETE FROM folders WHERE name = $1`
	_, err = tx.Exec(deleteFolderStatement, name)
	if err != nil {
		tx.Rollback()
		panic(err)
	}

	err = tx.Commit()
	if err != nil {
		panic(err)
	}
}

func GetHomeData() structs.HomeData {
	var homeData structs.HomeData

	recentlyUploadedQuery := `SELECT id, title, author, image, size, number_of_pages
							  FROM pdf
							  ORDER BY upload_date::TIMESTAMP WITH TIME ZONE DESC, id ASC
							  LIMIT 5`

	rows, err := Database.Query(recentlyUploadedQuery)
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	for rows.Next() {
		var pdfPreview structs.PDFpreview
		err := rows.Scan(&pdfPreview.Uuid, &pdfPreview.Title, &pdfPreview.Author, &pdfPreview.Image, &pdfPreview.Size, &pdfPreview.NumPages)
		if err != nil {
			panic(err)
		}
		homeData.RecentlyUploaded = append(homeData.RecentlyUploaded, pdfPreview)
	}

	recentlyViewedQuery := `SELECT id, title, author, image, size, number_of_pages
							FROM pdf WHERE last_viewed IS NOT NULL
							ORDER BY last_viewed::TIMESTAMP WITH TIME ZONE DESC
							LIMIT 5`

	rows, err = Database.Query(recentlyViewedQuery)
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	for rows.Next() {
		var pdfPreview structs.PDFpreview
		err := rows.Scan(&pdfPreview.Uuid, &pdfPreview.Title, &pdfPreview.Author, &pdfPreview.Image, &pdfPreview.Size, &pdfPreview.NumPages)
		if err != nil {
			panic(err)
		}
		homeData.RecentlyViewed = append(homeData.RecentlyViewed, pdfPreview)
	}

	foldersQuery := `SELECT name
					 FROM folders
					 ORDER BY name
					 LIMIT 3`

	rows, err = Database.Query(foldersQuery)
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	for rows.Next() {
		var folderName string
		err := rows.Scan(&folderName)
		if err != nil {
			panic(err)
		}
		homeData.Folders = append(homeData.Folders, folderName)
	}
	return homeData
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
