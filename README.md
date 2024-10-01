# weekly_sales
This repository contains a JavaScript file that scrapes content from a specified webpage using Puppeteer, formats the scraped content, and sends it to a Telegram chat using the Telegram Bot API. The code is designed to be used as an AWS Lambda function, this repository **is not** a pre-configured AWS Lambda deployment package. Instead, it provides the source code that can be used to create an AWS Lambda function or be integrated into other JavaScript environments.

## How It Works

1. **Scrape Content**: The function uses Puppeteer to scrape content from the target URL specified in the environment variables.
2. **Format Content**: The scraped content is formatted for readability before being sent to the Telegram chat. The `scrape` and `formatContent` functions can be modified to adapt to different websites and content structures.
3. **Send to Telegram**: The formatted content is sent to a Telegram chat using the bot token provided in the environment variables. If no valid chat ID is found in the event, the function sends an error message to the fallback `TELEGRAM_CHAT_ID` (if set).


## Note on Deployment

If you wish to deploy this code as an AWS Lambda function, you need to:

1. Create a new Lambda function in the AWS Management Console.
2. Upload the code along with the necessary dependencies as a `.zip` file.
3. Configure the required environment variables.

For detailed instructions, see the [Setup](#setup) section below.

## Prerequisites

- **Node.js** installed locally (for testing outside of Lambda).
- An AWS account with permissions to create and manage Lambda functions (if deploying to AWS).
- A Telegram bot token from [BotFather](https://t.me/botfather).
- A target URL to scrape and the CSS selector of the HTML element to extract content from.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

