<template>
  <div>
    <navigation :auth="true"></navigation>

    <div class="container" :style="styleObj">
      <aside class="tree-root">
        <div v-if="getTeam.id" class="tree-item"
            @click.right.stop.prevent="$store.dispatch('changeActiveWidget', `folder${getTeam.id}`)"
            @click.left.stop="$router.push({name: 'folder', params: {id: getTeam.id}})">
          <div class="tree-plate"  v-bind:class="{active: $route.params.id === getTeam.id}">
            <div class="circle"></div>              
            <span class="folder no-select-color teamname">{{ getTeam.name }}</span>
            <plus-button @click="openModal('folder')" color="white"></plus-button>

            <div class="dropdown-content left" v-show="activeWidget === `folder${getTeam.id}`">
              <div @click="openModal('folder')">Add Folder</div>
            </div>
          </div>
        </div>

        <Tree
          v-for="folder in getFolders"
          :key="folder.id"
          :model="folder"
          :team="getTeam.id" >
        </Tree>
      </aside>

      <div class="workspace-main">
        <router-view :key="$route.fullPath"></router-view>
      </div>

      <FolderForm v-if="showModal" :config="modalConfig" @close="showModal = false"></FolderForm>
    </div>

  </div>

</template>

<script>
import { mapState } from  'vuex'
import Tree from '@/components/FolderTree'
import FolderForm from '@/components/FolderForm'
import { GetFolders, GetTeam } from '../constants/query.gql'

export default {
  components: {
    Tree,
    FolderForm,
  },
  computed: mapState(['activeWidget']),
  data() {
    return {
      showModal: false,
      modalConfig: {},
      getFolders: [],
      getTeam: {},
      styleObj: {
        width: `${window.innerWidth}px`,
        height: `${window.innerHeight - 52}px`
      }
    }
  },
  apollo: {
    getTeam: {
      query: GetTeam,
    },
    getFolders: {
      query: GetFolders,
      error(error) {
        console.error(error)
      },
    }
  },
  methods: {
    openModal(mode) {
      this.$store.dispatch('changeActiveWidget', null)
      this.showModal = true
      this.modalConfig = {
        mode,
        parent: ''
      }
    },
  }
}
</script>

<style scoped>
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
  flex-grow: 1;
}
</style>