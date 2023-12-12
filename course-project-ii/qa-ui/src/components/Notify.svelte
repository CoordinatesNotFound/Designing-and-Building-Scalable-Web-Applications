<script>
  export let message;
  export let type;
</script>

{#if message != null}
  {#if type == "error"}
    <div class="error">
      {message}
    </div>
  {:else}
    <div class="success">
      {message}
    </div>
  {/if}
{/if}

<style>
  .error {
    @apply text-red-500 bg-gray-200 text-lg border-solid border border-gray-300 rounded-lg p-4 mb-4;
  }

  .success {
    @apply text-green-500 bg-gray-200 text-lg border-solid border border-gray-300 rounded-lg p-4 mb-4;
  }
</style>