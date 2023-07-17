import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { PDF, PDFFile } from 'src/app/data/pdf';
import { PdfService } from 'src/app/service/pdf.service';
import {NgForm, NgModel, NgControl} from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';

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
  };
  pdfFile: PDFFile = {
    File: undefined
  }
  tags: string[] = [];

  constructor(
    private service: PdfService,
    public route: ActivatedRoute,
    public router: Router,
    private titleService: Title
  ) {}

  ngOnInit() {
    window.scrollTo(0, 0);
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.service.getPdfByUuid(id).subscribe({
        next: res => {
          this.pdf = res;
          if (this.pdf.Tags !== undefined) {
            this.tags = this.pdf.Tags
          }
          this.titleService.setTitle("Editing " + (this.pdf.Title ? this.pdf.Title : this.pdf.Filename!));
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
      this.service.updatePdfByUuid(this.pdf, id).subscribe({
        next: res => {
          console.log('Successfully updated');
          this.router.navigate(['/pdf/view/' + id])
        },
        error: err => {
          console.log(err);
        }
      });
    });
  }

}
