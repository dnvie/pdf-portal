import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { PDFPreviews } from 'src/app/data/pdfpreview';
import { PdfService } from 'src/app/service/pdf.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-pdf-overview',
  templateUrl: './pdf-overview.component.html',
  styleUrls: ['./pdf-overview.component.scss']
})
export class PdfOverviewComponent implements OnInit {

  currentPage = 0;
  totalPages = 0;
  pageSize = 48;
  listView = false
  loaded = false;
  skeletons: any[] = Array(48).fill({});
  pdfs: PDFPreviews = {
    Previews: undefined,
    TotalCount: 0
  }

  constructor(
    private service: PdfService,
    private titleService: Title
  ) {
  }

  ngOnInit() {
    this.loadPdfs();
    this.titleService.setTitle('View All PDFs');
    if (localStorage.getItem('listView') == "true") {
      this.listView = true;
    }
  }

  loadPdfs() {
    this.service.getAllPdfs(this.currentPage).subscribe(
      data => {
        this.pdfs = data
        this.totalPages = data.TotalCount;
        this.loaded = true;
      },
      error => {
        console.log("error loading network info", error);
      },
    );
  }

  toggleListView() {
    this.listView = true;
    localStorage.setItem('listView', 'true')
  }

  toggleGridView() {
    this.listView = false;
    localStorage.setItem('listView', 'false')
  }

  isListView(): boolean {
    return this.listView
  }

  onPageChange(event: PageEvent) {
    this.loaded = false;
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPdfs();
    window.scrollTo(0, 0);
  }

}
