import fetch from "node-fetch";
import puppeteer from "puppeteer";

// 🔹 STEP 1: Launch puppeteer and grab cookies from NSE

async function getFreshCookie() {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-http2",
      "--disable-features=NetworkService",
    ],
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
  );

  // Load NSE homepage
  await page.goto("https://www.nseindia.com", { waitUntil: "domcontentloaded" });

  // Wait 5s so NSE sets cookies
  await new Promise(r => setTimeout(r, 5000));

  const cookies = await page.cookies();
  await browser.close();

  return cookies.map(c => `${c.name}=${c.value}`).join("; ");
}



// 🔹 STEP 2: Use cookies to fetch API
async function run() {
  const url =
    "https://www.nseindia.com/api/quote-equity?symbol=RVNL&section=trade_info";

  console.log("👉 Launching browser to grab fresh cookie...");
  const cookieHeader = await getFreshCookie();

  console.log("✅ Got Cookie, fetching NSE data...");

  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      pragma: "no-cache",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      referer: "https://www.nseindia.com/",
      cookie: cookieHeader,
    },
  });

  const data = await res.json().catch(() => null);

  if (data) {
    console.log("🎯 NSE JSON Data:\n", data);
  } else {
    console.log("❌ Failed: Got HTML instead of JSON.");
  }
}

run();
