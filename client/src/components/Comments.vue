<template>
  <div>
    <div v-for="comment in comments">
      <div class="comment-wrapper">
        <div>
          <span>{{ comment.user.name }}</span>
          <span class="small-text date">{{ formatDate(comment.createdAt) }}</span>
        </div>
        <div class="comment-body">
          {{ comment.body  }}
        </div>
      </div>
    </div>
  </div> 
</template>

<script>
import { formatDate } from '@/helpers/helpers'

export default {
  props: ['comments'],
  data() {
    return {
      formatDate
    }
  }
}

</script>

<style scoped>
.comment-wrapper {
  padding: 10px;
  margin: 10px 0;
  background-color: rgba(0,0,0,.04);
}

.date {
  padding-left: 20px;
}
</style>