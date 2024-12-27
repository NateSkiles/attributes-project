import "dotenv/config";
import { getJson } from "serpapi";
import OpenAI from "openai";
import ExcelJS from "exceljs";
import getEngineParameters from "./serpapi_utils.js";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const engines = [
  "google",
  "google_shopping",
  "google_product",
  "google_trends",
  "youtube",
  "youtube_video",
  "walmart",
];

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

async function getDescription(key) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant to help provide descriptions to attributes returned by SerpApi. Keep the descriptions brief, once sentence.\n\nDo not include the name of the property in the description. Your description will be used to help users understand the property listed in an excel spreadsheet.",
      },
      {
        role: "user",
        content: `Provide a brief description for the property: ${key}`,
      },
    ],
  });

  console.log(response.choices[0].message.content.trim());

  return response.choices[0].message.content.trim();
}

async function fetchSerpapiData(engine) {
  console.log("Fetching data for engine:", engine);
  const params = getEngineParameters(engine);
  const response = await getJson(params);

  return response;
}

async function writeToExcel(data) {
  const workbook = new ExcelJS.Workbook();

  for (const [engine, keys] of Object.entries(data)) {
    const worksheet = workbook.addWorksheet(engine);
    worksheet.columns = [
      { header: "Property Name", key: "key", width: 30 },
      { header: "Description", key: "description", width: 50 },
    ];

    const records = Object.entries(keys).map(([key, description]) => ({
      key,
      description,
    }));

    worksheet.addRows(records);
  }

  await workbook.xlsx.writeFile("serpapi_keys.xlsx");
}

function extractKeys(obj, path = "") {
  let keys = [];

  if (Array.isArray(obj)) {
    if (obj.length > 0) {
      // Include '[]' to represent an array and process the first element
      const newPath = path + "[]";
      keys.push(...extractKeys(obj[0], newPath));
    }
  } else if (obj !== null && typeof obj === "object") {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newPath = path ? `${path}.${key}` : key;
        if (typeof obj[key] === "object" && obj[key] !== null) {
          keys.push(...extractKeys(obj[key], newPath));
        } else {
          keys.push(newPath);
        }
      }
    }
  } else {
    keys.push(path);
  }

  return keys;
}

async function main() {
  const allKeys = {};
  for (const engine of engines) {
    const data = await fetchSerpapiData(engine);

    const keys = extractKeys(data);
    const uniqueKeys = [...new Set(keys)]; // Remove duplicates

    allKeys[engine] = {};
    for (const key of uniqueKeys) {
      allKeys[engine][key] = await getDescription(key);
    }
  }
  await writeToExcel(allKeys);
}

main().catch(console.error);
