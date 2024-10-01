# Weekly_sales_bot
This repository contains a JavaScript file that scrapes content from a specified webpage using Puppeteer, formats the scraped content, and sends it to a Telegram chat using the Telegram Bot API. The code is designed to be used as an AWS Lambda function, this repository **is not** a pre-configured AWS Lambda deployment package. Instead, it provides the source code that can be used to create an AWS Lambda function or be integrated into other JavaScript environments.

You are welcome to use this bot: https://t.me/the_iraqui_bot
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

## Setup

### Step 1: Clone the Repository

- Clone this repository to your local machine

### Step 2: Install Dependencies

- Install the required Node.js dependencies:
```
npm install
```
### Step 3: Configure Environment Variables

Create a .env file in the root directory (for local testing) or set these variables in your AWS Lambda configuration:

- TELEGRAM_BOT_TOKEN: Your Telegram bot token.
- TARGET_URL: The URL of the webpage you want to scrape.
- TARGET_SELECTOR: The CSS selector of the element to extract content from.
- TELEGRAM_CHAT_ID (optional): The chat ID to send fallback or error messages.

### Step 4: Test Locally

If you want to run the script locally (outside AWS Lambda), make sure you have Node.js installed and the .env file configured correctly. Then run:
```
node index.js
```

### Step 5: Deploy as an AWS Lambda Function
1. Create the Lambda Function:
-  Go to the AWS Lambda Console.
-  Click Create function.
-  Choose Author from scratch and name it (e.g., TelegramScraper).
-  Set the Runtime to Node.js 14.x or higher.
-  Choose or create an execution role with permissions to access CloudWatch logs.

2. Upload the Code:
-  Create a .zip file containing the following:
  -  index.js (your main function file with the provided code).
  -  node_modules directory (after running npm install for the dependencies).
-  Upload the .zip file to your Lambda function.

3.Configure Environment Variables:
-  Set the environment variables in the Lambda function settings as described in Step 3.

4.Deploy and Test:
-  Save and deploy your function in the Lambda console.
-  Create a test event with the following JSON structure:

```
{
  "body": "{\"message\":{\"chat\":{\"id\":123456789},\"text\":\"/scrape\"}}"
}
```
- Click Test to run the function and check the logs for results.


## Setting Up a Webhook with AWS API Gateway and Postman

You can configure your Telegram bot to receive messages automatically by setting up a webhook using AWS API Gateway and Postman.

### Step 1: Create an API Gateway Endpoint
1. Go to the [API Gateway console](https://console.aws.amazon.com/apigateway).
2. Create a new REST API.
3. Add a new resource and method (`POST`).
4. Integrate it with a Lambda function that handles incoming messages or directly forwards them to your bot endpoint.

### Step 2: Deploy the API
1. Deploy the API to a new or existing stage.
2. Note the invoke URL, e.g., `https://{api-id}.execute-api.{region}.amazonaws.com/{stage}/{resource}`.

### Step 3: Set the Webhook URL Using Postman
1. Open Postman and create a new `POST` request.
2. Set the URL to: https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook
3. In the request body, select **x-www-form-urlencoded** and add:
- `url`: `https://{api-id}.execute-api.{region}.amazonaws.com/{stage}/{resource}`
4. Send the request.

### Step 4: Verify the Webhook
Check the response from Telegram to confirm the webhook is set successfully. Your bot should now receive updates through the API Gateway endpoint.

## Troubleshooting

- **Check the CloudWatch Logs** for any error messages or issues.
- Ensure that the environment variables are correctly set.
- Modify the `scrape` and `formatContent` functions to match different sites or content structures as needed.

## Important Notes

- **Do not upload your `node_modules` folder** to the repository. Add it to your `.gitignore` file.
- If your dependencies are not installing correctly in Lambda, ensure that you are using compatible versions of Puppeteer and Chromium.
- If you encounter issues with the Lambda function timeout, increase the timeout setting in the Lambda configuration (under **General Configuration**).


## License
This project is licensed under the MIT License. See the LICENSE file for details.

