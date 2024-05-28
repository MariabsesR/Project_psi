import { Component, OnInit } from '@angular/core';

import { Webpage } from '../webpage';
import { WebpageService } from '../webpage.service';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { SelectionDialogComponent } from '../selection-dialog/selection-dialog.component';
import { ReportComponent } from '../report/report.component';
import { switchMap } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-webpages',
  templateUrl: './webpages.component.html',
  styleUrls: ['./webpages.component.css']
})
export class WebpagesComponent implements OnInit {
  urlControl: FormControl;
  webpages: Webpage[] = [];
  webpagesOg: Webpage[] = [];
  selectedStatus: string = ''; // Declare selectedStatus property

  constructor(private webpageService: WebpageService, private dialog: MatDialog, private router: Router, private cdr: ChangeDetectorRef) {
    this.urlControl = new FormControl('', [Validators.required, this.isValidUrlValidator]);
   }

   ngOnInit(): void {
    this.loadWebpages(); // Load webpages when the component initializes
  }

  loadWebpages(): void {
    this.webpageService.getWebpages().subscribe((webpages: Webpage[]) => {
      this.webpages = webpages;

      // Fetch pages for each website
      this.webpages.forEach(webpage => {
        this.getWebpagePages(webpage._id); // Fetch pages for each website
      });
    });
  }

  getWebpagePages(webpageId: string): void {
    this.webpageService.getWebpagePages(webpageId).subscribe((pages) => {
      const webpage = this.webpages.find(w => w._id === webpageId);
      if (webpage) {
        webpage.pages = pages; // Assign the pages to the corresponding website
      }
    });
  }

  getWebpages(): void {
    //this.webpageService.getWebpages()
    //.subscribe(webpages => this.webpages = webpages);
    //this.webpageService.getWebpages()
    //.subscribe(webpages => this.webpagesOg = webpages);
    this.webpageService.getWebpages()
    .subscribe(webpages => {
      this.webpages = webpages;
      //this.totalPages = this.webpages.length;
      //this.calculateMetrics();
    });
  }

  initiateEvaluation(webpageId: string): void {
    this.webpageService.initiateEvaluation(webpageId)
      .subscribe(response => {
        // Handle response if needed
        console.log('Evaluation initiated successfully');
      });
  }

  calculateMetrics(webpage: Webpage): void {
    webpage.totalPages = webpage.pages.length;
    webpage.pagesWithoutErrors = webpage.pages.filter(page => page.errorsA === 0 && page.errorsAA === 0 && page.errorsAAA === 0).length;
    webpage.pagesWithErrors = webpage.pages.length - webpage.pagesWithoutErrors;
    webpage.pagesWithAError = webpage.pages.filter(page => page.errorsA > 0).length;
    webpage.pagesWithAAError = webpage.pages.filter(page => page.errorsAA > 0).length;
    webpage.pagesWithAAAError = webpage.pages.filter(page => page.errorsAAA > 0).length;

    // Count occurrences of each error type across all pages of the webpage
    const errorsCount = new Map<string, number>();
    webpage.pages.forEach(page => {
        page.errorCodes.forEach(errorCode => {
            errorsCount.set(errorCode, (errorsCount.get(errorCode) || 0) + 1); // Increment count or initialize to 1
        });
    });

    // Sort errors by occurrence in descending order
    const sortedErrors = Array.from(errorsCount.entries()).sort((a, b) => b[1] - a[1]);

    // Get the top 10 errors
    const top10 = sortedErrors.slice(0, 10);
    webpage.top10Errors = new Map<string, number>(top10);
  }

  add(url: string): void {
    url = url.trim();
    if (!url) { return; }
    if (!this.isValidUrl(url)) {
      console.error('Invalid URL');
      return;
    }
    this.webpageService.addWebpage({ url } as Webpage)
      .subscribe(webpage => {
        this.webpages.push(webpage);
      });
  }

  deleteWebpage(webpageId: string): void {
    this.webpageService.deleteWebpage(webpageId)
      .subscribe(() => {
        this.webpages = this.webpages.filter(webpage => webpage._id !== webpageId);
        // Optionally, you can also delete associated pages from the webpage list
      });
  }

  deletePage(webpageId: string, pageId: string): void {
    this.webpageService.deletePage(webpageId, pageId)
      .subscribe(() => {
        // Filter out the deleted page from the webpage's pages array
        this.webpages.forEach(webpage => {
          webpage.pages = webpage.pages.filter(page => page._id !== pageId);
        });
      });
  }

  onSortByChange(sortBy: string): void {
    switch (sortBy) {
      case 'registryAsc':
        this.sortByRegisteredAsc();
        break;
      case 'registryDesc':
        this.sortByRegisteredDesc();
        break;
      case 'lastEvaluationAsc':
        this.sortByEvaluationAsc();
        break;
      case 'lastEvaluationDesc':
        this.sortByEvaluationDesc();
        break;
      default:
        break;
    }
  }

  // Method to get sorted webpages by last evaluation time in ascending order
  sortByEvaluationAsc(): void {
    this.webpageService.getWebpagesSortedByEvaluationAsc()
      .subscribe(webpages => this.webpages = webpages);
  }

