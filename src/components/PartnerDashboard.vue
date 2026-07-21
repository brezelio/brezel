<template>
  <div class="pd">
    <section class="pd-hero">
      <div class="pd-hero__grid" aria-hidden="true" />
      <div class="pd-hero__inner">
        <h1 class="pd-hero__title">
          <span class="pd-hero__greeting">{{ greetingLine }}</span>
          <span
            v-if="displayName"
            class="pd-hero__name"
          >{{ displayName }}</span>
        </h1>
        <p class="pd-hero__lead">
          {{ t('widgets.dashboard.lead') }}
        </p>
        <div class="pd-hero__actions">
          <button
            type="button"
            class="pd-btn pd-btn--primary"
            @click="go('quotation_wizard')"
          >
            {{ t('widgets.dashboard.cta_quote') }}
          </button>
          <button
            type="button"
            class="pd-btn pd-btn--ghost"
            @click="go('offers')"
          >
            {{ t('widgets.dashboard.cta_offers') }}
          </button>
        </div>
      </div>
    </section>

    <section class="pd-section">
      <header class="pd-section__head">
        <h2 class="pd-section__title">
          {{ t('widgets.dashboard.pipeline_title') }}
        </h2>
        <p class="pd-section__desc">
          {{ t('widgets.dashboard.pipeline_desc') }}
        </p>
      </header>
      <div
        class="pd-pipeline"
        :class="{ 'pd-pipeline--loading': loading }"
      >
        <button
          v-for="item in pipeline"
          :key="item.status"
          type="button"
          class="pd-metric"
          @click="goOffers(item.status)"
        >
          <span class="pd-metric__value">{{ item.count }}</span>
          <span class="pd-metric__label">{{ item.label }}</span>
        </button>
      </div>
    </section>

    <section class="pd-section pd-section--split">
      <div class="pd-recent">
        <header class="pd-section__head">
          <h2 class="pd-section__title">
            {{ t('widgets.dashboard.recent_title') }}
          </h2>
          <p class="pd-section__desc">
            {{ t('widgets.dashboard.recent_desc') }}
          </p>
        </header>
        <a-spin :spinning="loading">
          <ul
            v-if="recentOffers.length"
            class="pd-list"
          >
            <li
              v-for="offer in recentOffers"
              :key="offer.id"
              class="pd-list__item"
            >
              <button
                type="button"
                class="pd-list__link"
                @click="openOffer(offer)"
              >
                <span class="pd-list__main">
                  <span class="pd-list__name">{{ offerTitle(offer) }}</span>
                  <span class="pd-list__meta">{{ offerMeta(offer) }}</span>
                </span>
                <span
                  class="pd-list__status"
                  :data-status="offer.status"
                >{{ statusLabel(offer.status) }}</span>
              </button>
            </li>
          </ul>
          <p
            v-else-if="!loading"
            class="pd-empty"
          >
            {{ t('widgets.dashboard.recent_empty') }}
          </p>
        </a-spin>
      </div>

      <aside class="pd-shortcuts">
        <header class="pd-section__head">
          <h2 class="pd-section__title">
            {{ t('widgets.dashboard.shortcuts_title') }}
          </h2>
          <p class="pd-section__desc">
            {{ t('widgets.dashboard.shortcuts_desc') }}
          </p>
        </header>
        <nav class="pd-shortcuts__nav">
          <button
            type="button"
            class="pd-shortcut"
            @click="go('quotation_wizard')"
          >
            {{ t('modules.quotation_wizard.title') }}
          </button>
          <button
            type="button"
            class="pd-shortcut"
            @click="go('offers')"
          >
            {{ t('modules.offers.title') }}
          </button>
          <button
            type="button"
            class="pd-shortcut"
            @click="go('customers')"
          >
            {{ t('modules.customers.title') }}
          </button>
          <button
            type="button"
            class="pd-shortcut"
            @click="go('contracts')"
          >
            {{ t('modules.contracts.title') }}
          </button>
        </nav>
      </aside>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Api, Module, brezelRouter } from '@kibro/brezel-spa'

const { t } = useI18n()

