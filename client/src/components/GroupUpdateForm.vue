<template>
  <div class="modal-mask white">
    <div class="modal-wrapper">
      <div class="modal-container">
        <h3>Update group</h3>

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
          <el-button type="primary" @click="updateGroup">Update</el-button>
          <el-button type="text" @click="$emit('close')">Cancel</el-button>
        </section>

        <section class="delete-section">
          <div v-if="group.users.length > 0" class="warning">
            Oops, you can't delete this group yet! Remove all users and subgroups from the group first.
          </div>
          <el-button v-else type="text" class="black-text-button"
            @click="deleteGroup">Delete group</el-button>
        </section>

        <close-button class="close" :hidden="false" @click="$emit('close')"></close-button>
      </div>
    </div>
  </div>
</template>

<script>
import { UpdateGroup, DeleteGroup, GetGroups } from '../constants/query.gql'
import { mapState } from 'vuex'
import { randomChoice } from '@/helpers/helpers'

export default {
  props: ['group'],
  data() {
    const { name, initials, avatarColor } = this.group
    return {
      enteredInitials: false,
      colors: [
        "D81B60","F06292","F48FB1","FFB74D","FF9800","F57C00","00897B","4DB6AC","80CBC4",
        "80DEEA","4DD0E1","00ACC1","9FA8DA","7986CB","3949AB","8E24AA","BA68C8","CE93D8"
      ],
      searchUser: '',
      form: {
        name,
        initials,       
        avatarColor,
      },
    }
  },
  computed: {
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
    selectAvatarColor(color) {
      this.form.avatarColor = color
    },
    changeActiveWidget(key) {
      this.$store.dispatch('changeActiveWidget', key)
    },
    updateGroup() {
      const { name, initials, avatarColor } = this.form
      if (!name || !initials) return

      this.$apollo.mutate({
        mutation: UpdateGroup,
        variables: { id: this.group.id, name, initials, avatarColor },
      }).then(() => {
        this.$emit('close')
      }).catch((error) => {
        console.log(error)
      })
    },
    deleteGroup() {
      const id = this.group.id
      this.$apollo.mutate({
        mutation: DeleteGroup,
        variables: { id },
        update: (store) => {
          try {
            const data = store.readQuery({query: GetGroups})
            data.getGroups.splice(data.getGroups.findIndex(o => o.id === id), 1)
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

.delete-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.16);
}

.warning {
  font-size: 12px;
}

</style>
