const { google } = require('googleapis');
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_DATA_API_KEY  // Replace with your API key
});


async function fetchVideosFromPlaylist(playlistId) {
    try {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1); // Set to 24 hours ago
  
      const response = await youtube.playlistItems.list({
        playlistId,
        part: 'snippet',
        maxResults: 5 // You may need to adjust this
      });
  
      let videoDetails = await Promise.all(
        response.data.items.map(async (item) => {
          const videoResponse = await youtube.videos.list({
            id: item.snippet.resourceId.videoId,
            part: 'contentDetails'
          });
          return {
            ...item,
            duration: videoResponse.data.items[0].contentDetails.duration,
            publishedAt: item.snippet.publishedAt
          };
        })
      );
  
      // Filter by date and duration
      videoDetails = videoDetails.filter(video => {
        const publishedDate = new Date(video.publishedAt);
        const duration = convertDurationToMinutes(video.duration);
        return publishedDate >= oneDayAgo && duration >= 0; // condition for minimum time duration of video
      });
  
      return videoDetails.map(video => `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`);
    } catch (error) {
      console.error('Error fetching playlist videos: ', error);
      return [];
    }
  }

  async function fetchPlaylistName(playlistId) {
    try {
        const response = await youtube.playlists.list({
            id: playlistId,
            part: 'snippet',
            maxResults: 1
        });

        if (response.data.items.length > 0) {
            return response.data.items[0].snippet.title;
        } else {
            console.log(`No playlist found with the ID: ${playlistId}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching playlist name for ID ${playlistId}: `, error);
        return null;
    }
}
  
  function convertDurationToMinutes(duration) {
    let match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    let hours = (parseInt(match[1]) || 0);
    let minutes = (parseInt(match[2]) || 0);
    let seconds = (parseInt(match[3]) || 0);
  
    // Convert everything to minutes
    return hours * 60 + minutes + seconds / 60;
  }
  
  module.exports = { fetchVideosFromPlaylist,fetchPlaylistName  };