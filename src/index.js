const puppeteerExtra = require("puppeteer-extra");
const Chromium = require("@sparticuz/chromium");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fetch = require("node-fetch");

// Retrieve the Telegram bot token, URL, and selector from environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TARGET_URL = process.env.TARGET_URL;
const TARGET_SELECTOR = process.env.TARGET_SELECTOR;

if (!TELEGRAM_BOT_TOKEN || !TARGET_URL || !TARGET_SELECTOR) {
  throw new Error("Required environment variables (TELEGRAM_BOT_TOKEN, TARGET_URL, TARGET_SELECTOR) are not set.");
}

// Function to send message to Telegram
async function sendTelegramMessage(chatID, message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatID,
        text: message,
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      throw new Error(`Telegram API error: ${data.description}`);
    }
    return data;
  } catch (error) {
    console.error("Failed to send message to Telegram:", error);
    throw error; // Re-throw the error to handle it in the main flow
  }
}

// Function to handle scraping - can be changed to match a specific use case
async function scrape() {
  try {
    puppeteerExtra.use(StealthPlugin());

    const browser = await puppeteerExtra.launch({
      headless: Chromium.headless,
      defaultViewport: Chromium.defaultViewport,
      executablePath: await Chromium.executablePath(),
      args: [...Chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.goto(TARGET_URL);
    await page.waitForSelector(TARGET_SELECTOR);
    await page.waitForTimeout(2000);

    const productsDivContent = await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      return element ? element.innerText : null;
    }, TARGET_SELECTOR);

    await browser.close();

    return productsDivContent;
  } catch (error) {
    console.error("Error during scraping:", error);
    throw error;
  }
}

// Function to format the scraped content - can be changed to match a specific use case
function formatContent(content) {
  if (!content) {
    console.log("Content is null or undefined. Cannot format.");
    return "No content available to format.";
  }

  try {
    if (content.includes("כרגע אין מוצרים בקטגוריה זו")) {
      return content;
    }

    const lines = content.split('\n').filter(line => line.trim() !== '');
    const formattedLines = [];

    // Check if the number of lines is not a multiple of 3 and log a warning if necessary
    if (lines.length % 3 !== 0) {
      console.warn(`Warning: The number of lines (${lines.length}) is not a multiple of 3. Some product details may be missing.`);
    }

    for (let i = 0; i < lines.length; i += 3) {
      const productName = lines[i] || "Unknown Product";
      const productPrice = (i + 1 < lines.length) ? lines[i + 1] : ""; // Optional: Not used now, but left for future
      const productOffer = (i + 2 < lines.length) ? lines[i + 2] : "No offer available";
      formattedLines.push(`${productName}: ${productOffer}`);
    }

    return formattedLines.join('\n');
  } catch (error) {
    console.error("Error formatting content:", error);
    return "Error formatting content. Please check the input data format.";
  }
}

exports.handler = async (event, context) => {
  let chatID;

  try {
    console.log("Received event:", JSON.stringify(event, null, 2));

    // Parse the event body to get the actual message object
    const body = JSON.parse(event.body || '{}');

    // Attempt to extract chat ID from the event body
    chatID = body?.message?.chat?.id;

    if (!chatID) {
      // If no chat ID is found, use the fallback TELEGRAM_CHAT_ID environment variable
      const fallbackChatID = process.env.TELEGRAM_CHAT_ID;

      if (fallbackChatID) {
        console.log("No chat ID found in event. Using fallback TELEGRAM_CHAT_ID for error reporting.");

        // Send an error message to the fallback chat ID and end the function
        await sendTelegramMessage(fallbackChatID, "Error: No valid chat ID provided in the event. Could not send the message.");
        
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'No valid chat ID provided. Error reported to fallback chat ID.' }),
        };
      } else {
        // If no fallback chat ID is available, log and return an error response
        console.error("No chat ID provided and no fallback TELEGRAM_CHAT_ID set.");
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'No valid chat ID provided and no fallback chat ID configured.' }),
        };
      }
    }

    // If chatID is available, continue with the rest of the logic

    // Scrape the content and format it
    const scrapedContent = await scrape();
    const formattedContent = formatContent(scrapedContent);

    // Send the final message once to the valid chat ID
    const telegramResponse = await sendTelegramMessage(chatID, formattedContent);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Data sent to Telegram successfully',
        telegramResponse,
      }),
    };
  } catch (error) {
    console.error("Error in handler execution:", error);

    // If an error occurs and we have a valid chat ID, send an error message
    if (chatID || process.env.TELEGRAM_CHAT_ID) {
      const errorChatID = chatID || process.env.TELEGRAM_CHAT_ID;
      await sendTelegramMessage(errorChatID, `An error occurred: ${error.message}`);
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
