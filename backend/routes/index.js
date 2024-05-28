var express = require('express');
var router = express.Router();
const webpageController = require('../controllers/webpageController');
const { Webpage, StatusWebpageEnum }= require("../models/Webpage.js");
const { Page, StatusEnum } = require("../models/Page.js");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/init', async (req, res) => {
  try {
    // Clear the database
    await Webpage.deleteMany({});
    await Page.deleteMany({});

    // Initialize collections
    const page1 = new Page({
      url: 'https://www.youtube.com/',
      status: 'por avaliar',
      lastEvaluation: new Date("2024-04-10"),
      registered: new Date("2024-04-01")
    });
    await page1.save();

    const page2 = new Page({
      url: 'https://www.youtube.com/page1',
      status: 'por avaliar',
      lastEvaluation: new Date("2024-04-12"),
      registered: new Date("2024-04-03")
    });
    await page2.save();

    const page3 = new Page({
      url: 'https://example2.com/page2',
      status: 'por avaliar',
      lastEvaluation: new Date("2024-04-08"),
      registered: new Date("2024-04-02")
    });
    await page3.save();

    const webpage1 = new Webpage({
      url: 'https://www.youtube.com/',
      lastEvaluation: new Date("2024-04-10"),
      registered: new Date("2024-04-02"),
      listaPaginasMonotorizadas: [page1._id,page2._id]
    });
    await webpage1.save();

    const webpage2 = new Webpage({
      url: 'https://example2.com',
      lastEvaluation: new Date("2023-04-08"),
      registered: new Date("2023-04-02"),
      listaPaginasMonotorizadas: [page3._id]
    });
    await webpage2.save();

    res.json({ message: 'Database initialized' });
  } catch (err) {
    console.error("Error resetting database:", err);
    res.status(500).json({ message: err.message });
  }
});

// Endpoint to list all webpages
router.get('/webpages', webpageController.webpage_list);
module.exports = router;

// Endpoint para obter detalhes de um webpage específico pelo ID
router.get('/detail/:id', webpageController.webpage_detail);
// gets list webpages sorted by time evaluated  asc
router.get('/webpages/sorted_evaluation_asc', webpageController.webpage_list_sorted_evaluation_asc);
// gets list webpages sorted by time registered asc
router.get('/webpages/sorted_registered_asc', webpageController.webpage_list_sorted_registered_asc);
// gets list webpages sorted by time evaluated desc
router.get('/webpages/sorted_evaluation_desc', webpageController.webpage_list_sorted_evaluation_desc);
// gets list webpages sorted by time registered desc
router.get('/webpages/sorted_registered_desc', webpageController.webpage_list_sorted_registered_desc);
//add a new webpage
router.post('/webpages', webpageController.webpage_create_post);
// Add a new  page to a specific webpage
router.post('/detail/:webpageId', webpageController.webpage_add_page_post);
// get pages associated with a specific webpage
router.get('/detail/:webpageId/pages', webpageController.webpage_get_pages);

// Endpoint para excluir uma webpage pelo ID
router.delete('/webpages/:id', webpageController.webpage_delete);
// Endpoint para excluir uma pagina pelo ID
router.delete('/detail/:webpageId/:pageId', webpageController.page_delete);
//endpoint generates a report for one page
router.get('/detail/:id/:pageId/report', webpageController.generateReport);
//evaluated a webpage and the ids of the specific pages ent ot it in the body
router.post('/detail/:id/report', webpageController.evaluateWebpage);
//returns a report- only used for testing and checking reports
router.get('/detail/:id/getReport', webpageController.getReport);
// creates a new report and saves it as pdf or html
router.post('/detail/:id/generateFile/:type', webpageController.generateFile);

