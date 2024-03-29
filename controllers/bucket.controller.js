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

  uploadFile: async (req_or_url, res = null) => {
    try {
      const youtubeUrl =
        typeof req_or_url === "string" ? req_or_url : req_or_url.body.url;
      const tempDir = path.join(__dirname, "../temp");
      const timestamp = Date.now(); // Store the timestamp to use in the file key
      const outputFilename = path.join(tempDir, `${timestamp}_output.mp3`);

      // Download and convert the YouTube video to MP3
      await downloadYouTubeVideoAsMP3(youtubeUrl, outputFilename);

      // Initialize AWS S3 inside the uploadFile function
      const S3 = new AWS.S3({
        endpoint,
        region,
        credentials: {
          accessKeyId: access_key,
          secretAccessKey: secret_key,
        },
      });

      // Upload the MP3 file to S3
      const fileKey = `${timestamp}_youtube_audio.mp3`; // This is the file key
      const uploadParams = {
        Bucket: process.env.BUCKET_NAME, // Replace with your bucket name
        Key: fileKey,
        Body: fs.createReadStream(outputFilename),
      };

      await S3.upload(uploadParams).promise();

      // Optionally delete the local file after upload
      fs.unlinkSync(outputFilename);

      if (res) {
        res.status(200).json({ message: "File uploaded successfully" });
      }
      return fileKey; // Return the file key
    } catch (err) {
      console.error(err);
      if (res) {
        res.status(500).json({ message: err.message });
      }
      return null; // Return null in case of an error
    }
  },

  makeFilePublic: async (arg1, arg2) => {
    try {
      const S3 = new AWS.S3({
        endpoint,
        region,
        credentials: {
          accessKeyId: access_key,
          secretAccessKey: secret_key,
        },
      });

      let bucket_name, object_name;

      // Determine if function is called with req, res or with direct parameters
      if (
        typeof arg1 === "object" &&
        arg1.body &&
        arg1.body.bucket_name &&
        arg2 &&
        arg2.status
      ) {
        // Called with request-response objects
        bucket_name = arg1.body.bucket_name;
        object_name = arg1.body.object_name;
      } else if (typeof arg1 === "string" && typeof arg2 === "string") {
        // Called with direct parameters
        bucket_name = arg1;
        object_name = arg2;
      } else {
        throw new Error("Invalid arguments");
      }

      if (!bucket_name || !object_name) {
        throw new Error("Bucket name and object name are required");
      }

      await S3.putObjectAcl({
        Bucket: bucket_name,
        Key: object_name,
        ACL: "public-read",
      }).promise();

      console.log("Object set to public read successfully");

      // Send response if res object is available
      if (arg2 && arg2.status) {
        return arg2
          .status(200)
          .json({ message: "Object set to public read successfully" });
      }
    } catch (err) {
      console.error(err);
      if (arg2 && arg2.status) {
        return arg2.status(500).json({ message: err.message });
      } else {
        throw err; // Rethrow the error for other use cases
      }
    }
  },

  listFileNames: async (req, res) => {
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
      if (!bucket_name) {
        return res.status(400).json({ message: "Bucket name is required" });
      }

      const MAX_KEYS = 300;

      let params = {
        Bucket: bucket_name,
        MaxKeys: MAX_KEYS,
      };

      console.log("Listing All Files in Bucket: " + bucket_name);
      console.log("==========================");

      while (true) {
        let response = await S3.listObjectsV2(params).promise();

        for (let content of response.Contents) {
          const fileUrl = `https://kr.object.ncloudstorage.com/${bucket_name}/${content.Key}`;
          console.log(`File URL: ${fileUrl}`);
        }

        if (response.IsTruncated) {
          params.ContinuationToken = response.NextContinuationToken;
        } else {
          break;
        }
      }

      return res.status(200).json({ message: "Files listed successfully" });
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
