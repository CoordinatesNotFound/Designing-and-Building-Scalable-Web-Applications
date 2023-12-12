<script>
    import { link } from "svelte-spa-router";
    import InfiniteScroll from "svelte-infinite-scroll";
    import { userUuid } from "../stores/stores.js";
    import { onMount } from "svelte";
    import Notify from "./Notify.svelte";

    export let params = {};

    let page = 0;
    let size = 20;
    let loadedQuestions = [];
    let allQuestions = [];

    let messageError = null;
    let messageSuccess = null;

    let eventSource;

    onMount(() => {
        // set up sse connection
        eventSource = new EventSource(`/sse/courses/${params.id}`);

        // listen for message
        eventSource.addEventListener("message", (event) => {
            console.log("event", event);
            const data = JSON.parse(event.data);
            if (
                data.type === "question" &&
                !allQuestions.some((q) => q.id === data.id)
            ) {
                console.log("update questions via sse...", data);
                allQuestions = [data, ...allQuestions];
                loadedQuestions = [...allQuestions.slice(0, size * (page + 1))];
                console.log(loadedQuestions)
            }
        });

        // close sse connection
        window.onbeforeunload = () => {
            console.log("window unload close sse...");
            eventSource.close();
        };

        return () => {
            console.log("destroy close sse");
            eventSource && eventSource.close();
        };
    });

    // get questions
    const getQuestions = async () => {
        const response = await fetch(`/api/courses/${params.id}/questions`);

        allQuestions = await response.json();

        page = 0;
        loadedQuestions = [...allQuestions.slice(0, size)];

        return allQuestions;
    };

    let questionsPromise = getQuestions();

    // add question
    let content = "";

    const addQuestion = async () => {
        // input length check
        if (content.length == 0) {
            return;
        }

        // create question
        const newQuestion = {
            content,
            user_uuid: $userUuid,
        };

        const response = await fetch(`/api/courses/${params.id}/questions`, {
            method: "POST",
            body: JSON.stringify(newQuestion),
        });

        questionsPromise = getQuestions();

        // error
        if (!response.ok) {
            if (response.status === 429) {
                // < 1 min, too many requests
                const errorData = await response.json();
                messageError = errorData.error;
            } else {
                // other errors
                messageError = "An error occurred.";
            }
            setTimeout(() => {
                messageError = null;
            }, 5000);
            console.log("error: < 1 min");
            return;
        }

        content = "";

        // notify success
        messageSuccess = "You created a question successfully!";
        setTimeout(() => {
            messageSuccess = null;
        }, 5000);

        // generate 3 answers via llm
        const addedQuestionData = await response.json();

        await fetch("/api/llm-api", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                question_id: addedQuestionData.id,
                question: addedQuestionData.content,
                user_uuid: "llm",
            }),
        });
    };

    // upvote
    const upvote = async (question_id) => {
        // check whether has voted
        const voted = await fetch(
            `/api/questions/${question_id}/vote/${$userUuid}`,
        );
        const votedData = await voted.json();

        // voted before
        if (votedData.voted) {
            messageError = "You've already upvoted this question.";
            setTimeout(() => {
                messageError = null;
            }, 5000);
            return;
        }

        // update question votes
        await fetch(`/api/questions/${question_id}`, {
            method: "PUT",
            body: JSON.stringify({ user_uuid: $userUuid }),
        });

        questionsPromise = getQuestions();

        // notify success
        messageSuccess = "You voted the question successfully!";
        setTimeout(() => {
            messageSuccess = null;
        }, 5000);
    };

    const loadMorePage = () => {
        console.log("page:", page);
        if (page > allQuestions.length / size) {
            return;
        }
        page++;
        loadedQuestions = [
            ...loadedQuestions,
            ...allQuestions.slice(size * page, size * (page + 1)),
        ];
    };
</script>

<nav>
    <a class="text-blue-500 hover:underline" use:link={"/"}>Home</a>
</nav>

<h1 class="text-3xl font-bold mb-4">Questions</h1>

<Notify message={messageError} type="error" />
<Notify message={messageSuccess} type="success" />

<div class="create">
    <input type="text" bind:value={content} />
    <button id="create-button" on:click={addQuestion}>Add question</button>
</div>


{#await questionsPromise}
    <div class="text-gray-700">Loading questions...</div>
{:then questions}
    {#if loadedQuestions == null || loadedQuestions.length == 0}
        <div class="text-red-500">No questions available</div>
    {:else}
        <ul>
            {#each loadedQuestions as question}
                <li>
                    <div class="item">
                        <div class="content">
                            <a
                                class="text-black-500 hover:underline"
                                use:link={`/courses/${params.id}/questions/${question.id}/answers`}
                                >{question.content}</a
                            >
                        </div>
                        <div class="vote">
                            <div class="mr-4">
                                <span class="text-gray-500"
                                    >votes: {question.votes}</span
                                >
                            </div>
                            <button on:click={() => upvote(question.id)}
                                >upvote</button
                            >
                        </div>
                    </div>
                </li>
            {/each}
            <InfiniteScroll threshold={50} on:loadMore={loadMorePage} />
        </ul>
    {/if}
{/await}

<style>

    nav {
        @apply bg-gray-100 p-4;
    }

    h1 {
        @apply text-3xl font-bold mb-4;
        margin-top: 30px;
        margin-bottom: 30px;
    }

    input {
        @apply flex-grow border border-gray-300 p-2 mr-2;
    }

    ul {
		/* We need to limit the height and show a scrollbar */
		height: 500px;
		overflow: auto;

        @apply divide-y divide-gray-300;
	}

    li {
        @apply py-4;
    } 

    button {
        @apply px-4 py-2 bg-blue-500 text-white rounded-md;
    }



    .create {
        @apply flex mb-4;
    }

    .item {
        @apply flex items-center justify-between;
    }

    .content {
        @apply w-3/4;
    }

    .vote {
        @apply w-1/4 flex items-center justify-end;
    }


</style>
