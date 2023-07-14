import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PdfDetailsComponent } from './components/pdf-details/pdf-details.component';
import { PdfOverviewComponent } from './components/pdf-overview/pdf-overview.component';
import { PdfTagResultsComponent } from './components/pdf-tag-results/pdf-tag-results.component';
import { PdfUploadComponent } from './components/pdf-upload/pdf-upload.component';

const routes: Routes = [
  {path: "", component: PdfOverviewComponent},
  {path: "all", component: PdfOverviewComponent},
  {path: "upload", component: PdfUploadComponent},
  {path: "pdf/view/:id", component: PdfDetailsComponent},
  {path: "pdfs/tag/:tag", component: PdfTagResultsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
