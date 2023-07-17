import {HttpClient, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import { PDF, PDFFile } from '../data/pdf';
import { PDFPreview, PDFPreviews } from '../data/pdfpreview';


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

    getPdfByUuid(uuid: string): Observable<PDF> {
        return this.http.get<PDF>(baseUrl + '/pdf/' + uuid);
    }
    
    getPdfFileByUuid(uuid: string): Observable<PDFFile> {
        return this.http.get<PDFFile>(baseUrl + '/pdf/file/' + uuid);
    }

}