require('dotenv').config();

const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const { fetchVideosFromPlaylist } = require('./fetchVideos');
const { uploadFile, makeFilePublic } = require('./controllers/bucket.controller.js');
const { recognizeUrl } = require('./controllers/clova.controller.js');
const { extractText } = require('./extract'); // Import extractText


const LAST_PROCESSED_FILE = path.join(__dirname, 'last_processed_urls.json');

// List of whitelisted playlist IDs
const whitelistedPlaylists = [
  'PLW6XfMkhux5LNO4FYV_Lrspo0cnOxZ6fy',
  // Add more playlist IDs as needed
];

function readLastProcessedUrls() {
  if (fs.existsSync(LAST_PROCESSED_FILE)) {
    return JSON.parse(fs.readFileSync(LAST_PROCESSED_FILE, 'utf8'));
  }
  return {};
}

function writeLastProcessedUrl(playlistId, url) {
  const urls = readLastProcessedUrls();
  urls[playlistId] = url;
  fs.writeFileSync(LAST_PROCESSED_FILE, JSON.stringify(urls, null, 2), 'utf8');
}

async function processLatestVideoFromPlaylist(playlistId) {
  try {
    const videoUrls = await fetchVideosFromPlaylist(playlistId);
    const lastProcessedUrls = readLastProcessedUrls();
    const lastProcessedUrl = lastProcessedUrls[playlistId];

    if (videoUrls.length > 0) {
      const latestVideoUrl = videoUrls[videoUrls.length - 1];

      if (latestVideoUrl !== lastProcessedUrl) {
        const uploadedFileKey = await uploadFile(latestVideoUrl);
        
        if (uploadedFileKey) {
          const bucketName = 'videoinput3'; // Replace with your actual bucket name
          await makeFilePublic(bucketName, uploadedFileKey);

          const fileUrl = `https://kr.object.ncloudstorage.com/${bucketName}/${uploadedFileKey}`;

          try {
              const recognitionResult = await recognizeUrl(fileUrl);
              const extractionResult = await extractText(recognitionResult);
              console.log("Extraction Result:", extractionResult.choices[0].message.content);
          } catch (error) {
              console.error("Error during recognition or extraction:", error);
          }

          writeLastProcessedUrl(playlistId, latestVideoUrl);
        } else {
          console.error(`Failed to upload video from URL ${latestVideoUrl}`);
        }
      } else {
        console.log(`No new videos to upload from playlist ${playlistId}.`);
      }
    } else {
      console.log(`No videos found in playlist ${playlistId}.`);
    }
  } catch (error) {
    console.error(`Error processing playlist ${playlistId}:`, error);
  }
}
  

// Schedule to run every day at a specific time (e.g., at midnight)
cron.schedule('*/2 * * * *', async () => {
  console.log('Running scheduled task to fetch videos from playlists');
  for (const playlistId of whitelistedPlaylists) {
    await processLatestVideoFromPlaylist(playlistId);
  }
});

console.log('Scheduler running...');
