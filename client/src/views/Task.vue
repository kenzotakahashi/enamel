<template>
  <div class="white card max-height">
    <TaskHeader :task="task"></TaskHeader>
    <div class="scroll">
      <TaskStateBar :task="task" :users="getUsers"></TaskStateBar>
      <TaskSettingBar :task="task" :subtasks="subtasks" :showSubtasks="showSubtasks"
        :record="getRecord"
        @toggleSubtaskView="showSubtasks = !showSubtasks"></TaskSettingBar>

      <div v-if="showSubtasks">
        <TaskTree v-for="model in subtasks" :key="model.id" :model="model">
        </TaskTree>
        <TaskForm :parentId="taskId" :open="true"></TaskForm>      
      </div>

      <DescriptionField :model="task" kind="task"></DescriptionField>
    </div>

    <Record v-if="activeWidget === 'record-form'" :task="task" :record="getRecord"></Record>
    <DateRangePicker v-if="activeWidget === 'daterange'" :task="task"></DateRangePicker>
  </div>

</template>

<script>
import moment from 'moment'
import { mapState } from 'vuex'
import { GetTask, GetTasks, GetUsers, GetRecord, UpdateTask } from '../constants/query.gql'
import TaskHeader from '@/components/task/TaskHeader'
import TaskStateBar from '@/components/task/TaskStateBar'
import TaskSettingBar from '@/components/task/TaskSettingBar'
import TaskTree from '@/components/task/TaskTree'
import TaskForm from '@/components/task/TaskForm'
import DescriptionField from '@/components/DescriptionField'
import DateRangePicker from '@/components/DateRangePicker'
import Record from '@/components/Record'

export default {
  components: {
    TaskHeader,
    TaskStateBar,
    TaskSettingBar,
    TaskTree,
    TaskForm,
    DescriptionField,
    DateRangePicker,
    Record,
  },
  props: ['taskId'],
  data() {
    return {
      task: {
        parent: {},
        creator: {
          firstname: '',
          lastname: '',
        },
        folders: [],
        assignees: [],
        shareWith: []
      },
      showSubtasks: false,
      subtasks: [],
      comments: [],
      getRecord: {},
      getUsers: [],
    }
  },
  computed: {
    ...mapState(['activeWidget'])
  },
  apollo: {
    getTask: {
      query: GetTask,
      variables() {
        return {id: this.taskId}
      },
      result({ data: { getTask } }) {
        this.task = getTask
        document.title = `${getTask.name} - enamel`
      }
    },
    getTasks: {
      query: GetTasks,
      variables() {
        return { parent: this.task.id }
      },
      skip() {
        return !this.task.id
      },
      result({ data: {getTasks} }) {
        this.subtasks = getTasks
      },
    },
    getRecord: {
      query: GetRecord,
      variables() {
        return {
          task: this.task.id,
          date: moment().format('YYYY-MM-DD')
        }
      },
      error(err) {
        console.log(err)
      }
    },
    getUsers: GetUsers
  },
  methods: {
  }
}
</script>

<style scoped lang="scss">

.card {
  position: relative;
}

.scroll {
  flex-grow: 1;
  overflow: scroll;
}
</style>