  // Method to get sorted webpages by registration time in ascending order
  sortByRegisteredAsc(): void {
    this.webpageService.getWebpagesSortedByRegisteredAsc()
      .subscribe(webpages => this.webpages = webpages);
  }

  // Method to get sorted webpages by last evaluation time in descending order
  sortByEvaluationDesc(): void {
    this.webpageService.getWebpagesSortedByEvaluationDesc()
      .subscribe(webpages => this.webpages = webpages);
  }

  // Method to get sorted webpages by registration time in descending order
  sortByRegisteredDesc(): void {
    this.webpageService.getWebpagesSortedByRegisteredDesc()
      .subscribe(webpages => this.webpages = webpages);
  }


  filterByStatus(status: string): void {
    if (!status) {
      this.getWebpages(); // If no status is selected, fetch all webpages
      return;
    }

    // Filter the webpages array based on the selected status
    this.webpages = this.webpagesOg.filter(webpage => webpage.status === status);
  }

  // Function to validate the URL
  private isValidUrl(url: string): boolean {
    // Regular expression to match the protocol part of the URL
    const protocolRegex = /^(https?|ftp):\/\//;

    // Extract the protocol part from the URL
    const protocolMatch = url.match(protocolRegex);

    // Check if a valid protocol is found
    return !!protocolMatch;
  }

  isValidUrlValidator(control: FormControl): { [key: string]: any } | null {
    const protocolRegex = /^(https?|ftp):\/\//;
    const isValid = protocolRegex.test(control.value);

    if (!isValid) {
      return { invalidUrl: true };
    }

    return null; // Return null if valid
  }

  openDialog(webpageId: string): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '250px', // Adjust the width as needed
      data: { message: 'Are you sure you want to delete this webpage?' } // Optional data to pass to the dialog
    });

    // Handle what happens when the dialog is closed
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // User confirmed the action, you can call another method to delete the webpage
        console.log('User confirmed the action');
        this.deleteWebpage(webpageId);
      } else {
        // User cancelled the action
        console.log('User cancelled the action');
      }
    });
  }


  openSelectionDialog(webpage: Webpage): void {
    const dialogRef = this.dialog.open(SelectionDialogComponent, {
      data: { pages: webpage.pages } // Pass the list of pages to the dialog
    });

    dialogRef.afterClosed().subscribe((selectedPages: Webpage[]) => {
      if (selectedPages && selectedPages.length > 0) {
        // Start the evaluation with the selected pages
        this.startEvaluation(webpage, selectedPages.map(page => page._id));
      } else {
        console.warn('No pages selected for evaluation.');
      }
    });
  }

  // Start the evaluation for a given webpage with the selected pages
  startEvaluation(webpage: Webpage, selectedPageIds: string[]): void {
    // Set the initial status to "Em avaliação" when starting the evaluation
    webpage.status = 'Em avaliação';

    this.webpageService.evaluateWebpage(webpage._id, selectedPageIds)
      .pipe(
        catchError((error) => {
          console.error('Evaluation error:', error);
          webpage.status = 'Erro na avaliação'; // Set error status in case of failure
          return of(null); // Prevent the observable stream from breaking
        })
      )
      .subscribe(() => {
        // Determine the new status based on the current state of pages in the webpage
        const isAnyPageInEvaluation = webpage.pages.some(
          (page) => page.status === 'Em avaliação' || page.status === 'Por avaliar'
        );
        const isAnyPageErrored = webpage.pages.some(
          (page) => page.status === 'Erro na avaliação'
        );
        const areAllPagesEvaluated = webpage.pages.every(
          (page) => page.status === 'Conforme' || page.status === 'Não conforme'
        );

        if (isAnyPageErrored) {
          webpage.status = 'Erro na avaliação'; // Set the status to error if any page has an error
        } else if (areAllPagesEvaluated) {
          webpage.status = 'Avaliado'; // Set the status to "Avaliado" if all pages are evaluated
        } else if (isAnyPageInEvaluation) {
          webpage.status = 'Em avaliação'; // Keep the status as "Em avaliação" if any page is still being evaluated
        }

        // After setting the appropriate status, continue with additional logic
        this.calculateMetrics(webpage); // Calculate metrics based on the current state of the webpage
        //this.openReportView(webpage); // Open the report view for the webpage
        this.cdr.detectChanges();
      });
  }

  openReportView(webpage: any) {
    // Open the MatDialog with the ReportViewDialogComponent
    this.dialog.open(ReportComponent, {
      data: { webpage }, // Pass the webpage data to the dialog
    });
  }

  handleDeleteButtonClick(webpage: Webpage): void {
    if (!webpage) {
      console.error("Webpage not found.");
      return;
    }
    // If the webpage has pages, open the dialog for confirmation
    if (webpage.pages && webpage.pages.length > 0) {
      this.openDialog(webpage._id); // Implement this method to open a confirmation dialog
    } else {
      // Otherwise, delete the webpage directly
      this.deleteWebpage(webpage._id);
    }
  }
}
