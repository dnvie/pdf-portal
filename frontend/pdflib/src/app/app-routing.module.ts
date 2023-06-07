import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PdfOverviewComponent } from './components/pdf-overview/pdf-overview.component';

const routes: Routes = [
  {path: "", component: PdfOverviewComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
