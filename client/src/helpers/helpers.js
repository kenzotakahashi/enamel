import moment from 'moment'

export const formatDate = (date) => {
  const day = moment(date).format('MMM DD')
  const today = moment().format('MMM DD')
  return today === day ? moment(date).format('HH:mm') : day
}

export function randomChoice(arr) {
  return arr[Math.floor(arr.length * Math.random())]
}

export const backgroundStrongColorMap = {
  New: '#1976d2',
  'In Progress': '#0097a7',
  Completed: '#689f38',
  'On Hold': '#616161',
  Cancelled: '#616161',
}

export function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase())
}