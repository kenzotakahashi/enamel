<template>
  <div class="remove-button" @click="$emit('click')">
    <svg fill="currentColor" height="16" width="16" viewBox="0 0 16 16">
      <path d="M8.844 8l2.981-2.973a.593.593 0 0 0 0-.84.599.599 0 0 0-.844 0l-2.977 2.97L5.03 4.173a.593.593 0 0 0-.84 0 .598.598 0 0 0 0 .845l2.97 2.977-2.985 2.977a.592.592 0 0 0 0 .84c.232.233.61.233.844 0L8 8.84l2.977 2.985a.592.592 0 0 0 .84 0 .599.599 0 0 0 0-.843L8.844 8z" fill-rule="evenodd"></path>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'remove-button',
}
</script>


<style scoped>
.remove-button {
  visibility: hidden;
  display: block;
  width: 12px;
  height: 12px;
  position: absolute;
  right: -4px;
  top: -4px;
  padding: 1px;
  background-color: rgba(0, 0, 0, 0.9);
  border: 2px solid white;
  border-radius: 50%;
  color: #fff;
  transition: all 0.1s ease-out;
  cursor: pointer;
  z-index: 1;
}

.remove-button svg {
  color: #fff;
  display: block;
  width: 12px;
  height: 12px;
}
</style>