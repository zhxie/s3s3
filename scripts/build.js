const fs = require("fs");

const script = fs.readFileSync("s3s3.js", "utf-8");
const template = fs.readFileSync("template.scriptable", "utf-8");

const output = JSON.parse(template);
output["script"] = script;

fs.writeFileSync("s3s3.scriptable", JSON.stringify(output, null, 2), "utf-8");
