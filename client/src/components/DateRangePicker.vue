<template>
	<div class="daterange-picker bottom" @click.stop="">
		<div class="title">
			When do you want this task to be done?
		</div>
		<div class="planning-types">
			<div v-for="planning in planningList" :key="planning"
				@click="changePlanningType(planning)"
				class="planning-type" v-bind:class="{active: planningType === planning}">
				{{planning}}
			</div>
		</div>
		<div class="planning-controls">
			<div class="planning-dates">
				<div class="header">Dates:</div>
				<div>
					<form>
						<div class="form-item">
							<div class="form-element" @click.stop="focusInput('startDate')">
								<input type="text" v-model="startDate"
									ref="startDate" @input="">	
								</input>
								<div v-show="showEmptyField" class="empty-field"
									@mouseover="emptyField = today" @mouseleave="emptyField = defaultField">
									{{emptyField}}
								</div>
							</div>
						</div>

						<div class="separator">-</div>

						<div class="form-item">
							<div class="form-element" @click.stop="focusInput('finishDate')">
								<input type="text" v-model="finishDate"
									ref="finishDate" @input="">
								</input>
								<div v-show="showEmptyField" class="empty-field"
									@mouseover="emptyField = today" @mouseleave="emptyField = defaultField">
									{{emptyField}}
								</div>
							</div>
						</div>
					</form>
				</div>
			</div>
			<div class="planning-duration">
				<div class="header">Duration:</div>
					<form>
						<div class="form-item">
<!-- 							<div class="form-element">
								<input type="number" class="duration" min="0"
									v-model="duration"></input>
							</div> -->
							<span>{{duration}}</span>
							<span class="duration-label">{{durationLabel}}</span>
						</div>
					</form>				
			</div>
		</div>

		<section>
		  <el-button type="primary" @click="updateTask">OK</el-button>
		  <el-button type="text" @click="changeActiveWidget(null)">
		  	Cancel
		  </el-button>          
		</section>
	</div>
</template>

<script>
import moment from 'moment'
import { UpdateTask } from '@/constants/query.gql'

export default {
	props: ['task'],
	data() {
		const hasDate = this.task.startDate !== null
		const startDate = hasDate
			? moment(this.task.startDate).format('MM/DD/YYYY')
			: null
		const finishDate = hasDate
			? moment(this.task.finishDate).format('MM/DD/YYYY')
			: null

		const today = moment().format('MM/DD/YYYY')
		const tomorrow = moment().add(1, 'days').format('MM/DD/YYYY')
		const nextWeek = {
			startDate: moment().day(8).format('MM/DD/YYYY'),
			finishDate: moment().day(12).format('MM/DD/YYYY')
		}

		return {
			planningType: this.getPlanningType(startDate, finishDate, today, tomorrow, nextWeek),
			planningList: ['backlogged','today','tomorrow','next week','custom date'],
			today,
			tomorrow,
			nextWeek,
			defaultField: 'MM/DD/YYYY',
			emptyField: 'MM/DD/YYYY',
			showEmptyField: !hasDate,
			startDate,
			finishDate,
			duration: this.task.duration
		}
	},
	computed: {
		durationLabel() {
			if (this.duration === 1) {
				return 'day'
			} else if (this.duration > 1) {
				return 'days'
			} else {
				return ''
			}
		}
	},
	methods: {
		getPlanningType(startDate, finishDate, today, tomorrow,  nextWeek) {
			if (startDate === today && finishDate === today) {
				return 'today'
			} else if (startDate === tomorrow && finishDate === tomorrow) {
				return 'tomorrow'
			} else if (startDate === nextWeek.startDate &&
								finishDate === nextWeek.finishDate) {
				return 'next week'
			} else if (startDate) {
				return 'custom date'
			} else {
				return 'backlogged'
			}
		},
		focusInput(formType) {
			this.showEmptyField = false
			if (!this.startDate) {
				this.startDate = this.today
				this.finishDate = this.today
				this.planningType = 'today'
			}
			this.$refs[formType].focus()
		},
		changePlanningType(kind) {
			this.planningType = kind
			if (kind === 'backlogged') {
				this.startDate = null
				this.finishDate = null
				this.showEmptyField = true
			} else if (kind === 'today' || kind === 'custom date' && !this.startDate) {
				this.startDate = this.today
				this.finishDate = this.today
				this.duration = 1
				this.showEmptyField = false
			} else if (kind === 'tomorrow') {
				this.startDate = this.tomorrow
				this.finishDate = this.tomorrow
				this.duration = 1
				this.showEmptyField = false
			} else if (kind === 'next week') {
				this.startDate = this.nextWeek.startDate
				this.finishDate = this.nextWeek.finishDate
				this.duration = 5
				this.showEmptyField = false
			}
		},
		checkPlanningType() {
			// if (this.startDate === this.today && this.finishDate === this.today) {
			// }
		},
		parseDate(date) {
			const splitted = date.split('/')
			if (splitted.length !== 3) return false
			return splitted.map(o => o.length >= 2 ? o : `0${o}`).join('/')
		},
		updateTask(e) {
			const startDate = this.parseDate(this.startDate)
			const finishDate = this.parseDate(this.finishDate)
			const duration = moment.duration(moment(finishDate).diff(moment(startDate))).asDays() + 1
		  this.$apollo.mutate({
		    mutation: UpdateTask,
		    variables: {
		    	id: this.task.id,
		    	input: {
		    		startDate,
		    		finishDate,
		    		duration
		    	}
		    },
		  }).then(() => {
				this.changeActiveWidget(null)
		  }).catch((error) => {
		    console.log(error)
		  })
		},
		changeActiveWidget(key) {
		  this.$store.dispatch('changeActiveWidget', key)
		},
	}
}
</script>

