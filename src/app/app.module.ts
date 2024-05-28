import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


import { AppComponent } from './app.component';
import { WebpagesComponent } from './webpages/webpages.component';
import { WebpageDetailComponent } from './webpage-detail/webpage-detail.component';
import { MessagesComponent } from './messages/messages.component';
import { InitComponent } from './init/init.component';

import { MatIconModule } from '@angular/material/icon'; // Import MatIconModule
import { MatDividerModule } from '@angular/material/divider'; // Import MatDividerModule
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatListModule} from '@angular/material/list';
import { ReactiveFormsModule } from '@angular/forms';
import {MatDialogModule} from '@angular/material/dialog';
import { DialogComponent } from './dialog/dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { SelectionDialogComponent } from './selection-dialog/selection-dialog.component';
import {MatRadioModule} from '@angular/material/radio';
import { ReportComponent } from './report/report.component';
import {MatAccordion, MatExpansionModule} from '@angular/material/expansion';
import { ReportPageComponent } from './report-page/report-page.component';

@NgModule({
  imports: [
      BrowserModule,
      FormsModule,
      AppRoutingModule,
      HttpClientModule,
      MatIconModule, // Add MatIconModule here
      MatDividerModule, // Add MatDividerModule here
      MatButtonModule,
      MatInputModule,
      MatFormFieldModule,
      MatSelectModule,
      BrowserAnimationsModule,
      MatListModule,
      CommonModule,
      RouterModule,
      ReactiveFormsModule,
      MatDialogModule,
      MatTooltipModule,
      MatCheckboxModule,
      MatRadioModule,
      MatExpansionModule,
    ],
  declarations: [
    AppComponent,
    WebpagesComponent,
    WebpageDetailComponent,
    MessagesComponent,
    InitComponent,
    DialogComponent,
    SelectionDialogComponent,
    ReportComponent,
    ReportPageComponent,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
