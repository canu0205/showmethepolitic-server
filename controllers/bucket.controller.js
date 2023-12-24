require("dotenv").config();

const AWS = require("aws-sdk");

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

  uploadFile: async (req, res, next) => {},

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
};
