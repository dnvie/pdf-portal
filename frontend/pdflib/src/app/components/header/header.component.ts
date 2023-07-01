import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { EventService } from 'src/app/event-service.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  cleared = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService
  ) {
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.removeActive();
        if (this.router.url === '/upload') {
          this.setActiveNav(3);
        } else if (this.router.url === '/search') {
          this.setActiveNav(2);
        } else if (this.router.url === '/profile') {
          this.setActiveNav(4);
        } else if (this.router.url === '/all') {
          this.setActiveNav(1);
        } else {
          this.setActiveNav(0);
        }
      }
    });
  }

  previousScrollPosition = 0;

  /*@HostListener('window:scroll', ['$event'])
  onScroll(event: Event) {
    const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if ((currentScrollPosition > this.previousScrollPosition) && (currentScrollPosition > 70)) {
      this.onScrollDown();
    } else {
      this.onScrollUp();
    }
    this.previousScrollPosition = currentScrollPosition;
  }*/

  onScrollDown() {
    this.hideNav();
  }

  onScrollUp() {
    this.showNav();
  }

  hideNav() {
    const navItems = document.getElementsByClassName('navItem')
    for (let i = 0; i < navItems.length; i++) {
      setTimeout(function(){navItems[i].classList.add('navItemHidden');}, i*40)
    }
    //setTimeout(function(){document.getElementById('header')?.classList.add('headerHidden');}, 0)
  }

  showNav() {
    const navItems = document.getElementsByClassName('navItem')
    for (let i = 0; i < navItems.length; i++) {
      setTimeout(function(){navItems[i].classList.remove('navItemHidden');}, i*40)
    }
    //setTimeout(function(){document.getElementById('header')?.classList.remove('headerHidden');}, 0)
  }

  setActiveNav(id: number) {
    const navItems = document.getElementsByClassName('navItem')
    this.removeActive();
    navItems[id].classList.add('navItemSelected');
  }

  removeActive() {
    const navItems = document.getElementsByClassName('navItem')
    for (let i = 0; i < navItems.length; i++) {
      navItems[i].classList.remove('navItemSelected');
    }
  }

  clear() {
    document.getElementsByClassName('nav')[0].classList.add('hidden');
    this.cleared = true;
  }

  unclear() {
    document.getElementsByClassName('nav')[0].classList.remove('hidden');
    this.cleared = false;
  }

  ngOnInit() {
    this.eventService.clearEvent$.subscribe(() => {
      this.clear();
    });
    this.eventService.unclearEvent$.subscribe(() => {
      this.unclear();
    });
  }

}
