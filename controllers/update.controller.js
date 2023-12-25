const Issue = require("../models/issue.model");
const Politician = require("../models/politician.model");

/*
  politicians: [
    {
      name: "김진태",
      opinion: "찬성",
    },
    {
      name: "김성태",
      opinion: "반대",
    },
  ]
*/

module.exports = {
  updateIssue: async (req, res, next) => {
    try {
      const { title, content, politicians } = req.body;
      if (!title || !content || !politicians)
        return res.status(400).send("Request body is missing");

      // Check if issue already exists
      const existingIssue = await Issue.findOne({ title: title });
      if (existingIssue) {
        return res.status(403).json({ messages: "Issue already exists" });
      }

      // Create a new issue
      const newIssue = new Issue({ title, content });
      await newIssue.save();

      // Process politicians
      await Promise.all(
        politicians.map(async (politician) => {
          const { name, opinion } = politician;
          let foundPolitician = await Politician.findOne({ name: name });

          if (!foundPolitician) {
            // Create a new politician
            const newPolitician = new Politician({
              name: name,
              opinions: [{ issue_id: newIssue._id, opinion: opinion }],
            });
            await newPolitician.save();
          } else {
            foundPolitician.opinions.push({
              issue_id: newIssue._id,
              opinion: opinion,
            });
            await foundPolitician.save();
          }
        })
      );

      // Send response
      return res.status(201).json({ newIssue, politicians });
    } catch (err) {
      next(err);
    }
  },

  updatePolitician: async (req, res, next) => {
    const { name, party, position, email, image } = req.body;
    if (!name || !party || !position || !email || !image)
      return res.status(400).send("Request body is missing");

    try {
      Politician.findOne({ name: req.body.name })
        .then(async (politician) => {
          // update if politician already exists
          politician.name = name || politician.name;
          politician.party = party || politician.party;
          politician.position = position || politician.position;
          politician.email = email || politician.email;
          politician.image = image || politician.image;
          await politician.save();
          return res.status(201).json({ politician });
        })
        .catch(async (err) => {
          // create new politician if not exists
          const politician = new Politician({
            name,
            party,
            position,
            email,
            image,
          });
          await politician.save();
          return res.status(201).json({ politician });
        });
    } catch (err) {
      next(err);
    }
  },
};
