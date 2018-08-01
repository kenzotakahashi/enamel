<template>
  <div class="modal-mask white">
    <div class="modal-wrapper">
      <div class="modal-container">
        <h3>Invite users</h3>

        <div v-if="error" class="error">
          {{ error }}
        </div>

        <section>
          <el-input v-for="(email, index) in form.emails" :key="index"
            type="email" v-model="form.emails[index]" placeholder="Enter email address"
            @keyup.esc="changeActiveWidget(null)">
          </el-input>
        </section>

        <section>
          <div class="tooltip">
            <div v-show="activeWidget === 'addGroupTooltip'" class="tooltip-content top" @click.stop="">
              <div>
                <div class="search-user-input">
                  <el-input type="text" v-model="searchGroup" placeholder="Search group"
                    @keyup.esc="changeActiveWidget(null)">
                  </el-input>                
                </div>
              </div>
              <div class="contact-picker-item-list">
                <div v-for="group in filteredGroups" class="contact-picker-item"
                  @click.stop="addMemberToGroup(group)">
                  <div class="picker-item">
                    <div class="item">
                      <avatar class="picker-avatar" :obj="group" :size="32"></avatar>
                      <div>
                        <div class="name">{{group.name}}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="contact-field">
              <div v-if="form.groups.length > 0" class="add-additional">
                <avatar v-for="group in form.groups" :key="group.id" 
                  class="member-avatar" :obj="group" :size="32">
                  <remove-button @click="removeMemberFromGroup(group.id)"></remove-button>
                </avatar>
                <div class="cross-wrapper">
                  <span class="cross"
                    @click.stop="changeActiveWidget('addGroupTooltip')">
                  </span>
                </div>
              </div>
              <el-button v-else type="text"
                @click.stop="changeActiveWidget('addGroupTooltip')">
                Add to group</el-button>
            </div>
          </div>
        </section>

        <section>
          <div class="field-title">Roles</div>
          <el-select class="role-select" v-model="form.role" placeholder="please select a role">
            <el-option label="Administrator" value="Administrator"></el-option>
            <el-option label="Regular User" value="Regular User"></el-option>
            <el-option label="Collaborator" value="Collaborator"></el-option>
            <el-option label="External User" value="External User"></el-option>
          </el-select>
        </section>

        <section>
          <el-button type="primary" @click="invite">Invite users</el-button>
          <el-button type="text" @click="$emit('close')">Cancel</el-button>          
        </section>

      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { Invite, GetUsers, GetGroups } from '../constants/query.gql'
import { validateEmail } from '@/helpers/helpers'

export default {
  props: ['groups', 'targetGroup'],
  data() {
    return {
      error: false,
      searchGroup: '',
      form: {
        emails: ['','',''],
        groups: this.targetGroup ? [this.targetGroup] : [],
        role: 'Regular User'
      },
    }
  },
  computed: {
    filteredGroups() {
      const s = this.searchGroup.toLowerCase()
      const groups = this.form.groups.map(o => o.id)
      return this.groups.filter(o => !groups.includes(o.id) && o.name.toLowerCase().includes(s))
    },
    ...mapState(['activeWidget'])
  },
  methods: {
    changeActiveWidget(key) {
      this.$store.dispatch('changeActiveWidget', key)
    },
    addMemberToGroup(group) {
      this.form.groups.push(group)
    },
    removeMemberFromGroup(id) {
      this.form.groups = this.form.groups.filter(o => o.id !== id)
    },
    invite() {
      const emails = this.form.emails.filter(o => !!o && validateEmail(o))
      const groups = this.form.groups.map(o => o.id)
      if (emails.length === 0) {
        this.error = 'Please enter at least one valid email'
        return
      }
      this.$apollo.mutate({
        mutation: Invite,
        variables: {
          emails,
          groups,
          role: this.form.role
        },
        update: (store, { data: { invite } }) => {
          try {
            const data = store.readQuery({ query: GetUsers })
            data.getUsers = data.getUsers.concat(invite)
            store.writeQuery({
              query: GetUsers,
              data
            })

            const users = invite.map(o => o.id)
            const data2 = store.readQuery({ query: GetGroups })
            data2.getGroups = data2.getGroups.map(o => (
              groups.includes(o.id)
              ? {...o, users: o.users.concat(users)}
              : o 
            ))
            store.writeQuery({
              query: GetGroups,
              data: data2
            })
          } catch(err) {
            console.log(err)
          }
        }
      }).then(() => {
        // TODO: alert email addresses that already exist
        this.$emit('close')
      }).catch((error) => {
        this.error = 'Something went wrong'
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
  padding: 24px;
}

.field-title {
  margin-bottom: 8px;
  font-size: 12px;
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

.role-select {
  width: 100%;
}

</style>
