# Freestyle-project-ibt

# Currency Hub Application

Currency Hub is a simple web application that allows you to convert currency amounts and view live exchange rates for various currencies. It uses the [ExchangeRate-API](https://www.exchangerate-api.com) to fetch real-time data.

## Features

* **Currency Conversion:** Convert amounts between a wide range of currencies.
* **Live Exchange Rates:** View a table of exchange rates relative to a selected base currency.
* **Dynamic Data:** Currency options and rates are fetched dynamically.
* **Session-Based API Key:** Your API key is requested via a prompt and stored in session storage for the duration of your browser session.

## Getting Started

To run this application locally, you will need a free API key from ExchangeRate-API.

### Prerequisites

* A modern web browser (e.g., Chrome, Firefox, Safari, Edge).
* An internet connection (to fetch exchange rates).

### Obtaining Your API Key

1.  **Navigate to ExchangeRate-API:**
    Open your web browser and go to [https://www.exchangerate-api.com](https://www.exchangerate-api.com).

2.  **Sign Up for a Free Plan:**
    * On the homepage, look for a "Sign Up," "Get Free Key," or similar button.
    * You will typically need to provide an email address and create a password to register for their free plan. The free plan is usually sufficient for development and personal use.

3.  **Verify Your Email (if required):**
    You might need to verify your email address by clicking a link sent to your inbox.

4.  **Access Your API Key:**
    * Once registered and logged in, navigate to your dashboard or API key section on the ExchangeRate-API website.
    * Your unique API key (sometimes referred to as "Access Key" or "API Token") will be displayed there. It's usually a long string of letters and numbers.
    * **Copy this API key.** You will need it when you first run the Currency Hub application.

    *(As of May 2025, the typical process involves signing up, choosing the free plan, and then finding the API key in your account dashboard.)*

### Running the Application

1.  **Download or Clone the Files:**
    Ensure you have the `index.html`, `style.css`, and `script.js` files in the same folder on your computer.

2.  **Open `index.html`:**
    * Navigate to the folder where you saved the files.
    * Double-click the `index.html` file. This will open the application in your default web browser.

3.  **Enter Your API Key:**
    * Upon first load (or if your session has expired), the application will display a browser prompt asking: "Please enter your ExchangeRate-API Key:".
    * Paste the API key you obtained from ExchangeRate-API into the prompt and click "OK".

4.  **Use the Application:**
    * If the API key is valid, the application will initialize, and you can start converting currencies or viewing exchange rates.
    * The API key will be stored in your browser's session storage, so you won't be prompted again unless you close the browser tab/window or the key is found to be invalid.

## How It Works

* The application is built using HTML for structure, CSS for styling, and JavaScript for dynamic functionality and API interaction.
* When you provide your API key, it's used to make requests to the ExchangeRate-API endpoints to fetch the latest currency conversion rates.
* The `/latest/USD` endpoint is used initially to populate currency dropdowns and provide a base set of rates for conversions.
* When viewing the "Live Exchange Rates" table for a different base currency, a new API call is made to `/latest/[SELECTED_BASE_CURRENCY]`.

## Troubleshooting

* **"API Key is required..." or "Invalid API Key..." message:**
    * Ensure you have entered the API key correctly.
    * Double-check that your API key is active on the ExchangeRate-API dashboard.
    * Free API plans might have request limits. If you exceed them, you might need to wait or consider a different plan on their website.
    * Refresh the page to be prompted for the API key again if an invalid key was previously entered and cleared from session storage.
* **Application doesn't load data:**
    * Check your internet connection.
    * Open your browser's developer console (usually by pressing F12) and look for any error messages in the "Console" tab. This can provide clues about what went wrong.

---

This `README.md` should provide clear instructions for any user trying to get the application running.