<template>
  <div>
    <navigation :auth="true"></navigation>

    <div class="container white account" :style="styleObj">
      <div></div>
      <h2 class="users-and-groups-header">Users & Groups</h2>
      <el-row>
        <el-col :span="5">
          <div class="column-header">
            <span class="title group">Groups<span class="count-title">({{getGroups.length}})</span></span>
            <plus-button @click="showGroupForm = true" class="title-plus-button"></plus-button>
          </div>

          <div v-for="(group, index) in groups" :key="index"
            class="group-list-item" v-bind:class="{selected: selected === index}"
            @click="changeView(index)">
            <span class="name">{{group.name}}</span>
            <span class="member-count">{{index ? ungroupedUsers.length : getUsers.length}}</span>
          </div>
          <div v-for="(group, index) in getGroups" :key="index+2"
            class="group-list-item" v-bind:class="{selected: selected === index+2}"
            @click="changeView(index+2)">
            <avatar class="avatar" :obj="group" :size="24"></avatar>
            <span class="name">{{group.name}}</span>
            <span class="member-count">{{group.users.length}}</span>
          </div>
        </el-col>

        <el-col :span="19" class="account-main-container">
          <div class="column-header">
            <span class="title">{{selectedGroup.name}}
              <span class="count-title">({{users.length}})</span>
            </span>
            <el-button v-show="selected === 0" type="text" class="text-button"
              @click="openInviteUserForm('all')">
              <!-- <plus-button class="add-user-plus-button"></plus-button> -->
              <span>+ Add users</span>
            </el-button>
            <span v-show="selected >= 2">
              <div class="tooltip">
                <div v-show="activeWidget === 'addUsersToGroupTooltip'"
                  class="tooltip-content bottom group-view">
                  <div class="menu-item" @click="showAddUsersToGroupForm = true">Add from account</div>
                  <div class="menu-item" @click="openInviteUserForm('group')">Invite by email</div>        
                </div>

                <div class="contact-field">
                  <el-button type="text" class="text-button"
                    @click.stop="$store.dispatch('changeActiveWidget', 'addUsersToGroupTooltip')">
                    + Add users
                  </el-button>
                </div>
              </div>

              <el-button type="text" class="text-button"
                @click="showGroupUpdateForm = true">
                <!-- <i class="fas fa-sliders-h"></i> -->
                <i class="fas fa-cog"></i>
                 Group settings
               </el-button>
            </span>
          </div>
          <div class="users-overview-items">
            <div class="users-overview-item"
              v-bind:class="{active: selectedRole && selectedRole.name === overview.name}"
              v-for="overview in usersOverviews" :key="overview.name"
              @click="changeRoleFilter(overview)">
              <div class="users-overview-count">
                {{ users.filter(o => overview.filter.includes(o.role)).length }}
              </div>
              <div class="users-overview-role">{{overview.name}}</div>
            </div>
          </div>

          <el-table :data="filteredUsers" empty-text="No users" style="width: 100%"
            @row-click="openUserDetail">
            <el-table-column label="NAME" sortable width="190">
              <template slot-scope="scope">
                <div class="user-container">
                  <avatar class="avatar" :obj="scope.row" :size="24"></avatar>
                  {{scope.row.name}}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="email" label="EMAIL" sortable width="230"></el-table-column>
            <el-table-column prop="role" label="ROLE" sortable width="115"></el-table-column>
            <el-table-column prop="status" label="STATUS" sortable></el-table-column>
            <el-table-column label="" width="40">
              <template v-if="selected >= 2" slot-scope="scope">
                <close-button :hidden="true" @click="removeUsersFromGroup(scope.row.id)"></close-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>

      <GroupForm v-if="showGroupForm" :users="getUsers" @close="showGroupForm = false"></GroupForm>
      <GroupUpdateForm v-if="showGroupUpdateForm" :group="selectedGroup"
        @close="showGroupUpdateForm = false"></GroupUpdateForm>
      <InviteUserForm v-if="!!showInviteUserForm" :groups="getGroups"
        :targetGroup="showInviteUserForm === 'group' ? selectedGroup : null"
        @close="showInviteUserForm = false"></InviteUserForm>
      <AddUsersToGroupForm v-if="showAddUsersToGroupForm"
        :group="selectedGroup" :users="getUsers"
        @close="showAddUsersToGroupForm = false"></AddUsersToGroupForm>
      <UserDetail v-if="activeWidget === 'userDetail'"
        :user="selectedUser" :groups="getGroups" :currentUser="getUser">
      </UserDetail>
    </div>

  </div>

</template>

<script>
import { mapState } from 'vuex'
import GroupForm from '@/components/GroupForm'
import GroupUpdateForm from '@/components/GroupUpdateForm'
import InviteUserForm from '@/components/InviteUserForm'
import AddUsersToGroupForm from '@/components/AddUsersToGroupForm'
import UserDetail from '@/components/UserDetail'
import { GetUser, GetUsers, GetGroups, RemoveUsersFromGroup } from '../constants/query.gql'

