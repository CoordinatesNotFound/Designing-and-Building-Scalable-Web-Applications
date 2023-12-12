import Courses from "../components/Courses.svelte";
import Questions from "../components/Questions.svelte";
import Answers from "../components/Answers.svelte";

const routes = {
  '/': Courses,
  '/courses/:id/questions': Questions,
  '/courses/:cId/questions/:qId/answers': Answers,
}

export default routes;
