export interface Element {
  htmlCode: string;
  pointer: string;
}

export interface DetailedResult {
  verdict: string;
  description: string;
  elements: Element[];
}

export interface TestResult {
  testName: string;
  testType: string;
  result: string;
  complianceLevel: string;
  detailedResults: DetailedResult[]; // Add detailedResults array
}

export interface Page {
  _id: string;
  url: string;
  registered: Date;
  lastEvaluation: Date;
  status: string;
  errorsA: number;
  errorsAA: number;
  errorsAAA: number;
  errorCodes: string[];
  totalTests: number;
  testsPassed: number;
  testsWithWarnings: number;
  failedTests: number;
  nonApplicableTests: number;
  latestReport: any;
  testResults: TestResult[]; // Add testResults array
}
