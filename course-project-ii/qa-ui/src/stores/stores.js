import { readable, writable } from "svelte/store";

// user
let user = localStorage.getItem("userUuid");

if (!user) {
  user = crypto.randomUUID().toString();
  localStorage.setItem("userUuid", user);
} 

export const userUuid = readable(user);

// // has posted question

// let storedHasPostedQuestion = localStorage.getItem("hasPostedQuestion")

// if(!storedHasPostedQuestion) {
//   storedHasPostedQuestion = new Date();
//   localStorage.setItem("hasPostedQuestion", storedHasPostedQuestion);
// }

// const hasPostedQuestion = writable(storedHasPostedQuestion)

// hasPostedQuestion.subscribe(value => {
//   localStorage.setItem("hasPostedQuestion", value);
// })


// // has posted answer

// let storedHasPostedAnswer = localStorage.getItem("hasPostedAnswer")

// if(!storedHasPostedAnswer) {
//   storedHasPostedAnswer = true;
//   localStorage.setItem("hasPostedAnswer", storedHasPostedAnswer);
// }

// const hasPostedAnswer = writable(storedHasPostedAnswer)

// hasPostedAnswer.subscribe(value => {
//   localStorage.setItem("hasPostedAnswer", value);
// })

// export {userUuid, hasPostedQuestion, hasPostedAnswer};
