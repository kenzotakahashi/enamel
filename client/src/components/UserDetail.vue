<template>
  <div class="user-detail white" @click.stop="">
    <div class="user-detail-container">
      <div class="user-detail-inner-container">

        <div class="user-main-info-container">
          <avatar :obj="user" :size="144"></avatar>
          <div class="user-name">{{user.name}}</div>
          <div class="user-role">{{user.jobTitle}}</div>
          <div class="user-signup-date">
            <span>joined: </span>
            <span class="user-signup-date-accented">{{formateDate(user.createdAt)}}</span>
          </div>
        </div>
        
        <div class="button-group-selector">
          <button class="button-group-selector-item" v-bind:class="{active: activeTab === 'settings'}"
            @click="activeTab = 'settings'">
            SETTINGS
          </button>
          <button class="button-group-selector-item" v-bind:class="{active: activeTab === 'groups'}"
            @click="activeTab = 'groups'">
            GROUPS
          </button>
        </div>
      
        <div v-show="activeTab === 'settings'">
          <div v-show="!showSettingsForm">
            <table class="user-settings-table">
              <tbody>
                <tr>
                  <td class="user-settings-label">Role</td>
                  <td class="user-settings-value">{{form.role}}</td>
                </tr>
                <tr>
                  <td class="user-settings-label">Email</td>
                  <td class="user-settings-value">{{user.email}}</td>
                </tr>
                <tr v-if="currentUser.role === 'Owner'">
                  <td class="user-settings-label">Rate/Salary</td>
                  <td class="user-settings-value" v-if="form.rateType">
                    {{form.rate}} per {{form.rateType}}
                  </td>
                </tr>
                <tr>
                  <td class="user-settings-label">Location</td>
                  <td class="user-settings-value">--</td>
                </tr>
                <tr>
                  <td class="user-settings-label">Phone number</td>
                  <td class="user-settings-value">--</td>
                </tr>
                <tr>
                  <td class="user-settings-label">Time zone</td>
                  <td class="user-settings-value">US/Pacific</td>
                </tr>
              </tbody>
            </table>

            <el-button type="text" class="text-button"
              v-if="currentUser.role === 'Owner'"
              @click="showSettingsForm = true">
              <span>Edit settings</span>
            </el-button>
          </div>
          <div v-show="showSettingsForm">
            <el-form ref="form" :model="form" size="small">
              <el-form-item>
                <label>Role</label>
                <el-select class="role-select" v-model="form.role" placeholder="please select a role">
                  <el-option label="Administrator" value="Administrator"></el-option>
                  <el-option label="Regular User" value="Regular User"></el-option>
                  <el-option label="External User" value="External User"></el-option>
                  <el-option label="Collaborator" value="Collaborator"></el-option>
                </el-select>
                <!-- <el-input v-model="form.role" placeholder="Role"></el-input> -->
                <label>{{ rateLabel }}</label>
                <div class="rate-form">
                  <div class="rate-input">
                    <el-input v-model="form.rate" type="number" min="0" placeholder="Rate">          
                    </el-input>
                  </div>
                  <el-radio-group v-model="form.rateType"
                    :style="{
                      display: 'flex',
                      'align-items': 'center'
                    }">
                    <el-radio-button label="Hour"></el-radio-button>
                    <el-radio-button label="Month"></el-radio-button>
                  </el-radio-group>
                </div>
              </el-form-item>
              <el-form-item>
                <el-button type="default" @click="updateUser">Save changes</el-button>
                <el-button type="text" @click="showSettingsForm = false">Cancel</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
        <div v-show="activeTab === 'groups'" class="user-group-section">
          <div class="user-groups-label">Member of</div>
          <div class="group-list">
            <avatar v-for="group in userGroups" :key="group.id" class="group-avatar"
              :obj="group" :size="32">
            </avatar>
          </div>
        </div>

<!--         <section v-show="user.role !== 'Owner' && activeTab === 'settings'">
          <div class="user-operations-section">
            <div class="user-operations-section-title">Delete User</div>
            <div class="user-operations-description">
              Once a user is deleted they won't be able to access their account and you won't be able to restore them. 
            </div>
            <div class="user-operations-notify">
              <el-checkbox v-model="notify">Notify user by email</el-checkbox>              
            </div>
            <el-button >Delete user</el-button>            
          </div>
        </section> -->

      </div>
      <close-button :size="24" @click="$store.dispatch('changeActiveWidget', null)"></close-button>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import { UpdateUser } from  '@/constants/query.gql'

