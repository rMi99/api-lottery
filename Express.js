const express = require('express');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

app.get('/api/lottery', async (req, res) => {
    const { date, drawNo, slug } = req.query;

    if (!date || !drawNo || !slug) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(`https://www.nlb.lk/English/results/${slug}/${drawNo}`);
        const htmlContent = await page.content();
        const $ = cheerio.load(htmlContent);
        const lotteryResults = [];
        $('.B li').each((index, element) => {
            const resultText = $(element).text().trim();
            if (resultText !== '' && resultText !== null) {
                lotteryResults.push(resultText);
            }
        });

        // Convert zodiac names to Sinhala
        switch (lotteryResults[0]) {
            case 'ARIES':
                lotteryResults[0] = 'mesha';
                break;
            case 'TAURUS':
                lotteryResults[0] = 'wushaba';
                break;
            // Add cases for other zodiac signs...
            default:
                break;
        }

        const jsonResults = JSON.stringify(lotteryResults);
        res.json(jsonResults);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
