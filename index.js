const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;
const TIMEOUT = 500;

const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE4Njg3NzgwLCJpYXQiOjE3MTg2ODc0ODAsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjUxZDM1OWFhLWQ1MjQtNGMxNC1hOWFjLWY3N2QyM2I5NGIzYiIsInN1YiI6Im1lbmRpcmF0dGFnYXlhdHJpMjAwM0BnbWFpbC5jb20ifSwiY29tcGFueU5hbWUiOiJtcnByb2plY3QiLCJjbGllbnRJRCI6IjUxZDM1OWFhLWQ1MjQtNGMxNC1hOWFjLWY3N2QyM2I5NGIzYiIsImNsaWVudFNlY3JldCI6IkpBbHdFSVpRR0FrbmhnVFUiLCJvd25lck5hbWUiOiJHYXlhdHJpIiwib3duZXJFbWFpbCI6Im1lbmRpcmF0dGFnYXlhdHJpMjAwM0BnbWFpbC5jb20iLCJyb2xsTm8iOiIySzIxQ1NVTjAxMDY3In0.kKIkyIkXtdpQIOD_49F2VWlGfUahRlUAkj3iJghArSg";

app.get('/numbers', async (req, res) => {
    const urls = req.query.url;
    if (!urls) {
        return res.status(400).json({ error: 'No URLs provided' });
    }

    const urlArray = Array.isArray(urls) ? urls : [urls];
    const numberPromises = urlArray.map(url => fetchNumbers(url));

    try {
        const results = await Promise.allSettled(numberPromises);
        const numbers = results
            .filter(result => result.status === 'fulfilled')
            .flatMap(result => result.value)
            .filter((value, index, self) => self.indexOf(value) === index) // Ensure uniqueness
            .sort((a, b) => a - b); // Sort numbers in ascending order

        return res.json({ numbers });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while processing the URLs' });
    }
});

const fetchNumbers = (url) => {
    return new Promise((resolve, reject) => {
        axios.get(url, { 
                timeout: TIMEOUT,
                headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
            })
            .then(response => {
                if (response.data && Array.isArray(response.data.numbers)) {
                    resolve(response.data.numbers);
                } else {
                    resolve([]);
                }
            })
            .catch(error => {
                resolve([]);
            });
    });
};

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
