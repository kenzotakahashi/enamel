<template>
  <el-container>
    <el-header >
      <navigation></navigation>
    </el-header>

    <el-main>
      <div class="container-center">
        <div>Welcome to enamel! Finish setting up your account</div>        

        <div v-if="error" class="error">
          {{ error }}
        </div>

        <el-form ref="form" :model="form">
          <el-form-item>
            <label>First name</label>
            <el-input v-model="form.firstname" placeholder="Your first name"></el-input>
            <label>Last name</label>
            <el-input v-model="form.lastname" placeholder="Your last name"></el-input>
            <label>Password</label>
            <el-input v-model="form.password" type="password" placeholder="Password"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click.once="signup">Complete</el-button>
          </el-form-item>
        </el-form>

      </div>

    </el-main>
  </el-container>

</template>

<script>
import { Signup } from '../constants/query.gql'

export default {
  data() {
    return {
      error: false,
      form: {
        firstname: '',
        lastname: '',
        password: '',
      }
    }
  },
  methods: {
    async signup() {
      // const validated = await this.$validator.validate()
      const { firstname, lastname, password } = this.form
      if (!(firstname && lastname && password)) {
        this.error = 'Please complete the form'
        return
      }
      this.$apollo.mutate({
        mutation: Signup,
        variables: {
          id: this.$route.params.id,
          firstname,
          lastname,
          password
        }
      }).then(({data: {signup}}) => {
        const id = signup.user.id
        const token = signup.token
        this.saveUserData(id, token)

        this.$router.push({name: 'workspace'})
      }).catch((error) => {
        this.error = 'Something went wrong'
        console.log(error)
      })
    },
    saveUserData (id, token) {
      localStorage.setItem('user-id', id)
      localStorage.setItem('user-token', token)
      this.$root.$data.userId = localStorage.getItem('user-id')
    },
  }
}
</script>

<style scoped>

.el-button {
  width: 100%;
}

.error {
  padding-top: 10px;
}
</style>

