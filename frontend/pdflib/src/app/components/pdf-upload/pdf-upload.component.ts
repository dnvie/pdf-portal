import { HttpClient, HttpErrorResponse, HttpEventType, HttpHeaders } from '@angular/common/http';
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
  uploading: boolean = false;

  constructor(private http: HttpClient, private eventService: EventService) {}

  onFileSelected(event: any) {
    const pdfFiles = event.target.files;
  
    if (pdfFiles) {
      const formData: FormData = new FormData();
      for (let i = 0; i < pdfFiles.length; i++) {
        const pdfFile = pdfFiles.item(i);
        formData.append('pdfFile', pdfFile);
      }
  
      this.fileName = pdfFiles.length === 1 ? 'Uploading: ' + pdfFiles.item(0).name : 'Uploading: ' + pdfFiles.length + ' files';
  
      const upload$ = this.http.post('http://localhost:3000/upload', formData, {
        reportProgress: true,
        observe: 'events',
      });
  
      this.addLoader();
  
      this.uploadSub = upload$.subscribe(
        (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.uploadProgress = Math.round((100 * event.loaded) / event.total!);
          } else if (event.type === HttpEventType.Response) {
            this.removeLoader();
          }
        },
        (error: HttpErrorResponse) => {
          this.removeLoaderError();
        }
      );
    }
  }

  reset() {
    this.uploadProgress = null;
    this.uploadSub = null;
    this.uploadFinished = true;
    this.fileName = ''
  }

  updateProgress(event: any) {
    const inputValue = event.target.value;
    this.uploadProgress = +inputValue;
  }

  /////////////////////////////////////

  triggerReduceInHeader() {
    this.eventService.triggerReduceEvent();
  }

  triggerExpandInHeader() {
    this.eventService.triggerExpandEvent();
  }

  triggerExpandClearInHeader() {
    this.eventService.triggerExpandClearEvent();
  }

  setUploadingFalse() {
    this.uploading = false;
  }

  /*triggerUnclearInHeader() {
    this.eventService.triggerUnclearEvent();
  }*/

  addLoader() {
    this.uploading = true;
    const loaderContainer = document.getElementById('loaderContainer');
    setTimeout(function(){ loaderContainer?.classList.add('active');}, 1)  
    this.triggerReduceInHeader();
    setTimeout(function(){ document.getElementById('spinner')?.classList.add('active');}, 350)  
  }

  removeLoader() {
    const loaderContainer = document.getElementById('loaderContainer');
    const spinnerElement = document.getElementById('spinner');
    const checkElement = document.getElementById('check');
  
    setTimeout(function() {
      spinnerElement?.classList.remove('active');
    }, 1000);

    setTimeout(function() {
      checkElement?.classList.add('active');
    }, 1150);
  
    setTimeout(function() {
      checkElement?.classList.remove('active');
    }, 2300);
  
    setTimeout(this.triggerExpandInHeader.bind(this), 2500);
    setTimeout(this.reset.bind(this), 2500);
    setTimeout(function() {loaderContainer?.classList.remove('active')}, 2500);
    setTimeout(this.setUploadingFalse.bind(this), 2500);
  }

  removeLoaderError() {
    const spinnerElement = document.getElementById('spinner');
    const errorElement = document.getElementById('error');
    const errorMessage = document.getElementById('errorMessage');
    const loaderContainer = document.getElementById('loaderContainer');
  
    setTimeout(function() {
      spinnerElement?.classList.remove('active');
    }, 1000);

    setTimeout(function() {
      errorElement?.classList.add('active');
    }, 1150);
  
    setTimeout(function() {
      errorElement?.classList.remove('active');
    }, 2300);
  
    setTimeout(this.triggerExpandClearInHeader.bind(this), 2500);
    setTimeout(function() {errorMessage?.classList.add('active')}, 2700);
    setTimeout(function() {errorMessage?.classList.remove('active')}, 4500);
    setTimeout(this.reset.bind(this), 2500);
    setTimeout(function() {loaderContainer?.classList.remove('active')}, 4500);
    setTimeout(this.setUploadingFalse.bind(this), 4500);
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
