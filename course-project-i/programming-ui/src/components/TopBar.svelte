
<script>
    import { userUuid } from "../stores/stores.js";

    export let points;
  
</script>
  
<nav>
    <span>Hello {$userUuid}!<br/></span>
    <span id="points">Points: {points}</span>
</nav>
  
<style>
    nav {
      @apply p-4 mb-4 shadow;
    }
  
    span {
      @apply text-2xl text-gray-700 font-serif;
    }
</style>