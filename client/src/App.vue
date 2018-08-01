<template>
  <div id="app" @click="$store.dispatch('changeActiveWidget', null)">
    <router-view></router-view>
  </div>
</template>
