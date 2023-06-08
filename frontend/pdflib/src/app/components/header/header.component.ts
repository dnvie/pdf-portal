import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  constructor() {}

  previousScrollPosition = 0;

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event) {
    const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if ((currentScrollPosition > this.previousScrollPosition) && (currentScrollPosition > 70)) {
      this.onScrollDown();
    } else {
      this.onScrollUp();
    }
    this.previousScrollPosition = currentScrollPosition;
  }

  onScrollDown() {
    this.hideNav();
  }

  onScrollUp() {
    this.showNav();
  }

  hideNav() {
    const navItems = document.getElementsByClassName('navItem')
    for (let i = 0; i < navItems.length; i++) {
      navItems[i].classList.remove('navItemHidden');
    }
    setTimeout(function(){document.getElementById('header')?.classList.add('headerHidden');}, 0)
  }

  showNav() {
    const navItems = document.getElementsByClassName('navItem')
    for (let i = 0; i < navItems.length; i++) {
      navItems[i].classList.remove('navItemHidden');
    }
    setTimeout(function(){document.getElementById('header')?.classList.remove('headerHidden');}, 0)
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

}
