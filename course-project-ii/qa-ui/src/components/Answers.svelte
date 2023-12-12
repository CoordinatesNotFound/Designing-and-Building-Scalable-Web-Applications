<script>
    import { link } from "svelte-spa-router";
    import InfiniteScroll from "svelte-infinite-scroll";
    import { userUuid } from "../stores/stores.js";
    import { onMount } from "svelte";
    import Notify from "./Notify.svelte";

    export let params = {};

    let page = 0;
    let size = 20;
    let loadedAnswers = [];
    let allAnswers = [];

    let messageError = null;
    let messageSuccess = null;

    let eventSource;

    onMount(() => {
        // set up sse connection
        eventSource = new EventSource(`/sse/questions/${params.qId}`);

        // listen for message
        eventSource.addEventListener("message", (event) => {
            const data = JSON.parse(event.data);
            if (
                data.type === "answer" &&
                !allAnswers.some((q) => q.id === data.id)
            ) {
                console.log("update answers via sse...", data);
                allAnswers = [data, ...allAnswers];
                loadedAnswers = [...allAnswers.slice(0, size * (page + 1))];
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

    // get question info
    const getQuestion = async () => {
        const response = await fetch(`/api/questions/${params.qId}`);
        return await response.json();
    };

    let questionPromise = getQuestion();

    // get answer list
    const getAnswers = async () => {
        const response = await fetch(`/api/questions/${params.qId}/answers`);

        allAnswers = await response.json();
        page = 0;
        loadedAnswers = [...allAnswers.slice(size * page, size * (page + 1))];

        console.log(loadedAnswers);
        return allAnswers;
    };

    let answersPromise = getAnswers();

    // add answer
    let content = "";

    const addAnswer = async () => {
        if (content.length == 0) {
            return;
        }

        const newAnswer = {
            content,
            user_uuid: $userUuid,
        };

        const response = await fetch(`/api/questions/${params.qId}/answers`, {
            method: "POST",
            body: JSON.stringify(newAnswer),
        });

        answersPromise = getAnswers();

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
        messageSuccess = "You created the answer successfully!";
        setTimeout(() => {
            messageSuccess = null;
        }, 5000);
    };

    // upvote
    const upvote = async (answer_id) => {
        // check whether has voted
        const voted = await fetch(
            `/api/answers/${answer_id}/vote/${$userUuid}`,
        );
        const votedData = await voted.json();

        // voted before
        if (votedData.voted) {
            messageError = "You've already upvoted this answer.";
            setTimeout(() => {
                messageError = null;
            }, 5000);

            return;
        }

        // update answer votes
        await fetch(`/api/answers/${answer_id}`, {
            method: "PUT",
            body: JSON.stringify({ user_uuid: $userUuid }),
        });

        answersPromise = getAnswers();

        // notify success
        messageSuccess = "You voted the answer successfully!";
        setTimeout(() => {
            messageSuccess = null;
        }, 5000);
    };

    // load more pages
    const loadMorePage = () => {
        console.log(page);
        if (page > allAnswers.length / size) {
            return;
        }
        page++;
        loadedAnswers = [
            ...loadedAnswers,
            ...allAnswers.slice(size * page, size * (page + 1)),
        ];
    };
</script>

<nav>
    <span>
        <a class="text-blue-500 hover:underline" use:link={"/"}>Home</a>
    </span>
    <span>
        <a class="text-blue-500 hover:underline" use:link={`/courses/${params.cId}/questions`}>Back</a>
    </span>
</nav>

{#await questionPromise}
    <div class="text-gray-700">Loading question info...</div>
{:then question}
    {#if question == null}
        <div class="text-red-500">Question info not found</div>
    {:else}
        <h1 class="text-3xl font-bold mb-4">Question: {question.content}</h1>
        <div class="mr-4">
            <span class="text-gray-500">
                votes: {question.votes}
            </span><br/>
            <span class="text-gray-500">
                created at: {question.created_at}
            </span>
        </div>
    {/if}
{/await}

<h2>Answers</h2>

<Notify message={messageError} type="error" />
<Notify message={messageSuccess} type="success" />

<div class="create">
    <input type="text" bind:value={content} />
    <button id="create-button" on:click={addAnswer}>Add answer</button>
</div>

{#await answersPromise}
    <div class="text-gray-700">Loading answers...</div>
{:then answers}
    {#if loadedAnswers == null || loadedAnswers.length == 0}
        <div class="text-red-500">No answers available</div>
    {:else}
        <ul>
            {#each loadedAnswers as answer}
                <li>
                    <div class="item">
                        <div class="content">
                            {answer.content}
                        </div>
                        <div class="vote">
                            <div class="mr-4">
                                <span class="text-gray-500">
                                    votes: {answer.votes}
                                </span>
                            </div>
                        </div>
                        <button on:click={() => upvote(answer.id)}
                            >upvote</button
                        >
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

    nav span {
        margin-right: 20px;
    }

    h1 {
        @apply text-3xl font-bold mb-4;
        margin-top: 30px;
        margin-bottom: 30px;
    }

    h2 {
        @apply text-2xl font-bold mb-4;
        margin-top: 20px;
        margin-bottom: 20px;
    }

    input {
        @apply flex-grow border border-gray-300 p-2 mr-2;
    }

    li {
        @apply py-4;
    }

    ul {
        /* We need to limit the height and show a scrollbar */
        height: 500px;
        overflow: auto;

        @apply divide-y divide-gray-300;
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
