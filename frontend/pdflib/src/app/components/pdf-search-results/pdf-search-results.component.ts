import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { PDFPreviews } from 'src/app/data/pdfpreview';
import { PdfService } from 'src/app/service/pdf.service';

export enum ResultMode {
  tag,
  author,
  search,
  folder
};

@Component({
  selector: 'app-pdf-search-results',
  templateUrl: './pdf-search-results.component.html',
  styleUrls: ['./pdf-search-results.component.scss']
})
export class PdfSearchResultsComponent implements OnInit {

  mode: ResultMode = ResultMode.author;
  loaded = false
  skeletons: any[] = Array(24).fill({});
  currentPage = 0;
  totalPages = 0;
  pageSize = 48;
  listView = false
  tag = ''
  author = ''
  search = ''
  folder = ''
  pdfs: PDFPreviews = {
    Previews: undefined,
    TotalCount: 0
  }

  constructor(
    public route: ActivatedRoute,
    private titleService: Title,
    private service: PdfService,
  ) {
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    if (localStorage.getItem('listView') == "true") {
      this.listView = true;
    }
    this.route.data.subscribe(data => {
      this.mode = data['mode'];
    });

    this.route.params.subscribe(params => {
      if (this.mode == 0) {
        this.tag = params['tag'];
        this.titleService.setTitle('Tag: ' + this.tag)
        this.loadPdfsByAuthorOrTag(this.tag)
      } else if (this.mode == 1) {
        this.author = params['author'];
        this.titleService.setTitle('Author: ' + this.author)
        this.loadPdfsByAuthorOrTag(this.author)
      } else if (this.mode == 2) {
        this.route.queryParamMap.subscribe(queryParams => {
          let title = queryParams.get('title');
          let author = queryParams.get('author');
          let tag = queryParams.get('tag');
          if (title || author || tag) {
            if (title == null) title = '';
            if (author == null) author = '';
            if (tag == null) tag = '';
            this.titleService.setTitle('Search');
            this.loadPdfs(title, author, tag);
          }
        });
      } else {
        this.folder = params['folder'];
        this.titleService.setTitle('Folder: ' + this.folder)
        this.loadPdfsInFolder(this.folder)
      }
    });
  }

  loadPdfsByAuthorOrTag(query: string) {
    if (this.mode == 0) {
      this.service.getAllPdfsByTag(this.currentPage, query).subscribe({
        next: res => {
          this.pdfs = res
          this.totalPages = res.TotalCount;
          this.loaded = true;
          setTimeout(this.revealItems, 1);
          setTimeout(this.revealCards, 1);
        },
        error: err => {
          console.log(err);
        }
      });
    } else if (this.mode == 1) {
      this.service.getAllPdfsByAuthor(this.currentPage, query).subscribe({
        next: res => {
          this.pdfs = res
          this.totalPages = res.TotalCount;
          this.loaded = true;
          setTimeout(this.revealItems, 1);
          setTimeout(this.revealCards, 1);
        },
        error: err => {
          console.log(err);
        }
      });
    }
  }

  loadPdfs(title: string, author: string, tag: string) {
    this.service.getAllPdfsBySearch(this.currentPage, title, author, tag).subscribe({
      next: res => {
        this.pdfs = res
        this.totalPages = res.TotalCount;
        this.loaded = true;
        setTimeout(this.revealItems, 1);
        setTimeout(this.revealCards, 1);
      },
      error: err => {
        console.log(err);
      }
    });
  }

  loadPdfsInFolder(folder: string) {
    this.service.getAllPdfsInFolder(this.currentPage, folder).subscribe({
      next: res => {
        this.pdfs = res
        this.totalPages = res.TotalCount;
        this.loaded = true;
        setTimeout(this.revealItems, 1);
        setTimeout(this.revealCards, 1);
      },
      error: err => {
        console.log(err);
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.loaded = false;
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    if (this.mode == 0) {
      this.loadPdfsByAuthorOrTag(this.tag);
    } else if (this.mode == 1) {
      this.loadPdfsByAuthorOrTag(this.author);
    } else if (this.mode == 2) {
      this.route.queryParamMap.subscribe(queryParams => {
        let title = queryParams.get('title');
        let author = queryParams.get('author');
        let tag = queryParams.get('tag');
        if (title || author || tag) {
          if (title == null) title = '';
          if (author == null) author = '';
          if (tag == null) tag = '';
          this.titleService.setTitle('Search');
          this.loadPdfs(title, author, tag);
        }
      });
    } else {
      this.loadPdfsInFolder(this.folder)
    }
    window.scrollTo(0, 0);
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
    const noContent = document.getElementsByClassName('noContent');

    for (let i = 0; i < noContent.length; i++) {
        setTimeout(function () {
          noContent[i]?.classList.remove('unrevealed');
        }, 80);
    }
    const cards = document.getElementsByClassName('card');

    for (let i = 0; i < cards.length; i++) {
        setTimeout(function () {
            cards[i]?.classList.remove('unrevealed');
        }, i * 10);
    }
  }
}
