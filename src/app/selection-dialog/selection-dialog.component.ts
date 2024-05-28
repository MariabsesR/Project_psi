import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Webpage } from '../webpage'; // Adjust import path

@Component({
  selector: 'app-selection-dialog',
  templateUrl: './selection-dialog.component.html',
  styleUrls: ['./selection-dialog.component.css']
})
export class SelectionDialogComponent {
  pageSelections: { [key: string]: boolean } = {}; // Dictionary to track selections

  constructor(
    public dialogRef: MatDialogRef<SelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { pages: Webpage[] }
  ) {}

  closeDialog(): void {
    this.dialogRef.close(); // Close without returning data
  }

  confirmSelection(): void {
    const selectedPages = this.data.pages.filter(page => this.pageSelections[page._id]);
    this.dialogRef.close(selectedPages); // Return selected pages on confirmation
  }
}
