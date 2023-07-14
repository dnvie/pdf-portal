import { Component, OnInit } from '@angular/core';
import { PDF, PDFFile } from 'src/app/data/pdf';
import { PdfService } from 'src/app/service/pdf.service';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pdf-details',
  templateUrl: './pdf-details.component.html',
  styleUrls: ['./pdf-details.component.scss']
})
export class PdfDetailsComponent implements OnInit {
  pdfUrl: SafeResourceUrl | undefined;

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

  constructor(
    private service: PdfService,
    public route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.service.getPdfByUuid(id).subscribe({
        next: res => {
          this.pdf = res;
          console.log(this.pdf);
          //const byteCharacters = atob(this.pdf.File!);
          //const byteNumbers = new Array(byteCharacters.length);
          //for (let i = 0; i < byteCharacters.length; i++) {
          //  byteNumbers[i] = byteCharacters.charCodeAt(i);
          //}
          //const byteArray = new Uint8Array(byteNumbers);
          //const pdfData = new Blob([byteArray], { type: 'application/pdf' });
          //const pdfUrl = URL.createObjectURL(pdfData);
          //console.log(pdfUrl);
          //window.open(pdfUrl, '_blank');
        },
        error: err => {
          console.log(err);
        }
      });
    });
  }

  formatDate(date: string): string {
    return date.substring(8,10) + "." + date.substring(5,7) + "." + date.substring(0,4)
  }

  getPdf(type: number) {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.service.getPdfFileByUuid(id).subscribe({
        next: res => {
          this.pdfFile = res;
          console.log(this.pdfFile);
          const byteCharacters = atob(this.pdfFile.File!);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const pdfData = new Blob([byteArray], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(pdfData);

          if(type == 1) {
            window.open(pdfUrl, '_blank');
          } else {
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = this.pdf.Filename!;
            link.click();
            window.URL.revokeObjectURL(pdfUrl);
          }
        },
        error: err => {
          console.log(err);
        }
      });
    });
  }
}