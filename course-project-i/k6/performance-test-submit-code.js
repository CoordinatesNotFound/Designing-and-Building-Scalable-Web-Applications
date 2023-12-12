import http from "k6/http";

export const options = {
  duration: "5s",
  vus: 10,
  summaryTrendStats: ["med", "p(99)"],
};

export default function () {
    http.post(
      "http://localhost:7800/api/submission",
      JSON.stringify({
        user: `user-${Math.floor(Math.random() * 1000)}`,
        assignment: 1,
        code: `performance-test-code-${Math.floor(Math.random() * 1000)}`,
      }),
    );
}