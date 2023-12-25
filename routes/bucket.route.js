var express = require("express");
var router = express.Router();

const controller = require("../controllers/bucket.controller.js");

/* GET users listing. */
router.post("/create", controller.createBucket, async (req, res, next) => {});
router.put("/set-cors", controller.setCors, async (req, res, next) => {});
router.put("/update-acl", controller.updateAcl, async (req, res, next) => {});

router.post("/upload-from-youtube", controller.uploadFile, async (req, res, next) => {});

router.post("/list-file-names",controller.listFileNames,async (req, res, next) => {});

module.exports = router;
