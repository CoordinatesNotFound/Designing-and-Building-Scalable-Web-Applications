<script>
    import { userUuid, currentAssignment } from "../stores/stores.js";
    
    import {onMount, afterUpdate} from "svelte"

    import TopBar from "./TopBar.svelte"

    let updatedResult = null;
    let eventSource;

    const assignmentNumber = 3;
    let code = "";

    let submissionId = 0;

    let isBeingGraded = 0;

    let points = ($currentAssignment-1)*100;



    onMount(() => {
        
        // close sse when components being destroyed
        return () => {
            if(eventSource){
                if (eventSource.readyState === 1) {
                    console.log(submissionId,"sse connection closed (client side)")
                    eventSource.close();
                }
            }
        }
    })



    afterUpdate(() => {
        
        if(eventSource){
            console.log("readyState", eventSource.readyState)
        }
        
        if(submissionId > 0 ){
            // don't build repetitive sse connection
            if(eventSource && (eventSource.readyState == 1 || eventSource.readyState == 0)){
                if(updatedResult && updatedResult["status"] === "processed"){
                    console.log(submissionId,"code graded, closing sse connection...");
                    console.log(submissionId,"sse connection closed (client side)");
                    eventSource.close();
                }
                return;
            }else{
                if(updatedResult && updatedResult["status"] === "processed"){
                    return;
                }
                // build a new sse connection, binding with sumissionId
                eventSource = new EventSource(`/api/sse/${submissionId}`);
                console.log(submissionId,"sse connection open (client side)")
                eventSource.onmessage = (event) => {
                    console.log(submissionId,"sse event received")
                    updatedResult = JSON.parse(event.data);
                    isBeingGraded = 0;
                };

                eventSource.onerror = (event) => {
                    console.log(event);
                };
            }
        }
    } )



    const getAssignement = async () => {
        
        if ($currentAssignment > assignmentNumber) {
            return null;
        }
        const response = await fetch(`/api/assignment/${$currentAssignment}`);
        return await response.json();
    };

    let assignmentPromise = getAssignement();
    

    const submitCode = async (assignmentId) => {
        if (code.length === 0 || isBeingGraded === 1) {
            return;
        }


        const newSubmission = {
            user: $userUuid,
            code: code,
            assignment: assignmentId,
        };

        const response = await fetch("/api/submission", {
            method: "POST",
            body: JSON.stringify(newSubmission),
        });

        updatedResult = null;
 

        const res = await response.json();

        if(eventSource){
            if (eventSource.readyState === 1 || eventSource.readyState === 0) {
                console.log(submissionId,"sse connection closed (client side)")
                eventSource.close();
            }
        }

        submissionId = res.submissionId;

        isBeingGraded = 1;

       
    };

    const goToNextAssignment = async () => {
        $currentAssignment++;
        points = ($currentAssignment-1)*100;

        
        if(eventSource){
            if (eventSource.readyState === 1 || eventSource.readyState === 0) {
                console.log(submissionId,"sse connection closed (client side)")
                eventSource.close();
            }
        }
        updatedResult = null;
        submissionId = 0;
        code = ""
        assignmentPromise = getAssignement();
    };


</script>

<TopBar points={points}/>

<h1 class="text-3xl font-bold mb-4">Programming Assignments</h1>

{#await assignmentPromise}
    <div class="text-gray-700">Loading assignment...</div>
{:then assignment}
    {#if assignment == null}
        <div class="text-green-500">You have completed all of the assignments!</div>
    {:else}
        <div id="assignment" class="mb-8">
            <h2 class="text-2xl font-bold mb-4">Assignment-{$currentAssignment}: {assignment.title}</h2>
            <p>{assignment.handout}</p>
            <input type="textarea" bind:value={code} />
            <button class="bg-blue-500" on:click={() => submitCode(assignment.id)} disabled={isBeingGraded === 1}>
                Submit code for grading
            </button>
        </div>
        <div>
            <h2 class="text-2xl font-bold mb-4">Result</h2>
            {#if updatedResult != null}
                <div id="result">
                    <p class={updatedResult["correct"] ? 'bg-green-200' : 'bg-red-200'}><b>status: </b>{updatedResult["status"]}</p>
                    <p class={updatedResult["correct"] ? 'bg-green-200' : 'bg-red-200'}><b>grader_feedback: </b>{updatedResult["graderFeedback"]}</p>
                    <p id="correctness" class={updatedResult["correct"] ? 'bg-green-200' : 'bg-red-200'}><b>{updatedResult["correct"] ? "Correct!": "Incorrect"}</b></p>
                    {#if $currentAssignment <= assignmentNumber && updatedResult["correct"] == true}
                        <button id="next" class="bg-green-500" on:click={goToNextAssignment}>
                            Next Assignment
                        </button> 
                    {/if}     
                </div>
            {/if}
            {#if isBeingGraded === 1}
                <p class="bg-gray-200">Code submitted, waiting for grading result...</p>
                <p class="bg-gray-200">You may not submit code again until the previously submitted one is graded.</p>
            {/if}
        </div>
        
       
    {/if}
{/await}

<style>
    input { 
        @apply w-full border rounded p-2 h-40;
    }


    button {
        @apply text-white px-4 py-2 rounded mt-4;
    }

    p{
        @apply text-gray-800 p-2 rounded mb-2;
    }
</style>
