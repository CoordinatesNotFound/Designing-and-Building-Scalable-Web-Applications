<script>
    import { link } from 'svelte-spa-router';


    const getCourses = async () => {
        const response = await fetch(`/api/courses`);
        return await response.json();
    };

    let coursesPromise = getCourses();

    
</script>

<h1 class="text-3xl font-bold mb-4">Course List</h1>


{#await coursesPromise}
    <div class="text-gray-700">Loading course list...</div>
{:then courses}
    {#if courses == null}
        <div class="text-green-500">No couses available</div>
    {:else}
        <ul>
            {#each courses as course}
                <li>
                    <a class="text-black-500 hover:underline" use:link={`/courses/${course.id}/questions`}>{course.name}</a>
                </li>
            {/each}
        </ul>
    {/if}
{/await}



<style>
    h1 {
        @apply text-3xl font-bold mb-4;
        margin-top: 30px;
        margin-bottom: 30px;
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
</style>


