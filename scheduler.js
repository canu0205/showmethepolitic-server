require('dotenv').config();

const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const { fetchVideosFromPlaylist } = require('./fetchVideos');
const { uploadFile, makeFilePublic } = require('./controllers/bucket.controller.js');
const { recognizeUrl } = require('./controllers/clova.controller.js');


const LAST_PROCESSED_FILE = path.join(__dirname, 'last_processed_urls.json');

// List of whitelisted playlist IDs
const whitelistedPlaylists = [
  'PLW6XfMkhux5LNO4FYV_Lrspo0cnOxZ6fy',
  'PLW6XfMkhux5J9IWsdd6q3qYTdtJbj_Muv'
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
          
          // Check if uploadedFileKey is not null
          if (uploadedFileKey) {
            const bucketName = 'videoinput3'; // Replace with your actual bucket name
            await makeFilePublic(bucketName, uploadedFileKey);

            // Construct the URL of the uploaded file
            const fileUrl = `https://kr.object.ncloudstorage.com/${bucketName}/${uploadedFileKey}`;

            // Call recognizeUrl with the file URL
            try {
                const recognitionResult = await recognizeUrl(fileUrl);

                // console.log("Recognition Result:", recognitionResult.text); 

                // Write recognitionResult to a JSON file
                const fileName = `transcription_${Date.now()}.json`; // File name with timestamp
                const filePath = path.join(__dirname, 'transcriptions', fileName); // Adjust the directory as needed

                fs.writeFile(filePath, JSON.stringify(recognitionResult, null, 2), 'utf8', (err) => {
                    if (err) {
                    console.error('Error writing file:', err);
                    } else {
                    console.log(`Transcription saved to ${filePath}`);
                    }
                });
            } catch (error) {
                console.error("Error during recognition:", error);
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
cron.schedule('* * * * *', async () => {
  console.log('Running scheduled task to fetch videos from playlists');
  for (const playlistId of whitelistedPlaylists) {
    await processLatestVideoFromPlaylist(playlistId);
  }
});

console.log('Scheduler running...');
