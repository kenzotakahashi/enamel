<template>
  <div class="plus-button"
    @click.stop="$emit('click')">
    <svg :height="size || 16" :width="size || 16" viewBox="0 0 15 15">
      <g fill-rule="evenodd">
        <path :fill="circleColor[color]" d="M7.5 15a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15zm0-1a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13z"></path>
        <path :fill="plusColor[color]" d="M7 7H4v1h3v3h1V8h3V7H8V4H7v3z" id="plus_light_icon" ></path>
      </g>
    </svg>
  </div>
</template>

<script> 
export default {
  name: 'plus-button',
  props: ['size', 'color'],
  data() {
    return {
      circleColor: {
        'white': 'rgba(255,255,255,.6)',
        'grey': 'rgba(0, 0, 0, 0.32)',
      },
      plusColor: {
        'white': '#fff',
        'grey': 'rgba(0, 0, 0, 0.32)',

      }      
    }
  }
}
</script>

<style scoped>
.plus-button {
  display: flex;
  cursor: pointer;
  width: 16px;
  height: 16px;
}


</style>