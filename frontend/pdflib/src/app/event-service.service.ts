import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private reduceEventSubject = new Subject<void>();
  private expandEventSubject = new Subject<void>();
  private expandClearEventSubject = new Subject<void>();
  private unclearEventSubject = new Subject<void>();

  reduceEvent$ = this.reduceEventSubject.asObservable();
  expandEvent$ = this.expandEventSubject.asObservable();
  expandClearEvent$ = this.expandClearEventSubject.asObservable();
  unclearEvent$ = this.reduceEventSubject.asObservable();

  triggerReduceEvent() {
    this.reduceEventSubject.next();
  }

  triggerExpandEvent() {
    this.expandEventSubject.next();
  }

  triggerExpandClearEvent() {
    this.expandClearEventSubject.next();
  }

  /*triggerUnclearEvent() {
    this.unclearEventSubject.next();
  }*/
}