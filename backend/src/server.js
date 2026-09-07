const path = require("path");
const express = require("express");
const cors = require("cors");
const { port } = require("./config/env");

const app = express();
app.use(cors());
app.use(express.json());
// Vercel serves the separate frontend project. Locally and on Render, this
// service still serves the dashboard from the sibling frontend directory.
if (!process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, "../../frontend")));
}
app.use("/api", require("./routes"));
app.use((error, _req, response, _next) => {
  console.error(error);
  response.status(500).json({ error: "Internal server error" });
});

if (require.main === module) {
  app.listen(port, () => console.log(`NER Logistics API listening on ${port}`));
}

module.exports = app;

