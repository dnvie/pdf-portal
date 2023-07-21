import { Component, OnInit } from '@angular/core';
import { PdfService } from 'src/app/service/pdf.service';

@Component({
  selector: 'app-folders',
  templateUrl: './folders.component.html',
  styleUrls: ['./folders.component.scss']
})
export class FoldersComponent implements OnInit {

  folders: string[] = []

  constructor(private service: PdfService) {}

  ngOnInit(): void {
    this.service.getFolders().subscribe(
      data => {
        this.folders = data
      },
      error => {
        console.log("error loading folders", error);
      },
    );
  }

}
