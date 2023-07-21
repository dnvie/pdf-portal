import {HttpClient, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import { PDF, PDFFile } from '../data/pdf';
import { HomeData, PDFPreview, PDFPreviews } from '../data/pdfpreview';


const baseUrl = 'http://localhost:3000';

@Injectable({
    providedIn: 'root'
  })
  

export class PdfService {

    constructor(
        private http: HttpClient
    ) { }

    getAllPdfs(page: number): Observable<PDFPreviews> {
        const params = new HttpParams()
            .set('page', String(page));
        return this.http.get<PDFPreviews>(baseUrl + '/pdfs', { params });
    }

    getAllPdfsByTag(page: number, tag: string): Observable<PDFPreviews> {
        const params = new HttpParams()
            .set('page', String(page));
        return this.http.get<PDFPreviews>(baseUrl + '/pdfs/tag/' + tag, { params });
    }

    getAllPdfsByAuthor(page: number, author: string): Observable<PDFPreviews> {
        const params = new HttpParams()
            .set('page', String(page));
        return this.http.get<PDFPreviews>(baseUrl + '/pdfs/author/' + author, { params });
    }

    getAllPdfsBySearch(page: number, title: string, author: string, tag: string): Observable<PDFPreviews> {
        const params = new HttpParams()
            .set('page', String(page))
            .set('title', title)
            .set('author', author)
            .set('tag', tag);
        return this.http.get<PDFPreviews>(baseUrl + '/pdfs/search', { params });
    }

    getAllPdfsInFolder(page: number, folder: string): Observable<PDFPreviews> {
        const params = new HttpParams()
            .set('page', String(page));
        return this.http.get<PDFPreviews>(baseUrl + '/folders/' + folder, { params });
    }

    getPdfByUuid(uuid: string): Observable<PDF> {
        return this.http.get<PDF>(baseUrl + '/pdf/' + uuid);
    }
    
    getPdfFileByUuid(uuid: string): Observable<PDFFile> {
        return this.http.get<PDFFile>(baseUrl + '/pdf/file/' + uuid);
    }

    updatePdfByUuid(pdf: PDF, uuid: string): Observable<PDF> {
        return this.http.put<PDF>(baseUrl + '/pdf/file/' + uuid, pdf);
    }

    deletePdfByUuid(uuid: string): Observable<PDF> {
        return this.http.delete<PDF>(baseUrl + '/pdf/delete/' + uuid)
    }

    getFolders(): Observable<string[]> {
        return this.http.get<string[]>(baseUrl + '/folders')
    }

    createFolder(name: string): Observable<string> {
        return this.http.get<string>(baseUrl + '/folder/' + name);
    }

    updateFolderName(oldName: string, newName: string): Observable<string> {
        const newFolder = { name: newName };
        return this.http.put<string>(baseUrl + '/folders/' + oldName, newFolder)
    }

    deleteFolder(name: string): Observable<string> {
        return this.http.delete<string>(baseUrl + '/folders/' + name);
    }

    getHomeData(): Observable<HomeData> {
        return this.http.get<HomeData>(baseUrl + '/home');
    }

}