const express = require("express");
const router = express.Router();

const controller = require("../controllers/read.controller.js");

router.get("/issues", controller.readAllIssues);
router.get("/issue/:title0", controller.readIssue);

module.exports = router;
