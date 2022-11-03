const fs = require("fs");
const csv = require("csv-parser");
const sha256 = require("sha256");
const path = "HNGi9 CSV FILE - Sheet1.csv";

require("dotenv").config({ path: ".env" });

fs.writeFileSync(
  "nft.csv",
  "Serial Number,Name,UUID,Hash\n",
  function (err) {
    if (err) {
      console.log(err);
    } else {
      return;
    }
  }
);


const result = [];
//parse csv into JSON using the csvparser
fs.createReadStream(path)
  .pipe(csv({}))
  .on("data", (data) => result.push(data))
  .on("end", () => {
    // write the json output of the csv file into a json file in the root of the directory
    fs.writeFileSync("nft.json", JSON.stringify(result));
    for (let i = 0; i < result.length; i++) {
      const jsonObj = result[i];
      const keys = Object.keys(jsonObj);
      let attributes = [];
      // For every key containing the words attrbute
      // the name and the value is extracted and added to the CHIP_0007 compatible json
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let obj = {};
        if (key.includes("Attribute")) {
          obj[key] = jsonObj[key];
          attributes.push(obj);
        }
      }
      const formattedObj = {
        format: "CHIP-0007",
        name: "All team naming",
        description: jsonObj["description"],
        minting_tool: "",
        sensitive_content: false,
        series_number: jsonObj["Series Number"],
        series_total: result.length,
        attributes: [Object.keys(...attributes)],
        collection: {
          name: jsonObj["Filename"],
          id: jsonObj["UUID"],
          attributes: [attributes],
        },
      };

      // final JSON object after hashing the previous json using SHA256
      finalObject = {
        ...formattedObj,
        data: {
          hash: jsonObj["Filename"]
            ? sha256(JSON.stringify(formattedObj) + process.env.SHA256_SECRET)
            : "",
        },
      };

      fs.appendFileSync(
        "nft.csv",
        `${jsonObj["Series Number"]},${
          finalObject.collection.name ? finalObject.collection.name : ""
        },${jsonObj["UUID"] ? jsonObj["UUID"] : ""},${finalObject.data.hash}\n`,
        function (err) {
          if (err) {
            console.log(err);
          } else {
            return;
          }
        }
      );
    }
  });

