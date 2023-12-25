const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const IssueSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: String,
});

module.exports = mongoose.model("Issue", IssueSchema);
