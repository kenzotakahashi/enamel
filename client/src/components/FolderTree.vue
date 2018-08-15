<template name="tree">
  <li>
    <div class="tree-item"
        @click.right.stop.prevent="$store.commit('changeActiveWidget', `folder${model.id}`)"
        @click.left.stop="$router.push({name: 'folder', params: {id: model.id}})">
      <span @click="toggle" class="fold-button"
        v-bind:class="{active: $route.params.id === model.id}"
        v-bind:style="{visibility: isFolder ? 'visible' : 'hidden'}">
        <i :class="`fas fa-angle-${open ? 'down' : 'right'}`"></i>
      </span>
      <div class="tree-plate" v-bind:class="{active: $route.params.id === model.id}">
        <span class="folder no-select-color">{{ model.name }}</span>

        <div class="dropdown-content left" v-show="activeWidget === `folder${model.id}`">
          <div @click="openModal('folder')">Add Folder</div>
          <!-- <div @click="deleteFolder">Delete</div> -->
        </div>
      </div>
    </div>

    <ul class="tree" v-show="open" v-if="isFolder">
      <FolderTree
        v-for="folder in getFolders"
        :key="folder.id"
        :model="folder"
        @open="openArrow"
      >
      </FolderTree>
    </ul>

    <FolderForm v-if="showModal" :config="{}" @close="showModal = false"></FolderForm>
  </li>
</template>

<script>
import { mapState } from 'vuex'
import FolderTree from './FolderTree'
import FolderForm from './FolderForm'
import { GetFolders } from '../constants/query.gql'

export default {
  name: 'tree',
  components: {
    FolderTree,
    FolderForm
  },
  props: ['model', 'team'],
  data() {
    return {
      open: false,
      showModal: false,
      getFolders: []
    }
  },
  mounted() {
    if (this.isSeletecd) {
      this.$emit('open')
    }
  },
  computed: {
    isFolder: function () {
      return this.getFolders.length > 0
    },
    isSeletecd() {
      return this.$route.params.id === this.model.id
    },
    ...mapState(['activeWidget'])
  },
  apollo: {
    getFolders: {
      query: GetFolders,
      variables() {
        return { parent: this.model.id }
      },
      error(error) {
        console.error(error)
      },
    }
  },
  methods: {
    toggle() {
      if (this.isFolder) {
        this.open = !this.open
      }
    },
    openModal(mode) {
      this.$store.commit('changeActiveWidget', null)
      this.showModal = true
      this.modalConfig = {
        mode,
        parent: this.model.id
      }
    },
    openArrow() {
      this.open = true
      this.$emit('open')
    },
    // deleteFolder() {
    //   const { id, parent } = this.model
    //   this.$apollo.mutate({
    //     mutation: DeleteFolder,
    //     variables: {id},
    //     update: (store) => {
    //       const variables = this.team ? {} : {parent}
    //       const data = store.readQuery({
    //         query: GetFolders,
    //         variables
    //       })
    //       data.getFolders.splice(data.getFolders.findIndex(o => o.id === id), 1)
    //       store.writeQuery({
    //         query: GetFolders,
    //         variables,
    //         data
    //       })
    //     }
    //   }).then(() => {
    //     this.$router.replace({
    //       name: "folder",
    //       params: {id: this.team || parent},
    //     })
    //   }).catch((error) => {
    //     console.log(error)
    //   })
    // },
  }
};
</script>

<style>
</style>
