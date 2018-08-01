<template>
  <div class="modal-mask white">
    <div class="modal-wrapper">
      <div class="modal-container">
        <h3>Add users to group</h3>

        <section>
          <div class="contact-field">
            <div v-if="form.users.length > 0" class="add-additional">
              <avatar v-for="user in form.users" :key="user.id" 
                class="member-avatar" :obj="user" :size="32">
                <remove-button @click="removeMemberFromGroup(user.id)"></remove-button>
              </avatar>
              <div class="cross-wrapper">
                <span class="cross"
                  @click.stop="changeActiveWidget('addGroupTooltip')">
                </span>
              </div>
            </div>
            <div v-else>Search for and select users below</div>
          </div>
        </section>

        <div class="user-list">
          <div>
            <div class="search-user-input">
              <el-input type="text" v-model="searchUser" placeholder="Search contact"
                @keyup.esc="changeActiveWidget(null)">
              </el-input>
            </div>
          </div>
          <div class="contact-picker-item-list">
            <div v-for="user in filteredUsers" class="contact-picker-item"
              @click.stop="addMemberToGroup(user)">
              <div class="picker-item">
                <div class="item">
                  <avatar class="picker-avatar" :obj="user" :size="32"></avatar>
                  <div>
                    <div class="name">{{user.name}}</div>
                    <div class="email">{{user.email}}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section class="button-group">
          <el-button type="primary" @click="addUsersToGroup">Add</el-button>
          <el-button type="text" @click="$emit('close')">Cancel</el-button>          
        </section>

        <close-button class="close" :hidden="false" @click="$emit('close')"></close-button>
      </div>
    </div>
  </div>
</template>

<script>
import { AddUsersToGroup, GetUsers, GetGroups } from '../constants/query.gql'
import { mapState } from 'vuex'

export default {
  props: ['group', 'users'],
  data() {
    return {
      targetUsers: this.users.filter(o => !this.group.users.includes(o.id)),
      searchUser: '',
      form: {
        users: []
      },
    }
  },
  computed: {
    filteredUsers() {
      const s = this.searchUser.toLowerCase()
      const users = this.form.users.map(o => o.id)
      return this.targetUsers.filter(o => !users.includes(o.id)
        && (o.name.toLowerCase().includes(s) || o.email.toLowerCase().includes(s)))
    },
    ...mapState(['activeWidget'])
  },
  methods: {
    changeActiveWidget(key) {
      this.$store.dispatch('changeActiveWidget', key)
    },
    addMemberToGroup(user) {
      this.form.users.push(user)
    },
    removeMemberFromGroup(id) {
      this.form.users = this.form.users.filter(o => o.id !== id)
    },
    addUsersToGroup() {
      const users = this.form.users.map(o => o.id)
      if (users.length === 0) {
        this.$emit('close')
        return
      }
      this.$apollo.mutate({
        mutation: AddUsersToGroup,
        variables: { id: this.group.id, users }
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

section {
  margin-top: 16px;
}

.modal-container {
  width: 408px;
  height: 536px;
  padding: 24px;
}

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

.search-user-input {
  padding: 15px;
}

.contact-picker-item-list {
  padding-bottom: 24px;
  max-height: 295px;
  overflow: auto;
}

.contact-field {
  box-sizing: border-box;
  height: 36px;
}

.add-additional {
  display: flex;
  flex-direction: row;
}

.user-list {
  flex-grow: 1;
}

.button-group {
  flex-shrink: 0;
}

</style>
