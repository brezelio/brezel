<template>
  <BrezelApp loading-animation="pulse">
    <template #logo>
      <div style="padding: 10px;">
        <img
          src="/assets/logo.jpg"
          class="main-logo"
          style="width: 100%; max-height: 100px"
          alt="Logo"
        >
      </div>
    </template>
    <template #loginLogo>
      <img
        src="/assets/logo.jpg"
        :style="{ maxWidth: '100%', margin: '0 auto 26px auto', display: 'block' }"
        alt="logo"
      >
    </template>
  </BrezelApp>
</template>

<script>
// Local Dist / Build
import { App as BrezelApp } from '@kibro/brezel-spa'

// Linked
// import BrezelApp from '@kibro/brezel-spa/src/components/App.vue'

export default {
  name: 'App',
  components: {
    BrezelApp,
  },
}
</script>

<style lang="scss">
.main-logo {
  padding: 8px;
}
</style>
