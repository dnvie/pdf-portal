import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { PDF, PDFFile } from 'src/app/data/pdf';
import { PdfService } from 'src/app/service/pdf.service';
import {NgForm, NgModel, NgControl, FormControl} from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable } from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { EventService } from 'src/app/event-service.service';

@Component({
  selector: 'app-pdf-edit',
  templateUrl: './pdf-edit.component.html',
  styleUrls: ['./pdf-edit.component.scss']
})
export class PdfEditComponent implements OnInit {

  pdf: PDF = {
    Uuid: undefined,
    Title: undefined,
    Author: undefined,
    Tags: undefined,
    Image: undefined,
    Size: undefined,
    NumPages: undefined,
    UploadDate: undefined,
    CreationDate: undefined,
    Filename: undefined,
    Folder: null
  };
  pdfFile: PDFFile = {
    File: undefined
  }
  tags: string[] = [];

  myControl = new FormControl('');
  folders: string[] = [];
  filteredFolders!: Observable<string[]>;
  loaded = false

  constructor(
    private service: PdfService,
    public route: ActivatedRoute,
    public router: Router,
    private titleService: Title,
    private eventService: EventService
  ) {}

  ngOnInit() {
    this.filteredFolders = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
    window.scrollTo(0, 0);
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.service.getPdfByUuid(id).subscribe({
        next: res => {
          this.pdf = res;
          if (this.pdf.Tags !== undefined) {
            this.tags = this.pdf.Tags
          }
          if (this.pdf.Folder) {
            this.myControl.patchValue(this.pdf.Folder)
          }
          this.titleService.setTitle("Editing " + (this.pdf.Title ? this.pdf.Title : this.pdf.Filename!));
          this.loaded = true;
        },
        error: err => {
          console.log(err);
        }
      });
      this.service.getFolders().subscribe({
        next: res => {
          this.folders = res
        },
        error: err => {
          console.log(err);
        }
      });
    });
  }

  formatDate(date: string): string {
    if (date) {
      return date.substring(8,10) + "." + date.substring(5,7) + "." + date.substring(0,4)
    }
    return date
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
      if (!this.tags) {
        this.tags = [];
      }
      this.tags.push(value);
    }
    event.chipInput?.clear();
  }

  updatePdf() {    
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (this.tags) {
        if (this.tags.length != 0) {
          this.pdf.Tags = this.tags
        }
      }
      if (this.myControl.value) {
        if (this.myControl.value !== "") {
          this.pdf.Folder = this.myControl.value
        } else {
          this.pdf.Folder = null
        }
      } else {
        this.pdf.Folder = null
      }
      this.service.updatePdfByUuid(this.pdf, id).subscribe({
        next: res => {
          setTimeout(this.triggerUpdateMessage.bind(this), 1);
          setTimeout(this.triggerHideMessage.bind(this), 2200);
          this.router.navigate(['/pdf/view/' + id])
        },
        error: err => {
          setTimeout(this.triggerUpdateErrorMessage.bind(this), 1);
          setTimeout(this.triggerHideMessage.bind(this), 2200);
          console.log(err);
        }
      });
    });
  }

  deletePdf() {
    if (confirm('Are you sure you want to delete this file?')) {
      this.route.params.subscribe(params => {
        const id = params['id'];
        this.service.deletePdfByUuid(id).subscribe({
          next: res => {
            setTimeout(this.triggerDeleteMessage.bind(this), 1);
            setTimeout(this.triggerHideMessage.bind(this), 2200);
            this.router.navigate(['/'])
          },
          error: err => {
            setTimeout(this.triggerDeleteErrorMessage.bind(this), 1);
            setTimeout(this.triggerHideMessage.bind(this), 2200);
            console.log(err);
          }
        });
      });
    }
  }

  triggerUpdateMessage() {
    this.eventService.triggerUpdateEvent();
  }

  triggerDeleteMessage() {
    this.eventService.triggerDeleteEvent();
  }

  triggerUpdateErrorMessage() {
    this.eventService.triggerUpdateErrorEvent();
  }

  triggerDeleteErrorMessage() {
    this.eventService.triggerDeleteErrorEvent();
  }

  triggerHideMessage() {
    this.eventService.triggerHideMessageEvent();
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.folders.filter(folder => folder.toLowerCase().includes(filterValue));
  }

}
