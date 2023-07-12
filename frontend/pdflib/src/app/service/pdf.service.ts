import {HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import { PDF } from '../data/pdf';
import { PDFPreview, PDFPreviews } from '../data/pdfpreview';


const baseUrl = 'http://localhost:3000';

@Injectable({
    providedIn: 'root'
  })
  

export class PdfService {

    constructor(
        private http: HttpClient
    ) { }

    getAllPdfs(): Observable<PDFPreview[]> {
        return this.http.get<PDFPreview[]>(baseUrl + '/pdfs');
    }

    getPdfByUuid(uuid: string): Observable<PDF> {
        return this.http.get<PDF>(baseUrl + '/pdf/' + uuid);
    }

}