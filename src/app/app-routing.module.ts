import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WebpagesComponent } from './webpages/webpages.component';
import { WebpageDetailComponent } from './webpage-detail/webpage-detail.component';
import { InitComponent } from './init/init.component';
import { ReportComponent } from './report/report.component';

const routes: Routes = [
  { path: '', redirectTo: '/webpages', pathMatch: 'full' },
  { path: 'webpages', component: WebpagesComponent },
  { path: 'detail/:id', component: WebpageDetailComponent },
  { path: 'webpages/sorted_registered_asc', component: WebpagesComponent },
  { path: 'webpages/sorted_registered_desc', component: WebpagesComponent },
  { path: 'webpages/sorted_evaluation_asc', component: WebpagesComponent },
  { path: 'webpages/sorted_evaluation_desc', component: WebpagesComponent },
  { path: 'webpage/:id/report', component: ReportComponent },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
