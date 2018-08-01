<template>
  <div class="task-statebar">
    <div class="task-status dropdown" v-bind:style="{borderColor: backgroundStrongColorMap[task.status]}"
      @click.stop="$store.dispatch('changeActiveWidget', 'task-status-menu')">
      <div class="task-status-view" v-bind:style="{
        backgroundColor: backgroundColorMap[task.status],
        borderColor: borderColorMap[task.status]
      }">
        <span class="task-status-label">{{task.status}}</span>
        <span class="arrow-wrap"></span>
      </div>
      <div class="dropdown-content left" v-show="activeWidget === 'task-status-menu'">
        <div v-for="status in statusList" :key="status" @click="changeTaskStatus(status)"
          v-bind:class="{ 'active-status': task.status === status }">
          <span class="status-icon" v-bind:style="{
            backgroundColor: backgroundStrongColorMap[status]
          }"></span>
          <span>{{status}}</span>            
        </div>

      </div>
    </div>

    <div class="state-bar-assignee">

      <div class="tooltip">
        <div v-show="activeWidget === 'addAssigneeTooltip'"
          class="tooltip-content bottom group-view" @click.stop="">
          <div>
            <div class="search-user-input">
              <el-input type="text" v-model="searchUser" placeholder="Search contact"
                @keyup.esc="changeActiveWidget(null)">
              </el-input>                
            </div>
          </div>
          <div class="contact-picker-item-list">
            <div v-for="user in filteredUsers" class="contact-picker-item"
              @click.stop="assignUserToTask(user.id)">
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
          <div v-if="task.assignees.length > 0" class="add-additional">
            <avatar v-for="user in task.assignees" :key="user.id" 
              class="member-avatar" :obj="user" :size="32">
              <remove-button @click="removeUserFromTask(user.id)"></remove-button>
            </avatar>
            <div class="cross-wrapper">
              <span class="cross"
                @click.stop="changeActiveWidget('addAssigneeTooltip')">
              </span>
            </div>
          </div>
          <el-button v-else
            type="text"
            @click.stop="changeActiveWidget('addAssigneeTooltip')"
            class="black-text-button" >
            + Add assignee
          </el-button>
        </div>
      </div>

    </div>

    <div class="state-bar-creator">
      <span class="small-text">
        by {{task.creator.firstname}} {{task.creator.lastname[0]}} at {{formatDate(task.createdAt)}}
      </span>
    </div>

  </div>
</template>

<script>
import { mapState } from 'vuex'
import { UpdateTask } from '@/constants/query.gql'
import { backgroundStrongColorMap, formatDate } from '@/helpers/helpers'

export default {
  props: ['task', 'users'],
  data() {
    return {
      formatDate,
      searchUser: '',
      statusList: ['New', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
      backgroundStrongColorMap,
      backgroundColorMap: {
        New: 'rgb(227, 242, 253)',
        'In Progress': '#e0f7fa',
        Completed: '#f1f8e9',
        'On Hold': '#fafafa',
        Cancelled: '#fafafa',
      },
      borderColorMap: {
        New: 'rgb(211, 228, 242)',
        'In Progress': '#ceeaee',
        Completed: '#e3ebd9',
        'On Hold': '#e5e5e5',
        Cancelled: '#e5e5e5',
      },
    }
  },
  computed: {
    filteredUsers() {
      const s = this.searchUser.toLowerCase()
      const users = this.task.assignees
      return this.users.filter(o => !users.includes(o.id)
        && (o.name.toLowerCase().includes(s) || o.email.toLowerCase().includes(s)))
    },
    ...mapState(['activeWidget'])
  },
  methods: {
    changeTaskStatus(status) {
      if (this.task.status === status) return
      this.updateTask({status})
    },
    assignUserToTask(id) {
      const assignees = this.task.assignees.map(o => o.id)
      assignees.push(id)
      this.updateTask({assignees})
    },
    removeUserFromTask(id) {
      const assignees = this.task.assignees.map(p => p.id).filter(o => o !== id)
      this.updateTask({assignees})
    },
    updateTask(input) {
      this.$apollo.mutate({
        mutation: UpdateTask,
        variables: {
          id: this.task.id,
          input
        },
      }).then(() => {
        this.$store.dispatch('changeActiveWidget', null)
      }).catch((error) => {
        console.log(error)
      })
    },
    changeActiveWidget(key) {
      this.$store.dispatch('changeActiveWidget', key)
    },
  }
}
</script>

<style scoped>
.task-statebar {  
  display: flex;
  height: 48px;
  position: relative;
  padding-right: 8px;
  border-top: solid 1px;
  border-color: rgba(0,0,0,.16);
}

.task-status {
  flex-shrink: 0;
  margin-top: -1px;
  margin-bottom: -1px;
  border-left: 9px solid;
  /*border-color: rgb(25, 118, 210);*/
}

.task-status-view {
  display: flex;
  cursor: pointer;
  padding: 14px 11px 14px 20px;
  border-radius: none;
  border-image: initial;
  box-sizing: content-box;
  height: 20px;
  border-style: solid;
  border-width: 1px;
  border-left: none;
}

.arrow-wrap {
  border-color: #000 transparent transparent;
  border-style: solid;
  border-width: 4px 3px 0;
  float: right;
  margin-left: 6px;
  margin-top: 10px;

  border-top-color: rgb(33, 33, 33);
}

.dropdown-content > div {
  font-size: 13px;
  padding: 7px 32px 6px 24px;
}

.task-status-label {
  align-self: center;
  font-size: 13px;
  color: #111;
  font-weight: 600;
}

.status-icon {
  box-sizing: content-box;
  display: inline-block;
  width: 10px;
  height: 10px;
  border: 1px solid #fff!important;
  border-radius: 2px;
  margin-right: 11px;
  align-self: center;
}

.active-status, .active-status:hover {
  color: #fff;
  background-color: #48f;
  cursor: default;
}

.state-bar-assignee {
  display: flex;
  align-items: center;
  flex-grow: 1;
  padding: 0 8px;
}

.state-bar-creator {
  display: flex;
  align-items: center;
  padding-right: 10px;
}

/*assignees*/

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