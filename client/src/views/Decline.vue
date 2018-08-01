<template>
  <el-container>
    <el-header>
      <navigation></navigation>
    </el-header>

    <el-main>
      <div class="container-center">
        <div>Invitation declined.</div>
      </div>

    </el-main>
  </el-container>

</template>

<script>
import { Decline } from '../constants/query.gql'

export default {
  mounted() {
    this.decline()
  },
  methods: {
    async decline() {
      this.$apollo.mutate({
        mutation: Decline,
        variables: { id: this.$route.params.id }
      }).then(async (data) => {
      }).catch((error) => {
        console.log(error)
      })
    },
  }
}
</script>

<style scoped>
.el-button {
  width: 100%;
}
</style>
