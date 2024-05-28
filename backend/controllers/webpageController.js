const { Webpage, StatusWebpageEnum } = require("../models/Webpage.js");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const { Page, StatusEnum } = require("../models/Page.js");
const { QualWeb } = require('@qualweb/core');

// Lists all the webpages
exports.webpage_list = asyncHandler(async (req, res, next) => {
  try {

    const allWebpages = await Webpage.find();


    res.json(allWebpages);
  } catch (err) {
    console.error("Error fetching webpage list:", err);
    res.status(500).json({ message: "Error fetching webpage list" });
  }
})
//lists specific webpage
exports.webpage_detail = asyncHandler(async (req, res, next) => {
  const webpageId = req.params.id;

  try {
    const webpage = await Webpage.findById(webpageId).exec();

    if (!webpage) {
      return res.status(404).json({ message: "Hero not found" });
    }
    res.json(webpage);
  } catch (err) {
    console.error("Error fetching webpage details:", err);
    res.status(500).json({ message: "Error fetching webpage details" });
  }
});

// List all webpages sorted by last evaluation time in ascending order
exports.webpage_list_sorted_evaluation_asc = asyncHandler(async (req, res, next) => {
  try {

    const allWebpagesSorted = await Webpage.find().sort({ lastEvaluation: 1 }).exec();


    res.json(allWebpagesSorted);
  } catch (err) {
    console.error("Error fetching sorted webpage list:", err);
    res.status(500).json({ message: "Error fetching sorted webpage list" });
  }
});

// List all webpages sorted by registration time in ascending order
exports.webpage_list_sorted_registered_asc = asyncHandler(async (req, res, next) => {
  try {

    const allWebpagesSorted = await Webpage.find().sort({ registered: 1 }).exec();


    res.json(allWebpagesSorted);
  } catch (err) {
    console.error("Error fetching sorted webpage list:", err);
    res.status(500).json({ message: "Error fetching sorted webpage list" });
  }
});

// List all webpages sorted by last evaluation time in descending order
exports.webpage_list_sorted_evaluation_desc = asyncHandler(async (req, res, next) => {
  try {

    const allWebpagesSorted = await Webpage.find().sort({ lastEvaluation: -1 }).exec();


    res.json(allWebpagesSorted);
  } catch (err) {
    console.error("Error fetching sorted webpage list:", err);
    res.status(500).json({ message: "Error fetching sorted webpage list" });
  }
});

// List all webpages sorted by registration time in descending order
exports.webpage_list_sorted_registered_desc = asyncHandler(async (req, res, next) => {
  try {

    const allWebpagesSorted = await Webpage.find().sort({ registered: -1 }).exec();


    res.json(allWebpagesSorted);
  } catch (err) {
    console.error("Error fetching sorted webpage list:", err);
    res.status(500).json({ message: "Error fetching sorted webpage list" });
  }
});
//creates webpage wityh post

