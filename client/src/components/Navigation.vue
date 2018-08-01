<template>
  <div class="nav">
    <div class="nav-left">
      <a :href="`${url}`" class="logo">enamel</a>
    </div>
    <NavigationRight v-if="auth"></NavigationRight>
  </div>
</template>

<script>
import NavigationRight from './NavigationRight'

export default {
  components: {
    NavigationRight
  },
  props: ['auth'],
  data() {
    return {
      url: process.env.BASE_URL
    }
  }
}

</script>

<style scoped>
.nav {
  display: flex;
}

.nav-left {
  flex-grow: 1;
}

.nav > div {
  overflow: hidden;
  padding: 10px 10px;
  cursor: pointer;
}

.logo {
  font-size: 25px;
  font-family: 'Questrial', sans-serif;
  letter-spacing: 3px;
}
</style>
