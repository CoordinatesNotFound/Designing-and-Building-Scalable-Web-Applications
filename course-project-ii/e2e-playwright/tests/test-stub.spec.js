const { test, expect } = require("@playwright/test");

test("Server responds with a page with the title 'Questions and answers'", async ({ page }) => {
  await page.goto("/");
  expect(await page.title()).toBe("Questions and answers");
});

test("Create a question", async ({ page }) => {
  await page.goto("/#/courses/1/questions");
  const question = "test question";
  await page.locator("input[type=text]").type(question);
  await page.locator("#create-button").click();
  await expect(page.locator("ul li:first-child").locator("a")).toHaveText(question);
});

test("Create a answer", async ({ page }) => {
  await page.goto("/#/courses/1/questions/1/answers");
  const answer = "test answer";
  await page.locator("input[type=text]").type(answer);
  await page.locator("#create-button").click();
  await expect(page.locator("ul li:first-child").locator(".content")).toHaveText(answer);
});

test("Upvote a question", async ({ page }) => {
  await page.goto("/#/courses/1/questions");
  const firstQuestion = page.locator("ul li:first-child");
  await firstQuestion.locator("button").click();
  await expect(page.locator("ul li:first-child").locator(".vote").locator("div").locator("span")).toHaveText("votes: 1");
});

test("Upvote a answer", async ({ page }) => {
  await page.goto("/#/courses/1/questions/1/answers");
  const firstAnswer = page.locator("ul li:first-child");
  await firstAnswer.locator("button").click();
  await expect(page.locator("ul li:first-child").locator(".vote").locator("div").locator("span")).toHaveText("votes: 1");
});