<style scoped>
.daterange-picker {
  box-sizing: border-box;
  text-align: center;
  background-color: #fff;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.16), 0 0 1px 0 rgba(0, 0, 0, 0.16);

  /* Position the tooltip */
  position: absolute;
  z-index: 10000;

	text-align: left;
  width: 550px;
}

.daterange-picker.bottom {
  top: 155px;
  left: -165px;  
}

.title {
	font-size: 17px;
	color: #111;
	line-height: 27px;
	padding: 18px;
}

.planning-type {
	display: inline-block;
	font-weight: 700;
	font-size: 11px;
	color: #504f4f;
	line-height: 18px;
	margin-left: 18px;
	cursor: pointer;
  border-bottom: 2px solid transparent;
	text-transform: uppercase;
}

.planning-type.active {
  border-bottom-color: #5285b8;
}

.planning-controls {
	padding: 18px;
}

.planning-dates {
	width: 236px;
	display: inline-block;
	vertical-align: top;
}

.planning-duration {
	width: 236px;
	display: inline-block;
	vertical-align: top;
}

.header {
	font-size: 17px;
	color: #111;
	line-height: 27px;
	margin-bottom: 9px; 
}

.separator {
	display: inline-block;
	padding: 0 6px;
	vertical-align: top;
	font-weight: 700;
	font-size: 15px;
}

.form-item {
	height: 27px;
	display: inline-block;
	line-height: 18px;
}

.form-element {
	display: inline-block;
	position: relative;
  border: 1px solid;
	border-color: #d1d1d3;
	border-radius: 2px;
}

.form-element > input {
	height: 25px;
	vertical-align: middle;
	box-sizing: border-box;
	width: 105px;
	background-color: #fff;
	padding: 0 8px;
}

.form-element > input.duration {
	width: 50px;
}

.empty-field {
	font-size: 13px;
  line-height: 18px;
  font-weight: 400;
  color: gray;
  padding: 4px 8px 0;
  position: absolute;
  overflow: hidden;
  width: 89px;
  height: 23px;
  left: 0px;
  top: 0px;
}

.duration-label {
	margin-left: 7px;
}

section {
	padding: 9px 18px 15px;
}

</style>