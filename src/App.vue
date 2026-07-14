<template>
  <BrezelApp loading-animation="pulse">
    <template #logo>
      <div class="loewe-menu-logo">
        <img
          src="/assets/loewe-energie.svg"
          class="main-logo"
          alt="LÖWE ENERGIE"
        >
      </div>
    </template>
    <template #loginLogo>
      <img
        src="/assets/loewe-energie.svg"
        class="loewe-login-logo"
        alt="LÖWE ENERGIE"
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
/* LÖWE ENERGIE brand — aligned with https://www.loewe.gmbh/ */
:root {
  --primary-color: #95c11f;
  --primary-color-hover: #7fa818;
  --primary-color-light: #eef6d4;
  --theme-primary-color: #95c11f;
  --theme-primary-color-hover: #7fa818;
  --theme-primary-color-light: #eef6d4;
  --menu-item-selected-background: #eef6d4;
}

.loewe-menu-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 18px 16px;
  border-bottom: 1px solid rgba(20, 20, 20, 0.08);
  background: #fff;
}

.main-logo {
  width: 100%;
  max-width: 168px;
  max-height: 56px;
  height: auto;
  object-fit: contain;
}

.loewe-login-logo {
  display: block;
  width: min(280px, 80%);
  max-width: 280px;
  margin: 0 auto 28px;
  height: auto;
}

/* Sidebar menu — Löwe green selection */
.ant-layout-sider {
  background: #fff !important;
  border-right: 1px solid rgba(20, 20, 20, 0.08);
}

.main-menu.ant-menu {
  border-inline-end: none !important;
  padding: 8px 0 16px;
}

.main-menu .ant-menu-item {
  margin-inline: 8px !important;
  width: calc(100% - 16px) !important;
  border-radius: 4px !important;
}

.main-menu .ant-menu-item-selected {
  background-color: var(--menu-item-selected-background) !important;
  color: #4d6a0c !important;
  font-weight: 600;
}

.main-menu .ant-menu-item-selected::after {
  border-inline-end-color: #95c11f !important;
}

.main-menu .ant-menu-item:hover {
  color: #6f9114 !important;
}

.main-menu .ant-menu-item .anticon,
.main-menu .ant-menu-item .icon {
  color: inherit;
}

/* Collapsed sider: keep mark readable */
.ant-layout-sider-collapsed .loewe-menu-logo {
  padding: 16px 8px;
}

.ant-layout-sider-collapsed .main-logo {
  max-width: 40px;
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
