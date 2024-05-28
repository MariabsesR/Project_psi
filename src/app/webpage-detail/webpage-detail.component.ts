import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Webpage } from '../webpage';
import { WebpageService } from '../webpage.service';
import { Location } from '@angular/common';
import { FormControl, Validators, ValidationErrors } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { ReportComponent } from '../report/report.component';
import { Router } from '@angular/router';
import { ReportPageComponent } from '../report-page/report-page.component';
import { Page } from '../page';

@Component({
  selector: 'app-webpage-detail',
  templateUrl: './webpage-detail.component.html',
  styleUrls: ['./webpage-detail.component.css']
})
export class WebpageDetailComponent implements OnInit {
  urlControl: FormControl;
  webpage: Webpage | undefined;
  pageUrl: string = '';
  selectedPages: string[] = []; // Track selected page IDs


  constructor(
    private route: ActivatedRoute,
    private webpageService: WebpageService,
    private location: Location,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.urlControl = new FormControl('', [Validators.required,
      this.isValidUrlValidator,]);
  }

  ngOnInit(): void {
    this.getWebpage();
    this.getWebpagePages(this.route.snapshot.paramMap.get('id')!);
  }

  getWebpage(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.webpageService.getWebpage(id).subscribe((webpage) => {
      this.webpage = webpage;

      if (this.webpage) {
        const currentDomain = this.extractDomain(this.webpage.url);
        // Update the URL control to include domain matching validation
        this.urlControl.setValidators([
          Validators.required,
          this.isValidUrlValidator,
          this.isMatchingDomainValidator(currentDomain)
        ]);
        this.urlControl.updateValueAndValidity(); // Trigger validation update
      }
    });
  }

  getWebpagePages(webpageId: string): void {
    this.webpageService.getWebpagePages(webpageId).subscribe(pages => {
      if (this.webpage) {
        this.webpage.pages = pages; // Assign retrieved pages to the webpage object
      }
    });
  }

  addPage(url: string): void {
    if (!this.webpage) {
      console.error("Webpage not found.");
      return;
    }

    if (!this.isValidUrl(url)) {
      console.error('Invalid URL');
      return;
    }

    if (!this.isValidDomain(url)) {
      console.error('Invalid Domain');
      return;
    }

    this.webpageService.addPage(this.webpage._id, url).subscribe(response => {
      if (response && response.page) {
        // Update the webpage object with the new page
        this.webpage!.pages.push(response.page);
        // Clear input field
        this.pageUrl = '';
      } else {
        // Handle error response
        console.error("Error adding page:", response.message);
      }
    });
  }

  deleteWebpage(webpageId: string): void {
    this.webpageService.deleteWebpage(webpageId)
      .subscribe(() => {
        this.router.navigate(['/webpages']);
      });
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

  deletePages(): void {
    if (!this.webpage) {
      console.error("Webpage not found.");
      return;
    }

    const webpageId = this.webpage._id;

    this.selectedPages.forEach(pageId => {
    this.webpageService.deletePage(webpageId, pageId)
      .subscribe(() => {
        // Filter out the deleted page from the current webpage's pages array
        this.webpage!.pages = this.webpage!.pages.filter(page => page._id !== pageId);
      });
    });

    this.selectedPages = [];
  }

  handleCheckboxChange(pageId: string, isChecked: boolean): void {
    if (isChecked) {
      this.selectedPages.push(pageId); // Add to selected if checked
    } else {
      this.selectedPages = this.selectedPages.filter(id => id !== pageId); // Remove if unchecked
    }
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

  isMatchingDomainValidator(referenceDomain: string): (control: FormControl) => ValidationErrors | null {
    return (control: FormControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const pageDomain = this.extractDomain(control.value);
      if (pageDomain !== referenceDomain) {
        return { domainMismatch: true };
      }
      return null;
    };
  }

  getFirstError(): string | null {
    if (this.urlControl.hasError('invalidUrl')) {
      return 'invalidUrl';
    } else if (this.urlControl.hasError('domainMismatch')) {
      return 'domainMismatch';
    }
    return null;
  }


  isValidDomain(pageUrl: string): boolean {
    if (!this.webpage) {
      console.error("Webpage not found.");
      return false;
    }

    // Extract domain from the webpage URL
    const webpageDomain = this.extractDomain(this.webpage.url);

    // Extract domain from the page URL
    const pageDomain = this.extractDomain(pageUrl);

    // Check if the page domain matches the webpage domain
    if (webpageDomain !== pageDomain) {
      console.error('Provided URL does not belong to the domain of the webpage');
      return false;
    }

    return true;
  }

  private extractDomain(url: string): string {
    // Regular expression to extract the domain from the URL
    const domainRegex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/g;

    // Extract domain using the regex
    const matches = url.match(domainRegex);

    // Check if a match is found and return the domain
    return matches ? matches[0] : '';
  }


  openReportView(webpage: any) {
    // Open the MatDialog with the ReportViewDialogComponent
    this.dialog.open(ReportComponent, {
      data: { webpage }, // Pass the webpage data to the dialog
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
            if (errorsCount.has(errorCode)) {
                errorsCount.set(errorCode, errorsCount.get(errorCode)! + 1);
            } else {
                errorsCount.set(errorCode, 1);
            }
        });
    });

    // Sort errors by occurrence and get the top 10
    const sortedErrors = Array.from(errorsCount.entries()).sort((a, b) => b[1] - a[1]);
    const top10 = sortedErrors.slice(0, 10);
    webpage.top10Errors = new Map<string, number>(top10);
    this.openReportView(webpage)
  }

  goBack(): void {
    //this.location.back();
  }

  generateReport(webpageId: string, reportType: string) {
    this.webpageService.generateFile(webpageId, reportType).subscribe(
      (response) => {
        console.log('Report generated successfully:', response);
        // Handle success, maybe display a message or perform other actions
      },
      (error) => {
        console.error('Error generating report:', error);
        // Handle error, display error message to the user
      }
    );
  }

  openPageReport(page: Page): void {
    this.dialog.open(ReportPageComponent, {
      data: { page }
    });
  }
}
