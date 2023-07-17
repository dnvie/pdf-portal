import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { PDFPreviews } from 'src/app/data/pdfpreview';
import { PdfService } from 'src/app/service/pdf.service';

export enum ResultMode {
  tag,
  author,
  search
};


@Component({
  selector: 'app-pdf-search-results',
  templateUrl: './pdf-search-results.component.html',
  styleUrls: ['./pdf-search-results.component.scss']
})
export class PdfSearchResultsComponent implements OnInit{

  mode: ResultMode = ResultMode.author;
  currentPage = 0;
  totalPages = 0;
  pageSize = 48;
  listView = false
  tag = ''
  author = ''
  search = ''
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
    this.route.data.subscribe(data => {
      this.mode = data['mode'];      
    });

    this.route.params.subscribe(params => {
      if (this.mode == 0) {
        this.tag = params['tag'];
        this.titleService.setTitle('Tag: ' + this.tag)
        this.loadPdfs(this.tag)
      } else if (this.mode == 1) {
        this.author = params['author'];
        this.titleService.setTitle('Author: ' + this.author)
        this.loadPdfs(this.author)
      } else {
        this.search = params['search'];
        this.titleService.setTitle('Search: ' + this.search)
        this.loadPdfs(this.search)
      }
      
    });
  }

  loadPdfs(query: string) {
    if (this.mode == 0) {
      this.service.getAllPdfsByTag(this.currentPage, query).subscribe({
        next: res => {
          this.pdfs = res
          this.totalPages = res.TotalCount;
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
        },
        error: err => {
          console.log(err);
        }
      });
    } else {
      this.service.getAllPdfsBySearch(this.currentPage, query).subscribe({
        next: res => {
          this.pdfs = res
          this.totalPages = res.TotalCount;
        },
        error: err => {
          console.log(err);
        }
      });
    }
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    //this.loaded = false;
    if (this.mode == 0) {
      this.loadPdfs(this.tag);
    } else if (this.mode == 1) {
      this.loadPdfs(this.author);
    } else {
      this.loadPdfs(this.search);
    }
    window.scrollTo(0, 0);
  }

}
