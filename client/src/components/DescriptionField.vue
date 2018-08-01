<template>
  <div @click="openForm" class="description-field">
    <span v-show="!showForm" class="description-text">Click to add the description</span>
    <div v-show="showForm">
      <textarea
        cols="5"
        ref="descriptionform"
        v-model="description"
        @keyup.esc="closeForm"
        @focus="showButton = true"
      >
      </textarea>
      <div class="save-button" v-bind:style="{visibility: showButton ? 'visible' : 'hidden'}" >
        <el-button type="primary" size="small" @click.stop="updateDescription"
          >Save</el-button>        
      </div>
    </div>
  </div>
</template>

<script>
import { UpdateTask, UpdateFolder } from '../constants/query.gql'

export default {
  props: ['model', 'kind'],
  data() {
    return {
      showButton: false,
      isFormOpen: false,
      description: this.model.description
    }
  },
  computed: {
    showForm() {
      return this.isFormOpen || this.description
    }
  },
  methods: {
    openForm() {
      this.isFormOpen = true
      this.$nextTick(() => this.$refs.descriptionform.focus())
    },
    closeForm() {
      this.isFormOpen = false
    },
    updateDescription(e) {
      this.$apollo.mutate({
        mutation: this.kind === 'task' ? UpdateTask : UpdateFolder,
        variables: {
          id: this.model.id,
          input: {description: this.description}
        },
      }).then(() => {
        this.isFormOpen = false
        this.showButton = false
        this.cancel(e)
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
.description-field {
  padding: 30px 30px;
  border-bottom: 1px solid;
  border-color: rgba(0,0,0,.16);
  cursor: pointer;
}

textarea {
  width: 100%;
  height: 100px;
  display: block;
}

.description-field:hover .description-text {
  color: rgba(0, 0, 0, 0.56);
}

.description-text {
  font-size: 18px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.32);
}

.save-button {
  display: flex;
  justify-content: flex-end;
}

</style>
