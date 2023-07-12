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

@NgModule({
  declarations: [
    AppComponent,
    PdfOverviewComponent,
    HeaderComponent,
    PdfUploadComponent,
    PdfDetailsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
