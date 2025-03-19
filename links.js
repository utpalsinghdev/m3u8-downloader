import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import path from 'path';

const mainUrl = "https://api.you42.com/embed/video"
const start = 46128
const l = 100
const state = "miss_"

// Add stealth plugin
puppeteer.use(StealthPlugin());

async function logApiCalls(urls) {
    let collectedUrls = [];
    const foldername = 'out/links';
    const tempfoldername = 'out/links/temp';

    // Ensure output folder exists
    if (!fs.existsSync(foldername)) {
        fs.mkdirSync(foldername);
    }

    const tempFilePath = path.join(tempfoldername, `${state}temp_api_calls_${start}_to_${Number(start) + Number(l) - 1}.json`);

    // Save collected URLs to a temporary file
    function saveTempData() {
        fs.writeFileSync(tempFilePath, JSON.stringify(collectedUrls, null, 2), 'utf-8');
    }

    // Catch unexpected errors
    process.on('uncaughtException', (err) => {
        saveTempData();
        process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
        saveTempData();
        process.exit(1);
    });

    // Launch Puppeteer with stealth mode
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
        ],
    });

    for (const url of urls) {

        const page = await browser.newPage();

        // Set user agent and viewport
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
        );
        await page.setViewport({ width: 1280, height: 800 });

        // Block unnecessary resources
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const requestUrl = request.url();
            if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
                request.abort();
            } else {
                request.continue();
            }

            if (request.resourceType() === 'xhr' || request.resourceType() === 'fetch') {
                collectedUrls.push({ url: requestUrl, mainUrl: url });
                saveTempData();
            }
        });

        try {
            await page.goto(url, { waitUntil: 'networkidle2' });

            // await page.waitForSelector('video');


        } catch (error) {
            console.error(`Failed to load ${url}: ${error.message}`);
        } finally {
            await page.close();
        }

        // Wait for 3 seconds before processing the next URL
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Close the browser


    // Save final data
    async function processMissingUrls(missingUrls) {
        if (missingUrls.length === 0) {
            return;
        }

        console.dir({
            message: `The following URLs did not trigger any API calls:`,
            urls: missingUrls,
        }, { depth: null });

        for (const url of missingUrls) {
            const page = await browser.newPage();

            // Set user agent and viewport
            await page.setUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
            );
            await page.setViewport({ width: 1280, height: 800 });

            // Block unnecessary resources
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                const requestUrl = request.url();
                if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
                    request.abort();
                } else {
                    request.continue();
                }

                if (request.resourceType() === 'xhr' || request.resourceType() === 'fetch') {
                    page.reload();
                    page.reload();

                    collectedUrls.push({ url: requestUrl, mainUrl: url });
                    saveTempData();
                }
            });

            try {
                await page.goto(url, { waitUntil: 'networkidle2' });

                // Wait for a sufficient amount of time to allow API calls to be triggered

            } catch (error) {
                console.error(`Failed to load ${url}: ${error.message}`);
            } finally {
                await page.close();
            }

            // Wait for 3 seconds before processing the next URL
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        const filteredUrls = collectedUrls.filter(item => item.url.endsWith('.m3u8'));
        const newMissingUrls = urls.filter(url => !filteredUrls.some(item => item.mainUrl === url));

        await processMissingUrls(newMissingUrls);
    }

    const filteredUrls = collectedUrls.filter(item => item.url.endsWith('.m3u8'));
    const initialMissingUrls = urls.filter(url => !filteredUrls.some(item => item.mainUrl === url));

    await processMissingUrls(initialMissingUrls);

    const randomFileName = `${state}api_calls_${start}_to_${Number(start) + Number(l) - 1}.json`;
    const finalFilePath = path.join(foldername, randomFileName);

    fs.writeFileSync(finalFilePath, JSON.stringify(filteredUrls, null, 2), 'utf-8');
    console.log(`Final API calls have been saved to ${finalFilePath}`);


    await browser.close();
}

