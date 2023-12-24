var express = require("express");
var router = express.Router();

const controller = require("../controllers/clova.controller.js");

router.post(
  "/recognize",
  controller.recognizeUrl,
  async (req, res, next) => {}
);

module.exports = router;
