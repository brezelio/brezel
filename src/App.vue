<template>
  <BrezelApp loading-animation="pulse">
    <template #logo>
      <div>
        <img
          src="/assets/logo.svg"
          class="main-logo"
          style="width: 100%; max-height: 100px"
          alt="Logo"
        >
      </div>
    </template>
    <template #loginLogo>
      <img
        src="/assets/logo.svg"
        :style="{ maxWidth: '100%', margin: '0 auto 26px auto', display: 'block' }"
        alt="logo"
      >
    </template>
  </BrezelApp>
</template>

<script>
import { App as BrezelApp } from '@kibro/brezel-spa'

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

/* Field groups: label and value on one line, vertically centered */
.ant-card-body {
  .field-group-item-list {
    width: 100%;

    tr.field-group-item {
      td {
        vertical-align: middle !important;
        padding-block: 6px;
      }

      td.field-group-label,
      td.td-left-xs {
        text-align: left !important;
        white-space: nowrap;
        padding-right: 16px;
        width: 1%;
      }

      td.td-right-xs {
        text-align: right;
        width: 99%;
      }

      .field {
        line-height: 1.5715;
        margin: 0;
      }
    }
  }

  .field-group-item-list-vertical {
    .field-group-label {
      margin-bottom: 2px;
      line-height: 1.5715;
    }

    .field-group-item .field .ant-form-item {
      margin-bottom: 0;
    }
  }
}
</style>
