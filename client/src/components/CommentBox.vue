<template>
  <el-row class="comment-box">
    <el-col :span="20">
      <input class="no-outline" type="text" name="comment" v-model="form.body"
        placeholder="Add comment"></input>
    </el-col>
    <el-col :span="4">
      <el-button type="primary" size="small" @click="createComment">Send</el-button>
    </el-col>
  </el-row>
</template>

<script>
import { GetComments, CreateComment } from '../constants/query.gql'

export default {
  props: ['parent'],
  data() {
    return {
      form: {
        body: ''
      }
    }
  },
  methods: {
    createComment() {
      if (!this.form.body) return
      const parent = this.parent
      this.$apollo.mutate({
        mutation: CreateComment,
        variables: {
          parent: {
            "kind": "Task",
            "item": parent
          },
          body: this.form.body
        },
        update: (store, { data: { createComment } }) => {
          try {
            const data = store.readQuery({
              query: GetComments,
              variables: {parent}
            })
            data.getComments.push(createComment)
            store.writeQuery({
              query: GetComments,
              variables: {parent},
              data
            })
          } catch(err) {
            console.log(err)
          }
        }
      }).then(() => {
        this.form.body = ''
      }).catch((error) => {
        console.log(error)
      })
    }
  }
}

</script>

<style scoped>

</style>
