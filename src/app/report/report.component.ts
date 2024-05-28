import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Webpage } from '../webpage';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent{

  constructor(
    private dialogRef: MatDialogRef<ReportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { webpage: Webpage }
  ) {}

  close() {
    this.dialogRef.close(); // Close the dialog when the button is clicked
  }

  
}
