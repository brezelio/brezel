<template>
  <BrezelApp>
    <template slot="logo">
      <img src="/assets/logo.png" alt="Logo">
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
