<template>
<div>
  <el-button type="info" @click="logout">退出</el-button>

</div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {};
  },
  methods: {
    logout() {
      sessionStorage.clear();
      this.$router.push('/login');
    },
  },
};
</script>

<style scoped>

</style>