export default {
  props: ['user', 'groups', 'currentUser'],
  data() {
    const { role, rate, rateType } = this.user
    return {
      activeTab: 'settings',
      showSettingsForm: false,
      notify: true,
      form: {
        role,
        rate,
        rateType
      }
    }
  },
  computed: {
    userGroups() {
      const id = this.user.id
      return this.groups.filter(o => o.users.includes(id))
    },
    rateLabel() {
      if (this.form.rateType === 'Hour') {
        return 'Rate'
      } else if (this.form.rateType === 'Month') {
        return 'Salary'
      } else {
        return 'Rate/Salary'
      }
    }
  },
  methods: {
    formateDate(date) {
      return moment(date).format('MMM DD, YYYY')
    },
    updateUser() {
      this.$apollo.mutate({
        mutation: UpdateUser,
        variables: {
          id: this.user.id, 
          input: this.form
        },
      }).then(() => {
        this.showSettingsForm = false
      }).catch((error) => {
        console.log(error)
      })
    }
  }
}

</script>

<style scoped>
.user-detail {
  box-sizing: border-box;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: block;
  width: 424px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.56), 0 0 1px 0 rgba(0, 0, 0, 0.16);
  z-index: 1;
}

.user-detail-container {
  display: flex;
  align-items: flex-start;
  width: 100%;
  max-height: 100%;
  /*padding-left: 8px;*/
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;    
}

.user-detail-inner-container {
  flex-grow: 0;
  flex-shrink: 0;
  width: 376px;
  height: 100%;
  padding: 32px 0 32px 24px;    
}

.user-main-info-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;    
}

.user-name {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.42;
  margin: 8px 0;
  max-width: 100%;
  -webkit-font-smoothing: antialiased;
  text-align: center;
  word-wrap: break-word;
}

.user-role {
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.56);
  max-width: 100%;
  -webkit-font-smoothing: antialiased;
  text-align: center;
  word-wrap: break-word;
}

.user-signup-date {
  font-size: 12px;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
}

.user-signup-date-accented {
  font-weight: 600;
}

.button-group-selector {
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
}

.button-group-selector-item {
  flex-grow: 1;
  transition: all 0.1s ease-out;
  min-height: 24px;
  padding: 0 7px;
  font-size: 12px;
  line-height: 1.66666667;

  border-color: #48f;
  color: #48f;
  background-color: #fff;
}

.button-group-selector-item.active {
  border-color: transparent;
  background-color: #48f;
  color: #fff;
}

.button-group-selector-item:first-child {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.button-group-selector-item:last-child {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.user-settings-table {
  width: 100%;
  margin-bottom: 16px;
  table-layout: fixed;
  border-collapse: collapse;
  border-spacing: 0;
}

td {
  vertical-align: baseline;
  box-sizing: border-box;
}

.user-settings-label {
  width: 35%;
  padding-right: 16px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.56);
  padding-bottom: 16px;
}

.user-settings-value {
  width: 65%;
  font-size: 12px;
  font-weight: 600;
  word-wrap: break-word;
}

.user-group-section {
  margin-bottom: 24px;
}

.user-groups-label {
  margin-bottom: 8px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.56);
}

.group-list {
  display: flex;
  flex-wrap: wrap;
}

.group-avatar {
  margin-right: 8px;
}

.close-button {
  position: sticky;
  top: 8px;
  right: 8px;
  z-index: 2;
}

.user-operations-section {
  padding-top: 32px;
  border-top: 1px solid rgba(0, 0, 0, 0.16);
}

.user-operations-section-title {
  color: black;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: .01875em;
}

.user-operations-description {
  margin-bottom: 8px;
  font-size: 14px;
}

.user-operations-notify {
  margin: 15px 0;
}

.role-select {
  width: 100%;
}

.rate-form {
  display: flex;
}

.rate-input {
  flex-grow: 1;
  margin-right: 10px;
}

.rate-input > div {
  display: flex;
  align-items: center;
}

</style>

