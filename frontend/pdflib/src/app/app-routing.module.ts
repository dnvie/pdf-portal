import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PdfDetailsComponent } from './components/pdf-details/pdf-details.component';
import { PdfOverviewComponent } from './components/pdf-overview/pdf-overview.component';
import { PdfSearchResultsComponent, ResultMode } from './components/pdf-search-results/pdf-search-results.component';
import { PdfUploadComponent } from './components/pdf-upload/pdf-upload.component';

const routes: Routes = [
  {path: "", component: PdfOverviewComponent},
  {path: "all", component: PdfOverviewComponent},
  {path: "upload", component: PdfUploadComponent},
  {path: "pdf/view/:id", component: PdfDetailsComponent},
  {path: "pdfs/tag/:tag", component: PdfSearchResultsComponent, data: {mode: ResultMode.tag}},
  {path: "pdfs/author/:author", component: PdfSearchResultsComponent, data: {mode: ResultMode.author}},
  {path: "pdfs/search/:search", component: PdfSearchResultsComponent, data: {mode: ResultMode.search}}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
