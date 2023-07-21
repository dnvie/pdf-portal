import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PdfOverviewComponent } from './components/pdf-overview/pdf-overview.component';
import { HeaderComponent } from './components/header/header.component';
import { PdfUploadComponent } from './components/pdf-upload/pdf-upload.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { PdfDetailsComponent } from './components/pdf-details/pdf-details.component';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatPaginatorModule} from '@angular/material/paginator';
import { PdfSearchResultsComponent } from './components/pdf-search-results/pdf-search-results.component';
import { PdfEditComponent } from './components/pdf-edit/pdf-edit.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FoldersComponent } from './components/folders/folders.component';
import { FolderEditComponent } from './components/folder-edit/folder-edit.component';
import { HomeComponent } from './components/home/home.component';
import { DropzoneDirective } from 'src/app/directives/dropzone.directive';


@NgModule({
  declarations: [
    AppComponent,
    PdfOverviewComponent,
    HeaderComponent,
    PdfUploadComponent,
    PdfDetailsComponent,
    PdfSearchResultsComponent,
    PdfEditComponent,
    FoldersComponent,
    FolderEditComponent,
    HomeComponent,
    DropzoneDirective
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule,
    FormsModule,
    MatIconModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
