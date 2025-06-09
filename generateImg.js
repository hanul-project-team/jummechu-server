import StoreImg from "./models/storeImg.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import connect from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const delay = ms => new Promise(res => setTimeout(res, ms));

const keywords = ["Japanese cuisine", "Korean cuisine", "Fast food", "Fried chicken", "Pizza", "Hamburger", "Steak", "Shabu-shabu", "Noodles", "Sushi"];

async function generateImage(keyword, index) {
  const filename = `${Date.now()}-${index + 1}.png`;
  const filePath = path.join(__dirname, "static", filename);

  try {
    const response = await axios.post(
      `https://sbs24-mbof1aly-swedencentral.cognitiveservices.azure.com/openai/deployments/dall-e-3/images/generations?api-version=2024-02-01`,
      {
        prompt: `A close-up, realistic photo of only ${keyword} on a plate, taken at a real restaurant with natural lighting. No background clutter — just the food in focus.`
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );
    console.log(response.data);
    const imageUrl = response.data.data[0].url;

    const res = await axios.get(imageUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, res.data);

    await StoreImg.create({
      keyword,
      url: `http://localhost:3000/static/${filename}`,
    });

    console.log(`생성 완료`);
  } catch (err) {
    console.error(`생성 실패:`, err.message);
  }
}

(async () => {
  try {
    await connect();
    for (const keyword of keywords) {
      for (let i = 0; i < 5; i++) {
        await generateImage(keyword, i);
        await delay(20000);
      }
    }
    console.log("모든 이미지 생성 완료");
  } catch (err) {
    console.error(err);
  }
})();
