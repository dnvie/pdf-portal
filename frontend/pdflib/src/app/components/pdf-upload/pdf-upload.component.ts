import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { finalize, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Component, ViewChild } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { EventService } from 'src/app/event-service.service';

@Component({
  selector: 'app-pdf-upload',
  templateUrl: './pdf-upload.component.html',
  styleUrls: ['./pdf-upload.component.scss']
})
export class PdfUploadComponent {
  @ViewChild(HeaderComponent)
  headerComponent!: HeaderComponent;
  fileName = '';
  uploadProgress: number | null = null;
  uploadSub: Subscription | null = null;
  uploadFinished: boolean = false;

  constructor(private http: HttpClient, private eventService: EventService) {}

  onFileSelected(event: any) {

      const pdfFiles = event.target.files;

      if (pdfFiles) {
        const formData: FormData = new FormData();
        for (let i = 0; i < pdfFiles.length; i++) {
          const pdfFile = pdfFiles.item(i);
          formData.append('pdfFile', pdfFile);
        }

        this.fileName = (pdfFiles.length === 1 ? pdfFiles.item(0).name : pdfFiles.length + "files")

        const upload$ = this.http.post("http://localhost:3000/upload", formData, {
            reportProgress: true,
            observe: 'events'
        })
        .pipe(
            finalize(() => this.reset())
        );
      
        this.uploadSub = upload$.subscribe(event => {
          if (event.type == HttpEventType.UploadProgress) {
            this.uploadProgress = Math.round(100 * (event.loaded / event.total!));
          }
        })
    }
  }

  reset() {
    this.uploadProgress = null;
    this.uploadSub = null;
    this.uploadFinished = true;
    this.fileName = 'No file uploaded yet.'
  }

  updateProgress(event: any) {
    const inputValue = event.target.value;
    this.uploadProgress = +inputValue;
  }

  /////////////////////////////////////

  triggerClearInHeader() {
    this.eventService.triggerClearEvent();
  }

  triggerUnclearInHeader() {
    this.eventService.triggerUnclearEvent();
  }
}

/*uploadPdfFile(event: any) {
    const pdfFiles = event.target.files;
  
    const formData: FormData = new FormData();
    for (let i = 0; i < pdfFiles.length; i++) {
      const pdfFile = pdfFiles.item(i);
      formData.append('pdfFile', pdfFile);
    }

    const upload$ = this.http.post("/http://localhost:3000/upload', formdata", formData);

    upload$.subscribe();
  }*/
