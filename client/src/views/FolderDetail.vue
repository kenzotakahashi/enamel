<template>
  <div class="white card max-height">
    <div class="folder-header">
      <form @submit.prevent="updateFolder">
        <input class="no-outline header-title folder-name" type="text" name="taskname" ref="taskname"
          v-model="folderName" @keyup.esc="cancel">
        </input>
      </form>
    </div>
    <div class="folder-statebar">


      <div class="tooltip">
        <div v-show="activeWidget === 'addFolderShareTooltip'" class="tooltip-content bottom" @click.stop="">
          <div class="group-field">
            <div class="add-additional">
              <avatar v-for="group in shareWith" :key="group.id" 
                class="member-avatar" :kind="group.__typename" :obj="getAvatarObj(group)" :size="32">
                <remove-button @click="removeGroup(group.id)"></remove-button>
              </avatar>
            </div>
          </div>
          <div>
            <div class="search-input">
              <div class="label">Share with:</div>
              <el-input type="text" v-model="searchGroup" placeholder="Add by name or email"
                @keyup.esc="changeActiveWidget(null)">
              </el-input>                
            </div>
          </div>
          <div class="contact-picker-item-list">
            <div v-for="group in filteredGroups" :key="group.id" class="contact-picker-item"
              @click.stop="addGroup(group)">
              <div class="picker-item">
                <div class="item">
                  <avatar class="picker-avatar" :kind="group.__typename" :obj="group" :size="32"></avatar>
                  <div>
                    <div class="name">{{group.name}}</div>
                    <div class="email">{{group.email}}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <el-button v-if="folder.parent" type="text" class="black-text-button subfolder share-info">
          <!-- <i class="fas fa-share-alt"></i> -->
          <span class="shared-with">{{ shareInfo }}</span>
        </el-button>
        <el-button v-else type="text" class="black-text-button share-info"
          @click.stop="changeActiveWidget('addFolderShareTooltip')" >
          <i class="fas fa-share-alt"></i>
          <span class="shared-with">{{ shareInfo }}</span>
        </el-button>

      </div>

    </div>

    <DescriptionField :model="folder" kind="folder"></DescriptionField>
   
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { formatDate } from '@/helpers/helpers'
import { UpdateFolder, GetUser, GetUsers, GetGroups, GetTeam } from '../constants/query.gql'
import DescriptionField from '@/components/DescriptionField'

function initializeShareWith(shareWith) {
  return shareWith.map(o => ({
    ...o,
    id: o.item,
    __typename: o.kind
  }))
}