export default {
  components: {
    GroupForm,
    GroupUpdateForm,
    InviteUserForm,
    AddUsersToGroupForm,
    UserDetail,
  },
  data() {
    return {
      selected: 0,
      selectedRole: null,
      selectedUser: null,
      showGroupForm: false,
      showGroupUpdateForm: false,
      showInviteUserForm: false,
      showAddUsersToGroupForm: false,
      groups: [
        {
          name: 'All users'
        },
        {
          name: 'Ungrouped'
        }
      ],
      usersOverviews: [
        {
          name: 'Administrators',
          filter: ['Owner', 'Administrator']
        },
        {
          name: 'Regular Users',
          filter: ['Regular User']
        },
        {
          name: 'Collaborators',
          filter: ['Collaborator']
        },
        {
          name: 'External Users',
          filter: ['External User']
        },
      ],
      getUser: {},
      getUsers: [],
      getGroups: [],
      styleObj: {
        width: `${window.innerWidth}px`,
        height: `${window.innerHeight - 52}px`
      }
    }
  },
  apollo: {
    getUser: {
      query: GetUser,
      variables: {},
    },
    getUsers: {
      query: GetUsers
    },
    getGroups: {
      query: GetGroups
    }
  },
  computed: {
    users() {
      if (this.selected === 0) {
        return this.getUsers
      } else if (this.selected === 1) {
        return this.ungroupedUsers
      } else {
        return this.getUsers.filter(o => this.getGroups[this.selected-2].users.includes(o.id))
      }
    },
    filteredUsers() {
      return this.selectedRole
        ? this.users.filter(o => this.selectedRole.filter.includes(o.role))
        : this.users
    },
    ungroupedUsers() {
      const members = [].concat(...this.getGroups.map(o => o.users))
      return this.getUsers.filter(o => !members.includes(o.id))
    },
    selectedGroup() {
      return this.selected < 2 ? this.groups[this.selected] : this.getGroups[this.selected-2]
    },
    ...mapState(['activeWidget'])
  },
  methods: {
    changeActiveWidget(key) {
      this.$store.dispatch('changeActiveWidget', key)
    },
    openInviteUserForm(type) {
      this.showInviteUserForm = type
    },
    openUserDetail(user, e) {
      if (this.activeWidget !== 'userDetail') {
        this.changeActiveWidget('userDetail')       
      }
      this.selectedUser = user
      e.stopPropagation()
    },
    changeView(index) {
      this.selected = index
    },
    changeRoleFilter(overview) {
      this.selectedRole = !this.selectedRole || this.selectedRole.name !== overview.name
        ? overview : null 
    },
    removeUsersFromGroup(userId) {
      this.$apollo.mutate({
        mutation: RemoveUsersFromGroup,
        variables: {
          id: this.selectedGroup.id,
          users: [userId]
        }
      }).then(() => {
        this.$emit('close')
      }).catch((error) => {
        console.log(error)
      })
    }
  }
}
</script>

<style scoped>

.account {
  padding: 30px 60px 0;
  flex-direction: column;
}

.column-header {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.users-and-groups-header {
  margin-bottom: 15px;
}

.selected, .selected:hover {
  background-color: rgba(68, 136, 255, 0.16);
}

.title {
  font-size: 18px;
  font-weight: 600;
}

.title.group {
  flex-grow: 1;
}

.count-title {
  color: #50596c;
  margin-left: 4px;
  font-weight: 400;
}

.account-main-container {
  padding-left: 32px;
}

.text-button {
  padding: 0;
  margin-left: 16px;
}

.avatar {
  margin-right: 8px;
}

.name {
  flex-grow: 1;
}

.member-count {
  width: 5px;
  color: rgba(0, 0, 0, 0.32);
}

.users-overview-items {
  display: flex;
  padding-top: 16px;
}

.users-overview-item {
  max-width: 184px;
  padding: 8px 24px 8px 16px;
  margin-right: 16px;
  border: 1px solid rgba(0, 0, 0, 0.16);
  border-radius: 2px;
  -webkit-font-smoothing: antialiased;
  cursor: pointer;
  user-select: none;
}

.users-overview-item:hover, .users-overview-item:hover .users-overview-role,
.users-overview-item.active, .users-overview-item.active .users-overview-role {
  color: #409EFF;
  border-color: #409EFF;
}

.users-overview-count {
  font-weight: 600;
}

.users-overview-role {
  color: rgba(0, 0, 0, 0.56);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.create-group-button {
  float: right;
  cursor: pointer;
}

.plus-button.title-plus-button {
  align-self: center;
  fill: rgba(0, 0, 0, 0.32);
}

.plus-button.add-user-plus-button {
  display: inline-block;
  /*align-self: center;*/
}

</style>
