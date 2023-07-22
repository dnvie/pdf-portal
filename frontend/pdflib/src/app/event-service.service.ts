import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private reduceEventSubject = new Subject<void>();
  private expandEventSubject = new Subject<void>();
  private expandClearEventSubject = new Subject<void>();
  private showUpdateEventSubject = new Subject<void>();
  private showDeleteEventSubject = new Subject<void>();
  private showUpdateErrorEventSubject = new Subject<void>();
  private showDeleteErrorEventSubject = new Subject<void>();
  private showFolderExistsEventSubject = new Subject<void>();
  private showFolderCreatedEventSubject = new Subject<void>();
  private hideMessageEventSubject = new Subject<void>();

  reduceEvent$ = this.reduceEventSubject.asObservable();
  expandEvent$ = this.expandEventSubject.asObservable();
  expandClearEvent$ = this.expandClearEventSubject.asObservable();
  showUpdateEvent$ = this.showUpdateEventSubject.asObservable();
  showDeleteEvent$ = this.showDeleteEventSubject.asObservable();
  showUpdateErrorEvent$ = this.showUpdateErrorEventSubject.asObservable();
  showDeleteErrorEvent$ = this.showDeleteErrorEventSubject.asObservable();
  showFolderExistsEvent$ = this.showFolderExistsEventSubject.asObservable();
  showFolderCreatedEvent$ = this.showFolderCreatedEventSubject.asObservable();
  hideMessageEvent$ = this.hideMessageEventSubject.asObservable();

  triggerReduceEvent() {
    this.reduceEventSubject.next();
  }

  triggerExpandEvent() {
    this.expandEventSubject.next();
  }

  triggerExpandClearEvent() {
    this.expandClearEventSubject.next();
  }

  triggerUpdateEvent() {
    this.showUpdateEventSubject.next();
  }

  triggerDeleteEvent() {
    this.showDeleteEventSubject.next();
  }

  triggerUpdateErrorEvent() {
    this.showUpdateErrorEventSubject.next();
  }

  triggerDeleteErrorEvent() {
    this.showDeleteErrorEventSubject.next();
  }

  triggerFolderExistsEvent() {
    this.showFolderExistsEventSubject.next();
  }

  triggerFolderCreatedEvent() {
    this.showFolderCreatedEventSubject.next();
  }

  triggerHideMessageEvent() {
    this.hideMessageEventSubject.next();
  }
}