export default {
  components: {
    DescriptionField
  },
  data() {
    return {
      getUser: {},
      getUsers: [],
      getGroups: [],
      getTeam: {},
      searchGroup: '',
      formatDate,
      folderName: this.folder.name,
      shareWith: initializeShareWith(this.folder.shareWith)
    }
  },
  props: ['folder'],
  mounted() {
    document.title = `${this.folder.name} - enamel`
  },
  apollo: {
    getUser: GetUser,
    getUsers: GetUsers,
    getGroups: GetGroups,
    getTeam: GetTeam,
  },
  computed: {
    shareInfo() {
      const share = this.shareWith
      if (!share) return 'Private'
      if (share.length === 1) {
        if (share[0].__typename === 'User') {
          return 'Private'
        } else {
          return 'Shared with 1 group'
        }
      } else {
        const users = share.filter(o => o.__typename === 'User').length
        const groups = share.length - users
        if (!users) {
          return `Shared with ${groups} groups`
        } else if (!groups) {
          return `Shared with ${users} people`
        } else {
          return `Shared with ${groups} group${groups > 1 ? 's' : ''}
                  and ${users} ${users > 1 ? 'people' : 'person'}`
        }
      }
    },
    groups() {
      return [this.getTeam].concat(this.getUsers).concat(this.getGroups)
    },
    excludeList() {
      return this.excludeUsers(this.shareWith, this.groups || [])
    },
    filteredGroups() {
      const s = this.searchGroup.toLowerCase()
      const sharedIds = this.shareWith.map(o => o.id)
      return this.groups.filter(o => {
        if (sharedIds.includes(o.id)) return false
        if (this.excludeList.includes(o.id)) return false
        if (o.email && o.email.includes(s)) return true
        return o.name && o.name.toLowerCase().includes(s)
      })
    },
    ...mapState(['activeWidget'])
  },
  methods: {
    getAvatarObj(obj) {
      if (!obj.kind) return obj
      return this.groups.find(o => o.id === obj.item)
    },
    changeActiveWidget(key) {
      this.$store.dispatch('changeActiveWidget', key)
    },
    addGroup(group) {
      this.mergeGroup(this.shareWith.concat([group]))
    },
    removeGroup(id) {
      // Folder must be shared with at least one user
      if (this.shareWith.length === 1 && this.shareWith[0].__typename === 'User') {
        return
      }
      // For now, you cannot remove yourself from the folder.
      if (id === this.getUser.id) {
        return
      }
      const shareWith = this.shareWith.filter(o => o.id !== id)
      const group = this.groups.find(o => o.id === id)
      if (group.__typename === 'Team' ||
          group.__typename === 'Group' && group.users.includes(this.getUser.id)) {
        shareWith.push(this.getUser)
      }
      this.mergeGroup(shareWith)
    },
    excludeUsers(shareWith, groups) {
      let list = []
      const sharedIds = shareWith.map(o => o.id)
      const shared = groups.filter(o => sharedIds.includes(o.id))
      if (shared.find(o => o.__typename === 'Team')) {
        list = this.groups.filter(o =>
          ['Regular User','Owner','Administrator'].includes(o.role)).map(p => p.id)
      }
      const members = shared.filter(o => o.__typename === 'Group').map(p => p.users)
      return list.concat(...members)
    },
    mergeGroup(shareWith) {
      const excludeList = this.excludeUsers(shareWith, this.groups)
      const _shareWith = shareWith.filter(o => !excludeList.includes(o.id))
      
      const sh = _shareWith.map(o => ({
        kind: o.__typename,
        item: o.id
      }))
      this.changeSharing(sh)
    },
    updateFolder(e) {
      const name = this.folderName
      if (name === this.folder.name) {
        this.cancel(e)
        return
      }
      this.$apollo.mutate({
        mutation: UpdateFolder,
        variables: { id: this.folder.id, input: {name} },
      }).then(() => {
        this.cancel(e)
      }).catch((error) => {
        console.log(error)
      })
    },
    changeSharing(shareWith) {
      this.$apollo.mutate({
        mutation: UpdateFolder,
        variables: { id: this.folder.id, input: {shareWith} },
      }).then(({data: {updateFolder} }) => {
        this.shareWith = initializeShareWith(updateFolder.shareWith)
      }).catch((error) => {
        console.log(error)
      })
    },
    cancel(e) {
      e.target.blur()
    }
  }

}
</script>

<style scoped>
.folder-header {
  padding: 15px 24px 0;
  line-height: 21px;
  min-height: 40px;
}

.folder-statebar {  
  display: flex;
  /*min-width: 400px;*/
  height: 48px;
  position: relative;
  padding: 0 24px;
  /*border-top: solid 1px;*/
  border-bottom: solid 1px;
  border-color: rgba(0,0,0,.16);
}

.folder-name {
  padding: 0;
  margin: 5px 0;
  height: 32px;
  width: 100%;
}

.shared-with {
  padding-left: 7px;
}

.subfolder:hover {
  color: initial;
  cursor: default;
}

/*tooltip*/

.member-avatar {
  margin-right: 8px;
  cursor: pointer;
}

.member-avatar:hover .remove-button {
  visibility: visible;
}

.tooltip .tooltip-content {
  width: 278px;
  left: 50%; 
  margin-left: -139px;
}

.search-input {
  padding: 15px;
}

.contact-picker-item-list {
  padding-bottom: 24px;
  max-height: 295px;
  overflow: auto;
}

.group-field {
  box-sizing: border-box;
  /*height: 36px;*/
  padding: 15px;
}

.add-additional {
  display: flex;
  flex-direction: row;
}

.label {
  text-align: left;
}

</style>
