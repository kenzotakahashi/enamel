<template>
	<div class="task-setting-bar">
		<div class="daterange-wrapper">
			<el-button type="text" class="black-text-button"
			  @click.stop="changeActiveWidget('daterange')">
			  <i class="far fa-calendar"></i>
				<span class="date-button-label">{{ dateLabel }}</span>
			</el-button>				
		</div>
		<div class="record-wrapper">
			<el-button type="text" class="black-text-button"
			  @click.stop="changeActiveWidget('record-form')">
			  <i class="far fa-clock"></i>
				<span class="date-button-label">{{ recordLabel }}</span>
			</el-button>					
		</div>

		<div class="state-bar-add-subtask">
		  <el-button type="text" @click="$emit('toggleSubtaskView')"
		    v-bind:class="{'black-text-button': !showSubtasks}">
		    {{subtasks.length > 0 ? formatSubtaskCount(subtasks) : 'Add subtask'}}
		  </el-button>
		</div>

	</div>
</template>

<script>
import { mapState } from 'vuex'
import moment from 'moment'

export default {
	props: ['task', 'subtasks', 'showSubtasks', 'record'],
	computed: {
		...mapState(['activeWidget']),
		dateLabel() {
			const { startDate, finishDate, duration } = this.task
			if (startDate) {
				const start = moment(startDate).format('MMM DD')
				if (startDate === finishDate) {
					return `${start} (1d)`
				} else {
					return `${start} - ${moment(finishDate).format('MMM DD')} (${duration}d)`
				}
			} else if (duration) {
				return `Backlogged (${duration}d)`
			} else {
				return 'Set date'
			}
		},
		recordLabel() {
			if (!this.record || !this.record.timeSpent) return '0:00'
			const [ hours, minutes ] = this.record.timeSpent.split(':')
			return `${hours}:${minutes > 0 ? minutes : '00'}`
		}
	},
	methods: {
		changeActiveWidget(key) {
		  this.$store.dispatch('changeActiveWidget', key)
		},
		formatSubtaskCount(subtasks) {
		  const count = subtasks.length
		  return `${count} subtask${count > 1 ? 's' : ''}`
		},
	}
}
</script>

<style scoped lang="scss">
.task-setting-bar {  
  display: flex;
  height: 44px;
  position: relative;
  padding-right: 8px;
  padding-left: 18px;
  border-top: solid 1px;
  border-bottom: solid 1px;
  border-color: rgba(0,0,0,.16);
  & > div {
	  padding-right: 10px;
  }
}

.fa-calendar, .fa-clock {
	padding-right: 7px;
}

.date-button-label {
	font-size: 12px;
}

.record-wrapper {
	flex-grow: 1;
}

.daterange-wrapper, .record-wrapper {
	display: flex;
}

.state-bar-add-subtask {
  display: flex;
  align-items: center;
  // padding: 0 10px;
}
	
</style>