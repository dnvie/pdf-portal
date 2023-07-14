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

    getPdfByUuid(uuid: string): Observable<PDF> {
        return this.http.get<PDF>(baseUrl + '/pdf/' + uuid);
    }
    
    getPdfFileByUuid(uuid: string): Observable<PDFFile> {
        return this.http.get<PDFFile>(baseUrl + '/pdf/file/' + uuid);
    }

}