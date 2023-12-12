const { test, expect } = require("@playwright/test");

test("Server responds with a page with the title 'Programming assignments'", async ({ page }) => {
  await page.goto("/");
  expect(await page.title()).toBe("Programming assignments");
});

test("Create a submission that fails the tests", async ({ page }) => {
  //localStorage.clear();
  await page.goto("/");
  await page.waitForSelector('#assignment',{timeout:20000});
  const code = "incorrect submission";
  await page.locator("input[type=textarea]").type(code);
  await page.locator("button").click();
  await page.waitForSelector('#result');
  await expect(page.locator("#correctness")).toHaveText("Incorrect");
});

test("Create a submission that passes the tests", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector('#assignment');
  const code = "def hello(): return 'Hello'";
  await page.locator("input[type=textarea]").type(code);
  await page.locator("button").click();
  await page.waitForSelector('#result', {timeout:100000});
  await expect(page.locator("#correctness")).toHaveText("Correct!");
});

test("Create a submission that passes the tests and then move to next assignment", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector('#assignment');
  await expect(page.locator("#assignment")).toHaveText("Assignment-1: Hello Write a function \"hello\" that returns the string \"Hello\"  Submit code for grading")
  const code = "def hello(): return 'Hello'";
  await page.locator("input[type=textarea]").type(code);
  await page.locator("button").click();
  await page.waitForSelector('#result', {timeout:100000});
  await expect(page.locator("#correctness")).toHaveText("Correct!");
  await page.locator("button >> text='Next Assignment'").click();
  await expect(page.locator("#assignment")).toHaveText("Assignment-2: Hello world Write a function \"hello\" that returns the string \"Hello world!\"  Submit code for grading")
});

test("Points shown to the user change when the user solves a programming assignment", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector('#assignment');
  await expect(page.locator("#points")).toHaveText("Points: 0")
  const code = "def hello(): return 'Hello'";
  await page.locator("input[type=textarea]").type(code);
  await page.locator("button").click();
  await page.waitForSelector('#result', {timeout:100000});
  await expect(page.locator("#correctness")).toHaveText("Correct!");
  await page.locator("#next").click();
  await expect(page.locator("#points")).toHaveText("Points: 100")
});

//There are at least three end to end tests written with Playwright. The tests cover
// (1) creating a submission that fails the tests and checking the feedback on incorrect submission,
// (2) creating a submission that passes the tests and checking the notification on the correctness of the submission, 
// (3) creating a submission that passes the tests, checking the notification on the correctness of the submission, 
      //moving to the next assignment, and checking that the assignment is a new one.
// verify that the points shown to the user change when the user solves a programming assignment.