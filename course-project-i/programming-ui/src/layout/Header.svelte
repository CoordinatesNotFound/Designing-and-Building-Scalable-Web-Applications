<script>
  import { userUuid } from "../stores/stores.js";
  // import {writable} from "svelte/store"

  // let storedCurrentAssignment = localStorage.getItem("currentAssignment");

  // if(!storedCurrentAssignment){
  //   storedCurrentAssignment = 1;
  // }
  // const currentAssignment = writable(parseInt(storedCurrentAssignment, 10))

  // let points = 0;
  // currentAssignment.subscribe(value => {
  //   points = (value - 1) * 100
  // })

</script>

<nav class="p-4 mb-4 shadow">
  <span class="text-2xl text-gray-700 font-serif">Hello {$userUuid}!<br/></span>

</nav>
