import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { PDFPreviews } from 'src/app/data/pdfpreview';
import { PdfService } from 'src/app/service/pdf.service';
import { PageEvent } from '@angular/material/paginator';

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
        setTimeout(this.revealItems, 1);
        setTimeout(this.revealCards, 1);
      },
      error => {
        console.log("error loading network info", error);
      },
    );
  }

  toggleListView() {
    this.listView = true;
    localStorage.setItem('listView', 'true')
    setTimeout(this.revealItems, 1);
  }

  toggleGridView() {
    this.listView = false;
    localStorage.setItem('listView', 'false')
    setTimeout(this.revealCards, 1);
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

  revealItems() {
    setTimeout(function () { document.getElementsByClassName('noContent')[0]?.classList.remove('unrevealed'); }, 1);
    const items = document.getElementsByClassName('itemContainer');

    for (let i = 0; i < items.length; i++) {
        setTimeout(function () {
            items[i]?.classList.remove('unrevealed');
        }, i * 10);
    }
  }

  revealCards() {
    setTimeout(function () { document.getElementsByClassName('noContent')[0]?.classList.remove('unrevealed'); }, 1);
    const cards = document.getElementsByClassName('card');  

    for (let i = 0; i < cards.length; i++) {
        setTimeout(function () {
            cards[i]?.classList.remove('unrevealed');
        }, i * 10);
    }
  }

}
