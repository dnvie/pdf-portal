import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { PDFPreviews } from 'src/app/data/pdfpreview';
import { PdfService } from 'src/app/service/pdf.service';

@Component({
  selector: 'app-pdf-tag-results',
  templateUrl: './pdf-tag-results.component.html',
  styleUrls: ['./pdf-tag-results.component.scss']
})
export class PdfTagResultsComponent implements OnInit{

  currentPage = 0;
  totalPages = 0;
  pageSize = 48;
  listView = false
  tag = ''
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
    this.route.params.subscribe(params => {
      this.tag = params['tag'];
      this.titleService.setTitle('Tag: ' + this.tag)
      this.loadPdfs(this.tag)
    });
  }

  loadPdfs(tag: string) {
    this.service.getAllPdfsByTag(this.currentPage, tag).subscribe({
      next: res => {
        this.pdfs = res
        this.totalPages = res.TotalCount;
      },
      error: err => {
        console.log(err);
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    //this.loaded = false;
    this.loadPdfs(this.tag);
    window.scrollTo(0, 0);
  }

}
