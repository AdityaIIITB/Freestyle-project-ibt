document.addEventListener('DOMContentLoaded', () => {
    // const statusMessageElement = document.getElementById('statusMessage');
    const appContent = document.getElementById('appContent');

    const amountInput = document.getElementById('amount');
    const fromCurrencySelect = document.getElementById('fromCurrency');
    const toCurrencySelect = document.getElementById('toCurrency');
    const swapCurrenciesButton = document.getElementById('swapCurrencies');
    const convertButton = document.getElementById('convertButton');
    const conversionResultDiv = document.getElementById('conversionResult');

    const baseCurrencyRatesSelect = document.getElementById('baseCurrencyRates');
    const ratesTableContainer = document.getElementById('ratesTableContainer');

    const loadingIndicator = document.getElementById('loadingIndicator');

    let API_KEY = '';
    let currencyRates = null; // To store fetched rates (primarily USD based for conversion logic)

    // --- Status Message Helper ---
    // function showStatusMessage(message, type = 'info') { // type can be 'info', 'success', 'error'
    //     statusMessageElement.textContent = message;
    //     // statusMessageElement.className = `status-message ${type}`; // Apply class for styling
    //     statusMessageElement.style.display = 'block';
    // }

    // --- API Key Management ---
    function getApiKeyAndInitialize() {
        API_KEY = sessionStorage.getItem('exchangeRateApiKey');

        if (!API_KEY) {
            API_KEY = prompt("Please enter your ExchangeRate-API Key:");
            if (API_KEY && API_KEY.trim() !== "") {
                sessionStorage.setItem('exchangeRateApiKey', API_KEY);
                // showStatusMessage('API Key entered. Initializing...', 'info');
                initializeConverter();
            } else {
                // showStatusMessage('API Key is required to use the application. Please refresh and enter a valid key.', 'error');
                appContent.style.display = 'none';
                API_KEY = ''; // Ensure API_KEY is cleared
                return; // Stop further execution
            }
        } else {
            // showStatusMessage('Using API Key from session storage. Initializing...', 'info');
            initializeConverter();
        }
    }


    // --- Initialization ---
    async function initializeConverter() {
        if (!API_KEY) {
            // This case should ideally be handled by getApiKeyAndInitialize before calling this
            // showStatusMessage("API Key is missing. Please refresh to enter.", 'error');
            appContent.style.display = 'none';
            return;
        }

        appContent.style.display = 'none'; // Hide content until successful init
        loadingIndicator.style.display = 'block';
        // statusMessageElement.style.display = 'none'; // Hide general status during loading

        try {
            // Fetch initial rates against USD to populate dropdowns and for conversion logic
            const response = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`);
            if (!response.ok) {
                const errorData = await response.json();
                let specificError = `API Error: ${response.status}`;
                if (errorData && errorData['error-type']) {
                    specificError = `API Error: ${errorData['error-type']}.`;
                    if (errorData['error-type'] === 'invalid-key' || errorData['error-type'] === 'inactive-account') {
                        sessionStorage.removeItem('exchangeRateApiKey'); // Clear bad key
                        specificError += " The stored API key was invalid and has been cleared. Please refresh to enter a new key.";
                         API_KEY = ''; // Clear the local variable as well
                    }
                }
                throw new Error(specificError);
            }
            const data = await response.json();
            if (data.result === 'success') {
                currencyRates = data.conversion_rates;
                populateCurrencyDropdowns(Object.keys(currencyRates));
                loadDefaultRatesView();
                appContent.style.display = 'block';
                // showStatusMessage('Application ready.', 'success');
            } else {
                // This case might indicate other API issues not caught by !response.ok
                throw new Error(data['error-type'] || 'Failed to fetch initial currency data. API did not return success.');
            }
        } catch (error) {
            console.error('Initialization Error:', error);
            // showStatusMessage(`Initialization failed: ${error.message}`, 'error');
            appContent.style.display = 'none';
            if (API_KEY === '') { // If key was cleared due to being invalid
                 // Message already set by the block that cleared the key.
            }
        } finally {
            loadingIndicator.style.display = 'none';
        }
    }

    function populateCurrencyDropdowns(currencies) {
        const commonCurrencies = ['USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'];
        const sortedCurrencies = currencies.sort((a, b) => {
            const aIsCommon = commonCurrencies.includes(a);
            const bIsCommon = commonCurrencies.includes(b);
            if (aIsCommon && !bIsCommon) return -1;
            if (!aIsCommon && bIsCommon) return 1;
            return a.localeCompare(b);
        });

        [fromCurrencySelect, toCurrencySelect, baseCurrencyRatesSelect].forEach(select => {
            select.innerHTML = '';
            sortedCurrencies.forEach(currency => {
                const option = document.createElement('option');
                option.value = currency;
                option.textContent = currency;
                select.appendChild(option);
            });
        });
        fromCurrencySelect.value = 'USD';
        toCurrencySelect.value = 'EUR';
        baseCurrencyRatesSelect.value = 'USD';
    }

    // --- Event Listeners ---
    convertButton.addEventListener('click', performConversion);
    swapCurrenciesButton.addEventListener('click', swapCurrencies);
    baseCurrencyRatesSelect.addEventListener('change', (e) => fetchAndDisplayRates(e.target.value));

    async function performConversion() {
        if (!API_KEY || !currencyRates) {
            conversionResultDiv.textContent = "App not initialized. Please ensure API key is valid and refresh.";
            conversionResultDiv.style.color = 'red';
            return;
        }
        const amount = parseFloat(amountInput.value);
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;

        if (isNaN(amount) || amount < 0) {
            conversionResultDiv.textContent = 'Please enter a valid positive amount.';
            conversionResultDiv.style.color = 'red';
            return;
        }
        if (!fromCurrency || !toCurrency) {
            conversionResultDiv.textContent = 'Please select both currencies.';
            conversionResultDiv.style.color = 'red';
            return;
        }

        // Conversion logic using the initially fetched USD-based rates
        const rateFromUSD = currencyRates[fromCurrency];
        const rateToUSD = currencyRates[toCurrency];

        if (!rateFromUSD || !rateToUSD) {
            conversionResultDiv.textContent = 'Exchange rate data missing for selected currencies. Try refreshing.';
            conversionResultDiv.style.color = 'red';
            console.error("Missing rate data for:", fromCurrency, "or", toCurrency, "in stored rates:", currencyRates);
            return;
        }

        const convertedAmount = (amount / rateFromUSD) * rateToUSD;

        conversionResultDiv.innerHTML = `
            ${amount.toLocaleString()} <strong>${fromCurrency}</strong> =
            ${convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} <strong>${toCurrency}</strong>
        `;
        conversionResultDiv.style.color = '#0056b3';
    }

    function swapCurrencies() {
        const temp = fromCurrencySelect.value;
        fromCurrencySelect.value = toCurrencySelect.value;
        toCurrencySelect.value = temp;
        if (amountInput.value && parseFloat(amountInput.value) > 0) {
             performConversion(); // Re-calculate if amount is valid
        } else {
            conversionResultDiv.textContent = ''; // Clear previous result if no amount
        }
    }

    async function fetchAndDisplayRates(baseCurrency) {
        if (!API_KEY) {
            // showStatusMessage("Cannot fetch rates. API Key is missing.", "error");
            return;
        }
        loadingIndicator.style.display = 'block';
        // statusMessageElement.style.display = 'none'; // Hide general status
        ratesTableContainer.innerHTML = '';

        try {
            const response = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${baseCurrency}`);
            if (!response.ok) {
                const errorData = await response.json();
                let specificError = `Failed to fetch rates for ${baseCurrency}. API Error: ${response.status}.`;
                 if (errorData && errorData['error-type']) {
                    specificError = `API Error for ${baseCurrency}: ${errorData['error-type']}.`;
                     if (errorData['error-type'] === 'invalid-key' || errorData['error-type'] === 'inactive-account') {
                        sessionStorage.removeItem('exchangeRateApiKey');
                        API_KEY = '';
                        specificError += " The API key was invalid and has been cleared. Please refresh to enter a new key.";
                        appContent.style.display = 'none'; // Hide app if key becomes invalid
                    }
                }
                throw new Error(specificError);
            }
            const data = await response.json();

            if (data.result === 'success') {
                displayRatesTable(data.conversion_rates, baseCurrency);
                // If the fetched base was USD, update our main currencyRates cache
                if (baseCurrency === 'USD') {
                    currencyRates = data.conversion_rates;
                }
            } else {
                throw new Error(data['error-type'] || `API did not return success for ${baseCurrency}.`);
            }
        } catch (error) {
            console.error('Fetch Rates Error:', error);
            // showStatusMessage(`Could not load rates for ${baseCurrency}: ${error.message}`, 'error');
        } finally {
            loadingIndicator.style.display = 'none';
        }
    }

    function displayRatesTable(rates, base) {
        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Currency</th>
                    <th>Rate (1 ${base} =)</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = table.querySelector('tbody');
        const popularCurrencies = ['USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'];

        const sortedCurrencies = Object.keys(rates)
            .filter(curr => curr !== base)
            .sort((a, b) => {
                const aIsPopular = popularCurrencies.includes(a);
                const bIsPopular = popularCurrencies.includes(b);
                if (aIsPopular && !bIsPopular) return -1;
                if (!aIsPopular && bIsPopular) return 1;
                return a.localeCompare(b);
            });

        sortedCurrencies.forEach(currency => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${currency}</td>
                <td>${rates[currency].toFixed(4)}</td>
            `;
            tbody.appendChild(tr);
        });
        ratesTableContainer.innerHTML = ''; // Clear previous table before appending new one
        ratesTableContainer.appendChild(table);
    }
    
    function loadDefaultRatesView() {
        if (baseCurrencyRatesSelect.value) {
            fetchAndDisplayRates(baseCurrencyRatesSelect.value);
        } else if (currencyRates && Object.keys(currencyRates).includes('USD')) {
            // This case might not be hit if populateCurrencyDropdowns always sets a value
            baseCurrencyRatesSelect.value = 'USD';
            fetchAndDisplayRates('USD');
        }
    }

    // --- Initial Load ---
    getApiKeyAndInitialize();
});