//TODO: Automate the generation of these URLs from 46061 to 46079



console.log(`Generating URLs from ${mainUrl}/${start}/player to ${mainUrl}/${Number(start) + Number(l) - 1}/player`);

const generatedUrls = Array.from({ length: Number(l) }, (_, i) => `${mainUrl}/${Number(start) + i}/player`);

console.log(`Starting to log API calls for the first URL: ${generatedUrls[0]}`);

const oldURls = [
    'https://api.you42.com/embed/video/46130/player',
    'https://api.you42.com/embed/video/46131/player',
    'https://api.you42.com/embed/video/46133/player',
    'https://api.you42.com/embed/video/46135/player',
    'https://api.you42.com/embed/video/46137/player',
    'https://api.you42.com/embed/video/46139/player',
    'https://api.you42.com/embed/video/46141/player',
    'https://api.you42.com/embed/video/46143/player',
    'https://api.you42.com/embed/video/46145/player',
    'https://api.you42.com/embed/video/46148/player',
    'https://api.you42.com/embed/video/46151/player',
    'https://api.you42.com/embed/video/46154/player',
    'https://api.you42.com/embed/video/46157/player',
    'https://api.you42.com/embed/video/46158/player',
    'https://api.you42.com/embed/video/46160/player',
    'https://api.you42.com/embed/video/46162/player',
    'https://api.you42.com/embed/video/46163/player',
    'https://api.you42.com/embed/video/46165/player',
    'https://api.you42.com/embed/video/46167/player',
    'https://api.you42.com/embed/video/46169/player',
    'https://api.you42.com/embed/video/46170/player',
    'https://api.you42.com/embed/video/46171/player',
    'https://api.you42.com/embed/video/46174/player',
    'https://api.you42.com/embed/video/46177/player',
    'https://api.you42.com/embed/video/46180/player',
    'https://api.you42.com/embed/video/46181/player',
    'https://api.you42.com/embed/video/46182/player',
    'https://api.you42.com/embed/video/46183/player',
    'https://api.you42.com/embed/video/46184/player',
    'https://api.you42.com/embed/video/46185/player',
    'https://api.you42.com/embed/video/46186/player',
    'https://api.you42.com/embed/video/46187/player',
    'https://api.you42.com/embed/video/46190/player',
    'https://api.you42.com/embed/video/46192/player',
    'https://api.you42.com/embed/video/46193/player',
    'https://api.you42.com/embed/video/46194/player',
    'https://api.you42.com/embed/video/46195/player',
    'https://api.you42.com/embed/video/46198/player',
    'https://api.you42.com/embed/video/46199/player',
    'https://api.you42.com/embed/video/46201/player',
    'https://api.you42.com/embed/video/46202/player',
    'https://api.you42.com/embed/video/46203/player',
    'https://api.you42.com/embed/video/46205/player',
    'https://api.you42.com/embed/video/46207/player',
    'https://api.you42.com/embed/video/46209/player',
    'https://api.you42.com/embed/video/46211/player',
    'https://api.you42.com/embed/video/46214/player',
    'https://api.you42.com/embed/video/46216/player',
    'https://api.you42.com/embed/video/46217/player',
    'https://api.you42.com/embed/video/46218/player',
    'https://api.you42.com/embed/video/46219/player',
    'https://api.you42.com/embed/video/46220/player',
    'https://api.you42.com/embed/video/46221/player',
    'https://api.you42.com/embed/video/46222/player',
    'https://api.you42.com/embed/video/46223/player',
    'https://api.you42.com/embed/video/46224/player',
    'https://api.you42.com/embed/video/46225/player',
    'https://api.you42.com/embed/video/46226/player',
    'https://api.you42.com/embed/video/46227/player'
]

logApiCalls(generatedUrls)
    .then(() => {
        console.log(`Completed logging API calls for the last URL: ${generatedUrls[generatedUrls.length - 1]}`);
        console.log('Done logging API calls!');
    })
    .catch(error => console.error(`Error: ${error.message}`));
