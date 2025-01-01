import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import axios from 'axios';

const m3u8Urls = [

]

const maxRetries = 3; // Maximum retry attempts for a file

async function downloadFile(url, filePath, attempt = 1) {
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0',
            },
        });
        writeFileSync(filePath, response.data);
        console.log(`File downloaded successfully: ${filePath}`);
    } catch (error) {
        console.error(`Error downloading file ${url} (Attempt ${attempt}): ${error.message}`);
        if (attempt < maxRetries) {
            console.log(`Retrying download for ${url}...`);
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait before retry
            await downloadFile(url, filePath, attempt + 1);
        } else {
            console.error(`Failed to download ${url} after ${maxRetries} attempts.`);
        }
    }
}

async function downloadBatch(segmentUrls, baseUrl, folderName) {
    await Promise.all(
        segmentUrls.map(async(segment) => {
            const segmentUrl = segment.startsWith('http') ? segment : `${baseUrl}${segment}`;
            const filePath = join(folderName, segment);
            await downloadFile(segmentUrl, filePath);
        })
    );
}

async function downloadSegmentsForM3u8(m3u8Url) {
    const folderName = m3u8Url.split('/').pop().split('.')[0]; // Create folder name from m3u8 file name
    const m3u8FileName = m3u8Url.split('/').pop();

    if (!existsSync(folderName)) {
        mkdirSync(folderName);
    }

    const m3u8FilePath = join(folderName, m3u8FileName);
    await downloadFile(m3u8Url, m3u8FilePath);

    const m3u8Content = readFileSync(m3u8FilePath, 'utf8');
    const lines = m3u8Content.split('\n');
    const segmentUrls = lines.filter((line) => line && !line.startsWith('#'));
    const baseUrl = m3u8Url.substring(0, m3u8Url.lastIndexOf('/') + 1);

    const batchSize = 10; // Number of parallel downloads per batch

    console.log(`Found ${segmentUrls.length} segments to download and splitting into ${Math.ceil(segmentUrls.length / batchSize)} batches of ${batchSize}...`);
    for (let i = 0; i < segmentUrls.length; i += batchSize) {
        const batch = segmentUrls.slice(i, i + batchSize);
        console.log(`Downloading batch ${Math.floor(i / batchSize) + 1} for ${folderName}`);
        await downloadBatch(batch, baseUrl, folderName);
    }

    console.log(`All segments for ${folderName} downloaded successfully!`);
}

async function downloadAllM3u8Files() {
    for (const m3u8Url of m3u8Urls) {
        console.log(`Starting download for: ${m3u8Url}`);
        await downloadSegmentsForM3u8(m3u8Url);
    }
}

downloadAllM3u8Files();