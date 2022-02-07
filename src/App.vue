<template>
  <BrezelApp>
    <template slot="logo">
      <img
        src="/assets/logo.svg"
        style="width: 100%; max-height: 100px"
        alt="Logo"
      >
    </template>
    <template slot="loginLogo">
      <img
        src="/assets/logo.svg"
        :style="{ maxWidth: '100%', margin: '0 auto 26px auto', display: 'block' }"
        alt="logo"
      >
    </template>
  </BrezelApp>
</template>
<script>
import BrezelApp from '@kibro/brezel-spa/src/components/App'

export default {
  name: 'App',
  components: {
    BrezelApp
  }
}
</script>

<style lang="scss">
</style>
