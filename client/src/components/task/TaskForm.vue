<template>
  <div class="task-creation-form">
    <div v-show="isFormOpen" class="task-input">
      <form @submit.prevent="createTask" autocomplete="off">
        <input @focusout="closeForm" @keyup.esc="closeForm"
          class="no-outline" ref="taskform" type="text" name="task"
          v-model="newTaskName" placeholder="Enter title for new task"></input>
      </form>
    </div>
    <div v-show="!isFormOpen" @click="openForm" class="task-button">
      <el-button type="text">+ New task</el-button>      
    </div>
  </div>
</template>

<script>
import { GetTasks, GetTask, CreateTask } from '@/constants/query.gql'
import shortid from 'shortid'

export default {
  props: ['parentId', 'open'],
  data() {
    return {
      isFormOpen: this.open,
      newTaskName: '',
    }
  },
  mounted() {
    if (this.open) {
      this.$refs.taskform.focus()
    }
  },
  methods: {
    openForm() {
      this.isFormOpen = true
      this.$nextTick(() => this.$refs.taskform.focus())
    },
    closeForm() {
      this.isFormOpen = false
    },
    createTask() {
      if (!this.newTaskName) return
      const parent = this.parentId
      const folder = parent ? undefined : this.$route.params.id
      this.$apollo.mutate({
        mutation: CreateTask,
        variables: {
          folder,
          parent,
          name: this.newTaskName
        },
        update: (store, { data: { createTask } }) => {
          try {
            const data = store.readQuery({
              query: GetTasks,
              variables: {folder, parent}
            })
            if (parent) {
              data.getTasks.push(createTask)
            } else {
              data.getTasks.unshift(createTask)
            }
            store.writeQuery({
              query: GetTasks,
              variables: {folder, parent},
              data
            })
          } catch(err) {
            console.log(err)
          }
        }
      }).then(() => {
        this.newTaskName = ''
      }).catch((error) => {
        console.log(error)
      })
    }
  }
}

</script>

<style scoped>
.task-creation-form {
  border: 0px solid transparent;
  border-bottom-color: #ebebeb;
  border-width: 1px 0;
  border-style: solid;
  height: 40px;
  padding-left: 24px;
  padding-right: 16px;
  /*display: flex;*/
  /*align-items: center;*/
  box-sizing: border-box;
}

.task-button {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.task-input {
  display: flex;
  font-size: 14px;
  height: 100%;
}

.task-input > form {
  display: flex;
  width: 100%;
}

.task-input > input {
  align-items: center;
  display: inline-flex;
}
</style>
