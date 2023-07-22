import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { EventService } from 'src/app/event-service.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  cleared = false;
  reduced = false;

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('searchInput2') searchInput2!: ElementRef<HTMLInputElement>;
  @ViewChild('searchInput3') searchInput3!: ElementRef<HTMLInputElement>;
  @ViewChild('searchInput4') searchInput4!: ElementRef<HTMLInputElement>;
  @ViewChild('searchInput5') searchInput5!: ElementRef<HTMLInputElement>;
  @ViewChild('searchInput6') searchInput6!: ElementRef<HTMLInputElement>;

  constructor(
    private router: Router,
    private eventService: EventService
  ) {
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.removeActive();
        if (this.router.url === '/upload') {
          this.setActiveNav(3);
        } else if (this.router.url.startsWith('/pdfs/')) {
          this.setActiveNav(2);
        } else if (this.router.url.startsWith('/folders')) {
          this.setActiveNav(4);
        } else if (this.router.url === '/all') {
          this.setActiveNav(1);
        } else if (this.router.url === '/') {
          this.setActiveNav(0);
        }
      }
    });
  }

  setActiveNav(id: number) {
    const navItems = document.getElementsByClassName('navItem')
    const navItemsSmall = document.getElementsByClassName('navItemSmall')
    this.removeActive();
    navItems[id].classList.add('navItemSelected');
    navItemsSmall[id].classList.add('navItemSelected');
  }

  removeActive() {
    const navItems = document.getElementsByClassName('navItem')
    const navItemsSmall = document.getElementsByClassName('navItemSmall')
    for (let i = 0; i < navItems.length; i++) {
      navItems[i].classList.remove('navItemSelected');
      navItemsSmall[i].classList.remove('navItemSelected');
    }
  }

  clear() {
    document.getElementsByClassName('nav')[0].classList.add('hidden');
    document.getElementsByClassName('nav')[1].classList.add('hidden');
    this.cleared = true;
  }

  unclear() {
    document.getElementsByClassName('nav')[0].classList.remove('hidden');
    document.getElementsByClassName('nav')[1].classList.remove('hidden');
    this.cleared = false;
  }

  reduce() {
    setTimeout(this.clear, 1);
    setTimeout(function () { document.getElementById('header')?.classList.add('headerCompact'); }, 200)
    setTimeout(function () { document.getElementById('smallHeader')?.classList.add('headerCompact'); }, 200)
    this.cleared = true;
    this.reduced = true;
  }

  expand() {
    setTimeout(function () { document.getElementById('header')?.classList.remove('headerCompact'); }, 1)
    setTimeout(function () { document.getElementById('smallHeader')?.classList.remove('headerCompact'); }, 1)
    setTimeout(this.unclear, 200)
    this.cleared = false;
    this.reduced = false;
  }

  expandClear() {
    setTimeout(function () { document.getElementById('header')?.classList.remove('headerCompact'); }, 1)
    setTimeout(function () { document.getElementById('smallHeader')?.classList.remove('headerCompact'); }, 1)
    this.reduced = false;
    setTimeout(this.unclear, 2300)
    this.cleared = false;
  }

  addSearch() {
    this.clearSearchBars();
    setTimeout(this.clear, 1);
    setTimeout(function () { document.getElementById('search')?.classList.add('active'); }, 250);
    setTimeout(function () { document.getElementById('closeSearch')?.classList.add('active'); }, 300);
  }

  removeSearch() {
    setTimeout(function () { document.getElementById('search')?.classList.remove('active'); }, 1);
    setTimeout(function () { document.getElementById('closeSearch')?.classList.remove('active'); }, 50);
    setTimeout(this.unclear, 250);
  }

  clearSearchBars() {
    this.searchInput.nativeElement.value = '';
    this.searchInput2.nativeElement.value = '';
    this.searchInput3.nativeElement.value = '';
    this.searchInput4.nativeElement.value = '';
    this.searchInput5.nativeElement.value = '';
    this.searchInput6.nativeElement.value = '';
  }

  addSmallSearch() {
    this.clearSearchBars();
    setTimeout(function () { document.getElementById('smallSearch')?.classList.add('active'); }, 1);
  }

  closeSmallSearch() {
    setTimeout(function () { document.getElementById('smallSearch')?.classList.remove('active'); }, 1);
  }

  addMessage() {
    setTimeout(function () { document.getElementById('messageContainer')?.classList.add('active'); }, 1);
  }

  removeMessage() {
    setTimeout(function () { document.getElementById('messageContainer')?.classList.remove('active'); }, 1);
  }

  showMessageUpdate() {
    document.getElementById('messageContainer')!.innerHTML = `<span class="material-symbols-rounded">check_circle</span> Successfully updated`;
    document.getElementById('messageContainer')!.style.color = "#2de358";
    setTimeout(this.clear, 1);
    setTimeout(this.addMessage, 250);
  }

  showMessageDelete() {
    document.getElementById('messageContainer')!.innerHTML = `<span class="material-symbols-rounded">delete</span> Successfully deleted`;
    document.getElementById('messageContainer')!.style.color = "#2de358";
    setTimeout(this.clear, 1);
    setTimeout(this.addMessage, 250);
  }

  showErrorUpdate() {
    document.getElementById('messageContainer')!.innerHTML = `<span class="material-symbols-rounded">error</span> Update failed`;
    document.getElementById('messageContainer')!.style.color = "#db1432";
    setTimeout(this.clear, 1);
    setTimeout(this.addMessage, 250);
  }

  showErrorDelete() {
    document.getElementById('messageContainer')!.innerHTML = `<span class="material-symbols-rounded">error</span> Deletion failed`;
    document.getElementById('messageContainer')!.style.color = "#db1432";
    setTimeout(this.clear, 1);
    setTimeout(this.addMessage, 250);
  }

  showFolderExists() {
    document.getElementById('messageContainer')!.innerHTML = `<span class="material-symbols-rounded">error</span> Folder already exists`;
    document.getElementById('messageContainer')!.style.color = "#db1432";
    setTimeout(this.clear, 1);
    setTimeout(this.addMessage, 250);
  }

  showFolderCreated() {
    document.getElementById('messageContainer')!.innerHTML = `<span class="material-symbols-rounded">check_circle</span> Folder created`;
    document.getElementById('messageContainer')!.style.color = "#2de358";
    setTimeout(this.clear, 1);
    setTimeout(this.addMessage, 250);
  }

  hideMessage() {
    setTimeout(this.removeMessage, 1);
    setTimeout(this.unclear, 250);
  }

  search(event: KeyboardEvent, searchValueTitle: string, searchValueAuthor: string, searchValueTag: string) {
    if (event.keyCode === 13 || event.key === 'Enter' || event.code === 'Enter') {
      if (searchValueTitle.length != 0 || searchValueAuthor.length != 0 || searchValueTag.length != 0) {
        const queryParams: any = {};
        if (searchValueTitle.length !== 0) {
          queryParams.title = searchValueTitle;
        }
        if (searchValueAuthor.length !== 0) {
          queryParams.author = searchValueAuthor;
        }
        if (searchValueTag.length !== 0) {
          queryParams.tag = searchValueTag;
        }
        this.router.navigate(['/pdfs/search'], { queryParams });
      }
    }
  }

  searchByButton(searchValueTitle: string, searchValueAuthor: string, searchValueTag: string) {
    if (searchValueTitle.length != 0 || searchValueAuthor.length != 0 || searchValueTag.length != 0) {
      const queryParams: any = {};
      if (searchValueTitle.length !== 0) {
        queryParams.title = searchValueTitle;
      }
      if (searchValueAuthor.length !== 0) {
        queryParams.author = searchValueAuthor;
      }
      if (searchValueTag.length !== 0) {
        queryParams.tag = searchValueTag;
      }
      this.router.navigate(['/pdfs/search'], { queryParams });
      this.closeSmallSearch();
    }
  }

  ngOnInit() {
    this.eventService.reduceEvent$.subscribe(() => {
      this.reduce();
    });
    this.eventService.expandEvent$.subscribe(() => {
      this.expand();
    });
    this.eventService.expandClearEvent$.subscribe(() => {
      this.expandClear();
    });
    this.eventService.showUpdateEvent$.subscribe(() => {
      this.showMessageUpdate();
    });
    this.eventService.showDeleteEvent$.subscribe(() => {
      this.showMessageDelete();
    });
    this.eventService.showUpdateErrorEvent$.subscribe(() => {
      this.showErrorUpdate();
    });
    this.eventService.showDeleteErrorEvent$.subscribe(() => {
      this.showErrorDelete();
    });
    this.eventService.showFolderExistsEvent$.subscribe(() => {
      this.showFolderExists();
    });
    this.eventService.showFolderCreatedEvent$.subscribe(() => {
      this.showFolderCreated();
    });
    this.eventService.hideMessageEvent$.subscribe(() => {
      this.hideMessage();
    });
  }
}
