import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HomeData } from 'src/app/data/pdfpreview';
import { PdfService } from 'src/app/service/pdf.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  home: HomeData = {
    RecentlyUploaded: undefined,
    RecentlyViewed: undefined,
    Folders: undefined
  };
  loaded = false

  constructor(private service: PdfService, private titleService: Title) { }

  ngOnInit(): void {
    this.service.getHomeData().subscribe({
      next: res => {
        this.home = res;
        this.titleService.setTitle('PDF Portal - Home');
        this.loaded = true;
        this.revealPage();
      },
      error: err => {
        console.log(err);
      }
    });
  }

  revealPage() {
    setTimeout(this.revealFolders, 1);
    setTimeout(this.revealRecentlyViewed, 50);
    setTimeout(this.revealRecentlyUploaded, 150)
  }

  revealFolders() {
    setTimeout(function () { document.getElementById('noContent1')?.classList.remove('unrevealed'); }, 100);
    setTimeout(function () { document.getElementsByClassName('heading')[0]?.classList.remove('unrevealed'); }, 1);
    setTimeout(function () { document.getElementsByClassName('folderContainer')[0]?.classList.remove('unrevealed'); }, 20);

    const itemContainers = document.getElementsByClassName('itemContainer');
    let totalDelay = 20;

    for (let i = 0; i < itemContainers.length; i++) {
        setTimeout(function () {
            itemContainers[i]?.classList.remove('unrevealed');
        }, totalDelay + i * 20);
    }

    const viewAllButtonDelay = totalDelay + itemContainers.length * 20;
    setTimeout(function () { document.getElementsByClassName('viewAllButton')[0]?.classList.remove('unrevealed'); }, viewAllButtonDelay);
  }

  revealRecentlyViewed() {
    setTimeout(function () { document.getElementById('noContent2')?.classList.remove('unrevealed'); }, 150);
    setTimeout(function () { document.getElementsByClassName('heading')[1]?.classList.remove('unrevealed'); }, 1);
    setTimeout(function () { document.getElementById('recentlyViewedContainer')?.classList.remove('unrevealed'); }, 20);

    const cards = document.getElementsByClassName('cardRV');
    let totalDelay = 20;

    for (let i = 0; i < cards.length; i++) {
        setTimeout(function () {
            cards[i]?.classList.remove('unrevealed');
        }, totalDelay + i * 15);
    }
  }

  revealRecentlyUploaded() {
    setTimeout(function () { document.getElementById('noContent3')?.classList.remove('unrevealed'); }, 200);
    setTimeout(function () { document.getElementsByClassName('heading')[2]?.classList.remove('unrevealed'); }, 1);
    setTimeout(function () { document.getElementById('recentlyUploadedContainer')?.classList.remove('unrevealed'); }, 20);

    const cards2 = document.getElementsByClassName('cardRU');
    let totalDelay = 20;

    for (let i = 0; i < cards2.length; i++) {
        setTimeout(function () {
            cards2[i]?.classList.remove('unrevealed');
        }, totalDelay + i * 15);
    }
  }
}
