
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

async function waitFor(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0; // A variable to calculate the total distance traveled by scroll on the page.
      const distance = 100; //Move 100 pixels at a time
      const timer = setInterval(() => {
        window.scrollBy(0, distance); // window > Move the page by 100 pixels
        totalHeight += distance;
      // document.body.scrollHeight : A property that expresses the total height of the page content in JavaScript
        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

async function scrapeTwitter(account) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(`https://twitter.com/${account}`, { waitUntil: 'networkidle2' , timeout: 0  });
/* 
waitUntil: 'networkidle2' - >The page has been fully loaded.
timeout :Unlimited waiting for the page to load.
*/ 
  console.log(`Starting to scroll through @${account}'s timeline...`);
  let previousHeight = await page.evaluate('document.body.scrollHeight');// We get the full height of the page
  let reachedEnd = false;
  const scrollPause = 3000;

  while (!reachedEnd) { // Repeat until you reach the end of the timeline
    await autoScroll(page); // start Scroll

    await waitFor(scrollPause);  // Wait for more content to load

    let newHeight = await page.evaluate('document.body.scrollHeight');
    
    if (newHeight === previousHeight) {
      reachedEnd = true;
      console.log(`Reached the end of @${account}'s timeline.`);
    } else {
      previousHeight = newHeight;
      console.log(`Scrolling... Current height: ${newHeight}`);
    }
  }

  await page.waitForSelector('article', { timeout: 30000 });

  const content = await page.content(); // Get the full content HTML of the page.
  const $ = cheerio.load(content); // Cheerio is used to parse HTML and extract elements from it

  const tweets = $('article').map((i, el) => $(el).text()).get();

  const tickerRegex = /\$\w{3,4}/g;
  let tickerCounts = {};

  tweets.forEach(tweet => {
    const matches = tweet.match(tickerRegex);
    if (matches) {
      matches.forEach(ticker => {
        tickerCounts[ticker] = (tickerCounts[ticker] || 0) + 1;
        // 0 if it does not exist yet. + 1: Increases the value by 1 for each time the symbol appears.
      });
    }
  });

  await browser.close();
  return tickerCounts;
}

async function main() {
  const accounts = [
    'Mr_Derivatives', 'warrior_0719', 'ChartingProdigy', 
    'allstarcharts', 'yuriymatso', 'TriggerTrades', 
    'AdamMancini4', 'CordovaTrades', 'Barchart', 'RoyLMattox'
  ];
  
  const interval = 15 * 60 * 1000; // Repeat between each data collection process for 15 minutes

  async function scrapeAndPrint() {
    let allTickerCounts = {};

    for (const account of accounts) {
      console.log(`Scraping account @${account}...`);
      const results = await scrapeTwitter(account);

      Object.keys(results).forEach(ticker => { // { '$AAPL': 3, '$TSLA': 2 }
        allTickerCounts[ticker] = (allTickerCounts[ticker] || 0) + results[ticker];
      });
    }

    const currentTime = new Date();
    const elapsedMinutes = Math.round((currentTime - startTime) / 1000 / 60);
   // Convert from seconds to minutes
    Object.keys(allTickerCounts).forEach(ticker => {
      console.log(`'${ticker}' was mentioned '${allTickerCounts[ticker]}' times in the last '${elapsedMinutes}' minutes.`);
   /*
   ${ticker} - > Print the ticker
   ${allTickerCounts[ticker]} - > Prints the number of times the symbol appears
   ${elapsedMinutes} - > Prints the number of minutes that have passed since data collection began
    */
    });

    console.log('All accounts processed successfully!');
  }
// Repeat every 15 seconds between each data collection process and the second
  const startTime = new Date(); 

  await scrapeAndPrint(); 

  setInterval(async () => {
    console.log(`\nScraping again in ${interval / 1000 / 60} minutes...\n`);
    await scrapeAndPrint();
  }, interval);
}

main();
