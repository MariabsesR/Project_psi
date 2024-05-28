const mongoose = require('mongoose');

const StatusEnum = {
  PORAVALIAR: 'por avaliar',
  EMAVALIACAO: 'em avaliacao',
  CONFORME: 'conforme',
  NAOCONFORME: 'nao conforme',
  ERRO: 'erro na avaliacao',
};

// Define the schema for the test result elements
const elementSchema = new mongoose.Schema({
  htmlCode: { type: String, required: true },
  pointer: { type: String, required: true }
}, { _id: false });

// Define the schema for the detailed test results
const detailedResultSchema = new mongoose.Schema({
  verdict: { type: String, required: true },
  description: { type: String, required: true },
  elements: { type: [elementSchema], default: [] }
}, { _id: false });

// Define the schema for the test results
const testResultSchema = new mongoose.Schema({
  testName: { type: String, required: true },
  testType: { type: String, required: true }, // e.g., 'ACT Rule' or 'WCAG Technique'
  result: {
    type: String,
    enum: ['Passed', 'Warning', 'Failed', 'Not applicable'],
    required: true
  },
  complianceLevel: {
    type: String,
    enum: ['A', 'AA', 'AAA', 'N/A'],
    required: true
  },
  detailedResults: { type: [detailedResultSchema], default: [] } // New field to store detailed results
}, { _id: false }); // Disabling _id for subdocuments

const pageSchema = new mongoose.Schema({
   url: {
      type: String,
      required: true
   },
   registered: { type: Date, default: Date.now },
   lastEvaluation: { type: Date, default: null },
   status: {
      type: String,
      enum: Object.values(StatusEnum),
      default: StatusEnum.PORAVALIAR
   },
   latestReport: { type: Object, default: "" },
   errorsA: { type: Number, default: 0 },
   errorsAA: { type: Number, default: 0 },
   errorsAAA: { type: Number, default: 0 },
   errorCodes: { type: [String], default: [] }, // Array to store error codes
   totalTests: { type: Number, default: 0 },
   testsPassed: { type: Number, default: 0 },
   testsWithWarnings: { type: Number, default: 0 },
   failedTests: { type: Number, default: 0 },
   nonApplicableTests: { type: Number, default: 0 },
   testResults: { type: [testResultSchema], default: [] } // New field to store test results
});

const Page = mongoose.model('Page', pageSchema);

module.exports = { Page, StatusEnum };
