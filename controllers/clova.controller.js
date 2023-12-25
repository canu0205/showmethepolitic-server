require("dotenv").config();

const axios = require("axios");
const InvokeUrl = process.env.INVOKE_URL;
const ClovaApiKey = process.env.CLOVA_API_KEY;

module.exports = {
  recognizeUrl: async (arg1, arg2) => {
    try {
      let url, responseObj;

      // Determine if function is called with req, res or with direct parameters
      if (typeof arg1 === 'object' && arg1.body && arg2 && arg2.status) {
        // Called with request-response objects
        url = arg1.body.url;
        responseObj = arg2;
      } else if (typeof arg1 === 'string') {
        // Called with direct URL parameter
        url = arg1;
        responseObj = null;
      } else {
        throw new Error("Invalid arguments");
      }

      const response = await axios.post(
        `${InvokeUrl}/recognizer/url`,
        {
          url,
          language: "ko-KR",
          boostings: [{ words: "comma separated words" }],
          forbiddens: "comma separated words",
          completion: "sync",
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-CLOVASPEECH-API-KEY": ClovaApiKey,
          },
        }
      );

      if (responseObj) {
        return responseObj.status(200).json({ messages: "Recognize from url succeeded", data: response.data });
      } else {
        return response.data; // Return data when called with direct URL
      }
    } catch (err) {
      console.error(err);
      if (responseObj && responseObj.status) {
        return responseObj.status(500).json({ message: err.message });
      } else {
        throw err; // Rethrow the error for direct calls
      }
    }
  },
};
