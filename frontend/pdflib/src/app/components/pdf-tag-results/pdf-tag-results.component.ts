import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { PDFPreviews } from 'src/app/data/pdfpreview';
import { PdfService } from 'src/app/service/pdf.service';

export enum ResultMode {
  tag,
  author
};


@Component({
  selector: 'app-pdf-tag-results',
  templateUrl: './pdf-tag-results.component.html',
  styleUrls: ['./pdf-tag-results.component.scss']
})
export class PdfTagResultsComponent implements OnInit{

  mode: ResultMode = ResultMode.author;
  currentPage = 0;
  totalPages = 0;
  pageSize = 48;
  listView = false
  tag = ''
  author = ''
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
      console.log(this.mode);
      
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
    }
    window.scrollTo(0, 0);
  }

}