exports.webpage_create_post = async (req, res) => {
  try {
    const { url } = req.body;


    if (!url) {
      return res.status(400).json({ message: "URL is required" });
    }


    const urlPattern = /^(http|https):\/\/([\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?)$/;


    if (!url.match(urlPattern)) {
      return res.status(400).json({ message: "Invalid URL format" });
    }


    const webpage = new Webpage({ url });
    await webpage.save();
    res.status(201).json(webpage);
  } catch (error) {
    console.error("Error creating webpage:", error);
    res.status(500).json({ message: "Error creating webpage" });
  }
};

//add a nre page to a specific webpage
exports.webpage_add_page_post = asyncHandler(async (req, res, next) => {
  const webpageId = req.params.webpageId;
  const { url: pageUrl } = req.body;
  const urlPattern = /^(http|https):\/\/([\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?)$/;


  if (!pageUrl.match(urlPattern)) {
    return res.status(400).json({ message: "Invalid URL format" });
  }
  try {

    const webpage = await Webpage.findById(webpageId);
    if (!webpage) {
      return res.status(404).json({ message: "Webpage doesnt exist" });
    }


    const page = new Page({ url: pageUrl });


    await page.save();


    const webpageDomain = new URL(webpage.url).hostname;


    const pageDomain = new URL(pageUrl).hostname;


    if (webpageDomain !== pageDomain) {

      await Page.findByIdAndDelete(page._id);
      return res.status(400).json({ message: "Provided URL doesn't belong to the domain of the webpage" });
    }

    webpage.listaPaginasMonotorizadas.push(page);
    await webpage.save();
    //chnage status
    await exports.updateWebpageStatus(webpage);
    res.status(201).json({ message: "Page  added", page });
  } catch (error) {
    console.error("Error adding new page:", error);
    res.status(500).json({ message: "Error adding new page" });
  }
});

// retrieve pages associated with a  webpage
exports.webpage_get_pages = asyncHandler(async (req, res, next) => {
  const webpageId = req.params.webpageId;

  try {

    const webpage = await Webpage.findById(webpageId).populate('listaPaginasMonotorizadas').exec();

    if (!webpage) {
      return res.status(404).json({ message: "Webpage not found" });
    }


    const pages = webpage.listaPaginasMonotorizadas;


    res.json(pages);
  } catch (err) {
    console.error("Error fetching webpage pages:", err);
    res.status(500).json({ message: "Error fetching webpage pages" });
  }
});

// Delete webpage by ID (DELETE)
exports.webpage_delete = async (req, res) => {
  try {
    const webpageId = req.params.id;


    const webpage = await Webpage.findById(webpageId);
    if (!webpage) {
      return res.status(404).json({ message: "Webpage not found" });
    }


    const pageIdsToDelete = webpage.listaPaginasMonotorizadas;


    await Page.deleteMany({ _id: { $in: pageIdsToDelete } });


    await Webpage.findByIdAndDelete(webpageId);

    res.json({ message: "Webpage and associated pages deleted successfully" });
  } catch (error) {
    console.error("Error deleting webpage:", error);
    res.status(500).json({ message: "Error deleting webpage" });
  }
};

// Delete page by ID (DELETE)
exports.page_delete = async (req, res) => {
  try {
    const webpageId = req.params.webpageId;
    const pageId = req.params.pageId;
    // Find page by ID and delete
    const deletedPage = await Page.findByIdAndDelete(pageId);
    if (!deletedPage) {
      return res.status(404).json({ message: "Page not found" });
    }

    const webpage = await Webpage.findById(webpageId);
    if (!webpage) {
      return res.status(404).json({ message: "Webpage not found" });
    }
    webpage.listaPaginasMonotorizadas.pull(pageId);
    await webpage.save();
    await exports.updateWebpageStatus(webpage);
    res.json({ message: "Page deleted successfully" });
  } catch (error) {
    console.error("Error deleting page:", error);
    res.status(500).json({ message: "Error deleting page" });
  }
};

exports.generateReport = async (pageId, res) => {
  try {
    const page = await Page.findById(pageId);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }
    const url = page.url;

    const urlPattern = /^(http|https):\/\/([\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?)$/;
    if (!url.match(urlPattern)) {
      return res.status(400).json({ message: "Invalid URL format" });
    }

    // Set page status to 'In Evaluation'
    page.status = StatusEnum.EMAVALIACAO;
    page.lastEvaluation = Date.now();
    await page.save();

    // Perform accessibility report
    const plugins = {
      adBlock: false,
      stealth: true
    };
    const clusterOptions = {
      timeout: 60 * 1000
    };
    const launchOptions = {args: ['--no-sandbox', '--ignore-certificate-errors']};

    const qualweb = new QualWeb(plugins);

    await qualweb.start(clusterOptions, launchOptions);

    const qualwebOptions = { url };

    const report = await qualweb.evaluate(qualwebOptions);

    await qualweb.stop();

    // Log reports
    console.log("ACRT Report:");
    console.log(report[url].modules['act-rules']);
    console.log("\n\n\n\n\n");
    console.log("WCAG Report:");
    console.log(report[url].modules['wcag-techniques']);
    console.log("\n\n\n\n");

    // Extracting assertions object from the ACRT report
    const actRulesObject = report[url].modules['act-rules'];
    const assertions = actRulesObject.assertions;

    // Check for failed success criteria
    let hasErrors = false;
    let hasAorAA = false;

    page.errorsA = 0;
    page.errorsAA = 0;
    page.errorsAAA = 0;
    page.errorCodes = [];
    page.totalTests = 0;
    page.testsPassed = 0;
    page.testsWithWarnings = 0;
    page.failedTests = 0;
    page.nonApplicableTests = 0;
    page.testResults = []; // Initialize testResults array

    const processRule = (rule, ruleType) => {
      const totalErrors = rule.metadata.failed;
      const passed = rule.metadata.passed;
      const warning = rule.metadata.warning;
      const inapplicable = rule.metadata.inapplicable;
      const errorTypes = new Set();

      // Create a testResult object and push it into the page.testResults array
      const testResult = {
        testName: rule.code,
        testType: ruleType,
        result: totalErrors > 0 ? 'Failed' : passed > 0 ? 'Passed' : warning > 0 ? 'Warning' : 'Not applicable',
        complianceLevel: rule.metadata["success-criteria"][0]?.level || 'N/A',
        detailedResults: []
      };

      // Process each result in the rule
      rule.results.forEach(result => {
        const resultObject = {
          verdict: result.verdict,
          description: result.description,
          elements: result.elements.map(element => ({
            htmlCode: element.htmlCode,
            pointer: element.pointer
          }))
        };
        console.log("ENTROU AQUIIIIIIIIIIIIIIQUWEWQIEUQWIEUQWEIQWUEQWIEIQUEUIQIEQ\n\n\n\n\n\n\n\n\n");
        console.log(resultObject);
        testResult.detailedResults.push(resultObject);
        console.log(testResult.detailedResults);
      });

      page.testResults.push(testResult);
      console.log(page.testResults);
      if (passed > 0) {
          page.testsPassed++;
      }
      if (warning > 0) {
          page.testsWithWarnings++;
      }
      if (totalErrors > 0) {
          page.failedTests++;
      }
      if (inapplicable > 0) {
          page.nonApplicableTests++;
      }

      for (let i = 0; i < totalErrors; i++) {
        page.errorCodes.push(rule.code);
      }

      rule.metadata["success-criteria"].forEach(criteria => {
        if ((criteria.level === "AA" || criteria.level === "A") && totalErrors > 0) {
          hasAorAA = true;
        }
        if (criteria.level === "A" && totalErrors > 0) {
          errorTypes.add(criteria.level);
        }
        if (criteria.level === "AA" && totalErrors > 0) {
          errorTypes.add(criteria.level);
        }
        if (criteria.level === "AAA" && totalErrors > 0) {
          errorTypes.add(criteria.level);
        }
      });

      if (errorTypes.size > 0) {
        // Update error counts based on error types
        errorTypes.forEach(type => {
          if (type === "A") {
            page.errorsA += totalErrors;
          } else if (type === "AA") {
            page.errorsAA += totalErrors;
          } else if (type === "AAA") {
            page.errorsAAA += totalErrors;
          }
        });
      }
    };

    for (const ruleCode in assertions) {
      processRule(assertions[ruleCode], 'ACT Rule');
    }

    const wacgRulesObject = report[url].modules['wcag-techniques'];
    const wacgAssertions = wacgRulesObject.assertions;

    for (const wacgRuleCode in wacgAssertions) {
      processRule(wacgAssertions[wacgRuleCode], 'WCAG Technique');
    }

    if (hasAorAA) {
      hasErrors = true;
    }

    console.log("Has errors:", hasErrors);

    // Change page status according to errors
    if (hasErrors) {
      page.status = StatusEnum.NAOCONFORME;
    } else {
      page.status = StatusEnum.CONFORME;
    }

    page.totalTests = page.testsPassed + page.testsWithWarnings + page.failedTests + page.nonApplicableTests;
    // Save the report and the status
    page.latestReport = report;
    await page.save();
    return;
  } catch (error) {
    console.error("Error generating accessibility report:", error);
    if (page) {
      page.status = StatusEnum.ERRO;
      await page.save();
    }
    throw error;
  };
};



exports.evaluateWebpage = async (req, res) => {
  try {
    const webpageId = req.params.id;

    const webpage = await Webpage.findById(webpageId);
    if (!webpage) {
      return res.status(404).json({ message: "Webpage not found" });
    }
    //meter status em avaliacao
    webpage.status = StatusWebpageEnum.EMAVALIACAO;
    webpage.lastEvaluation = Date.now();
    await webpage.save();

    const { pageIds } = req.body;
    const pages = await Page.find({ _id: { $in: pageIds } }); // Fetch pages from the database

    if (!pages || pages.length === 0) {
      return res.status(404).json({ message: "No pages found" });
    }

    const pagesToEvaluate = pages.map(page => page);

    // Loop through each page and initiate evaluation
    for (const page of pages) {
      try {
        await exports.generateReport(page._id);
        const index = pagesToEvaluate.findIndex(p => p._id.equals(page._id)); // Find index of successfully evaluated page
        if (index !== -1) {
          pagesToEvaluate.splice(index, 1); // Remove successfully evaluated page from array
        }

      } catch (error) {
        // In case a page has an error, change all other pages not evaluated to error and the website status too
        webpage.status = StatusWebpageEnum.ERRO;
        await webpage.save();
        for (const pageToEvaluate of pagesToEvaluate) {
          pageToEvaluate.status = StatusEnum.ERRO;
          await pageToEvaluate.save();
        }
        console.error("Error generating report for page:", error);
        return res.status(500).json({ message: "Error generating reports " });
      }
    }
    console.log("testaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");

    // after all evaltuation are done check which status should it be tested
    await exports.updateWebpageStatus(webpage);


   return res.status(200).json({ message: "Evaluations done successfully" });
  } catch (error) {
    console.error("Error in evaluations:", error);
   return res.status(500).json({ message: "Error in evaluations" });
  }
};

/**
 *
 * const urlPattern = /^(http|https):\/\/([\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?)$/;
1- ^: Asserts the start of the string.
2-(http|https): Matches either "http" or "https".
3-:\/\/: Matches the sequence "://" literally.
4-([\w-]+(\.[\w-]+)+: This part of the pattern is for the domain name. It matches one or more word
characters (letters, digits, or underscores) followed by a dot, followed by one or more word characters,
 and this sequence can occur one or more times to represent subdomains.
5-([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?: This part matches the path and query parameters of the URL.
 It allows for zero or more characters that can include letters, digits, special characters
 (., @, ?, ^, =, %, &, :, /, ~, +, #, -), and slashes (/). The ? at the end makes this entire part
  optional, allowing for URLs without any path or query parameters.
6-$: Asserts the end of the string
 *
 */
exports.getReport = async (req, res) => {
  try {
    const pageId = req.params.id;
    const page = await Page.findById(pageId);

    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }



    return res.json(page.latestReport);
  } catch (error) {
    console.error("Error getting report:", error);
    return res.status(500).json({ message: "Error getting report" });
  }
};

//export.changeStatusWebpageToEmAvaliacao();
// test the status and change it of a webpage
exports.updateWebpageStatus = async (webpageToTest, res) => {
  try {

    const webpage = webpageToTest;

    if (!webpage) {
      console.log("webpage cant be null ");
      return;
    }

    // Populate listaPaginasMonotorizadas to get actual Page objects
    const populatedWebpage = await Webpage.findById(webpage._id).populate('listaPaginasMonotorizadas').exec();

    const pageswebpage = populatedWebpage.listaPaginasMonotorizadas;
    let allPagesAreToEvaluate = true;
    let pagesIsEmpty = false;
    let hasConforme = false;
    let hasPoravaliarORAvaliado = false;

    // Check if it has no pages
    if (!Array.isArray(pageswebpage) || pageswebpage.length === 0) {
      pagesIsEmpty = true;
    }

    // Check if all pages are "por avaliar", if so, webpage is also "por avaliar"
    for (const page of pageswebpage) {
      if (page.status !== StatusEnum.PORAVALIAR) {
        allPagesAreToEvaluate = false;
      }

      // Verify if any page has an error, hence website has error
      if (page.status === StatusEnum.ERRO) {
        webpage.status = StatusWebpageEnum.ERRO;
        await webpage.save();
        console.log("webpage estado erro");
        return;
      }

      // Verify pages in evaluation
      if (page.status === StatusEnum.CONFORME || page.status === StatusEnum.NAOCONFORME) {
        hasConforme = true;
      }
      if (page.status === StatusEnum.PORAVALIAR || page.status === StatusEnum.EMAVALIACAO) {
        hasPoravaliarORAvaliado = true;
      }
    }

    // Check if all other pages are to evaluate or if there are no pages
    if (allPagesAreToEvaluate || pagesIsEmpty) {
      webpage.status = StatusWebpageEnum.PORAVALIAR;
      await webpage.save();
      console.log("webpage estado . por avaliar");
      return;
    }

    // Check if pages are in evaluation
    if (hasConforme && hasPoravaliarORAvaliado) {
      webpage.status = StatusWebpageEnum.EMAVALIACAO;
      await webpage.save();
      console.log("webpage estado . em avaliacao ");
      return;
    }

    // If all other checks fail, it must be evaluated
    webpage.status = StatusWebpageEnum.AVALIADO;
    await webpage.save();
    console.log("webpage estado avaliado");
  } catch (error) {
    console.error("Error changing status webpage", error);
  }
};

const fs = require('fs').promises;
const pdf = require('html-pdf');
//https://apitemplate.io/blog/how-to-convert-html-to-pdf-using-node-js/
//onde vi
exports.generateFile = async (req, res) => {
  try {
    console.log("bananas 111");

    const webpageId = req.params.id;
    const reportType = req.params.type;
    console.log(reportType);

    const webpage = await Webpage.findById(webpageId);
    if (!webpage) {
      throw new Error("Webpage not found");
    }
    if(reportType !== 'pdf' && reportType !== 'html'){
      return res.status(404).json({ message: "Not a valid type" });
    }
  //without this the lsit is empty only has shallow copys of the list
    const populatedWebpage = await Webpage.findById(webpage._id).populate('listaPaginasMonotorizadas').exec();

    const pages = populatedWebpage.listaPaginasMonotorizadas;

    const errorAggregation = await Page.aggregate([
      { $match: { _id: { $in: pages.map(page => page._id) } } },
      { $unwind: "$errorCodes" },
      { $group: { _id: "$errorCodes", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    const totalPages = pages.length;
    const pagesWithoutErrors = pages.filter(page => page.status === StatusEnum.CONFORME).length;
    const pagesWithErrors = totalPages - pagesWithoutErrors;
    const pagesWithLevelAErrors = pages.filter(page => page.errorsA > 0).length;
    const pagesWithLevelAAErrors = pages.filter(page => page.errorsAA > 0).length;
    const pagesWithLevelAAAErrors = pages.filter(page => page.errorsAAA > 0).length;


    const percentagePagesWithoutErrors = (pagesWithoutErrors / totalPages) * 100;
    const percentagePagesWithErrors = (pagesWithErrors / totalPages) * 100;
    const percentagePagesWithLevelAErrors = (pagesWithLevelAErrors / totalPages) * 100;
    const percentagePagesWithLevelAAErrors = (pagesWithLevelAAErrors / totalPages) * 100;
    const percentagePagesWithLevelAAAErrors = (pagesWithLevelAAAErrors / totalPages) * 100;
//DUVIDAAAAAAAAAAAAAAAAAAAAAA---------------------------------------------------------------------- ESTE HTML TEMD E SER CCOMO O DO SITE OU PDOE SER NORMAL??
    let htmlContent = `
  <html>
  <head>
      <title>Report acessibility</title>
  </head>
  <body>
      <h1>Website :</h1>
      <p>URL: ${webpage.url}</p>
      <p>Registered Date: ${webpage.registered}</p>
      <p>Last Evaluation Date: ${webpage.lastEvaluation}</p>
      <p>Status: ${webpage.status}</p>

      <h1>Pages associated with website:</h1>
      <ul>
          ${pages.map(page => `
              <li>
                  <p>url: ${page.url}</p>
                  <p>last Evaluation Date: ${page.lastEvaluation}</p>
                  <p>status: ${page.status}</p>
              </li>
          `).join('')}
      </ul>

      <h1>Accessibility indicators:</h1>
      <p>Total pages: ${totalPages}</p>
      <p>Pages without erors: ${pagesWithoutErrors} (${percentagePagesWithoutErrors.toFixed(2)}%)</p>
      <p>Pages with error: ${pagesWithErrors} (${percentagePagesWithErrors.toFixed(2)}%)</p>
      <p>Pages With Level A error: ${pagesWithLevelAErrors} (${percentagePagesWithLevelAErrors.toFixed(2)}%)</p>
      <p>Pages with level AA errors: ${pagesWithLevelAAErrors} (${percentagePagesWithLevelAAErrors.toFixed(2)}%)</p>
      <p>Pages with level AAA errors: ${pagesWithLevelAAAErrors} (${percentagePagesWithLevelAAAErrors.toFixed(2)}%)</p>
      <h1>Top 10 errors:</h1>
          <ol>
            ${errorAggregation.map(error => `
              <li>${error._id}: amount =${error.count} </li>
            `).join('')}
          </ol>
  </body>
  </html>
`;
 // decide type of report
    let content, filename;
    if (reportType === 'html') {
      content = htmlContent;
      filename = `report_${webpageId}.html`
      // write to file
    await fs.writeFile(filename, content);
      console.log("type html");
    } else if (reportType === 'pdf') {
      filename = `report_${webpageId}.pdf`;
      pdf.create(htmlContent).toFile(filename, (err, res) => {
        if (err) return console.log(err);
        console.log('PDF generated successfully:', res);
      });
      console.log("type pdf");
    } else {
      return res.status(404).json({ message: `Invalid type ` });
    }




    // Return the generated filename

    return res.status(200).json({ message: `Created ${reportType.toUpperCase()} file`, filename });

  } catch (error) {
    console.error("Error generating report:", error);

    return res.status(500).json({ message: `Error creating report ` });
  }
};