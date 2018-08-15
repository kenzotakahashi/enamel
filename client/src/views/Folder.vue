<template>
  <el-row class="max-height">
    <el-col :span="12" class="max-height">
      <div class="white card max-height">
        <div class="folder-header">
          <div class="header-title folder-name">{{folder.name}}</div>
        </div>
      </div>
    </el-col>
    <el-col v-if="!isTeam(folder) && subRoute==='folder'" :span="12" class="max-height">
      <FolderDetail :folder="folder"></FolderDetail>
    </el-col>
  </el-row>
</template>

<script>
import { GetFolder } from '../constants/query.gql'
import FolderDetail from './FolderDetail.vue'

export default {
  components: {
    FolderDetail
  },
  beforeRouteUpdate (to, from, next) {
    this.subRoute = to.name
    next()
  },
  data() {
    return {
      subRoute: 'folder',
      folderName: '',
      folder: {
        shareWith: []
      },
    }
  },
  apollo: {
    getFolder: {
      query: GetFolder,
      variables() {
        return {id: this.$route.params.id}
      },
      result ({data: { getFolder }}) {
        this.folder = getFolder
        this.folderName = this.folder.name
        if (this.isTeam) {
          document.title = `${this.folder.name} - enamel`          
        }
      },
    }
  },
  methods: {
    isTeam(folder) {
      return !folder.parent && folder.shareWith.length === 0
    }
  }
}
</script>

<style>
.folder-header {
  padding: 15px 24px 0;
  line-height: 21px;
  min-height: 40px;
}

.folder-name {
  padding: 0;
  margin: 5px 0;
  height: 32px;
  width: 100%;
}

.menu-title {
  margin: 0 5px;
  font-size: 12px;
}

.max-height {
  height: 100%;
}

.white.card {
  display: flex;
  flex-direction: column;
}

.task-container {
  flex-grow: 1;
  overflow: scroll;
}

</style>
