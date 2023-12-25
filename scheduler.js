require('dotenv').config();

const cron = require('node-cron');
const { fetchVideosFromPlaylist } = require('./fetchVideos');

// List of whitelisted playlist IDs
const whitelistedPlaylists = [
  'PLW6XfMkhux5LNO4FYV_Lrspo0cnOxZ6fy',
  // Add more playlist IDs as needed
];

// Function to process videos from each playlist
async function processPlaylistVideos(playlistId) {
  try {
    const videoUrls = await fetchVideosFromPlaylist(playlistId);
    console.log(`Videos from playlist ${playlistId}:`, videoUrls);
    // Add additional processing logic here if needed
    // e.g., download videos, store information, etc.
  } catch (error) {
    console.error(`Error processing playlist ${playlistId}:`, error);
  }
}

// Schedule to run every day at a specific time (e.g., at midnight)
cron.schedule('* * * * *', async () => {
  console.log('Running scheduled task to fetch videos from playlists');
  for (const playlistId of whitelistedPlaylists) {
    await processPlaylistVideos(playlistId);
  }
}); // A cron schedule is a string of five fields, representing (in order): minute, hour, day of the month, month, and day of the week. 

console.log('Scheduler running...');
