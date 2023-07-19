/*import { HttpClient, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import {Subscription } from 'rxjs';
import { Component, ViewChild } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { EventService } from 'src/app/event-service.service';
import {MatChipInputEvent} from '@angular/material/chips';

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
  tags: string[] = [];

  constructor(private http: HttpClient, private eventService: EventService) {}

  onFileSelected(event: any) {
    const pdfFiles = event.target.files;
  
    if (pdfFiles) {
      const formData: FormData = new FormData();
      for (let i = 0; i < pdfFiles.length; i++) {
        const pdfFile = pdfFiles.item(i);
        formData.append('pdfFile', pdfFile);
      }
      formData.append('tags', JSON.stringify(this.tags));
  
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
          console.log(error.status);
          
          if (error.status == 409) {
            this.removeLoaderError("Duplicate files were omitted");
          } else if (error.status == 400) {
            this.removeLoaderError("No file(s) selected");
          } else if (error.status == 0) {
            this.removeLoaderError("The backend seems to be offline");
          } else {
            this.removeLoaderError("Error uploading files: Error " + error.status);
          }
        }
      );
    }
  }

  removeTag(tag: string) {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.tags.push(value);
    }
    event.chipInput?.clear();
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

  removeLoaderError(message: string) {
    const spinnerElement = document.getElementById('spinner');
    const errorElement = document.getElementById('error');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage!.innerText = message;
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
*/
///

import { HttpClient, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { map, Observable, startWith, Subscription } from 'rxjs';
import { Component, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { EventService } from 'src/app/event-service.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-pdf-upload',
  templateUrl: './pdf-upload.component.html',
  styleUrls: ['./pdf-upload.component.scss']
})
export class PdfUploadComponent implements OnInit{
  @ViewChild(HeaderComponent)
  headerComponent!: HeaderComponent;
  fileName = '';
  uploadProgress: number | null = null;
  uploadSub: Subscription | null = null;
  uploadFinished: boolean = false;
  uploading: boolean = false;
  tags: string[] = [];
  pdfFiles: any = [];
  myControl = new FormControl('');
  folders: string[] = [];
  filteredFolders!: Observable<string[]>;

  constructor(private http: HttpClient, private eventService: EventService) {}

  onFileSelected(event: any) {
    this.pdfFiles = event.target.files;
    for (let i = 0; i < this.pdfFiles.length; i++) {
      console.log(this.pdfFiles[i].name);
    }
  }

  uploadFiles() {
    if (this.pdfFiles.length === 0) {
      return;
    }
    const formData: FormData = new FormData();
      for (let i = 0; i < this.pdfFiles.length; i++) {
        const pdfFile = this.pdfFiles.item(i);
        formData.append('pdfFile', pdfFile);
      }
      formData.append('tags', JSON.stringify(this.tags));
      if (this.myControl.value) {
        formData.append('folder', JSON.stringify(this.myControl.value));
      }

    this.fileName = this.pdfFiles.length === 1 ? 'Uploading: ' + this.pdfFiles[0] : 'Uploading: ' + this.pdfFiles.length + ' files';

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
        console.log(error.status);

        if (error.status == 409) {
          this.removeLoaderError('Duplicate files were omitted');
        } else if (error.status == 400) {
          this.removeLoaderError('No file(s) selected');
        } else if (error.status == 0) {
          this.removeLoaderError('The backend seems to be offline');
        } else {
          this.removeLoaderError('Error uploading files: Error ' + error.status);
        }
      }
    );
  }

  removeTag(tag: string) {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.tags.push(value);
    }
    event.chipInput?.clear();
  }

  reset() {
    this.uploadProgress = null;
    this.uploadSub = null;
    this.uploadFinished = true;
    this.fileName = '';
  }

  updateProgress(event: any) {
    const inputValue = event.target.value;
    this.uploadProgress = +inputValue;
  }

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

  addLoader() {
    this.uploading = true;
    const loaderContainer = document.getElementById('loaderContainer');
    setTimeout(function () {
      loaderContainer?.classList.add('active');
    }, 1);
    this.triggerReduceInHeader();
    setTimeout(function () {
      document.getElementById('spinner')?.classList.add('active');
    }, 350);
  }

  removeLoader() {
    const loaderContainer = document.getElementById('loaderContainer');
    const spinnerElement = document.getElementById('spinner');
    const checkElement = document.getElementById('check');

    setTimeout(function () {
      spinnerElement?.classList.remove('active');
    }, 1000);

    setTimeout(function () {
      checkElement?.classList.add('active');
    }, 1150);

    setTimeout(function () {
      checkElement?.classList.remove('active');
    }, 2300);

    setTimeout(this.triggerExpandInHeader.bind(this), 2500);
    setTimeout(this.reset.bind(this), 2500);
    setTimeout(function () {
      loaderContainer?.classList.remove('active');
    }, 2500);
    setTimeout(this.setUploadingFalse.bind(this), 2500);
  }

  removeLoaderError(message: string) {
    const spinnerElement = document.getElementById('spinner');
    const errorElement = document.getElementById('error');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage!.innerText = message;
    const loaderContainer = document.getElementById('loaderContainer');

    setTimeout(function () {
      spinnerElement?.classList.remove('active');
    }, 1000);

    setTimeout(function () {
      errorElement?.classList.add('active');
    }, 1150);

    setTimeout(function () {
      errorElement?.classList.remove('active');
    }, 2300);

    setTimeout(this.triggerExpandClearInHeader.bind(this), 2500);
    setTimeout(function () {
      errorMessage?.classList.add('active');
    }, 2700);
    setTimeout(function () {
      errorMessage?.classList.remove('active');
    }, 4500);
    setTimeout(this.reset.bind(this), 2500);
    setTimeout(function () {
      loaderContainer?.classList.remove('active');
    }, 4500);
    setTimeout(this.setUploadingFalse.bind(this), 4500);
  }

  ngOnInit(): void {
    this.filteredFolders = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.folders.filter(folder => folder.toLowerCase().includes(filterValue));
  }
}