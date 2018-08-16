<template>
  <div id="app" @click="$store.commit('changeActiveWidget', null)">
    <router-view></router-view>
  </div>
</template>