import { Component, OnInit } from '@angular/core';
import { PDFPreview, PDFPreviews } from 'src/app/data/pdfpreview';
import { PdfService } from 'src/app/service/pdf.service';

@Component({
  selector: 'app-pdf-overview',
  templateUrl: './pdf-overview.component.html',
  styleUrls: ['./pdf-overview.component.scss']
})
export class PdfOverviewComponent implements OnInit {

  listView = false
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
      },
      error => {
        console.log("error loading network info", error);
      },
    );
  }

  /////////////////////////////////////

  toggleListView() {
    this.listView = true;
  }

  toggleGridView() {
    this.listView = false;
  }

  isListView(): boolean {
    return this.listView
  }
}
