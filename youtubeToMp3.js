const ytdl = require("ytdl-core");
// const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

async function downloadYouTubeVideoAsMP3(url, outputFilename) {
  return new Promise((resolve, reject) => {
    const stream = ytdl(url, { filter: "audioonly" });
    ffmpeg(stream)
      .audioCodec("libmp3lame")
      .toFormat("mp3")
      .saveToFile(outputFilename)
      .on("end", () => resolve(outputFilename))
      .on("error", (error) => reject(error));
  });
}

module.exports = downloadYouTubeVideoAsMP3;
