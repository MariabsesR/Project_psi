import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Page } from '../page';

interface ErrorCount {
  code: string;
  count: number;
}

@Component({
  selector: 'app-report-page',
  templateUrl: './report-page.component.html',
  styleUrls: ['./report-page.component.css']
})
export class ReportPageComponent {
  filterCriteria = {
    testType: '',
    result: '',
    complianceLevel: ''
  };

  errorCounts: { code: string, count: number }[] = [];
  filteredTests: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<ReportPageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { page: Page }
  ) {}

  ngOnInit() {
    this.calculateErrorCounts();
    this.filterTests();
  }

  calculateErrorCounts() {
    const errorMap = new Map<string, number>();
    this.data.page.errorCodes.forEach(code => {
      errorMap.set(code, (errorMap.get(code) || 0) + 1);
    });
    this.errorCounts = Array.from(errorMap, ([code, count]) => ({ code, count }));
  }

  filterTests() {
    console.log('Filtering with criteria:', this.filterCriteria); // Debugging
    this.filteredTests = this.data.page.testResults.filter(test => {
      console.log('Test:', test); // Debugging
      const matchesTestType = !this.filterCriteria.testType || test.testType === this.filterCriteria.testType;
      const matchesResult = !this.filterCriteria.result || test.result === this.filterCriteria.result;
      const matchesComplianceLevel = !this.filterCriteria.complianceLevel || test.complianceLevel === this.filterCriteria.complianceLevel;
      return matchesTestType && matchesResult && matchesComplianceLevel;
    });
    console.log('Filtered Tests:', this.filteredTests); // Debugging
  }

  close(): void {
    this.dialogRef.close();
  }
}
