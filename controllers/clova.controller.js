require("dotenv").config();

const axios = require("axios");
const InvokeUrl = process.env.INVOKE_URL;
const ClovaApiKey = process.env.CLOVA_API_KEY;

module.exports = {
  recognizeUrl: async (req, res, next) => {
    try {
      // const { url } = req.body;
      const { dataKey } = req.body;
      const response = await axios.post(
        `${InvokeUrl}/recognizer/object-storage`,
        {
          // url,
          dataKey,
          language: "ko-KR",
          boostings: [
            {
              words: "comma separated words",
            },
          ],
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

      return res
        .status(200)
        .json({ messages: "recognize from url succeed", data: response.data });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err });
    }
  },
};
