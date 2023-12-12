import http from "k6/http";

export const options = {
  duration: "5s",
  vus: 10,
  summaryTrendStats: ["med", "p(99)"],
};

export default function () {
    http.post(
      "http://localhost:7800/api/courses/1/questions",
      JSON.stringify({
        user_uuid: `user-${Math.floor(Math.random() * 100000000000)}`,
        content: `question-${Math.floor(Math.random() * 1000)}`,
      }),
    );
}