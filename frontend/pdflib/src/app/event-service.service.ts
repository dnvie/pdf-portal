import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private clearEventSubject = new Subject<void>();

  clearEvent$ = this.clearEventSubject.asObservable();
  unclearEvent$ = this.clearEventSubject.asObservable();

  triggerClearEvent() {
    this.clearEventSubject.next();
  }

  triggerUnclearEvent() {
    this.clearEventSubject.next();
  }
}