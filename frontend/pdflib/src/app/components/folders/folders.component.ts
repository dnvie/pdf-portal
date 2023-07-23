import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { PdfService } from 'src/app/service/pdf.service';

@Component({
  selector: 'app-folders',
  templateUrl: './folders.component.html',
  styleUrls: ['./folders.component.scss']
})
export class FoldersComponent implements OnInit {

  folders: string[] = []
  loaded = false;

  constructor(private service: PdfService, private titleService: Title) { }

  ngOnInit(): void {
    this.titleService.setTitle("Folders");
    this.service.getFolders().subscribe(
      data => {
        this.folders = data
        this.loaded = true;
      },
      error => {
        console.log("error loading folders", error);
      },
    );
  }

}
