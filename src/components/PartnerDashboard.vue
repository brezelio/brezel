<template>
  <div class="pd">
    <section class="pd-hero">
      <div class="pd-hero__glow" aria-hidden="true" />
      <div class="pd-hero__inner">
        <div class="pd-hero__brand">
          <img
            src="/assets/logo.svg"
            alt=""
            class="pd-hero__mark"
          >
          <p class="pd-hero__name">
            {{ t('widgets.dashboard.brand') }}
          </p>
        </div>
        <h1 class="pd-hero__title">
          {{ greeting }}
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
const greeting = computed(() => {
  const name = user.value?.firstname || user.value?.name || ''
  return name
    ? t('widgets.dashboard.greeting_named', { name })
    : t('widgets.dashboard.greeting')
})

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
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,700&family=Manrope:wght@400;500;600;700&display=swap');

.pd {
  --pd-ink: #1a0a0a;
  --pd-muted: #6b4a4a;
  --pd-paper: #fff8f0;
  --pd-panel: rgba(255, 252, 247, 0.92);
  --pd-line: rgba(109, 1, 1, 0.12);
  --pd-red: #c40808;
  --pd-red-deep: #6d0101;
  --pd-gold: #ef9300;
  --pd-gold-bright: #ffd60d;
  --pd-shadow: 0 18px 50px rgba(63, 0, 1, 0.12);
  font-family: Manrope, sans-serif;
  color: var(--pd-ink);
  min-height: calc(100vh - 120px);
  background:
    radial-gradient(ellipse 80% 50% at 10% -10%, rgba(255, 214, 13, 0.28), transparent 55%),
    radial-gradient(ellipse 60% 40% at 100% 0%, rgba(196, 8, 8, 0.12), transparent 50%),
    linear-gradient(180deg, #fff8f0 0%, #f4ebe3 48%, #efe4da 100%);
  margin: -16px;
  padding: 0 0 48px;
}

.pd-hero {
  position: relative;
  overflow: hidden;
  padding: 48px 40px 56px;
  color: #fff8f0;
  background:
    linear-gradient(135deg, rgba(63, 0, 1, 0.92) 0%, rgba(109, 1, 1, 0.88) 42%, rgba(196, 8, 8, 0.78) 100%),
    linear-gradient(180deg, #3f0001, #6d0101);
  animation: pd-fade-up 0.7s ease both;
}

.pd-hero__glow {
  position: absolute;
  inset: auto -10% -40% 40%;
  height: 70%;
  background: radial-gradient(circle, rgba(255, 214, 13, 0.35), transparent 65%);
  pointer-events: none;
  animation: pd-pulse 6s ease-in-out infinite;
}

.pd-hero__inner {
  position: relative;
  max-width: 760px;
}

.pd-hero__brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
}

.pd-hero__mark {
  width: 52px;
  height: auto;
  filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.25));
}

.pd-hero__name {
  margin: 0;
  font-family: Fraunces, serif;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.pd-hero__title {
  margin: 0 0 12px;
  font-family: Fraunces, serif;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  line-height: 1.15;
  max-width: 14ch;
}

.pd-hero__lead {
  margin: 0 0 28px;
  max-width: 38rem;
  font-size: 1.05rem;
  line-height: 1.55;
  color: rgba(255, 248, 240, 0.86);
}

.pd-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.pd-btn {
  border: 0;
  border-radius: 999px;
  padding: 12px 22px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.pd-btn:hover {
  transform: translateY(-2px);
}

.pd-btn--primary {
  background: linear-gradient(135deg, var(--pd-gold-bright), var(--pd-gold));
  color: var(--pd-red-deep);
  box-shadow: 0 10px 28px rgba(239, 147, 0, 0.35);
}

.pd-btn--ghost {
  background: transparent;
  color: #fff8f0;
  box-shadow: inset 0 0 0 1.5px rgba(255, 248, 240, 0.55);
}

.pd-btn--ghost:hover {
  background: rgba(255, 248, 240, 0.1);
}

.pd-section {
  padding: 36px 40px 0;
  animation: pd-fade-up 0.7s ease 0.12s both;
}

.pd-section--split {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(240px, 0.9fr);
  gap: 28px;
  align-items: start;
  animation-delay: 0.2s;
}

.pd-section__head {
  margin-bottom: 18px;
}

.pd-section__title {
  margin: 0 0 6px;
  font-family: Fraunces, serif;
  font-size: 1.45rem;
  font-weight: 700;
  color: var(--pd-red-deep);
}

.pd-section__desc {
  margin: 0;
  color: var(--pd-muted);
  font-size: 0.95rem;
}

.pd-pipeline {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  background: var(--pd-line);
  border: 1px solid var(--pd-line);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: var(--pd-shadow);
}

.pd-pipeline--loading {
  opacity: 0.65;
}

.pd-metric {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
  padding: 22px 20px;
  border: 0;
  background: var(--pd-panel);
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;
}

.pd-metric:hover {
  background: #fff;
}

.pd-metric__value {
  font-family: Fraunces, serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--pd-red);
  line-height: 1;
}

.pd-metric__label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--pd-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
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
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--pd-red-deep);
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(196, 8, 8, 0.08);
}

.pd-list__status[data-status='draft'] {
  background: rgba(239, 147, 0, 0.14);
  color: #9a5a00;
}

.pd-list__status[data-status='accepted'] {
  background: rgba(34, 120, 60, 0.12);
  color: #1f6b35;
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
  border-radius: 14px;
  background: var(--pd-panel);
  color: var(--pd-red-deep);
  font: inherit;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.pd-shortcut:hover {
  transform: translateX(4px);
  border-color: rgba(196, 8, 8, 0.35);
  background: #fff;
}

@keyframes pd-fade-up {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pd-pulse {
  0%, 100% { opacity: 0.55; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(1.05); }
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
