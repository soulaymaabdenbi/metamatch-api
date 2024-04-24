const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const urlArticle = "https://www.transfermarkt.com/statistics/rubrik/aktuell/32";

async function getHtml() {
  try {
    const response = await axios.get(urlArticle, {
      headers: {
        "User-Agent": generateRandomUserAgent(),
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching HTML:", error);
    throw error;
  }
}

function generateRandomUserAgent() {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

async function scrapeArticles() {
  try {
    const html = await getHtml();
    const $ = cheerio.load(html);

    const articleData = [];

    $(".newsticker__box").each((index, element) => {
      // Skip the first two articles
      if (index < 2) return;

      const articleUrl = $(element).find(".newsticker__link").attr("href");
      const publicationDate = $(element)
        .find(".newsticker__boxheader")
        .text()
        .trim();
      const priceRange = $(element).find(".newsticker__subline").text().trim();

      const headlineBox = $(element).find(".newsticker__headline-box");
      const subline = headlineBox.find(".newsticker__subline").text().trim();
      const headline = headlineBox.find(".newsticker__headline").text().trim();

      const imageUrl = $(element).find(".foto").attr("src");

      const completeArticleUrl = "https://www.transfermarkt.com" + articleUrl;

      const article = {
        articleUrl: completeArticleUrl,
        publicationDate,
        priceRange: priceRange || "N/A",
        subline: subline || "N/A",
        headline: headline || "N/A",
        imageUrl: imageUrl || "N/A",
      };

      articleData.push(article);
    });

    await saveArticles(articleData);

    console.log("Article data saved successfully.");
  } catch (error) {
    console.error("Error scraping articles:", error);
    throw error;
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

exports.startScrapingArticles = async () => {
  try {
    while (true) {
      await scrapeArticles();
      await delay(5000);
    }
  } catch (error) {
    console.error("Error during scraping:", error);
  }
};

async function saveArticles(articles) {
  try {
    await fs.promises.writeFile(
      "articleData.json",
      JSON.stringify(articles, null, 2)
    );
    console.log("Article data saved successfully.");
  } catch (error) {
    console.error("Error saving articles:", error);
    throw error;
  }
}

module.exports = { scrapeArticles };
