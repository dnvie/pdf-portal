import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HomeData } from 'src/app/data/pdfpreview';
import { PdfService } from 'src/app/service/pdf.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit{

  home: HomeData = {
    RecentlyUploaded: undefined,
    RecentlyViewed: undefined,
    Folders: undefined
  };

  constructor(private service: PdfService, private titleService: Title) {}
  
  ngOnInit(): void {
    this.service.getHomeData().subscribe({
      next: res => {
        this.home = res;
        this.titleService.setTitle('PDF Portal - Home');
      },
      error: err => {
        console.log(err);
      }
    });
  }

}
