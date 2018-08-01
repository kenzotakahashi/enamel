<template>
  <div class="modal-mask white">
    <div class="modal-wrapper">
      <div class="modal-container">
        <el-row>
          <el-col :span="12">
            <h3>Create {{mode}}</h3>

            <div>
              <el-input type="text" name="foldername" ref="foldername" v-model="form.name"
                :placeholder="`${mode} name`" :autofocus="true" @keyup.esc="$emit('close')">
              </el-input>
            </div>
<!--             <div class="radio-group">
              <el-radio v-model="mode" label="project">
                Project
              </el-radio>
              <div class="description">
                Use Projects to manage tasks that are part of a larger goal. Projects can have their own attributes separate from tasks, like Status and Finish Date, which you can track.
              </div>
              <el-radio v-model="mode" label="folder">
                Folder
              </el-radio>
              <div class="description">
                Use Folders as containers to organize and categorize work, making it easier to find and share information. Unlike Projects, Folders do not have attributes you can track.
              </div>
            </div> -->

            <div class="button-group">
              <el-button type="primary" @click="create(mode)">Create</el-button>
              <el-button type="text" @click="$emit('close')">Cancel</el-button>              
            </div>

          </el-col>
        </el-row>

      </div>
    </div>
  </div>
</template>

<script>
import { CreateFolder, CreateProject, GetFolders } from '../constants/query.gql'

export default {
  props: ['config'],
  data() {
    return {
      form: {
        name: '',
        shareWith: [],
        owners: []
      },
      mode: this.config.mode
    }
  },
  mounted() {
    this.$refs.foldername.focus()
  },
  methods: {
    create(mode) {
      const { name, shareWith, owners } = this.form
      if (!name) return
      const parent = this.config.parent
      if (mode === 'folder') {
        this.createFolder(name, parent, shareWith)
      } else {
        this.createProject(name, parent, shareWith, owners)
      }
    },
    createFolder(name, parent, shareWith) {
      this.$apollo.mutate({
        mutation: CreateFolder,
        variables: {name, parent, shareWith},
        update: (store, { data: { createFolder } }) => {
          const variables = parent ? { parent } : {}
          try {
            const data = store.readQuery({
              query: GetFolders,
              variables
            })
            data.getFolders.push(createFolder)
            store.writeQuery({
              query: GetFolders,
              variables,
              data
            })
          } catch(err) {
            console.log(err)
          }
        }
      }).then(({ data: { createFolder } }) => {
        this.$emit('close')
        this.$router.push({name: 'folder', params: {id: createFolder.id} })
      }).catch((error) => {
        console.log(error)
      })
    },
    createProject(name, parent, shareWith, owners) {
      this.$apollo.mutate({
        mutation: CreateProject,
        variables: {name, parent, shareWith, owners},
        update: (store, { data: { createProject } }) => {
          try {
            const data = store.readQuery({
              query: GetFolders,
              variables: {parent}
            })
            data.getFolders.push(createProject)
            store.writeQuery({
              query: GetFolders,
              variables: {parent},
              data
            })
          } catch(err) {
            console.log(err)
          }
        }
      }).then(({ data: { createProject } }) => {
        this.$emit('close')
        this.$router.push({name: 'folder', params: {id: createProject.id} })
      }).catch((error) => {
        console.log(error)
      })
    }
  }
}

</script>

<style scoped>

.modal-container {
  width: 600px;
}

.radio-group {
  padding: 20px 0;
}

.description {
  position: relative;
  left: 28px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.56);
  line-height: 1.67;
  padding-bottom: 10px;
}

.button-group {
  margin-top: 20px;
}
</style>
