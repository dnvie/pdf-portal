import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PdfOverviewComponent } from './components/pdf-overview/pdf-overview.component';
import { PdfUploadComponent } from './components/pdf-upload/pdf-upload.component';

const routes: Routes = [
  {path: "", component: PdfOverviewComponent},
  {path: "all", component: PdfOverviewComponent},
  {path: "upload", component: PdfUploadComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
