require("dotenv").config();

const AWS = require("aws-sdk");

const fs = require("fs");
const downloadYouTubeVideoAsMP3 = require("../youtubeToMp3");
const path = require("path");

const endpoint = new AWS.Endpoint("https://kr.object.ncloudstorage.com");
const region = "kr-standard";
const access_key = process.env.ACCESS_KEY;
const secret_key = process.env.SECRET_KEY;

module.exports = {
  createBucket: async (req, res, next) => {
    try {
      const S3 = new AWS.S3({
        endpoint,
        region,
        credentials: {
          accessKeyId: access_key,
          secretAccessKey: secret_key,
        },
      });

      const bucket_name = req.body.bucket_name;

      await S3.createBucket({
        Bucket: bucket_name,
        CreateBucketConfiguration: {},
      }).promise();

      return res.status(200).json({ message: "create bucket" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err });
    }
  },

  uploadFile: async (req, res, next) => {
    try {
      // Extract the YouTube URL from the request
      const youtubeUrl = req.body.url;
      const tempDir = path.join(__dirname, "../temp"); // Adjust according to your directory structure
      const outputFilename = path.join(tempDir, "output.mp3"); // Temporary file path

      // Download and convert the YouTube video to MP3
      await downloadYouTubeVideoAsMP3(youtubeUrl, outputFilename);

      // Initialize AWS S3
      const S3 = new AWS.S3({
        endpoint,
        region,
        credentials: {
          accessKeyId: access_key,
          secretAccessKey: secret_key,
        },
      });

      // Upload the MP3 file to S3
      const params = {
        Bucket: "hwllo", // Replace with your bucket name
        Key: `${Date.now()}_youtube_audio.mp3`, // Filename to save as
        Body: fs.createReadStream(outputFilename), // Read stream
      };

      await S3.upload(params).promise();

      // Optionally delete the local file after upload
      fs.unlinkSync(outputFilename);

      return res.status(200).json({ message: "File uploaded successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: err.message });
    }
  },

  setCors: async (req, res, next) => {
    try {
      const S3 = new AWS.S3({
        endpoint,
        region,
        credentials: {
          accessKeyId: access_key,
          secretAccessKey: secret_key,
        },
      });

      const bucket_name = "test-bc";

      const params = {
        Bucket: bucket_name,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ["*"],
              AllowedMethods: ["GET", "PUT", "POST"],
              AllowedOrigins: ["*"],
              MaxAgeSeconds: 3000,
            },
          ],
        },
      };

      // Set CORS
      await S3.putBucketCors(params).promise();

      // Get CORS
      const response = await S3.getBucketCors({
        Bucket: bucket_name,
      }).promise();
      console.log(JSON.stringify(response, null, 2));

      return res.status(200).json({ message: "set cors" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err });
    }
  },

  updateAcl: async (req, res, next) => {
    const S3 = new AWS.S3({
      endpoint,
      region,
      credentials: {
        accessKeyId: access_key,
        secretAccessKey: secret_key,
      },
    });

    const bucket_name = req.body.bucket_name;
    const object_name = req.body.object_name;
    const owner_id = req.body.owner_id;
    // const target_id = req.body.target_id;

    await S3.putObjectAcl({
      Bucket: bucket_name,
      Key: object_name,
      AccessControlPolicy: {
        Grants: [
          {
            Grantee: {
              ID: owner_id,
              Type: "CanonicalUser",
            },
            Permission: "FULL_CONTROL",
          },
          // {
          //   Grantee: {
          //     ID: target_id,
          //     Type: "CanonicalUser",
          //   },
          //   Permission: "READ",
          // },
        ],
        Owner: {
          ID: owner_id,
        },
      },
    }).promise();
  },
};
