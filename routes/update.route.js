const express = require("express");
const router = express.Router();

const controller = require("../controllers/update.controller.js");

router.put("/issue", controller.updateIssue);
router.put("/politician", controller.updatePolitician);

module.exports = router;
