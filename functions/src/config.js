const fs = require("fs");
const path = require("path");

const file = fs.readFileSync(path.join(__dirname, "../config.json")).toString();

module.exports = JSON.parse(file);
