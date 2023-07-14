import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PdfDetailsComponent } from './components/pdf-details/pdf-details.component';
import { PdfOverviewComponent } from './components/pdf-overview/pdf-overview.component';
import { PdfTagResultsComponent, ResultMode } from './components/pdf-tag-results/pdf-tag-results.component';
import { PdfUploadComponent } from './components/pdf-upload/pdf-upload.component';

const routes: Routes = [
  {path: "", component: PdfOverviewComponent},
  {path: "all", component: PdfOverviewComponent},
  {path: "upload", component: PdfUploadComponent},
  {path: "pdf/view/:id", component: PdfDetailsComponent},
  {path: "pdfs/tag/:tag", component: PdfTagResultsComponent, data: {mode: ResultMode.tag}},
  {path: "pdfs/author/:author", component: PdfTagResultsComponent, data: {mode: ResultMode.author}}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
