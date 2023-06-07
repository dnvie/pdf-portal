import { Component, OnInit } from '@angular/core';
import { PDFPreview, PDFPreviews } from 'src/app/data/pdfpreview';
import { PdfService } from 'src/app/service/pdf.service';

@Component({
  selector: 'app-pdf-overview',
  templateUrl: './pdf-overview.component.html',
  styleUrls: ['./pdf-overview.component.scss']
})
export class PdfOverviewComponent implements OnInit {

  pdfs: PDFPreviews = {
    data: undefined
  }

  constructor(
    private service: PdfService
  ) {
  }

  ngOnInit() {
    this.loadPdfs();
  }

  loadPdfs() {
    this.service.getAllPdfs().subscribe(
      data => {
        this.pdfs.data = data
        console.log(this.pdfs.data[0]);
        
      },
      error => {
        console.log("error loading network info", error);
      },
    );
  }

  test(pdf: PDFPreview) {
    console.log(pdf);
    
  }
}
