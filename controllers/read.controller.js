const Issue = require("../models/issue.model");
const Politician = require("../models/politician.model");

module.exports = {
  readAllIssues: async (req, res, next) => {
    try {
      const issues = await Issue.find();
      if (!issues || issues.length === 0) {
        return res.status(404).json({ message: "Issues not found" });
      }

      const formattedIssues = await Promise.all(
        issues.map(async (issue) => {
          const { _id, title, content } = issue;
          return { id: _id, title, content };
        })
      );

      return res
        .status(200)
        .json({ message: "Successfully find issues", data: formattedIssues });
    } catch (err) {
      next(err);
    }
  },

  readIssue: async (req, res, next) => {
    try {
      const { title0 } = req.params;
      const issue = await Issue.findOne({ title: title0 });
      if (!issue) {
        return res.status(404).json({ message: "Issue not found" });
      }

      const { _id, title, content } = issue;

      const politicians = await Politician.find({ "opinions.issue_id": _id });
      if (!politicians || politicians.length === 0) {
        return res.status(404).json({ message: "Politician not found" });
      }

      const opinions = politicians.map((politician) => {
        const { name, party, position, email, image } = politician;
        const opinion = politician.opinions.find(
          (opinion) => opinion.issue_id?.toString() === _id.toString()
        );

        return {
          name,
          party,
          position,
          email,
          image,
          opinion: opinion.opinion,
        };
      });
      const formattedIssue = { id: _id, title, content, opinions };

      return res
        .status(200)
        .json({ message: "Successfully find issue", data: formattedIssue });
    } catch (err) {
      next(err);
    }
  },
};
