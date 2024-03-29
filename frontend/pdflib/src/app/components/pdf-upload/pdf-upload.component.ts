import { HttpClient, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { map, Observable, startWith, Subscription } from 'rxjs';
import { Component, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { EventService } from 'src/app/event-service.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { FormControl } from '@angular/forms';
import { PdfService } from 'src/app/service/pdf.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-pdf-upload',
  templateUrl: './pdf-upload.component.html',
  styleUrls: ['./pdf-upload.component.scss']
})

export class PdfUploadComponent implements OnInit {
  @ViewChild(HeaderComponent)
  headerComponent!: HeaderComponent;
  fileName = '';
  uploadProgress: number | null = null;
  uploadSub: Subscription | null = null;
  uploadFinished: boolean = false;
  uploading: boolean = false;
  tags: string[] = [];
  pdfFiles: File[] = [];
  myControl = new FormControl('');
  folders: string[] = [];
  filteredFolders!: Observable<string[]>;

  constructor(private http: HttpClient, private eventService: EventService, private service: PdfService, private titleService: Title) { }

  onFileSelected(event: any) {
    const selectedFiles = event.target.files;
    for (let i = 0; i < selectedFiles.length; i++) {
      if (selectedFiles[i].type === "application/pdf") {
        this.pdfFiles.push(selectedFiles[i]);
      }
    }
  }

  uploadFiles() {
    if (this.pdfFiles.length === 0) {
      return;
    }
    const formData: FormData = new FormData();
    for (let i = 0; i < this.pdfFiles.length; i++) {
      const pdfFile = this.pdfFiles[i];
      
      formData.append('pdfFile', pdfFile);
    }
    formData.append('tags', JSON.stringify(this.tags));
    if (this.myControl.value) {
      if (this.myControl.value !== "") {
        formData.append('folder', JSON.stringify(this.myControl.value));
      }
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
          if (this.pdfFiles.length == 1) {
            this.removeLoaderMessage('1 file successfully uploaded');
          } else {
            this.removeLoaderMessage(this.pdfFiles.length + ' files successfully uploaded');
          }
          this.pdfFiles = [];
          this.tags = [];
          this.myControl.patchValue("");
          this.service.getFolders().subscribe({
            next: res => {
              this.folders = res
            },
            error: err => {
              console.log(err);
            }
          });
        }
      },
      (error: HttpErrorResponse) => {
        console.log(error.status);
        this.pdfFiles = [];

        if (error.status == 409) {
          this.removeLoaderMessage('Duplicate files were ignored');
        } else if (error.status == 400) {
          this.removeLoaderMessage('No file(s) selected');
        } else if (error.status == 0) {
          this.removeLoaderMessage('The backend seems to be offline');
        } else {
          this.removeLoaderMessage('Error uploading files: Error ' + error.status);
        }
      }
    );
  }

  onFilesDropped(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      if (files[i].type === "application/pdf") {
        this.pdfFiles.push(files[i]);
      }
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

  removeLoaderMessage(msg: string) {
    const spinnerElement = document.getElementById('spinner');
    var errorElement: HTMLElement | null
    const message = document.getElementById('message');
    if (msg.includes("successfully uploaded")) {
      errorElement = document.getElementById('check');
      message!.style.color = '#2de358';
    } else {
      errorElement = document.getElementById('error');
      message!.style.color = '#db1432';
    }
    message!.innerText = msg;
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
      message?.classList.add('active');
    }, 2700);
    setTimeout(function () {
      message?.classList.remove('active');
    }, 4500);
    setTimeout(this.reset.bind(this), 2500);
    setTimeout(function () {
      loaderContainer?.classList.remove('active');
    }, 4500);
    setTimeout(this.setUploadingFalse.bind(this), 4500);
  }

  ngOnInit(): void {
    setTimeout(this.revealItems, 20);
    this.titleService.setTitle("Upload Files");
    this.filteredFolders = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
    this.service.getFolders().subscribe({
      next: res => {
        this.folders = res
      },
      error: err => {
        console.log(err);
      }
    });
  }

  revealItems() {
    setTimeout(function () { document.getElementById('container')?.classList.remove('unrevealed'); }, 40);

    setTimeout(function () { document.getElementsByClassName('title')[0]?.classList.remove('unrevealed'); }, 60);
    setTimeout(function () { document.getElementsByClassName('smallTitle')[0]?.classList.remove('unrevealed'); }, 80);    
    setTimeout(function () { document.getElementsByClassName('dropzone')[0]?.classList.remove('unrevealed'); }, 100);
    setTimeout(function () { document.getElementById('dropzoneTitle')?.classList.remove('unrevealed'); }, 120);
    setTimeout(function () { document.getElementsByClassName('dropSmallText')[0]?.classList.remove('unrevealed'); }, 140);
    setTimeout(function () { document.getElementsByClassName('button')[0]?.classList.remove('unrevealed'); }, 160);
    setTimeout(function () { document.getElementsByClassName('filesSelected')[0]?.classList.remove('unrevealed'); }, 180);
    setTimeout(function () { document.getElementsByClassName('uploadButton')[0]?.classList.remove('unrevealed'); }, 200);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.folders.filter(folder => folder.toLowerCase().includes(filterValue));
  }
}