const loading = ref(true)
const counts = ref({
  draft: 0,
  calculated: 0,
  sent: 0,
  accepted: 0,
})
const recentOffers = ref([])

const user = computed(() => Api.getUser())
const displayName = computed(() => user.value?.firstname || user.value?.name || '')
const greetingLine = computed(() => (
  displayName.value
    ? t('widgets.dashboard.greeting_named')
    : t('widgets.dashboard.greeting')
))

const pipeline = computed(() => ([
  { status: 'draft', count: counts.value.draft, label: t('modules.offers.choice.status.draft') },
  { status: 'calculated', count: counts.value.calculated, label: t('modules.offers.choice.status.calculated') },
  { status: 'sent', count: counts.value.sent, label: t('modules.offers.choice.status.sent') },
  { status: 'accepted', count: counts.value.accepted, label: t('modules.offers.choice.status.accepted') },
]))

function go(moduleIdentifier) {
  brezelRouter.toModule(moduleIdentifier, 'module')
}

function goOffers(status) {
  brezelRouter.toModule('offers', 'module', null, {
    query: { status },
  })
}

function openOffer(offer) {
  brezelRouter.toModule('offers', 'module.show', offer.id)
}

function offerTitle(offer) {
  return offer.brezel_name || `${t('modules.offers.title')} ${offer.number ?? offer.id}`
}

function offerMeta(offer) {
  const customer = offer.customer?.brezel_name || offer.customer?.company || ''
  return customer || t('widgets.dashboard.no_customer')
}

function statusLabel(status) {
  if (!status) {
    return '—'
  }
  return t(`modules.offers.choice.status.${status}`)
}

async function countByStatus(status) {
  const offersModule = Module.byIdentifier('offers')
  const page = await Api.fetchEntitiesPaginated(offersModule, 1, {
    per_page: 1,
    pre_filters: [[{ column: 'status', operator: '=', value: status }]],
  })
  return page?.total ?? 0
}

async function loadDashboard() {
  loading.value = true
  try {
    const offersModule = Module.byIdentifier('offers')
    const [draft, calculated, sent, accepted, recent] = await Promise.all([
      countByStatus('draft'),
      countByStatus('calculated'),
      countByStatus('sent'),
      countByStatus('accepted'),
      Api.fetchEntities(offersModule, 1, {
        per_page: 6,
        order_by: 'updated_at',
        order: 'desc',
        columns: ['number', 'status', 'customer', 'type', 'updated_at', 'created_at'],
      }),
    ])
    counts.value = { draft, calculated, sent, accepted }
    recentOffers.value = recent || []
  } catch (error) {
    console.error(error)
    counts.value = { draft: 0, calculated: 0, sent: 0, accepted: 0 }
    recentOffers.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap');

.pd {
  --pd-ink: #141414;
  --pd-muted: #5c5c5c;
  --pd-paper: #f7f8f5;
  --pd-panel: #ffffff;
  --pd-line: rgba(20, 20, 20, 0.1);
  --pd-green: #95c11f;
  --pd-green-deep: #6f9114;
  --pd-green-soft: rgba(149, 193, 31, 0.14);
  --pd-shadow: 0 16px 40px rgba(20, 20, 20, 0.08);
  font-family: 'Source Sans 3', sans-serif;
  color: var(--pd-ink);
  min-height: calc(100vh - 120px);
  background:
    radial-gradient(ellipse 70% 45% at 0% 0%, rgba(149, 193, 31, 0.16), transparent 55%),
    radial-gradient(ellipse 50% 35% at 100% 8%, rgba(149, 193, 31, 0.08), transparent 50%),
    linear-gradient(180deg, #ffffff 0%, var(--pd-paper) 100%);
  margin: -16px;
  padding: 0 0 48px;
}

.pd-hero {
  position: relative;
  overflow: hidden;
  padding: 44px 40px 52px;
  color: var(--pd-ink);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(247, 248, 245, 0.96) 100%);
  border-bottom: 1px solid var(--pd-line);
  animation: pd-fade-up 0.65s ease both;
}

.pd-hero__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(149, 193, 31, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(149, 193, 31, 0.07) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.55), transparent 85%);
  pointer-events: none;
}

