import http from "k6/http";

export const options = {
  duration: "5s",
  vus: 10,
  summaryTrendStats: ["med", "p(99)"],
};

export default function () {
    http.post(
      "http://localhost:7800/api/questions/1/answers",
      JSON.stringify({
        user_uuid: `user-${Math.floor(Math.random() * 100000000000)}`,
        content: `answer-${Math.floor(Math.random() * 1000)}`,
      }),
    );
}