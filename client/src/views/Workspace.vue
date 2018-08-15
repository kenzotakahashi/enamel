<template>
  <div>

    <div class="container">
      <aside class="tree-root">
        <div v-if="getTeam.id" class="tree-item"
            @click.left.stop="$router.push({name: 'folder', params: {id: getTeam.id}})">
          <div class="tree-plate"  v-bind:class="{active: $route.params.id === getTeam.id}">
            <div class="circle"></div>
            <span class="folder no-select-color teamname">{{ getTeam.name }}</span>
          </div>
        </div>

      </aside>

      <div class="workspace-main">
        <router-view :key="$route.fullPath"></router-view>
      </div>

    </div>

  </div>

</template>

<script>
import { GetTeam } from '../constants/query.gql'

export default {
  data() {
    return {
      getTeam: {},
    }
  },
  apollo: {
    getTeam: {
      query: GetTeam,
    },
  },
}
</script>

<style scoped>
.container {
  width: 100%;
  height: calc(100% - 52px);
}

.plus-button {
  position: absolute;
  right: 0;
  top: 7px;
  margin: 0 2px;
}

aside {
  width: 220px;
  height: 100%;
  display: inline-block;
}

.workspace-main {
  flex: 1 1;
}
</style>