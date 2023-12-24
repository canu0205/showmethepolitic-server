var express = require("express");
var router = express.Router();

const users = require("./users.route");
const bucket = require("./bucket.route");

router.use("/users", users);
router.use("/bucket", bucket);

/* GET home page. */
// router.get("/", function (req, res, next) {
//   res.render("index", { title: "Express" });
// });

module.exports = router;
