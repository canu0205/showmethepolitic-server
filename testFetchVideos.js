require('dotenv').config();
const { fetchVideosFromPlaylist } = require('./fetchVideos');

console.log("YouTube Data API Key:", process.env.YOUTUBE_DATA_API_KEY);
const playlistId = 'PLqCB8pKLc7sykNudroRFx1E3ml2NDHrJL'; // Replace with your test playlist ID

fetchVideosFromPlaylist(playlistId)
  .then(videoUrls => console.log(videoUrls))
  .catch(error => console.error(error));
