const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PoliticianSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  party: String,
  position: String,
  image: String,
  issue_id: {
    type: Schema.Types.ObjectId,
    ref: "Issue",
  },
});

module.exports = mongoose.model("Politician", PoliticianSchema);
