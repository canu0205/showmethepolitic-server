var express = require("express");
var router = express.Router();

const controller = require("../controllers/bucket.controller.js");

/* GET users listing. */
router.post("/create", controller.createBucket, async (req, res, next) => {});
router.post("/set-cors", controller.setCors, async (req, res, next) => {});

router.post("/upload-from-youtube", controller.uploadFile, async (req, res, next) => {});


module.exports = router;
