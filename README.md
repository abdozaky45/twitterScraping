# Twitter Stock Symbol Mention Scraper

This project is a Node.js tool for browsing and collecting data from Twitter accounts to search for mentions of stock symbols without using the Twitter API.

## Introduction

This tool aims to extract mentions of stock symbols from Twitter accounts using web scraping techniques. It allows you to gather the necessary information from tweets without directly connecting to the Twitter API.

## Requirements

- **Puppeteer**: A Node library which provides a high-level API to control Chrome or Chromium over the DevTools Protocol. It is used for automating browsing tasks and scraping content from web pages.
- **Cheerio**: A fast, flexible, and lean implementation of core jQuery designed specifically for the server. It helps in parsing and manipulating HTML and XML documents.

## Usage

1. **Run the tool**

   Make sure to modify `config.js` to include the accounts you want to track. Then, you can run the tool using:

   ```bash
   npm start

