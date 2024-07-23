# PsiWebpages

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.0.0.

Overview

PsiWebpages is a web accessibility monitoring platform designed for webmasters to evaluate and continuously monitor the accessibility of their web pages. The platform allows users to input website URLs and specific pages to monitor, providing detailed accessibility indicators and reports.
Construction

This project uses the MEAN stack (MongoDB, Express, Angular, NodeJS) and is structured into four layers:

    Client Browser
    Web Server with Presentation Logic
    Application Server with Business Logic
    Database Server

Development follows a sprint-based approach, with three 2-week sprints, each producing a complete version of the system's functionalities.
Functionality Overview
Sprint 1

    Insert Website: Add a website URL for monitoring.
    Specify Pages: Add specific pages for monitoring.
    View Websites: List registered websites with their statuses.
    View Website Details: Detailed view of a registered website's information and pages.

Sprint 2

    Evaluate Accessibility: Perform accessibility evaluations on registered websites.
    Aggregated Indicators: View aggregated accessibility indicators for a website.
    Delete Entries: Delete websites and specific pages.

Sprint 3

    Detailed Evaluation Results: View detailed results of page evaluations.
    Generate Reports: Export accessibility reports in PDF or HTML format.

How to Run
Frontend

    

    ng serve
    Navigate to http://localhost:4200/. The application will automatically reload if you change any source files.

Build

    ng build

Backend

    Navigate to the Backend Directory
    Change to the directory where your backend code is located.

    Install Dependencies

    npm install

Run the Backend Server

    npm start

    By default, the backend server will run on http://localhost:3066/. You can adjust the port and other settings in your configuration files if needed.



Running on the Server

ssh user@yourserver.com

MongoDB Connection
Update the following connection string with your MongoDB details:
mongodb://<username>:<password>@localhost:27017/<database>?retryWrites=true&authSource=<database>

Run Front-End Server

ng serve --port XXXX --host 0.0.0.0 --disableHostCheck true

Run Back-End Server
Navigate to the backend directory and start the server:

npm start
