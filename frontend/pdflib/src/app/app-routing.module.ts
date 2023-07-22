import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FolderEditComponent, FolderMode } from './components/folder-edit/folder-edit.component';
import { FoldersComponent } from './components/folders/folders.component';
import { HomeComponent } from './components/home/home.component';
import { PdfDetailsComponent } from './components/pdf-details/pdf-details.component';
import { PdfEditComponent } from './components/pdf-edit/pdf-edit.component';
import { PdfOverviewComponent } from './components/pdf-overview/pdf-overview.component';
import { PdfSearchResultsComponent, ResultMode } from './components/pdf-search-results/pdf-search-results.component';
import { PdfUploadComponent } from './components/pdf-upload/pdf-upload.component';

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "all", component: PdfOverviewComponent },
  { path: "upload", component: PdfUploadComponent },
  { path: "pdf/view/:id", component: PdfDetailsComponent },
  { path: "pdfs/tag/:tag", component: PdfSearchResultsComponent, data: { mode: ResultMode.tag } },
  { path: "pdfs/author/:author", component: PdfSearchResultsComponent, data: { mode: ResultMode.author } },
  { path: "pdfs/search", component: PdfSearchResultsComponent, data: { mode: ResultMode.search } },
  { path: "pdf/edit/:id", component: PdfEditComponent },
  { path: "folders", component: FoldersComponent },
  { path: "folders/:folder", component: PdfSearchResultsComponent, data: { mode: ResultMode.folder } },
  { path: "folders/edit/:folder", component: FolderEditComponent, data: { mode: FolderMode.edit } },
  { path: "folder/create", component: FolderEditComponent, data: { mode: FolderMode.create } },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
