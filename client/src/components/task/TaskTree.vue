<template name="tree">
  <li>
    <div class="tree-item" v-bind:class="{active: isSeletecd}">
      <span @click="toggle" class="task-fold-button"
        v-bind:style="{visibility: isParent ? 'visible' : 'hidden'}">
        <i :class="`fas fa-angle-${open ? 'down' : 'right'}`"></i>
      </span>

      <router-link :to="{name: 'task', params: {taskId: model.id}}"
        class="task-info-container">
        <span class="task-info-wrapper">
          <div class="user-container">
            <avatar v-if="model.assignees && model.assignees.length === 1" :obj="model.assignees[0]"
              :size="24" class="task-avatar"></avatar>
            <avatar v-else-if="model.assignees && model.assignees.length > 1" :number="model.assignees.length"
              :size="24" class="task-avatar"></avatar>
            <avatar v-else :size="24" class="task-avatar" kind="unassigned"></avatar>
            <span class="task-title">{{ model.name }}</span>              
          </div>
        </span>
        <span class="task-status" v-bind:style="{color: backgroundStrongColorMap[model.status]}">
          {{ model.status }}</span>
      </router-link>
    </div>

    <ul class="tree" v-show="open" v-if="isParent">
      <tree
        v-for="task in getTasks"
        :key="task.id"
        :model="task"
        @open="openArrow"
      >
      </tree>
    </ul>
  </li>
</template>

<script>
import TaskTree from './TaskTree'
import { GetTasks } from '@/constants/query.gql'
import { backgroundStrongColorMap } from '@/helpers/helpers'

export default {
  name: 'tree',
  components: {
    'tree': TaskTree,
  },
  props: {
    model: Object
  },
  mounted() {
    if (this.isSeletecd) {
      this.$emit('open')
    }
  },
  data() {
    return {
      open: false,
      getTasks: [],
      backgroundStrongColorMap
    }
  },
  computed: {
    isParent() {
      return this.getTasks.length > 0
    },
    isSeletecd() {
      return this.$route.params.taskId === this.model.id
    }
  },
  apollo: {
    getTasks: {
      query: GetTasks,
      variables() {
        return { parent: this.model.id }
      },
      error(error) {
        console.error(error)
      }
    }
  },
  methods: {
    toggle() {
      this.open = !this.open
    },
    openArrow() {
      this.open = true
      this.$emit('open')
    }
  }
};
</script>

<style scoped lang="scss">
.task-avatar {
  margin-right: 8px;
  align-self: center;
}

.task-fold-button {
  width: 18px;
  margin: 0 4px;
  z-index: 5;
  text-align: center;
  // color: rgba(0, 0, 0, 0.9);
}

.task-fold-button:hover {
  color: #48f;
}

.task-info-container {
  display: flex;
  position: static;
  width: 100%;
  height: auto;
  // border-top: 1px solid $black;
}

.task-info-wrapper {
  flex-grow: 1;
  display: flex;
  align-items: center;
  width: 0;
  overflow: hidden;
}

.task-status {
  flex-shrink: 0;
  width: 100px;
  max-width: 128px;
  margin: 0 8px;
  /*line-height: 16px;*/
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 600;
}

.tree-item {
  line-height: 40px;
}

.tree-item:hover {
  background-color: $hover;
}

.tree-item.active {
  background-color: #4488ff29;
}

.task-title {
  font-size: 14px;
  white-space: nowrap;
}
</style>
