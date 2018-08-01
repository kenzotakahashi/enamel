<template>
  <div class="modal-mask white">
    <div class="modal-wrapper">
      <div class="modal-container">
        <h3>Create group</h3>

        <div class="groupname-initials-section">
          <div class="name-form">
            <div class="field-title">Group name</div>
            <el-input type="text" name="name" ref="name" v-model="form.name"
              :autofocus="true" @input="updateInitials" @keyup.esc="$emit('close')">
            </el-input>
          </div>
          <div class="initials-form">
            <div class="field-title">Initials</div>
            <el-input type="text" name="initials" v-model="form.initials"
              maxlength="2" @input="inputInitials" @keyup.esc="$emit('close')">
            </el-input>
          </div>
        </div>

        <section>
          <div class="field-title">Avatar color</div>
          <div class="avatarcolor-container">
            <avatar v-for="avatarColor in colors" :key="avatarColor"
              class="color-avatar" 
              @click="selectAvatarColor(avatarColor)"
              :obj="{initials: form.initials, avatarColor}" :size="32"
              :selected="form.avatarColor === avatarColor">
            </avatar>
          </div>
        </section>

        <section>
          <div class="field-title">Members</div>
          <div class="tooltip">
            <div v-show="activeWidget === 'addGroupTooltip'" class="tooltip-content top" @click.stop="">
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
              <el-button v-else type="text"
                @click.stop="changeActiveWidget('addGroupTooltip')">
                Add members</el-button>
            </div>
          </div>
        </section>

        <section>
          <el-button type="primary" @click="createGroup">Create</el-button>
          <el-button type="text" @click="$emit('close')">Cancel</el-button>          
        </section>

      </div>
    </div>
  </div>
</template>

<script>
import { CreateGroup, GetGroups } from '../constants/query.gql'
import { mapState } from 'vuex'
import { randomChoice } from '@/helpers/helpers'

export default {
  props: ['users'],
  data() {
    return {
      enteredInitials: false,
      colors: [
        "D81B60","F06292","F48FB1","FFB74D","FF9800","F57C00","00897B","4DB6AC","80CBC4",
        "80DEEA","4DD0E1","00ACC1","9FA8DA","7986CB","3949AB","8E24AA","BA68C8","CE93D8"
      ],
      searchUser: '',
      form: {
        name: '',
        initials: '',       
        avatarColor: '',
        users: []
      },
    }
  },
  computed: {
    filteredUsers() {
      const s = this.searchUser.toLowerCase()
      const users = this.form.users.map(o => o.id)
      return this.users.filter(o => !users.includes(o.id)
        && (o.name.toLowerCase().includes(s) || o.email.toLowerCase().includes(s)))
    },
    ...mapState(['activeWidget'])
  },
  methods: {
    inputInitials() {
      this.form.initials = this.form.initials.toUpperCase()
      this.enteredInitials = !!this.form.initials
    },
    updateInitials() {
      if (!this.enteredInitials) {
        if (this.form.name) {
          // If the name consists of multiple parts, pick the initial of the first two.
          // Otherwise use the first 2 letters
          const nameChunks = this.form.name.split(' ').filter(o => o.length > 0)
          const initials = nameChunks.length >= 2
            ? `${nameChunks[0][0]}${nameChunks[1][0]}`
            : nameChunks[0].slice(0,2)
          this.form.initials = initials.toUpperCase()          
        } else {
          this.form.initials = ''
        }
      }
    },
    addMemberToGroup(user) {
      this.form.users.push(user)
    },
    removeMemberFromGroup(id) {
      this.form.users = this.form.users.filter(o => o.id !== id)
    },
    selectAvatarColor(color) {
      this.form.avatarColor = color
    },
    changeActiveWidget(key) {
      this.$store.dispatch('changeActiveWidget', key)
    },
    createGroup() {
      const { name, initials, avatarColor, users } = this.form
      if (!name || !initials) return

      this.$apollo.mutate({
        mutation: CreateGroup,
        variables: {
          name,
          initials,
          avatarColor: avatarColor || randomChoice(this.colors),
          users: users.map(o => o.id)
        },
        update: (store, { data: { createGroup } }) => {
          try {
            const data = store.readQuery({query: GetGroups})
            data.getGroups.unshift(createGroup)
            store.writeQuery({
              query: GetGroups,
              data
            })
          } catch(err) {
            console.log(err)
          }
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

section {
  margin-top: 16px;
}

.modal-container {
  width: 408px;
  padding: 24px;
}

.groupname-initials-section {
  display: flex;
}

.avatarcolor-container {
  display: flex;
  flex-wrap: wrap;
}

.field-title {
  margin-bottom: 8px;
  font-size: 12px;
}

.name-form {
  flex-grow: 1;
}

.initials-form {
  width: 56px;
  padding-left: 8px;
}

.color-avatar {
  margin-bottom: 8px;
  margin-right: 8px;
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

</style>
