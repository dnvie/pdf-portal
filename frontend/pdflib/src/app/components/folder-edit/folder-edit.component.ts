import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { PdfService } from 'src/app/service/pdf.service';
import { EventService } from 'src/app/event-service.service';

export enum FolderMode {
  edit,
  create
};

@Component({
  selector: 'app-folder-edit',
  templateUrl: './folder-edit.component.html',
  styleUrls: ['./folder-edit.component.scss']
})
export class FolderEditComponent implements OnInit{

  oldName: string = ''
  newName: string = ''
  mode: FolderMode = FolderMode.edit;

  constructor(
    private service: PdfService,
    public route: ActivatedRoute,
    public router: Router,
    private titleService: Title,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.mode = data['mode'];      
    });
    console.log(this.mode);
    
    if (this.mode == 0) {
      this.route.params.subscribe(params => {
        this.oldName = params['folder'];
        this.newName = this.oldName;
      });
      this.titleService.setTitle("Editing folder: " + this.oldName);
    } else {
      this.titleService.setTitle("Creating new folder");
    }
    
  }

  updateFolder() {
    this.service.updateFolderName(this.oldName, this.newName).subscribe({
      next: res => {
        setTimeout(this.triggerUpdateMessage.bind(this), 1);
        setTimeout(this.triggerHideMessage.bind(this), 2000);
        this.router.navigate(['/folders'])
      },
      error: err => {
        if(err.status == 409) {
          setTimeout(this.triggerFolderExistsMessage.bind(this), 1);
          setTimeout(this.triggerHideMessage.bind(this), 2000);
        } else {
          setTimeout(this.triggerUpdateErrorMessage.bind(this), 1);
          setTimeout(this.triggerHideMessage.bind(this), 2000);
        }
      }
    });
  }

  deleteFolder() {
    if (confirm('Are you sure you want to delete this folder?')) {
      this.service.deleteFolder(this.oldName).subscribe({
        next: res => {
          setTimeout(this.triggerDeleteMessage.bind(this), 1);
          setTimeout(this.triggerHideMessage.bind(this), 2000);
          this.router.navigate(['/folders'])
        },
        error: err => {
          setTimeout(this.triggerDeleteErrorMessage.bind(this), 1);
          setTimeout(this.triggerHideMessage.bind(this), 2000);
          console.log(err);
        }
      });
    }
  }

  createFolder() {
    this.service.createFolder(this.newName).subscribe({
      next: res => {
        setTimeout(this.triggerFolderCreatedMessage.bind(this), 1);
        setTimeout(this.triggerHideMessage.bind(this), 2000);
        this.router.navigate(['/folders'])
      },
      error: err => {
        if(err.status == 409) {
          setTimeout(this.triggerFolderExistsMessage.bind(this), 1);
          setTimeout(this.triggerHideMessage.bind(this), 2000);
        } else {
          setTimeout(this.triggerUpdateErrorMessage.bind(this), 1);
          setTimeout(this.triggerHideMessage.bind(this), 2000);
        }
      }
    });
  }

  triggerUpdateMessage() {
    this.eventService.triggerUpdateEvent();
  }

  triggerDeleteMessage() {
    this.eventService.triggerDeleteEvent();
  }

  triggerUpdateErrorMessage() {
    this.eventService.triggerUpdateErrorEvent();
  }

  triggerDeleteErrorMessage() {
    this.eventService.triggerDeleteErrorEvent();
  }

  triggerFolderExistsMessage() {
    this.eventService.triggerFolderExistsEvent();
  }

  triggerFolderCreatedMessage() {
    this.eventService.triggerFolderCreatedEvent();
  }

  triggerHideMessage() {
    this.eventService.triggerHideMessageEvent();
  }
}
