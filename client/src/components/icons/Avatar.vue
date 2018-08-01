<template>
  <span class="avatar-top" @click="$emit('click')">
    <span v-if="kind === 'unassigned'" class="avatar-core" v-bind:style="{
      backgroundColor: '#f2f7ff',
      height: size + 'px',
      width: size + 'px',
    }">
      <svg viewBox="0 0 14 9" width="14px">
        <path fill-rule="evenodd" stroke="none" fill="#bcd4ff"
          d="M9,4 C10.11,4 11,3.1 11,2 C11,0.9 10.11,0 9,0 C7.9,0 7,0.9 7,2 C7,3.1 7.9,4 9,4 L9,4 Z M9,5.2 C7.33,5.2 4,6.03 4,7.7 L4,9 L14,9 L14,7.7 C14,6.03 10.67,5.2 9,5.2 L9,5.2 Z M5,3 L3,3 L3,1 L2,1 L2,3 L0,3 L0,4 L2,4 L2,6 L3,6 L3,4 L5,4 L5,3 L5,3 Z">
        </path>
      </svg>      
    </span>
    <span v-else-if="kind === 'Team'" class="avatar-core" v-bind:style="{
      backgroundColor: '#f2f7ff',
      color: 'rgba(0,0,0,.56)',
      height: size + 'px',
      width: size + 'px',
    }">
      <i class="fas fa-users"></i>
    </span>
    <span v-else-if="obj && obj.avatarColor" class="avatar-core"
      v-bind:class="{selectedColor: selected}"
      v-bind:style="{
        backgroundColor: `#${obj.avatarColor}`,
        height: size + 'px',
        width: size + 'px',
        fontSize: size * 0.4375 + 'px'
      }"
    >
      {{getInitials}}
    </span>
    <span v-else-if="obj && !obj.avatarColor" class="avatar-core"
      v-bind:class="{selectedColor: selected}"
      v-bind:style="{
        backgroundColor: '#f2f7ff',
        color: '#48f',
        height: size + 'px',
        width: size + 'px',
      }"
    >
      <i class="far fa-envelope-open"></i>
    </span>
    <span v-else-if="number" class="avatar-core" v-bind:class="{selectedColor: selected}" v-bind:style="{
      backgroundColor: '#f2f7ff',
      color: 'rgba(0,0,0,.56)',
      height: size + 'px',
      width: size + 'px',
      fontSize: size * 0.4375 + 'px'
    }">
      {{number}}
    </span>

    <slot></slot>
  </span>
</template>

<script>

export default {
  name: 'avatar',
  props: ['obj', 'number', 'kind', 'size', 'selected'],
  computed: {
    getInitials() {
      if (this.obj.initials) return this.obj.initials
      const {firstname, lastname} = this.obj
      if (!firstname) return
      return `${firstname[0]}${lastname[0]}`.toUpperCase()
    },
  }
}
</script>


<style scoped>
.avatar-top {
  cursor: pointer;
  position: relative;
}

.avatar-core {
  color: #fff;
  border-radius: 50%;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  letter-spacing: 1px;
}

.selectedColor {
  border: 1px solid white;
  box-shadow: 0px 0px 0px 2px #48f;
}
</style>