.pd-hero__inner {
  position: relative;
  max-width: 720px;
}

.pd-hero__title {
  display: flex;
  flex-direction: column;
  margin: 0 0 12px;
  font-family: Outfit, sans-serif;
  font-size: clamp(1.85rem, 3.6vw, 2.65rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
  max-width: 22ch;
}

.pd-hero__name {
  display: block;
}

.pd-hero__lead {
  margin: 0 0 28px;
  max-width: 36rem;
  font-size: 1.08rem;
  line-height: 1.55;
  color: var(--pd-muted);
}

.pd-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.pd-btn {
  border: 0;
  border-radius: 4px;
  padding: 12px 22px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.pd-btn:hover {
  transform: translateY(-1px);
}

.pd-btn--primary {
  background: var(--pd-green);
  color: #fff;
  box-shadow: 0 10px 24px rgba(149, 193, 31, 0.35);
}

.pd-btn--primary:hover {
  background: #a6d12a;
  color: #fff;
}

.pd-btn--ghost {
  background: transparent;
  color: var(--pd-ink);
  box-shadow: inset 0 0 0 1.5px rgba(20, 20, 20, 0.28);
}

.pd-btn--ghost:hover {
  background: rgba(20, 20, 20, 0.04);
}

.pd-section {
  padding: 36px 40px 0;
  animation: pd-fade-up 0.65s ease 0.1s both;
}

.pd-section--split {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(240px, 0.9fr);
  gap: 28px;
  align-items: start;
  animation-delay: 0.18s;
}

.pd-section__head {
  margin-bottom: 18px;
}

.pd-section__title {
  margin: 0 0 6px;
  font-family: Outfit, sans-serif;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--pd-ink);
}

.pd-section__desc {
  margin: 0;
  color: var(--pd-muted);
  font-size: 0.95rem;
}

.pd-pipeline {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.pd-pipeline--loading {
  opacity: 0.65;
}

.pd-metric {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  padding: 22px 20px;
  border: 1px solid var(--pd-line);
  border-radius: 4px;
  background: var(--pd-panel);
  text-align: left;
  cursor: pointer;
  box-shadow: var(--pd-shadow);
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.pd-metric:hover {
  border-color: var(--pd-green);
  transform: translateY(-2px);
}

.pd-metric__value {
  font-family: Outfit, sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--pd-green-deep);
  line-height: 1;
}

.pd-metric__label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--pd-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pd-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--pd-line);
}

.pd-list__item + .pd-list__item {
  border-top: 1px solid var(--pd-line);
}

.pd-list__link {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 4px;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
  font: inherit;
  transition: padding-left 0.2s ease;
}

.pd-list__link:hover {
  padding-left: 8px;
}

.pd-list__main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.pd-list__name {
  font-weight: 700;
  color: var(--pd-ink);
}

.pd-list__meta {
  font-size: 0.9rem;
  color: var(--pd-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pd-list__status {
  flex-shrink: 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--pd-green-deep);
  padding: 6px 10px;
  border-radius: 4px;
  background: var(--pd-green-soft);
}

.pd-list__status[data-status='draft'] {
  background: rgba(20, 20, 20, 0.06);
  color: #444;
}

.pd-list__status[data-status='accepted'] {
  background: rgba(149, 193, 31, 0.22);
  color: #4d6a0c;
}

.pd-empty {
  margin: 0;
  padding: 20px 0;
  color: var(--pd-muted);
}

.pd-shortcuts__nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pd-shortcut {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--pd-line);
  border-radius: 4px;
  background: var(--pd-panel);
  color: var(--pd-ink);
  font: inherit;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.pd-shortcut:hover {
  transform: translateX(4px);
  border-color: var(--pd-green);
  background: #fcfef6;
}

@keyframes pd-fade-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 960px) {
  .pd-section--split {
    grid-template-columns: 1fr;
  }

  .pd-pipeline {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .pd-hero,
  .pd-section {
    padding-left: 20px;
    padding-right: 20px;
  }

  .pd-pipeline {
    grid-template-columns: 1fr;
  }
}
</style>
