import OpenAI from "openai";
import puppeteer from "puppeteer";
import { extractNumber } from "../util/extractNumber";
import fs from "fs";

export type Reviews = {
  reviews: {
    reviewerName: string | undefined;
    review: string | undefined;
  }[];
};

const openai = new OpenAI({
  apiKey: "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",
});

const url =
  "https://2gis.kz/almaty/inside/9430047374968855/firm/70000001032609883/tab/reviews?m=76.905052%2C43.230401%2F19.86";

async function main() {
  // const params: OpenAI.Chat.ChatCompletionCreateParams = {
  //   messages: [
  //     {
  //       role: "user",
  //       content: `Проанализируйте эти отзывы об одной из кофеен. На каждый отзыв создайте метрики со значениями от 1 до 3, где 1 — очень плохая метрика, 2 — средняя и 3 — хорошая. Например: 'Отзыв 1: качество еды: 2, обслуживание: 3, атмосфера: 1.'. Сами параметры метрик не должны быть в точности как в моем примере, они должны зависеть от отзыва Вот отзывы: ${[
  //         ...reviews,
  //       ]}`,
  //     },
  //   ],
  //   model: "gpt-3.5-turbo",
  // };
  // const chatCompletion: OpenAI.Chat.ChatCompletion =
  //   await openai.chat.completions.create(params);
  // console.log(chatCompletion.choices);
}

main();

const scrape2GISPage = async (url: string) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url);

  const data: Reviews = {
    reviews: [],
  };

  const reviews = await page.evaluate(() => {
    return document.querySelector("._1xhlznaa")?.textContent?.trim();
  });

  const totalReviews = extractNumber(reviews!)!;

  const pagesToScrape = Math.ceil(totalReviews / 12);

  for (let i = 0; i < pagesToScrape; i++) {
    await page.waitForSelector("._1iczexgz");
    await page.click("._1iczexgz");

    await new Promise((resolve) => setTimeout(resolve, 500));
    
    console.log(`${Math.floor((i / pagesToScrape) * 100)}% has been parsed`);

    const reviews = await page.$$eval("._11gvyqv", (elements) =>
      elements.map((e) => {
        const reviewerName = e.querySelector("._er2xx9")?.textContent?.trim();
        const review = e.querySelector("._49x36f")?.textContent?.trim();

        return {
          reviewerName,
          review,
        };
      })
    );

    // console.log(reviews)
    const newReviews = reviews.slice(i * 12);

    data.reviews.push(...newReviews);
  }
  console.log(data.reviews, data.reviews.length);

  fs.writeFileSync("reviews.json", JSON.stringify(data));

  await browser.close();
};

scrape2GISPage(url);

