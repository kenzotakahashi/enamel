<template>
  <div class="close-button" v-bind:class="{hidden}"
    @click.stop="$emit('click')">
    <svg fill="currentColor" :height="size || 16" :width="size || 16" viewBox="0 0 16 16">
      <path d="M8 7.5L4.5 4l-.5.5L7.5 8 4 11.5l.5.5L8 8.5l3.5 3.5.5-.5L8.5 8 12 4.5l-.5-.5L8 7.5z"></path>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'close-button',
  props: ['size', 'hidden']
}
</script>

<style scoped>
.close-button {
  display: flex;
  transition: all 0.1s ease-out;
  cursor: pointer;
  z-index: 1;
}

.hidden {
  visibility: hidden;  
}

.close-button:hover {
  color: #409EFF;
}

</style>