<template>
  <div class="qw">
    <a-spin :spinning="loadingOffer">
    <div class="qw__page">
      <div class="qw__top">
        <div class="qw__top-row">
          <div>
            <h1 class="qw__title">
              <template v-if="mode === 'custom'">
                {{ $t('widgets.quotation_wizard.custom_inquiry.page_title') }}
              </template>
              <template v-else-if="editingOfferId">
                {{ $t('widgets.quotation_wizard.page_title_edit', { number: editingOfferNumber }) }}
              </template>
              <template v-else>
                {{ $t('widgets.quotation_wizard.page_title') }}
              </template>
            </h1>
            <p
              v-if="editingOfferId && mode !== 'custom'"
              class="qw__subtitle"
            >
              {{ $t('widgets.quotation_wizard.editing_draft_hint') }}
            </p>
            <p
              v-else-if="mode === 'custom'"
              class="qw__subtitle"
            >
              {{ $t('widgets.quotation_wizard.custom_inquiry.page_desc') }}
            </p>
          </div>
          <button
            v-if="!editingOfferId"
            type="button"
            class="qw-btn qw-btn--outline qw-btn--sm"
            @click="toggleMode"
          >
            {{ mode === 'custom'
              ? $t('widgets.quotation_wizard.custom_inquiry.back_to_wizard')
              : $t('widgets.quotation_wizard.custom_inquiry.open') }}
          </button>
        </div>
      </div>

      <template v-if="mode === 'custom'">
        <!-- Custom inquiry: customer (reuse section 2 fields via shared form) -->
        <section class="qw-section">
          <div class="qw-section__accent qw-section__accent--blue" />
          <header class="qw-section__head qw-section__head--split">
            <div class="qw-section__head-left">
              <span class="qw-section__num">1</span>
              <div>
                <h2 class="qw-section__title">{{ $t('widgets.quotation_wizard.sections.customer.title') }}</h2>
                <p class="qw-section__desc">{{ $t('widgets.quotation_wizard.custom_inquiry.customer_desc') }}</p>
              </div>
            </div>
            <button
              type="button"
              class="qw-btn qw-btn--outline qw-btn--sm"
              @click="loadExistingCustomer"
            >
              {{ $t('widgets.quotation_wizard.load_from_master') }}
            </button>
          </header>
          <div class="qw-form">
            <div class="qw-form__row qw-form__row--full">
              <label class="qw-radio-inline">
                <input
                  v-model="form.type"
                  type="radio"
                  value="b2b"
                >
                {{ $t('widgets.quotation_wizard.b2b') }}
              </label>
              <label class="qw-radio-inline">
                <input
                  v-model="form.type"
                  type="radio"
                  value="b2c"
                >
                {{ $t('widgets.quotation_wizard.b2c') }}
              </label>
            </div>
            <div class="qw-form__grid">
              <div v-if="form.type === 'b2b'">
                <label class="qw-label">{{ $t('modules.customers.fields.company') }} *</label>
                <input
                  v-model="form.company"
                  type="text"
                  class="qw-input"
                  :placeholder="$t('widgets.quotation_wizard.placeholders.company')"
                >
              </div>
              <div>
                <label class="qw-label">{{ $t('modules.customers.fields.firstname') }} *</label>
                <input
                  v-model="form.firstname"
                  type="text"
                  class="qw-input"
                >
              </div>
              <div>
                <label class="qw-label">{{ $t('modules.customers.fields.name') }} *</label>
                <input
                  v-model="form.name"
                  type="text"
                  class="qw-input"
                >
              </div>
              <div>
                <label class="qw-label">{{ $t('modules.customers.fields.email') }}</label>
                <input
                  v-model="form.email"
                  type="email"
                  class="qw-input"
                >
              </div>
              <div>
                <label class="qw-label">{{ $t('modules.customers.fields.phone') }}</label>
                <input
                  v-model="form.phone"
                  type="tel"
                  class="qw-input"
                >
              </div>
            </div>
            <div class="qw-form__row qw-form__row--full">
              <label class="qw-label">{{ $t('widgets.quotation_wizard.contract_address') }} *</label>
              <div class="qw-address-inline">
                <input
                  v-model="form.street"
                  type="text"
                  class="qw-input qw-address-inline__street"
                  :placeholder="$t('widgets.quotation_wizard.placeholders.street')"
                >
                <input
                  v-model="form.housenumber"
                  type="text"
                  class="qw-input qw-address-inline__house"
                  :placeholder="$t('modules.addresses.fields.housenumber')"
                >
                <input
                  v-model="form.zip"
                  type="text"
                  class="qw-input qw-address-inline__zip"
                  :placeholder="$t('modules.addresses.fields.zip')"
                >
                <input
                  v-model="form.city"
                  type="text"
                  class="qw-input qw-address-inline__city"
                  :placeholder="$t('modules.addresses.fields.city')"
                >
              </div>
            </div>
            <div class="qw-form__grid qw-form__grid--2">
              <div>
                <label class="qw-label">{{ $t('widgets.quotation_wizard.fields.medium') }}</label>
                <select
                  v-model="form.medium"
                  class="qw-input"
                >
                  <option value="electricity">
                    {{ $t('modules.tariffs.choice.type.electricity') }}
                  </option>
                  <option value="gas">
                    {{ $t('modules.tariffs.choice.type.gas') }}
                  </option>
                </select>
              </div>
              <div>
                <label class="qw-label">{{ $t('modules.customers.fields.iban') }}</label>
                <input
                  v-model="form.iban"
                  type="text"
                  class="qw-input qw-input--mono"
                  placeholder="DE00 0000 0000 0000 0000 00"
                >
              </div>
            </div>
          </div>
        </section>

        <section class="qw-section">
          <div class="qw-section__accent qw-section__accent--yellow" />
          <header class="qw-section__head">
            <span class="qw-section__num">2</span>
            <div>
              <h2 class="qw-section__title">{{ $t('widgets.quotation_wizard.custom_inquiry.details_title') }}</h2>
              <p class="qw-section__desc">{{ $t('widgets.quotation_wizard.custom_inquiry.details_desc') }}</p>
            </div>
          </header>
          <div class="qw-form">
            <div class="qw-form__row qw-form__row--full">
              <label class="qw-label">{{ $t('widgets.quotation_wizard.custom_inquiry.notes_label') }} *</label>
              <textarea
                v-model="customInquiry.notes"
                class="qw-input qw-textarea"
                rows="6"
                :placeholder="$t('widgets.quotation_wizard.custom_inquiry.notes_placeholder')"
              />
            </div>
            <div class="qw-form__row qw-form__row--full">
              <label class="qw-label">{{ $t('widgets.quotation_wizard.custom_inquiry.attachments_label') }}</label>
              <p class="qw-hint">{{ $t('widgets.quotation_wizard.custom_inquiry.attachments_hint') }}</p>
              <input
                ref="customFileInput"
                type="file"
                class="qw-file-input"
                multiple
                @change="onCustomFilesSelected"
              >
              <ul
                v-if="customInquiry.files.length"
                class="qw-file-list"
              >
                <li
                  v-for="(file, index) in customInquiry.files"
                  :key="`${file.name}-${index}`"
                  class="qw-file-list__item"
                >
                  <span>{{ file.name }}</span>
                  <button
                    type="button"
                    class="qw-text-btn qw-text-btn--danger"
                    @click="removeCustomFile(index)"
                  >
                    {{ $t('widgets.quotation_wizard.remove') }}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <footer class="qw-footer">
          <div class="qw-footer__total">
            {{ $t('widgets.quotation_wizard.custom_inquiry.footer_hint') }}
          </div>
          <div class="qw-footer__actions">
            <button
              type="button"
              class="qw-btn qw-btn--outline"
              :disabled="submitting"
              @click="mode = 'wizard'"
            >
              {{ $t('widgets.quotation_wizard.custom_inquiry.back_to_wizard') }}
            </button>
            <button
              type="button"
              class="qw-btn qw-btn--success"
              :disabled="submitting"
              @click="submitCustomInquiry"
            >
              <span v-if="submitting">{{ $t('widgets.quotation_wizard.creating') }}…</span>
              <span v-else>{{ $t('widgets.quotation_wizard.custom_inquiry.submit') }}</span>
            </button>
          </div>
        </footer>
      </template>

      <template v-else>
      <!-- VP bar + surcharge (calc.html reference) -->
      <div class="qw-vpbar">
        <div class="qw-vpbar__brand">
          <span class="qw-vpbar__badge" aria-hidden="true">LÖ</span>
          <span class="qw-vpbar__brand-name">
            Löwe<span class="qw-vpbar__brand-light">Sales</span>
          </span>
        </div>
        <div class="qw-vpbar__right">
          <span v-if="vpName" class="qw-vpbar__vp">VP: {{ vpName }}</span>
          <span
            v-if="vpName"
            class="qw-vpbar__divider"
            aria-hidden="true"
          />
          <button
            type="button"
            class="qw-vpbar__surcharge"
            :title="$t('widgets.quotation_wizard.surcharge_title')"
            :aria-label="$t('widgets.quotation_wizard.surcharge_title')"
            @click="openSurchargeModal"
          >
            <svg
              class="qw-vpbar__surcharge-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span class="qw-vpbar__surcharge-label">
              {{ $t('widgets.quotation_wizard.surcharge') }}:
              <span class="qw-vpbar__surcharge-value">{{ formatPrice(surcharge) }} ct</span>
            </span>
          </button>
        </div>
      </div>

      <div
        v-if="surchargeModalOpen"
        class="qw-modal-backdrop"
        @click.self="surchargeModalOpen = false"
      >
        <div class="qw-modal">
          <header class="qw-modal__head">
            <h3>{{ $t('widgets.quotation_wizard.surcharge_title') }}</h3>
            <button type="button" class="qw-text-btn" @click="surchargeModalOpen = false">×</button>
          </header>
          <div class="qw-modal__body">
            <label class="qw-label">{{ $t('widgets.quotation_wizard.surcharge_label') }}</label>
            <div class="qw-surcharge-row">
              <input
                v-model.number="surchargeDraft"
                type="number"
                step="0.01"
                class="qw-input"
              >
              <span>ct/kWh</span>
            </div>
          </div>
          <footer class="qw-modal__foot">
            <button type="button" class="qw-btn qw-btn--primary" @click="applySurcharge">
              {{ $t('widgets.quotation_wizard.surcharge_apply') }}
            </button>
          </footer>
        </div>
      </div>

      <!-- 5-step stepper -->
      <div class="qw-stepper">
        <div class="qw-stepper__track" />
        <div class="qw-stepper__progress" :style="{ width: progressPercent + '%' }" />
        <button
          v-for="(label, index) in stepLabels"
          :key="label"
          type="button"
          class="qw-stepper__item"
          :class="{
            'qw-stepper__item--active': currentStep === index + 1,
            'qw-stepper__item--done': currentStep > index + 1,
          }"
          @click.prevent="goToStep(index + 1)"
        >
          <span class="qw-stepper__num">{{ index + 1 }}</span>
          <span class="qw-stepper__label">{{ label }}</span>
        </button>
      </div>

      <!-- Step 1: Start (energy, configuration, customer, main address) -->
      <template v-if="currentStep === 1">
        <section class="qw-section">
          <div class="qw-section__accent qw-section__accent--green" />
          <header class="qw-section__head">
            <div>
              <h2 class="qw-section__title">{{ $t('widgets.quotation_wizard.sections.start.title') }}</h2>
              <p class="qw-section__desc">{{ $t('widgets.quotation_wizard.sections.start.desc') }}</p>
            </div>
          </header>
          <div class="qw-energy">
            <label
              v-for="option in mediumOptions"
              :key="option.value"
              class="qw-energy__card"
              :class="{ 'qw-energy__card--active': form.medium === option.value }"
            >
              <input
                v-model="form.medium"
                type="radio"
                name="medium"
                class="qw-sr-only"
                :value="option.value"
                @change="onMediumChange"
              >
              <component
                :is="option.icon"
                class="qw-energy__icon"
                :class="option.iconClass"
              />
              <span class="qw-energy__label">{{ option.label }}</span>
              <span class="qw-radio-dot" />
            </label>
          </div>
          <div class="qw-config">
            <div>
              <label class="qw-label">{{ $t('widgets.quotation_wizard.procurement_type') }} *</label>
              <select v-model="form.procurementType" class="qw-input">
                <option value="fixed">{{ $t('modules.offers.choice.procurement_type.fixed') }}</option>
                <option value="spot">{{ $t('modules.offers.choice.procurement_type.spot') }}</option>
              </select>
            </div>
            <label class="qw-config__toggle">
              <span class="qw-toggle">
                <input v-model="form.ecoOnly" type="checkbox">
                <span class="qw-toggle__track" />
              </span>
              <span>{{ $t('widgets.quotation_wizard.eco_only') }}</span>
            </label>
          </div>
        </section>

        <section class="qw-section">
          <div class="qw-section__accent qw-section__accent--blue" />
          <header class="qw-section__head qw-section__head--split">
            <div class="qw-section__head-left">
              <div>
                <h2 class="qw-section__title">{{ $t('widgets.quotation_wizard.sections.customer.title') }}</h2>
                <p class="qw-section__desc">{{ $t('widgets.quotation_wizard.sections.customer.desc') }}</p>
              </div>
            </div>
            <button
              type="button"
              class="qw-btn qw-btn--outline qw-btn--sm"
              @click="loadExistingCustomer"
            >
              {{ $t('widgets.quotation_wizard.load_from_master') }}
            </button>
          </header>
          <div class="qw-form">
            <div class="qw-form__row qw-form__row--full">
              <label class="qw-radio-inline">
                <input v-model="form.type" type="radio" value="b2b">
                {{ $t('widgets.quotation_wizard.b2b') }}
              </label>
              <label class="qw-radio-inline">
                <input v-model="form.type" type="radio" value="b2c">
                {{ $t('widgets.quotation_wizard.b2c') }}
              </label>
            </div>
            <div
              v-if="form.type === 'b2b'"
              class="qw-form__grid"
            >
              <div class="qw-form__row--full">
                <label class="qw-label">{{ $t('modules.customers.fields.company') }} *</label>
                <input
                  v-model="form.company"
                  type="text"
                  class="qw-input"
                  :placeholder="$t('widgets.quotation_wizard.placeholders.company')"
                >
              </div>
              <div>
                <label class="qw-label">{{ $t('modules.customers.fields.company_type') }} *</label>
                <select v-model="form.companyType" class="qw-input">
                  <option
                    v-for="opt in companyTypeOptions"
                    :key="opt"
                    :value="opt"
                  >
                    {{ $t(`modules.customers.choice.company_type.${opt}`) }}
                  </option>
                </select>
              </div>
              <div>
                <label class="qw-label">{{ $t('modules.customers.fields.industry') }} *</label>
                <select v-model="form.industry" class="qw-input">
                  <option value="">{{ $t('widgets.quotation_wizard.please_select') }}</option>
                  <option
                    v-for="opt in industryOptions"
                    :key="opt"
                    :value="opt"
                  >
                    {{ $t(`modules.customers.choice.industry.${opt}`) }}
                  </option>
                </select>
              </div>
            </div>
            <div class="qw-form__row qw-form__row--full">
              <label class="qw-label">{{ $t('widgets.quotation_wizard.contract_address') }} *</label>
              <div class="qw-address-inline qw-address-inline--5">
                <input
                  v-model="form.street"
                  type="text"
                  class="qw-input qw-address-inline__street"
                  :placeholder="$t('modules.addresses.fields.street')"
                >
                <input
                  v-model="form.housenumber"
                  type="text"
                  class="qw-input qw-address-inline__house"
                  :placeholder="$t('modules.addresses.fields.housenumber')"
                >
                <input
                  v-model="form.housenumberAddition"
                  type="text"
                  class="qw-input qw-address-inline__house"
                  :placeholder="$t('modules.addresses.fields.housenumber_addition')"
                >
                <input
                  v-model="form.zip"
                  type="text"
                  class="qw-input qw-address-inline__zip"
                  :placeholder="$t('modules.addresses.fields.zip')"
                >
                <input
                  v-model="form.city"
                  type="text"
                  class="qw-input qw-address-inline__city"
                  :placeholder="$t('modules.addresses.fields.city')"
                >
              </div>
            </div>
          </div>
          <div class="qw-step-nav">
            <span />
            <button type="button" class="qw-btn qw-btn--primary" @click.prevent="nextStep">
              {{ $t('widgets.quotation_wizard.next_meters') }}
            </button>
          </div>
        </section>
      </template>

      <!-- Step 2: Locations & meters -->
      <section v-if="currentStep === 2" class="qw-section qw-section--locations">
        <div class="qw-section__accent qw-section__accent--blue" />
        <header class="qw-section__head qw-section__head--split">
          <div class="qw-section__head-left">
            <div>
              <h2 class="qw-section__title">{{ $t('widgets.quotation_wizard.sections.locations.title') }}</h2>
              <p class="qw-section__desc">{{ $t('widgets.quotation_wizard.sections.locations.desc') }}</p>
            </div>
          </div>
          <div class="qw-meter-limit">
            <span class="qw-meter-limit__label">{{ $t('widgets.quotation_wizard.meter_limit_label') }}:</span>
            <div class="qw-meter-limit__bars">
              <span
                v-for="n in 5"
                :key="n"
                class="qw-meter-limit__bar"
                :class="{
                  'qw-meter-limit__bar--on': n <= meterCount && meterCount < 5,
                  'qw-meter-limit__bar--full': n <= meterCount && meterCount >= 5,
                }"
              />
            </div>
            <span class="qw-meter-limit__count">{{ meterCount }} / 5</span>
          </div>
        </header>

        <div class="qw-locations">
          <div
            v-for="(location, locIndex) in form.locations"
            :key="location.uid"
            class="qw-location"
          >
            <div class="qw-location__head">
              <div class="qw-location__title">
                <svg class="qw-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <input
                  v-model="location.label"
                  type="text"
                  class="qw-location__name-input"
                  :placeholder="`${$t('widgets.quotation_wizard.location')} ${locIndex + 1}`"
                >
              </div>
              <button
                v-if="form.locations.length > 1"
                type="button"
                class="qw-text-btn qw-text-btn--danger"
                @click="removeLocation(locIndex)"
              >
                {{ $t('widgets.quotation_wizard.remove_location') }}
              </button>
            </div>

            <div class="qw-location__delivery">
              <div class="qw-location__delivery-head">
                <label class="qw-label">{{ $t('widgets.quotation_wizard.shipping_address') }}</label>
                <button
                  type="button"
                  class="qw-chip-btn"
                  @click="copyContractAddressToLocation(location)"
                >
                  {{ $t('widgets.quotation_wizard.use_contract_address') }}
                </button>
              </div>
              <div class="qw-address-inline qw-address-inline--5">
                <input
                  v-model="location.street"
                  type="text"
                  class="qw-input qw-address-inline__street"
                  :placeholder="$t('modules.addresses.fields.street')"
                  @input="location.deliveryAddressMode = 'new'"
                >
                <input
                  v-model="location.housenumber"
                  type="text"
                  class="qw-input qw-address-inline__house"
                  :placeholder="$t('modules.addresses.fields.housenumber')"
                  @input="location.deliveryAddressMode = 'new'"
                >
                <input
                  v-model="location.housenumberAddition"
                  type="text"
                  class="qw-input qw-address-inline__house"
                  :placeholder="$t('modules.addresses.fields.housenumber_addition')"
                  @input="location.deliveryAddressMode = 'new'"
                >
                <input
                  v-model="location.zip"
                  type="text"
                  class="qw-input qw-address-inline__zip"
                  :placeholder="$t('modules.addresses.fields.zip')"
                  @input="location.deliveryAddressMode = 'new'"
                >
                <input
                  v-model="location.city"
                  type="text"
                  class="qw-input qw-address-inline__city"
                  :placeholder="$t('modules.addresses.fields.city')"
                  @input="location.deliveryAddressMode = 'new'"
                >
              </div>
            </div>

            <div class="qw-meters">
              <div
                v-for="(meter, meterIndex) in location.meters"
                :key="meter.uid"
                class="qw-meter-card"
              >
                <button
                  v-if="location.meters.length > 1 || form.locations.length > 1"
                  type="button"
                  class="qw-meter-card__remove"
                  :title="$t('widgets.quotation_wizard.remove')"
                  @click="removeMeter(locIndex, meterIndex)"
                >
                  ×
                </button>
                <div class="qw-meter-card__grid">
                  <div class="qw-meter-card__field">
                    <label class="qw-label qw-label--sm">{{ $t('modules.meters.fields.meter_number') }} *</label>
                    <input
                      v-model="meter.meter_number"
                      type="text"
                      class="qw-input qw-input--sm"
                    >
                  </div>
                  <div class="qw-meter-card__field">
                    <label class="qw-label qw-label--sm">{{ $t('widgets.quotation_wizard.malo_id') }} *</label>
                    <input
                      v-model="meter.malo"
                      type="text"
                      maxlength="11"
                      class="qw-input qw-input--sm qw-input--mono"
                      :class="{ 'qw-input--invalid': meter.malo && meter.malo.length > 0 && meter.malo.length < 11 }"
                      :placeholder="$t('widgets.quotation_wizard.placeholders.malo')"
                      @input="meter.malo = (meter.malo || '').replace(/[^0-9]/g, '')"
                    >
                  </div>
                  <div class="qw-meter-card__field">
                    <label class="qw-label qw-label--sm">{{ $t('widgets.quotation_wizard.meter_type_label') }} *</label>
                    <select
                      v-model="meter.meter_type"
                      class="qw-input qw-input--sm"
                      @change="onMeterTypeChange(meter)"
                    >
                      <option value="slp">SLP</option>
                      <option value="rlm">RLM</option>
                    </select>
                  </div>
                  <div class="qw-meter-card__field">
                    <label class="qw-label qw-label--sm">{{ $t('widgets.quotation_wizard.usage_kwh') }} *</label>
                    <input
                      v-model.number="meter.usage"
                      type="number"
                      min="1"
                      class="qw-input qw-input--sm"
                    >
                  </div>
                </div>
                <div
                  v-if="meter.meter_type === 'rlm'"
                  class="qw-meter-card__rlm"
                >
                  <label class="qw-label qw-label--sm qw-label--accent">{{ $t('modules.meters.fields.peak_power') }}</label>
                  <input
                    v-model.number="meter.peak_power"
                    type="number"
                    class="qw-input qw-input--sm qw-input--accent"
                  >
                </div>
              </div>
              <div
                v-if="meterCount < 5"
                class="qw-meters__footer"
              >
                <button
                  type="button"
                  class="qw-add-meter"
                  @click="addMeter(locIndex)"
                >
                  + {{ $t('widgets.quotation_wizard.add_meter') }}
                </button>
              </div>
            </div>
          </div>

          <button
            v-if="meterCount < MAX_METERS"
            type="button"
            class="qw-add-location"
            @click="addLocation"
          >
            <span class="qw-add-location__icon">+</span>
            {{ $t('widgets.quotation_wizard.add_location') }}
          </button>
          <p
            v-if="meterCount > MAX_METERS"
            class="qw-warning"
          >
            {{ $t('widgets.quotation_wizard.individual_request') }}
            <button
              type="button"
              class="qw-text-btn"
              @click="openCustomInquiry"
            >
              {{ $t('widgets.quotation_wizard.custom_inquiry.open') }}
            </button>
          </p>
        </div>
        <div class="qw-step-nav">
          <button type="button" class="qw-btn qw-btn--outline" @click.prevent="prevStep">
            {{ $t('widgets.quotation_wizard.back') }}
          </button>
          <button type="button" class="qw-btn qw-btn--primary" @click.prevent="nextStep">
            {{ $t('widgets.quotation_wizard.next_tariffs') }}
          </button>
        </div>
      </section>

      <!-- Step 3: Tariff selection (table) -->
      <div v-if="currentStep === 3">
      <div class="qw-tariff-head">
        <div>
          <h2 class="qw-tariff-head__title">{{ $t('widgets.quotation_wizard.sections.tariff.title') }}</h2>
          <p class="qw-section__desc">{{ $t('widgets.quotation_wizard.sections.tariff.desc') }}</p>
        </div>
      </div>

      <section
        v-for="entry in meterEntries"
        :key="entry.uid"
        class="qw-meter-tariff"
      >
        <div class="qw-section__accent qw-section__accent--green" />
        <header class="qw-meter-tariff__head">
          <div>
            <div class="qw-meter-tariff__loc">
              {{ $t('widgets.quotation_wizard.location') }} {{ entry.locIndex + 1 }}<template v-if="entry.locationLabel">: {{ entry.locationLabel }}</template>
            </div>
            <div class="qw-meter-tariff__meter">
              {{ entry.meter.meter_number || $t('widgets.quotation_wizard.new_meter') }}
            </div>
          </div>
          <div class="qw-meter-tariff__meta">
            <div>{{ mediumLabel }} ({{ entry.meter.meter_type.toUpperCase() }}) | {{ entry.zipCity }}</div>
            <span class="qw-badge">{{ $t('modules.meters.fields.usage') }}: {{ formatNumber(entry.meter.usage) }} kWh</span>
          </div>
        </header>

        <div class="qw-meter-tariff__body">
          <a-spin :spinning="loadingTariffs">
            <div
              v-if="tariffRowsForMeter(entry.meter).length === 0 && !loadingTariffs"
              class="qw-empty"
            >
              {{ $t('widgets.quotation_wizard.no_tariffs') }}
            </div>
            <div
              v-else
              class="qw-tariff-table-wrap"
            >
              <table class="qw-tariff-table">
                <thead>
                  <tr>
                    <th>{{ $t('widgets.quotation_wizard.table_tariff.tariff') }}</th>
                    <th>{{ $t('widgets.quotation_wizard.table_tariff.duration') }}</th>
                    <th>{{ $t('widgets.quotation_wizard.table_tariff.ap') }}</th>
                    <th>{{ $t('widgets.quotation_wizard.table_tariff.gp') }}</th>
                    <th>{{ $t('widgets.quotation_wizard.table_tariff.yearly') }}</th>
                    <th class="qw-tariff-table__action">{{ $t('widgets.quotation_wizard.table_tariff.action') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in tariffRowsForMeter(entry.meter)"
                    :key="row.key"
                    :class="{ 'qw-tariff-table__row--selected': entry.meter.tariffId === row.selected.id }"
                  >
                    <td>
                      <div class="qw-tariff-table__brand">
                        <span
                          class="qw-tariff-avatar"
                          :style="tariffAvatarStyle(row.selected)"
                        >{{ tariffInitials(row.selected) }}</span>
                        <div class="qw-tariff-table__brand-text">
                          <div class="qw-tariff-table__name">{{ row.displayName }}</div>
                          <div class="qw-tariff-table__meta">{{ row.selected.provider || row.selected.brezel_name || '' }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <select
                        class="qw-input qw-input--sm qw-tariff-duration"
                        :value="row.selected.duration"
                        @change="onTariffDurationChange(entry.meter, row, $event.target.value)"
                      >
                        <option
                          v-for="variant in row.variants"
                          :key="variant.id"
                          :value="variant.duration"
                        >
                          {{ variant.duration }} {{ $t('widgets.quotation_wizard.months') }}
                        </option>
                      </select>
                    </td>
                    <td>
                      <strong>{{ formatPrice(energyPriceWithSurcharge(row.selected)) }}</strong>
                      <span class="qw-tariff-table__unit">ct/kWh</span>
                    </td>
                    <td>
                      <strong>{{ formatPrice(row.selected.site_fixed_fee) }}</strong>
                      <span class="qw-tariff-table__unit">€/{{ $t('widgets.quotation_wizard.month') }}</span>
                    </td>
                    <td>
                      <strong>{{ formatCurrency(estimateYearlyCost(row.selected, entry.meter)) }}</strong>
                    </td>
                    <td class="qw-tariff-table__action">
                      <label class="qw-radio-inline">
                        <input
                          type="radio"
                          :name="'tariff-' + entry.uid"
                          :checked="entry.meter.tariffId === row.selected.id"
                          @change="selectTariffPrimary(entry.meter, row.selected.id)"
                        >
                        {{ $t('widgets.quotation_wizard.choose') }}
                      </label>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </a-spin>
        </div>
      </section>

      <div class="qw-footer">
        <button type="button" class="qw-btn qw-btn--outline" @click.prevent="prevStep">
          {{ $t('widgets.quotation_wizard.back') }}
        </button>
        <div class="qw-footer__actions">
          <button
            type="button"
            class="qw-btn qw-btn--outline"
            :disabled="submitting"
            @click="createOfferPdf"
          >
            {{ $t('widgets.quotation_wizard.create_offer_pdf') }}
          </button>
          <button
            type="button"
            class="qw-btn qw-btn--primary"
            @click.prevent="nextStep"
          >
            {{ $t('widgets.quotation_wizard.next_contract') }}
          </button>
        </div>
      </div>
      </div>

      <!-- Step 4: Contract data (per meter) -->
      <div v-if="currentStep === 4">
        <div class="qw-tariff-head">
          <div>
            <h2 class="qw-tariff-head__title">{{ $t('widgets.quotation_wizard.sections.contract.title') }}</h2>
            <p class="qw-section__desc">{{ $t('widgets.quotation_wizard.sections.contract.desc') }}</p>
          </div>
        </div>

        <section
          v-for="entry in meterEntries"
          :key="entry.uid"
          class="qw-section"
        >
          <div class="qw-section__accent qw-section__accent--blue" />
          <header class="qw-section__head">
            <div>
              <h2 class="qw-section__title">
                {{ $t('widgets.quotation_wizard.contract_data_for_meter') }}
                {{ entry.meter.meter_number || $t('widgets.quotation_wizard.new_meter') }}
              </h2>
            </div>
          </header>
          <div class="qw-form">
            <div class="qw-form__grid qw-form__grid--2">
              <div>
                <label class="qw-label">{{ $t('modules.meters.fields.switch_reason') }} *</label>
                <select v-model="entry.meter.switch_reason" class="qw-input">
                  <option
                    v-for="opt in switchReasonOptions"
                    :key="opt"
                    :value="opt"
                  >
                    {{ $t(`modules.meters.choice.switch_reason.${opt}`) }}
                  </option>
                </select>
              </div>
              <div>
                <label class="qw-label">{{ $t('widgets.quotation_wizard.fields.start_date') }} *</label>
                <input
                  v-model="entry.meter.start_date"
                  type="date"
                  class="qw-input"
                >
              </div>
              <div>
                <label class="qw-label">{{ $t('modules.meters.fields.current_provider') }} *</label>
                <select
                  v-model="entry.meter.current_provider"
                  class="qw-input"
                >
                  <option value="">{{ $t('widgets.quotation_wizard.please_select') }}</option>
                  <option
                    v-for="opt in currentProviderOptions"
                    :key="opt"
                    :value="opt"
                  >
                    {{ opt }}
                  </option>
                </select>
              </div>
              <div>
                <label class="qw-label">{{ $t('modules.meters.fields.current_customer_no') }}</label>
                <input
                  v-model="entry.meter.current_customer_no"
                  type="text"
                  class="qw-input"
                >
              </div>
              <div>
                <label class="qw-label">{{ $t('widgets.quotation_wizard.malo_id_short') }}</label>
                <input
                  :value="entry.meter.malo"
                  type="text"
                  class="qw-input qw-input--mono"
                  readonly
                >
              </div>
              <div>
                <label class="qw-label">{{ $t('widgets.quotation_wizard.external_id_optional') }}</label>
                <input
                  v-model="entry.meter.external_id"
                  type="text"
                  class="qw-input"
                >
              </div>
            </div>
          </div>
        </section>

        <div class="qw-step-nav">
          <button type="button" class="qw-btn qw-btn--outline" @click.prevent="prevStep">
            {{ $t('widgets.quotation_wizard.back') }}
          </button>
          <button type="button" class="qw-btn qw-btn--primary" @click.prevent="nextStep">
            {{ $t('widgets.quotation_wizard.next_payment') }}
          </button>
        </div>
      </div>

      <!-- Step 5: Order & payment -->
      <template v-if="currentStep === 5">
      <section class="qw-section">
        <div class="qw-section__accent qw-section__accent--green" />
        <header class="qw-section__head">
          <div>
            <h2 class="qw-section__title">{{ $t('widgets.quotation_wizard.sections.order.title') }}</h2>
            <p class="qw-section__desc">{{ $t('widgets.quotation_wizard.sections.order.desc') }}</p>
          </div>
        </header>
        <div class="qw-form">
          <h3 class="qw-form__block-title">{{ $t('widgets.quotation_wizard.contact_partner') }}</h3>
          <div class="qw-form__grid">
            <div>
              <label class="qw-label">{{ $t('modules.customers.fields.salutation') }}</label>
              <select v-model="form.salutation" class="qw-input">
                <option
                  v-for="opt in salutationOptions"
                  :key="opt"
                  :value="opt"
                >
                  {{ $t(`modules.customers.choice.salutation.${opt}`) }}
                </option>
              </select>
            </div>
            <div>
              <label class="qw-label">{{ $t('modules.customers.fields.firstname') }} *</label>
              <input v-model="form.firstname" type="text" class="qw-input">
            </div>
            <div>
              <label class="qw-label">{{ $t('modules.customers.fields.name') }} *</label>
              <input v-model="form.name" type="text" class="qw-input">
            </div>
            <div>
              <label class="qw-label">{{ $t('modules.customers.fields.birthdate') }}</label>
              <input v-model="form.birthdate" type="date" class="qw-input">
            </div>
            <div class="qw-form__span-2">
              <label class="qw-label">{{ $t('modules.customers.fields.email') }}</label>
              <input v-model="form.email" type="email" class="qw-input">
            </div>
            <div>
              <label class="qw-label">{{ $t('widgets.quotation_wizard.phone_prefix') }}</label>
              <input v-model="form.phonePrefix" type="text" class="qw-input">
            </div>
            <div class="qw-form__span-2">
              <label class="qw-label">{{ $t('widgets.quotation_wizard.phone_number') }}</label>
              <input v-model="form.phoneNumber" type="tel" class="qw-input">
            </div>
          </div>
          <div class="qw-form__divider">
            <h3 class="qw-form__subhead">{{ $t('widgets.quotation_wizard.marketing_consent') }}</h3>
            <div class="qw-form__row qw-form__row--full">
              <label class="qw-radio-inline">
                <input v-model="form.marketingPost" type="checkbox">
                {{ $t('widgets.quotation_wizard.marketing_post') }}
              </label>
              <label class="qw-radio-inline">
                <input v-model="form.marketingEmail" type="checkbox">
                {{ $t('widgets.quotation_wizard.marketing_email') }}
              </label>
              <label class="qw-radio-inline">
                <input v-model="form.marketingPhone" type="checkbox">
                {{ $t('widgets.quotation_wizard.marketing_phone') }}
              </label>
            </div>
          </div>
        </div>
      </section>

      <section
        v-for="(location, locIndex) in form.locations"
        :key="location.uid"
        class="qw-section"
      >
        <div class="qw-section__accent qw-section__accent--blue" />
        <header class="qw-section__head">
          <div>
            <h2 class="qw-section__title">
              {{ $t('widgets.quotation_wizard.location_data_for') }} {{ location.label || `${$t('widgets.quotation_wizard.location')} ${locIndex + 1}` }}
            </h2>
          </div>
        </header>
        <div class="qw-form">
          <div class="qw-form__row qw-form__row--full">
            <div class="qw-location__delivery-head">
              <h4 class="qw-form__numbered">{{ $t('widgets.quotation_wizard.section_delivery') }}</h4>
              <button
                type="button"
                class="qw-chip-btn"
                @click="copyContractAddressToLocation(location)"
              >
                {{ $t('widgets.quotation_wizard.use_contract_address') }}
              </button>
            </div>
            <div class="qw-address-inline qw-address-inline--5">
              <input
                v-model="location.street"
                type="text"
                class="qw-input qw-address-inline__street"
                :placeholder="$t('modules.addresses.fields.street')"
                @input="location.deliveryAddressMode = 'new'"
              >
              <input
                v-model="location.housenumber"
                type="text"
                class="qw-input qw-address-inline__house"
                :placeholder="$t('modules.addresses.fields.housenumber')"
                @input="location.deliveryAddressMode = 'new'"
              >
              <input
                v-model="location.housenumberAddition"
                type="text"
                class="qw-input qw-address-inline__house"
                :placeholder="$t('modules.addresses.fields.housenumber_addition')"
                @input="location.deliveryAddressMode = 'new'"
              >
              <input
                v-model="location.zip"
                type="text"
                class="qw-input qw-address-inline__zip"
                :placeholder="$t('modules.addresses.fields.zip')"
                @input="location.deliveryAddressMode = 'new'"
              >
              <input
                v-model="location.city"
                type="text"
                class="qw-input qw-address-inline__city"
                :placeholder="$t('modules.addresses.fields.city')"
                @input="location.deliveryAddressMode = 'new'"
              >
            </div>
          </div>

          <div class="qw-form__row qw-form__row--full">
            <h4 class="qw-form__numbered">{{ $t('widgets.quotation_wizard.section_billing') }}</h4>
            <select v-model="location.billingMode" class="qw-input qw-input--half">
              <option value="delivery">{{ $t('widgets.quotation_wizard.billing_like_delivery') }}</option>
              <option value="contract">{{ $t('widgets.quotation_wizard.billing_like_contract') }}</option>
              <option value="new">{{ $t('widgets.quotation_wizard.billing_different') }}</option>
            </select>
          </div>
          <div
            v-if="location.billingMode === 'new'"
            class="qw-form__row qw-form__row--full"
          >
            <div class="qw-address-inline qw-address-inline--5">
              <input
                v-model="location.billingStreet"
                type="text"
                class="qw-input qw-address-inline__street"
                :placeholder="$t('modules.addresses.fields.street')"
              >
              <input
                v-model="location.billingHousenumber"
                type="text"
                class="qw-input qw-address-inline__house"
                :placeholder="$t('modules.addresses.fields.housenumber')"
              >
              <input
                v-model="location.billingHousenumberAddition"
                type="text"
                class="qw-input qw-address-inline__house"
                :placeholder="$t('modules.addresses.fields.housenumber_addition')"
              >
              <input
                v-model="location.billingZip"
                type="text"
                class="qw-input qw-address-inline__zip"
                :placeholder="$t('modules.addresses.fields.zip')"
              >
              <input
                v-model="location.billingCity"
                type="text"
                class="qw-input qw-address-inline__city"
                :placeholder="$t('modules.addresses.fields.city')"
              >
            </div>
          </div>

          <div class="qw-form__divider">
            <h4 class="qw-form__numbered">{{ $t('widgets.quotation_wizard.section_bank') }}</h4>
            <div class="qw-form__grid qw-form__grid--3 qw-form__row--full">
              <div>
                <label class="qw-label">{{ $t('widgets.quotation_wizard.account_holder') }} *</label>
                <input v-model="location.bank" type="text" class="qw-input">
              </div>
              <div>
                <label class="qw-label">{{ $t('modules.customers.fields.iban') }} *</label>
                <input
                  v-model="location.iban"
                  type="text"
                  class="qw-input qw-input--mono"
                  placeholder="DEXX…"
                >
              </div>
              <div>
                <label class="qw-label">{{ $t('modules.customers.fields.bic') }}</label>
                <input
                  v-model="location.bic"
                  type="text"
                  class="qw-input qw-input--mono"
                  placeholder="XXXXDEXX"
                >
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer class="qw-footer qw-footer--inline">
        <div class="qw-footer__total">
          {{ $t('widgets.quotation_wizard.offer_total') }}:
          <strong>{{ formatCurrency(totalYearlyCost) }} / {{ $t('widgets.quotation_wizard.year') }}</strong>
        </div>
        <div class="qw-footer__actions">
          <button type="button" class="qw-btn qw-btn--outline" @click.prevent="prevStep">
            {{ $t('widgets.quotation_wizard.back') }}
          </button>
          <button
            type="button"
            class="qw-btn qw-btn--outline"
            :disabled="submitting"
            @click="saveDraft"
          >
            {{ editingOfferId
              ? $t('widgets.quotation_wizard.update_draft')
              : $t('widgets.quotation_wizard.save_draft') }}
          </button>
          <button
            type="button"
            class="qw-btn qw-btn--success"
            :disabled="submitting || meterCount > MAX_METERS"
            @click="finishQuotation"
          >
            <span v-if="submitting">{{ $t('widgets.quotation_wizard.creating') }}…</span>
            <span v-else>{{ $t('widgets.quotation_wizard.place_order') }}</span>
          </button>
        </div>
      </footer>
      </template>
      </template>
    </div>

    <a-modal
      v-model:open="customerModalOpen"
      :title="$t('widgets.quotation_wizard.load_from_master')"
      @ok="applyExistingCustomer"
    >
      <a-select
        v-model:value="selectedCustomerId"
        show-search
        :filter-option="false"
        :loading="loadingCustomers"
        style="width: 100%"
        :placeholder="$t('widgets.quotation_wizard.placeholders.customer')"
        @search="searchCustomers"
      >
        <a-select-option
          v-for="customer in customers"
          :key="customer.id"
          :value="customer.id"
        >
          {{ customerLabel(customer) }}
        </a-select-option>
      </a-select>
    </a-modal>
    </a-spin>
  </div>
</template>

<script setup>
import { computed, h, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  Api,
  BrezelActionFactory,
  ClientError,
  Module,
  brezelRouter,
  showMessage,
} from '@kibro/brezel-spa'

const { t } = useI18n()
const route = useRoute()

const MAX_METERS = 5
const OFFER_VALID_DAYS = 14
const TOTAL_STEPS = 5

const IconElectricity = {
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 10V3L4 14h7v7l9-11h-7z' }),
    ])
  },
}

const IconGas = {
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z' }),
    ])
  },
}

function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function createMeter(overrides = {}) {
  return {
    uid: uid(),
    dbId: null,
    positionDbId: null,
    meter_type: 'slp',
    meter_number: '',
    malo: '',
    usage: null,
    start_date: null,
    peak_power: null,
    annual_peak_power: null,
    switch_reason: 'supplier_switch',
    external_id: '',
    current_provider: '',
    current_customer_no: '',
    current_price_per_kwh: null,
    current_baseprice: null,
    showPreviousSupplier: false,
    previousSupplierCalculated: false,
    tariffId: null,
    compareTariffId: null,
    editing: true,
    ...overrides,
  }
}

function createLocation(label = '', overrides = {}) {
  return {
    uid: uid(),
    dbId: null,
    label,
    editing: false,
    deliveryAddressMode: 'new',
    street: '',
    housenumber: '',
    housenumberAddition: '',
    zip: '',
    city: '',
    billingMode: 'delivery',
    customBilling: false,
    billingAddressMode: 'new',
    billingStreet: '',
    billingHousenumber: '',
    billingHousenumberAddition: '',
    billingZip: '',
    billingCity: '',
    bank: '',
    iban: '',
    bic: '',
    addressDbId: null,
    billingAddressDbId: null,
    meters: [createMeter()],
    ...overrides,
  }
}

function copyContractAddressToLocation(location) {
  location.deliveryAddressMode = 'contract'
  location.street = form.street || ''
  location.housenumber = form.housenumber || ''
  location.housenumberAddition = form.housenumberAddition || ''
  location.zip = form.zip || ''
  location.city = form.city || ''
}

function copyDeliveryAddressToBilling(location) {
  location.billingMode = 'new'
  location.billingStreet = location.street || ''
  location.billingHousenumber = location.housenumber || ''
  location.billingHousenumberAddition = location.housenumberAddition || ''
  location.billingZip = location.zip || ''
  location.billingCity = location.city || ''
}

const submitting = ref(false)
const loadingCustomers = ref(false)
const loadingTariffs = ref(false)
const loadingOffer = ref(false)
const customers = ref([])
const tariffs = ref([])
const customerModalOpen = ref(false)
const selectedCustomerId = ref(null)
const existingCustomerId = ref(null)
const editingOfferId = ref(null)
const editingOfferNumber = ref(null)
const contractAddressId = ref(null)
const billingAddressId = ref(null)
const shippingAddressId = ref(null)
const mode = ref('wizard')
const currentStep = ref(1)
const surcharge = ref(0)
const surchargeDraft = ref(0)
const surchargeModalOpen = ref(false)
const customFileInput = ref(null)
const customInquiry = reactive({
  notes: '',
  files: [],
})

const vpName = computed(() => {
  try {
    const u = typeof Api.getUser === 'function' ? Api.getUser() : null
    if (!u) {
      return ''
    }
    if (u.brezel_name) {
      return u.brezel_name
    }
    const first = (u.firstname || '').trim()
    const last = (u.name || '').trim()
    if (first && last && first.toLowerCase() === last.toLowerCase()) {
      return first
    }
    return [first, last].filter(Boolean).join(' ') || u.email || ''
  } catch {
    return ''
  }
})

const stepLabels = computed(() => ([
  t('widgets.quotation_wizard.steps.start'),
  t('widgets.quotation_wizard.steps.meters'),
  t('widgets.quotation_wizard.steps.tariffs'),
  t('widgets.quotation_wizard.steps.contract_data'),
  t('widgets.quotation_wizard.steps.order_payment'),
]))

const progressPercent = computed(() => ((currentStep.value - 1) / (TOTAL_STEPS - 1)) * 100)

const form = reactive({
  medium: 'electricity',
  procurementType: 'fixed',
  ecoOnly: false,
  type: 'b2b',
  company: '',
  companyType: 'gmbh',
  industry: '',
  salutation: 'mr',
  firstname: '',
  name: '',
  birthdate: '',
  email: '',
  phone: '',
  phonePrefix: '',
  phoneNumber: '',
  marketingPost: false,
  marketingEmail: false,
  marketingPhone: false,
  street: '',
  housenumber: '',
  housenumberAddition: '',
  zip: '',
  city: '',
  iban: '',
  bic: '',
  accountHolder: '',
  billingSameAsContract: true,
  billingStreet: '',
  billingHousenumber: '',
  billingZip: '',
  billingCity: '',
  shippingSameAsContract: true,
  shippingStreet: '',
  shippingHousenumber: '',
  shippingZip: '',
  shippingCity: '',
  locations: [createLocation()],
})

const companyTypeOptions = ['gmbh', 'ag', 'einzelunternehmen', 'gbr', 'other']
const industryOptions = ['handel', 'gastronomie', 'produktion', 'dienstleistung', 'other']
const salutationOptions = ['mr', 'ms']
const switchReasonOptions = ['supplier_switch', 'move_in']
const currentProviderOptions = ['Vattenfall', 'E.ON', 'Sonstige']

const composedPhone = computed(() => {
  const prefix = (form.phonePrefix || '').trim()
  const number = (form.phoneNumber || '').trim()
  const combined = [prefix, number].filter(Boolean).join(' ').trim()
  return combined || number || form.phone || ''
})

const mediumOptions = computed(() => [
  {
    value: 'electricity',
    label: t('modules.tariffs.choice.type.electricity'),
    icon: IconElectricity,
    iconClass: 'qw-energy__icon--electricity',
  },
  {
    value: 'gas',
    label: t('modules.tariffs.choice.type.gas'),
    icon: IconGas,
    iconClass: 'qw-energy__icon--gas',
  },
])

const mediumLabel = computed(() => t(`modules.tariffs.choice.type.${form.medium}`))

const meterCount = computed(() => form.locations.reduce((sum, loc) => sum + loc.meters.length, 0))

const meterEntries = computed(() => {
  const entries = []
  form.locations.forEach((location, locIndex) => {
    location.meters.forEach((meter) => {
      const zipCity = location.deliveryAddressMode === 'contract'
        ? [form.zip, form.city].filter(Boolean).join(' ')
        : location.deliveryAddressMode === 'shipping'
          ? [form.shippingZip, form.shippingCity].filter(Boolean).join(' ')
          : [location.zip, location.city].filter(Boolean).join(' ')
      entries.push({
        uid: meter.uid,
        locIndex,
        locationLabel: location.label?.trim() || '',
        location,
        meter,
        zipCity,
      })
    })
  })
  return entries
})

const totalYearlyCost = computed(() => {
  return meterEntries.value.reduce((sum, entry) => {
    const tariff = tariffs.value.find(item => item.id === entry.meter.tariffId)
    if (!tariff) {
      return sum
    }
    return sum + estimateYearlyCost(tariff, entry.meter)
  }, 0)
})

const customersModule = Module.byIdentifier('customers')
const addressesModule = Module.byIdentifier('addresses')
const locationsModule = Module.byIdentifier('locations')
const metersModule = Module.byIdentifier('meters')
const offersModule = Module.byIdentifier('offers')
const positionsModule = Module.byIdentifier('positions')
const tariffsModule = Module.byIdentifier('tariffs')

onMounted(async () => {
  searchCustomers('')
  loadTariffs()
  initSurchargeFromUser()
  if (route.query.custom === '1' || route.query.mode === 'custom') {
    mode.value = 'custom'
  }
  await maybeLoadOfferFromRoute()
})

function initSurchargeFromUser() {
  try {
    const user = typeof Api.getUser === 'function' ? Api.getUser() : null
    if (user?.provision_type === 'surcharge' && user?.provision_default != null) {
      surcharge.value = Number(user.provision_default) || 0
    }
  } catch {
    // ignore
  }
}

function openSurchargeModal() {
  surchargeDraft.value = surcharge.value
  surchargeModalOpen.value = true
}

function applySurcharge() {
  surcharge.value = Number(surchargeDraft.value) || 0
  surchargeModalOpen.value = false
  showMessage('success', { content: t('widgets.quotation_wizard.surcharge_applied') })
}

function scrollWizardTop() {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function goToStep(step) {
  if (step < 1 || step > TOTAL_STEPS) {
    return
  }
  if (step > currentStep.value) {
    for (let s = currentStep.value; s < step; s += 1) {
      if (!validateStep(s)) {
        return
      }
    }
  }
  currentStep.value = step
  if (step === 3) {
    loadTariffs()
  }
  scrollWizardTop()
}

function nextStep() {
  if (!validateStep(currentStep.value)) {
    return
  }
  if (currentStep.value < TOTAL_STEPS) {
    currentStep.value += 1
    if (currentStep.value === 3) {
      loadTariffs()
    }
    scrollWizardTop()
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value -= 1
    scrollWizardTop()
  }
}

function validateStep(step) {
  if (step === 1) {
    if (!form.medium) {
      showMessage('error', { content: t('widgets.quotation_wizard.validation.medium') })
      return false
    }
    if (form.type === 'b2b' && !form.company?.trim()) {
      showMessage('error', { content: t('widgets.quotation_wizard.validation.company') })
      return false
    }
    if (form.type === 'b2b' && !form.companyType) {
      showMessage('error', { content: t('widgets.quotation_wizard.validation.company_type') })
      return false
    }
    if (form.type === 'b2b' && !form.industry) {
      showMessage('error', { content: t('widgets.quotation_wizard.validation.industry') })
      return false
    }
    if (!form.street?.trim() || !form.housenumber?.trim() || !form.zip?.trim() || !form.city?.trim()) {
      showMessage('error', { content: t('widgets.quotation_wizard.validation.address') })
      return false
    }
    return true
  }
  if (step === 2) {
    if (meterCount.value === 0) {
      showMessage('error', { content: t('widgets.quotation_wizard.validation.at_least_one_meter') })
      return false
    }
    if (meterCount.value > MAX_METERS) {
      showMessage('error', { content: t('widgets.quotation_wizard.individual_request') })
      return false
    }
    for (const location of form.locations) {
      const hasLocationAddress = location.deliveryAddressMode === 'contract'
        ? !!(form.street?.trim() && form.zip?.trim() && form.city?.trim())
        : !!(location.street?.trim() && location.zip?.trim() && location.city?.trim())
      if (!hasLocationAddress) {
        showMessage('error', { content: t('widgets.quotation_wizard.validation.location_address') })
        return false
      }
      for (const meter of location.meters) {
        if (!meter.meter_number?.trim()) {
          showMessage('error', { content: t('widgets.quotation_wizard.validation.meter_number') })
          return false
        }
        if (!meter.malo?.trim() || String(meter.malo).length !== 11) {
          showMessage('error', { content: t('widgets.quotation_wizard.validation.malo_required') })
          return false
        }
        if (!meter.usage || meter.usage <= 0) {
          showMessage('error', { content: t('widgets.quotation_wizard.validation.usage') })
          return false
        }
        if (meter.meter_type === 'rlm' && !meter.peak_power) {
          showMessage('error', { content: t('widgets.quotation_wizard.validation.peak_power') })
          return false
        }
      }
    }
    return true
  }
  if (step === 3) {
    for (const entry of meterEntries.value) {
      if (!entry.meter.tariffId) {
        showMessage('error', { content: t('widgets.quotation_wizard.validation.tariff') })
        return false
      }
    }
    return true
  }
  if (step === 4) {
    for (const entry of meterEntries.value) {
      if (!entry.meter.switch_reason) {
        showMessage('error', { content: t('widgets.quotation_wizard.validation.switch_reason') })
        return false
      }
      if (!entry.meter.start_date) {
        showMessage('error', { content: t('widgets.quotation_wizard.validation.start_date') })
        return false
      }
      if (!entry.meter.current_provider?.trim()) {
        showMessage('error', { content: t('widgets.quotation_wizard.validation.current_provider') })
        return false
      }
    }
    return true
  }
  return true
}

watch(
  () => route.query.offer || route.query.offerId,
  async () => {
    await maybeLoadOfferFromRoute()
  },
)

async function maybeLoadOfferFromRoute() {
  const offerQuery = route.query.offer || route.query.offerId
  if (!offerQuery) {
    return
  }
  await loadOfferDraft(Number(offerQuery))
}

function toggleMode() {
  mode.value = mode.value === 'custom' ? 'wizard' : 'custom'
}

function openCustomInquiry() {
  mode.value = 'custom'
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function onCustomFilesSelected(event) {
  const selected = Array.from(event.target.files || [])
  customInquiry.files.push(...selected)
  if (customFileInput.value) {
    customFileInput.value.value = ''
  }
}

function removeCustomFile(index) {
  customInquiry.files.splice(index, 1)
}

function validateCustomInquiry() {
  if (form.type === 'b2b' && !form.company?.trim()) {
    showMessage('error', { content: t('widgets.quotation_wizard.validation.company') })
    return false
  }
  if (!form.firstname?.trim() || !form.name?.trim()) {
    showMessage('error', { content: t('widgets.quotation_wizard.validation.contact') })
    return false
  }
  if (!form.street?.trim() || !form.zip?.trim() || !form.city?.trim()) {
    showMessage('error', { content: t('widgets.quotation_wizard.validation.address') })
    return false
  }
  if (!customInquiry.notes?.trim()) {
    showMessage('error', { content: t('widgets.quotation_wizard.custom_inquiry.validation.notes') })
    return false
  }
  return true
}

async function uploadCustomAttachments() {
  if (!customInquiry.files.length) {
    return []
  }
  const uploaded = []
  for (const file of customInquiry.files) {
    const response = await Api.files().uploadFile({
      file,
      name: file.name,
      module: 'files',
      virtualPath: 'custom-inquiries',
    })
    const json = await response.json()
    if (!response.ok || !json?.data?.id) {
      throw new Error(json?.errors || t('widgets.quotation_wizard.custom_inquiry.upload_error'))
    }
    uploaded.push(relation(json.data.id, 'files'))
  }
  return uploaded
}

async function submitCustomInquiry() {
  if (!validateCustomInquiry()) {
    return
  }
  submitting.value = true
  try {
    const customer = await resolveCustomer()
    const partner = currentPartnerRelation()
    const contractAddress = await upsertAddress(
      customer.id,
      contractAddressFields(),
      contractAddressId.value,
    )
    contractAddressId.value = contractAddress.id
    customer.default_address = relation(contractAddress.id, 'addresses')
    customer.default_billing_address = relation(contractAddress.id, 'addresses')
    customer.default_shipping_address = relation(contractAddress.id, 'addresses')
    if (form.iban) {
      customer.default_iban = form.iban
      customer.iban = form.iban
    }
    if (form.bic) {
      customer.default_bic = form.bic
      customer.bic = form.bic
    }
    if (form.accountHolder) {
      customer.default_bank = form.accountHolder
    }
    await Api.updateEntity(customer)

    const attachments = await uploadCustomAttachments()
    const notes = [
      customInquiry.notes.trim(),
      '',
      `${t('widgets.quotation_wizard.fields.medium')}: ${form.medium}`,
    ].join('\n')

    const offer = offersModule.makeEntity({
      customer: relation(customer.id, 'customers'),
      user: partner,
      status: 'draft',
      type: 'individual',
      created_at: formatDateISO(new Date()),
      inquiry_notes: notes,
      attachments: attachments.length ? attachments : null,
    })
    const offerResponse = await Api.createEntity(offer)
    const savedOffer = offersModule.makeEntity(offerResponse.resource)

    showMessage('success', { content: t('widgets.quotation_wizard.custom_inquiry.success') })
    brezelRouter.toModule('offers', 'module.show', savedOffer.id)
  } catch (error) {
    const message = error instanceof ClientError
      ? Object.values(error.response?.errors || {}).flat().join(' ')
      : error?.message || t('widgets.quotation_wizard.error')
    showMessage('error', { content: message })
  } finally {
    submitting.value = false
  }
}

function onMediumChange() {
  form.locations.forEach((loc) => {
    loc.meters.forEach((meter) => {
      meter.tariffId = null
      meter.compareTariffId = null
    })
  })
  loadTariffs()
}

function onMeterTypeChange(meter) {
  meter.tariffId = null
  meter.compareTariffId = null
  loadTariffs()
}

function selectTariff(meter, tariffId) {
  meter.tariffId = tariffId
  meter.compareTariffId = null
}

function selectTariffPrimary(meter, tariffId) {
  meter.tariffId = tariffId
  meter.compareTariffId = null
}

function energyPriceWithSurcharge(tariff) {
  return (Number(tariff?.energy_price) || 0) + (Number(surcharge.value) || 0)
}

function tariffInitials(tariff) {
  const source = (tariff?.provider || tariff?.name || tariff?.brezel_name || '?').trim()
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return source.slice(0, 2).toUpperCase()
}

function tariffAvatarStyle(tariff) {
  const palette = [
    { background: '#95c11f', color: '#ffffff' },
    { background: '#e8eef5', color: '#475569' },
    { background: '#fce7e7', color: '#c40808' },
    { background: '#dbeafe', color: '#1d4ed8' },
    { background: '#fef3c7', color: '#b45309' },
    { background: '#ede9fe', color: '#6d28d9' },
    { background: '#ccfbf1', color: '#0f766e' },
  ]
  const key = `${tariff?.provider || ''}${tariff?.name || ''}${tariff?.id || ''}`
  let hash = 0
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash + key.charCodeAt(i) * (i + 1)) % palette.length
  }
  const tone = palette[hash]
  return {
    background: tone.background,
    color: tone.color,
  }
}

function tariffsForMeter(meter) {
  return tariffs.value.filter((item) => {
    if (item.type !== form.medium || item.meter_type !== meter.meter_type) {
      return false
    }
    if (form.ecoOnly && !item.eco) {
      return false
    }
    return true
  })
}

function normalizeTariffFamilyName(name) {
  return String(name || '')
    .replace(/\s*\d+\s*(monate|months|m)?\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function tariffRowsForMeter(meter) {
  const list = tariffsForMeter(meter)
  const groups = new Map()
  for (const tariff of list) {
    const key = `${tariff.provider || ''}|${normalizeTariffFamilyName(tariff.name)}|${tariff.meter_type || ''}`
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key).push(tariff)
  }
  return Array.from(groups.entries()).map(([key, variants]) => {
    const sorted = [...variants].sort((a, b) => (Number(a.duration) || 0) - (Number(b.duration) || 0))
    const selected = sorted.find(item => item.id === meter.tariffId) || sorted[0]
    return {
      key,
      variants: sorted,
      selected,
      displayName: normalizeTariffFamilyName(selected?.name)
        ? (selected?.name || '').replace(/\s*\d+\s*$/, '').trim() || selected?.name
        : (selected?.name || ''),
    }
  })
}

function onTariffDurationChange(meter, row, durationValue) {
  const duration = Number(durationValue)
  const match = row.variants.find(item => Number(item.duration) === duration) || row.variants[0]
  if (match) {
    selectTariffPrimary(meter, match.id)
  }
}

function previousYearlyCost(meter) {
  const usage = meter.usage || 0
  return (meter.current_baseprice ?? 0) * 12 + (usage * (meter.current_price_per_kwh ?? 0) / 100)
}

function hasPreviousTariffPrices(meter) {
  return meter.current_price_per_kwh != null && meter.current_price_per_kwh !== ''
    || meter.current_baseprice != null && meter.current_baseprice !== ''
}

async function searchCustomers(query) {
  loadingCustomers.value = true
  try {
    const params = query ? { search: query } : {}
    customers.value = await Api.fetchEntities(customersModule, 0, params)
  } finally {
    loadingCustomers.value = false
  }
}

async function loadTariffs() {
  loadingTariffs.value = true
  try {
    tariffs.value = await Api.fetchEntities(tariffsModule, 0, {
      pre_filters: [[
        { column: 'type', operator: '=', value: form.medium },
        { column: 'active', operator: '=', value: true },
      ]],
    })
  } finally {
    loadingTariffs.value = false
  }
}

function locationAddressSummary(location) {
  if (location.deliveryAddressMode === 'contract') {
    return [form.street, form.housenumber, form.zip, form.city].filter(Boolean).join(', ')
  }
  if (location.deliveryAddressMode === 'shipping') {
    return customerShippingSummary()
  }
  return [location.street, location.housenumber, location.zip, location.city].filter(Boolean).join(', ')
}

function customerContractSummary() {
  return [form.street, form.housenumber, form.zip, form.city].filter(Boolean).join(', ')
    || t('widgets.quotation_wizard.use_contract_address')
}

function locationDisplayName(location) {
  return location.label?.trim() || ''
}

function customerBillingSummary() {
  if (form.billingSameAsContract) {
    return [form.street, form.housenumber, form.zip, form.city].filter(Boolean).join(', ')
      || t('widgets.quotation_wizard.billing_same')
  }
  return [form.billingStreet, form.billingHousenumber, form.billingZip, form.billingCity].filter(Boolean).join(', ')
    || t('widgets.quotation_wizard.billing_same')
}

function customerShippingSummary() {
  if (form.shippingSameAsContract) {
    return [form.street, form.housenumber, form.zip, form.city].filter(Boolean).join(', ')
      || t('widgets.quotation_wizard.shipping_same')
  }
  return [form.shippingStreet, form.shippingHousenumber, form.shippingZip, form.shippingCity].filter(Boolean).join(', ')
    || t('widgets.quotation_wizard.shipping_same')
}

function formatDateISO(value) {
  if (!value) {
    return null
  }
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return date.toISOString().slice(0, 10)
}

function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function currentPartnerRelation() {
  const user = Api.getUser()
  return user?.id ? relation(user.id, 'users') : null
}

function addressFieldsMatch(left, right) {
  if (!left || !right) {
    return false
  }
  const normalize = value => (value || '').trim().toLowerCase()
  return normalize(left.street) === normalize(right.street)
    && normalize(left.housenumber) === normalize(right.housenumber)
    && normalize(left.zip) === normalize(right.zip)
    && normalize(left.city) === normalize(right.city)
}

function contractAddressFields() {
  return {
    street: form.street,
    housenumber: form.housenumber,
    housenumberAddition: form.housenumberAddition,
    zip: form.zip,
    city: form.city,
  }
}

function billingAddressFields() {
  if (form.billingSameAsContract) {
    return contractAddressFields()
  }
  return {
    street: form.billingStreet,
    housenumber: form.billingHousenumber,
    housenumberAddition: '',
    zip: form.billingZip,
    city: form.billingCity,
  }
}

function shippingAddressFields() {
  if (form.shippingSameAsContract) {
    return contractAddressFields()
  }
  return {
    street: form.shippingStreet,
    housenumber: form.shippingHousenumber,
    housenumberAddition: '',
    zip: form.shippingZip,
    city: form.shippingCity,
  }
}

function locationAddressFields(location) {
  return {
    street: location.street,
    housenumber: location.housenumber,
    housenumberAddition: location.housenumberAddition,
    zip: location.zip,
    city: location.city,
  }
}

function locationBillingAddressFields(location) {
  return {
    street: location.billingStreet,
    housenumber: location.billingHousenumber,
    housenumberAddition: location.billingHousenumberAddition,
    zip: location.billingZip,
    city: location.billingCity,
  }
}

function applyAddressToForm(address, prefix = '') {
  if (!address) {
    return
  }
  const streetKey = prefix ? `${prefix}Street` : 'street'
  const houseKey = prefix ? `${prefix}Housenumber` : 'housenumber'
  const zipKey = prefix ? `${prefix}Zip` : 'zip'
  const cityKey = prefix ? `${prefix}City` : 'city'
  form[streetKey] = address.street || ''
  form[houseKey] = address.housenumber || ''
  form[zipKey] = address.zip || ''
  form[cityKey] = address.city || ''
  if (!prefix) {
    form.housenumberAddition = address.housenumber_addition || ''
  }
}

function meterFromEntities(meterEntity, positionEntity = null) {
  const previous = {
    current_provider: positionEntity?.current_provider || meterEntity?.current_provider || '',
    current_customer_no: positionEntity?.current_customer_no || meterEntity?.current_customer_no || '',
    current_price_per_kwh: positionEntity?.current_price_per_kwh ?? meterEntity?.current_price_per_kwh ?? null,
    current_baseprice: positionEntity?.current_baseprice ?? meterEntity?.current_baseprice ?? null,
  }
  return createMeter({
    dbId: meterEntity?.id || null,
    positionDbId: positionEntity?.id || null,
    meter_type: meterEntity?.meter_type || 'slp',
    meter_number: meterEntity?.meter_number || '',
    malo: meterEntity?.malo || '',
    usage: meterEntity?.usage ?? positionEntity?.usage ?? null,
    start_date: positionEntity?.start_date || meterEntity?.start_date || null,
    peak_power: meterEntity?.peak_power ?? null,
    annual_peak_power: meterEntity?.annual_peak_power ?? null,
    switch_reason: positionEntity?.switch_reason || meterEntity?.switch_reason || 'supplier_switch',
    external_id: positionEntity?.external_id || meterEntity?.external_id || '',
    current_provider: previous.current_provider,
    current_customer_no: previous.current_customer_no,
    current_price_per_kwh: previous.current_price_per_kwh,
    current_baseprice: previous.current_baseprice,
    showPreviousSupplier: !!(previous.current_provider || hasPreviousTariffPrices(previous)),
    previousSupplierCalculated: hasPreviousTariffPrices(previous),
    tariffId: positionEntity?.tariff_catalog?.id || null,
    compareTariffId: positionEntity?.compare_tariff_catalog?.id || null,
    editing: !(meterEntity?.meter_number),
  })
}

async function loadOfferDraft(offerId) {
  if (!offerId || Number.isNaN(offerId)) {
    return
  }
  loadingOffer.value = true
  try {
    const offer = await Api.fetchEntity(offerId, offersModule)
    if (offer.status !== 'draft') {
      showMessage('error', { content: t('widgets.quotation_wizard.edit_only_draft') })
      return
    }
    if (offer.type === 'individual') {
      showMessage('error', { content: t('widgets.quotation_wizard.custom_inquiry.edit_blocked') })
      return
    }

    editingOfferId.value = offer.id
    editingOfferNumber.value = offer.number
    currentStep.value = 1

    form.procurementType = offer.procurement_type || form.procurementType

    const customer = await Api.fetchEntity(offer.customer.id, customersModule)
    existingCustomerId.value = customer.id
    form.type = customer.type || 'b2b'
    form.company = customer.company || ''
    form.companyType = customer.company_type || form.companyType
    form.industry = customer.industry || ''
    form.salutation = customer.salutation || form.salutation
    form.firstname = customer.firstname || ''
    form.name = customer.name || ''
    form.birthdate = customer.birthdate || ''
    form.email = customer.email || ''
    form.phone = customer.phone || ''
    form.phonePrefix = ''
    form.phoneNumber = customer.phone || ''
    form.marketingPost = !!customer.marketing_post
    form.marketingEmail = !!customer.marketing_email
    form.marketingPhone = !!customer.marketing_phone
    form.iban = customer.iban || customer.default_iban || ''
    form.bic = customer.bic || customer.default_bic || ''
    form.accountHolder = customer.default_bank || ''

    contractAddressId.value = customer.default_address?.id || null
    billingAddressId.value = customer.default_billing_address?.id || null
    shippingAddressId.value = customer.default_shipping_address?.id || null

    if (contractAddressId.value) {
      const contractAddress = await Api.fetchEntity(contractAddressId.value, addressesModule)
      applyAddressToForm(contractAddress)
    }

    if (billingAddressId.value) {
      const billingAddress = await Api.fetchEntity(billingAddressId.value, addressesModule)
      if (addressFieldsMatch(contractAddressFields(), billingAddress)) {
        form.billingSameAsContract = true
      } else {
        form.billingSameAsContract = false
        applyAddressToForm(billingAddress, 'billing')
      }
    } else {
      form.billingSameAsContract = true
    }

    if (shippingAddressId.value) {
      const shippingAddress = await Api.fetchEntity(shippingAddressId.value, addressesModule)
      if (addressFieldsMatch(contractAddressFields(), shippingAddress)) {
        form.shippingSameAsContract = true
      } else {
        form.shippingSameAsContract = false
        applyAddressToForm(shippingAddress, 'shipping')
      }
    } else {
      form.shippingSameAsContract = true
    }

    const positions = await Api.fetchEntities(positionsModule, 0, {
      pre_filters: [[{ column: 'offer.id', operator: '=', value: offerId }]],
    })

    const locationMap = new Map()
    let detectedMedium = form.medium

    for (const positionSummary of positions) {
      const position = await Api.fetchEntity(positionSummary.id, positionsModule)
      if (!position.location?.id) {
        continue
      }

      const locationEntity = await Api.fetchEntity(position.location.id, locationsModule)
      const locationKey = locationEntity.id
      let locationForm = locationMap.get(locationKey)

      if (!locationForm) {
        let deliveryAddressMode = 'contract'
        let locationAddress = null
        if (locationEntity.address?.id) {
          locationAddress = await Api.fetchEntity(locationEntity.address.id, addressesModule)
          if (!addressFieldsMatch(contractAddressFields(), locationAddress)) {
            if (addressFieldsMatch(shippingAddressFields(), locationAddress)) {
              deliveryAddressMode = 'shipping'
            } else {
              deliveryAddressMode = 'new'
            }
          }
        }

        let locationBillingAddress = null
        if (locationEntity.billing_address?.id) {
          locationBillingAddress = await Api.fetchEntity(locationEntity.billing_address.id, addressesModule)
        }

        let billingMode = 'delivery'
        if (locationBillingAddress) {
          if (locationAddress && addressFieldsMatch(locationBillingAddress, locationAddress)) {
            billingMode = 'delivery'
          } else if (addressFieldsMatch(contractAddressFields(), locationBillingAddress)) {
            billingMode = 'contract'
          } else {
            billingMode = 'new'
          }
        }

        locationForm = createLocation(locationEntity.label || '', {
          dbId: locationEntity.id,
          addressDbId: locationEntity.address?.id || null,
          billingAddressDbId: locationEntity.billing_address?.id || null,
          deliveryAddressMode,
          street: locationAddress?.street || form.street || '',
          housenumber: locationAddress?.housenumber || form.housenumber || '',
          housenumberAddition: locationAddress?.housenumber_addition || '',
          zip: locationAddress?.zip || form.zip || '',
          city: locationAddress?.city || form.city || '',
          billingMode,
          billingStreet: locationBillingAddress?.street || '',
          billingHousenumber: locationBillingAddress?.housenumber || '',
          billingHousenumberAddition: locationBillingAddress?.housenumber_addition || '',
          billingZip: locationBillingAddress?.zip || '',
          billingCity: locationBillingAddress?.city || '',
          bank: locationEntity.bank || customer.default_bank || '',
          iban: locationEntity.iban || customer.iban || customer.default_iban || '',
          bic: locationEntity.bic || customer.bic || customer.default_bic || '',
          meters: [],
        })
        locationMap.set(locationKey, locationForm)
      }

      let meterEntity = null
      if (position.meter?.id) {
        meterEntity = await Api.fetchEntity(position.meter.id, metersModule)
      } else {
        const locationMeters = await Api.fetchEntities(metersModule, 0, {
          pre_filters: [[{ column: 'location.id', operator: '=', value: locationEntity.id }]],
        })
        meterEntity = locationMeters.find(item => item.usage === position.usage)
          || locationMeters.find(item => item.meter_number && item.meter_number === position.meter_number)
          || locationMeters[0]
      }

      if (meterEntity?.type) {
        detectedMedium = meterEntity.type
      }

      locationForm.meters.push(meterFromEntities(meterEntity, position))
    }

    form.medium = detectedMedium
    form.locations = Array.from(locationMap.values())
    if (form.locations.length === 0) {
      form.locations = [createLocation()]
    } else {
      form.locations.forEach((location) => {
        if (location.meters.length === 0) {
          location.meters.push(createMeter())
        }
      })
    }

    await loadTariffs()
  } catch (error) {
    const message = error instanceof ClientError
      ? Object.values(error.response?.errors || {}).flat().join(' ')
      : error?.message || t('widgets.quotation_wizard.load_draft_error')
    showMessage('error', { content: message })
  } finally {
    loadingOffer.value = false
  }
}

function toggleLocationEdit(location) {
  location.editing = !location.editing
}

function addLocation() {
  if (meterCount.value >= MAX_METERS) {
    return
  }
  form.locations.push(createLocation())
}

function removeLocation(index) {
  form.locations.splice(index, 1)
}

function addMeter(locIndex) {
  if (meterCount.value >= MAX_METERS) {
    return
  }
  form.locations[locIndex].meters.push(createMeter())
}

function removeMeter(locIndex, meterIndex) {
  const location = form.locations[locIndex]
  location.meters.splice(meterIndex, 1)
  if (location.meters.length === 0) {
    form.locations.splice(locIndex, 1)
  }
  if (form.locations.length === 0) {
    form.locations.push(createLocation())
  }
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(value || 0)
}

function formatDate(value) {
  if (!value) {
    return '—'
  }
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleDateString('de-DE')
}

function formatPrice(value) {
  return (value ?? 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatCurrency(value) {
  return `€${formatNumber(Math.round(value || 0))}`
}

function estimateYearlyCost(tariff, meter) {
  const usage = meter.usage || 0
  const energyPrice = energyPriceWithSurcharge(tariff)
  const grid = (tariff.grid_usage_fee ?? 0) + (tariff.grid_fixed_fee ?? 0)
    + (tariff.concession_fee ?? 0) + (tariff.metering_fee ?? 0)
  const levies = (tariff.kwkg_levy ?? 0) + (tariff.special_grid_levy ?? 0)
    + (tariff.offshore_levy ?? 0) + (tariff.electricity_tax ?? 0)
  const usagePrice = (tariff.grid_usage_fee ?? 0) + (tariff.concession_fee ?? 0)
    + levies + energyPrice
  const supplier = (tariff.site_fixed_fee ?? 0) + (usage * usagePrice / 100)
  return grid + levies + supplier
}

function costAdvantage(meter, tariff) {
  if (!meter.previousSupplierCalculated || !hasPreviousTariffPrices(meter)) {
    return null
  }
  return previousYearlyCost(meter) - estimateYearlyCost(tariff, meter)
}

function savingsFor(meter, tariff) {
  if (!meter.previousSupplierCalculated) {
    return 0
  }
  if (!hasPreviousTariffPrices(meter)) {
    return 0
  }
  const previous = previousYearlyCost(meter)
  return Math.max(0, previous - estimateYearlyCost(tariff, meter))
}

function onPreviousSupplierChange(meter) {
  meter.previousSupplierCalculated = hasPreviousTariffPrices(meter)
}

function calculatePreviousTariff(meter) {
  if (!hasPreviousTariffPrices(meter)) {
    showMessage('error', { content: t('widgets.quotation_wizard.validation.previous_tariff') })
    return
  }
  meter.previousSupplierCalculated = true
  showMessage('success', { content: t('widgets.quotation_wizard.calculate_success') })
}

function savingsPercentFor(meter, tariff) {
  if (!meter.previousSupplierCalculated) {
    return 0
  }
  const previous = previousYearlyCost(meter)
  if (!previous) {
    return 0
  }
  const savings = savingsFor(meter, tariff)
  return Math.round((savings / previous) * 100)
}

function customerLabel(customer) {
  if (!customer) {
    return ''
  }
  if (customer.brezel_name) {
    return customer.brezel_name
  }
  if (customer.company) {
    return customer.company
  }
  const person = [customer.firstname, customer.name].filter(Boolean).join(' ').trim()
  if (person) {
    return person
  }
  if (customer.email) {
    return customer.email
  }
  return `#${customer.id}`
}

function loadExistingCustomer() {
  customerModalOpen.value = true
  searchCustomers('')
}

async function applyExistingCustomer() {
  if (!selectedCustomerId.value) {
    return
  }
  const customer = await Api.fetchEntity(selectedCustomerId.value, customersModule)
  existingCustomerId.value = customer.id
  form.type = customer.type || 'b2b'
  form.company = customer.company || ''
  form.companyType = customer.company_type || form.companyType
  form.industry = customer.industry || ''
  form.salutation = customer.salutation || form.salutation
  form.firstname = customer.firstname || ''
  form.name = customer.name || ''
  form.birthdate = customer.birthdate || ''
  form.email = customer.email || ''
  form.phone = customer.phone || ''
  form.phonePrefix = ''
  form.phoneNumber = customer.phone || ''
  form.marketingPost = !!customer.marketing_post
  form.marketingEmail = !!customer.marketing_email
  form.marketingPhone = !!customer.marketing_phone
  form.iban = customer.iban || customer.default_iban || ''
  form.bic = customer.bic || customer.default_bic || ''
  form.accountHolder = customer.default_bank || ''
  if (customer.default_address?.id) {
    const address = await Api.fetchEntity(customer.default_address.id, addressesModule)
    form.street = address.street || ''
    form.housenumber = address.housenumber || ''
    form.zip = address.zip || ''
    form.city = address.city || ''
    contractAddressId.value = customer.default_address.id
  }
  if (customer.default_billing_address?.id) {
    const billingAddress = await Api.fetchEntity(customer.default_billing_address.id, addressesModule)
    billingAddressId.value = customer.default_billing_address.id
    if (addressFieldsMatch(contractAddressFields(), billingAddress)) {
      form.billingSameAsContract = true
    } else {
      form.billingSameAsContract = false
      applyAddressToForm(billingAddress, 'billing')
    }
  } else {
    form.billingSameAsContract = true
  }
  if (customer.default_shipping_address?.id) {
    const shippingAddress = await Api.fetchEntity(customer.default_shipping_address.id, addressesModule)
    shippingAddressId.value = customer.default_shipping_address.id
    if (addressFieldsMatch(contractAddressFields(), shippingAddress)) {
      form.shippingSameAsContract = true
    } else {
      form.shippingSameAsContract = false
      applyAddressToForm(shippingAddress, 'shipping')
    }
  } else {
    form.shippingSameAsContract = true
  }
  customerModalOpen.value = false
  showMessage('success', { content: t('widgets.quotation_wizard.customer_loaded') })
}

function validate(mode = 'finish') {
  if (form.type === 'b2b' && !form.company?.trim()) {
    showMessage('error', { content: t('widgets.quotation_wizard.validation.company') })
    return false
  }
  if (!form.street?.trim() || !form.zip?.trim() || !form.city?.trim()) {
    showMessage('error', { content: t('widgets.quotation_wizard.validation.address') })
    return false
  }
  if (mode === 'finish') {
    if (!form.firstname?.trim() || !form.name?.trim()) {
      showMessage('error', { content: t('widgets.quotation_wizard.validation.contact') })
      return false
    }
  }
  if (meterCount.value > MAX_METERS) {
    showMessage('error', { content: t('widgets.quotation_wizard.individual_request') })
    return false
  }
  for (const location of form.locations) {
    if (location.deliveryAddressMode === 'new') {
      if (!location.street?.trim() || !location.zip?.trim() || !location.city?.trim()) {
        showMessage('error', { content: t('widgets.quotation_wizard.validation.location_address') })
        return false
      }
    }
    if (mode === 'finish') {
      if (!location.bank?.trim()) {
        showMessage('error', { content: t('widgets.quotation_wizard.validation.account_holder') })
        return false
      }
      if (!location.iban?.trim()) {
        showMessage('error', { content: t('widgets.quotation_wizard.validation.iban') })
        return false
      }
      if (location.billingMode === 'new') {
        if (!location.billingStreet?.trim() || !location.billingZip?.trim() || !location.billingCity?.trim()) {
          showMessage('error', { content: t('widgets.quotation_wizard.validation.location_billing_address') })
          return false
        }
      }
    }
    for (const meter of location.meters) {
      if (mode !== 'draft') {
        if (!meter.meter_number?.trim()) {
          showMessage('error', { content: t('widgets.quotation_wizard.validation.meter_number') })
          return false
        }
        if (!meter.malo?.trim() || meter.malo.length !== 11) {
          showMessage('error', { content: t('widgets.quotation_wizard.validation.malo_required') })
          return false
        }
        if (!meter.usage || meter.usage <= 0) {
          showMessage('error', { content: t('widgets.quotation_wizard.validation.usage') })
          return false
        }
        if (meter.meter_type === 'rlm' && !meter.peak_power) {
          showMessage('error', { content: t('widgets.quotation_wizard.validation.peak_power') })
          return false
        }
        if (!meter.tariffId) {
          showMessage('error', { content: t('widgets.quotation_wizard.validation.tariff') })
          return false
        }
      } else if (meter.malo && meter.malo.length !== 11) {
        showMessage('error', { content: t('widgets.quotation_wizard.validation.malo') })
        return false
      }
      if (mode === 'finish') {
        if (!meter.switch_reason) {
          showMessage('error', { content: t('widgets.quotation_wizard.validation.switch_reason') })
          return false
        }
        if (!meter.start_date) {
          showMessage('error', { content: t('widgets.quotation_wizard.validation.start_date') })
          return false
        }
        if (!meter.current_provider?.trim()) {
          showMessage('error', { content: t('widgets.quotation_wizard.validation.current_provider') })
          return false
        }
      }
    }
  }
  return true
}

function relation(id, moduleIdentifier = null) {
  if (!id) {
    return null
  }
  const payload = { id }
  if (moduleIdentifier) {
    const module = Module.byIdentifier(moduleIdentifier)
    if (module?.id) {
      payload.module_id = module.id
    }
  }
  return payload
}

function customerFieldsPayload() {
  const primaryBank = form.locations[0]?.bank || form.accountHolder || null
  const primaryIban = form.locations[0]?.iban || form.iban || null
  const primaryBic = form.locations[0]?.bic || form.bic || null
  return {
    type: form.type,
    company: form.type === 'b2b' ? (form.company || null) : null,
    company_type: form.type === 'b2b' ? (form.companyType || null) : null,
    industry: form.type === 'b2b' ? (form.industry || null) : null,
    salutation: form.salutation || null,
    firstname: form.firstname || null,
    name: form.name || null,
    birthdate: form.birthdate || null,
    email: form.email || null,
    phone: composedPhone.value || null,
    marketing_post: !!form.marketingPost,
    marketing_email: !!form.marketingEmail,
    marketing_phone: !!form.marketingPhone,
    iban: primaryIban,
    default_iban: primaryIban,
    bic: primaryBic,
    default_bic: primaryBic,
    default_bank: primaryBank,
  }
}

async function resolveCustomer() {
  const partner = currentPartnerRelation()
  if (existingCustomerId.value) {
    const customer = customersModule.makeEntity({
      id: existingCustomerId.value,
      ...customerFieldsPayload(),
      partner,
    })
    await Api.updateEntity(customer)
    return customer
  }
  const customer = customersModule.makeEntity({
    ...customerFieldsPayload(),
    partner,
  })
  const response = await Api.createEntity(customer)
  return customersModule.makeEntity(response.resource)
}

async function upsertAddress(customerId, fields, existingId = null) {
  const payload = {
    customer: relation(customerId, 'customers'),
    street: fields.street || null,
    housenumber: fields.housenumber || null,
    housenumber_addition: fields.housenumberAddition || null,
    zip: fields.zip || null,
    city: fields.city || null,
    country: 'DE',
  }
  if (existingId) {
    const address = addressesModule.makeEntity({ id: existingId, ...payload })
    const response = await Api.updateEntity(address)
    return addressesModule.makeEntity(response.resource)
  }
  const address = addressesModule.makeEntity(payload)
  const response = await Api.createEntity(address)
  return addressesModule.makeEntity(response.resource)
}

async function createQuotation(mode = 'finish') {
  if (!validate(mode)) {
    return
  }
  const calculateAndExport = mode === 'finish' || mode === 'offer'
  if (calculateAndExport) {
    const missingMalo = form.locations.some(location => location.meters.some(meter => !meter.malo?.trim()))
    if (missingMalo) {
      showMessage('warning', { content: t('widgets.quotation_wizard.malo_missing_warning') })
    }
  }
  submitting.value = true
  try {
    const customer = await resolveCustomer()
    const partner = currentPartnerRelation()

    const contractAddress = await upsertAddress(
      customer.id,
      contractAddressFields(),
      contractAddressId.value,
    )
    contractAddressId.value = contractAddress.id

    const billingAddress = form.billingSameAsContract
      ? contractAddress
      : await upsertAddress(
        customer.id,
        billingAddressFields(),
        billingAddressId.value,
      )
    if (!form.billingSameAsContract) {
      billingAddressId.value = billingAddress.id
    } else {
      billingAddressId.value = contractAddress.id
    }

    const shippingAddress = form.shippingSameAsContract
      ? contractAddress
      : await upsertAddress(
        customer.id,
        shippingAddressFields(),
        shippingAddressId.value,
      )
    if (!form.shippingSameAsContract) {
      shippingAddressId.value = shippingAddress.id
    } else {
      shippingAddressId.value = contractAddress.id
    }

    const primaryBank = form.locations[0]?.bank || form.accountHolder || null
    const primaryIban = form.locations[0]?.iban || form.iban || null
    const primaryBic = form.locations[0]?.bic || form.bic || null
    customer.default_address = relation(contractAddress.id, 'addresses')
    customer.default_billing_address = relation(billingAddress.id, 'addresses')
    customer.default_shipping_address = relation(shippingAddress.id, 'addresses')
    if (primaryIban) {
      customer.default_iban = primaryIban
      customer.iban = primaryIban
    }
    if (primaryBic) {
      customer.default_bic = primaryBic
      customer.bic = primaryBic
    }
    if (primaryBank) {
      customer.default_bank = primaryBank
    }
    await Api.updateEntity(customer)

    const offerType = meterCount.value > MAX_METERS ? 'individual' : 'normal'
    const today = formatDateISO(new Date())
    let savedOffer
    if (editingOfferId.value) {
      const offerUpdate = offersModule.makeEntity({
        id: editingOfferId.value,
        customer: relation(customer.id, 'customers'),
        user: partner,
        type: offerType,
        status: 'draft',
        procurement_type: form.procurementType || null,
      })
      if (calculateAndExport) {
        offerUpdate.valid_till = formatDateISO(addDays(new Date(), OFFER_VALID_DAYS))
        offerUpdate.created_at = today
      }
      await Api.updateEntity(offerUpdate)
      savedOffer = offersModule.makeEntity({ id: editingOfferId.value })
    } else {
      const offer = offersModule.makeEntity({
        customer: relation(customer.id, 'customers'),
        user: partner,
        status: 'draft',
        type: offerType,
        procurement_type: form.procurementType || null,
        created_at: today,
        valid_till: calculateAndExport ? formatDateISO(addDays(new Date(), OFFER_VALID_DAYS)) : null,
      })
      const offerResponse = await Api.createEntity(offer)
      savedOffer = offersModule.makeEntity(offerResponse.resource)
    }

    const keptPositionIds = []

    for (const location of form.locations) {
      const address = await resolveLocationAddress(customer.id, contractAddress, shippingAddress, location)

      let billingForLocation = billingAddress
      if (location.billingMode === 'delivery') {
        billingForLocation = address
      } else if (location.billingMode === 'contract') {
        billingForLocation = contractAddress
      } else if (location.billingMode === 'new') {
        billingForLocation = await upsertAddress(
          customer.id,
          locationBillingAddressFields(location),
          location.billingAddressDbId || null,
        )
        location.billingAddressDbId = billingForLocation.id
      }

      const locationPayload = {
        customer: relation(customer.id, 'customers'),
        partner,
        label: location.label?.trim() || null,
        address: relation(address.id, 'addresses'),
        billing_address: relation(billingForLocation.id, 'addresses'),
        bank: location.bank || form.accountHolder || null,
        iban: location.iban || form.iban || null,
        bic: location.bic || form.bic || null,
        start_date: location.meters[0]?.start_date || null,
      }

      let savedLocation
      if (location.dbId) {
        const locationResponse = await Api.updateEntity(locationsModule.makeEntity({
          id: location.dbId,
          ...locationPayload,
        }))
        savedLocation = locationsModule.makeEntity(locationResponse.resource)
      } else {
        const locationResponse = await Api.createEntity(locationsModule.makeEntity(locationPayload))
        savedLocation = locationsModule.makeEntity(locationResponse.resource)
        location.dbId = savedLocation.id
      }
      location.addressDbId = address.id

      for (const meter of location.meters) {
        const meterPayload = {
          customer: relation(customer.id, 'customers'),
          location: relation(savedLocation.id, 'locations'),
          partner,
          type: form.medium,
          meter_type: meter.meter_type,
          meter_number: meter.meter_number || null,
          malo: meter.malo || null,
          peak_power: meter.meter_type === 'rlm' ? meter.peak_power : null,
          annual_peak_power: meter.meter_type === 'rlm' ? meter.annual_peak_power : null,
          usage: meter.usage,
          start_date: meter.start_date,
          switch_reason: meter.switch_reason || null,
          external_id: meter.external_id || null,
          current_provider: meter.current_provider || null,
          current_price_per_kwh: meter.current_price_per_kwh,
          current_baseprice: meter.current_baseprice,
          current_customer_no: meter.current_customer_no || null,
        }

        let savedMeter
        if (meter.dbId) {
          const meterResponse = await Api.updateEntity(metersModule.makeEntity({
            id: meter.dbId,
            ...meterPayload,
          }))
          savedMeter = metersModule.makeEntity(meterResponse.resource)
        } else {
          const meterResponse = await Api.createEntity(metersModule.makeEntity(meterPayload))
          savedMeter = metersModule.makeEntity(meterResponse.resource)
          meter.dbId = savedMeter.id
        }

        if (meter.tariffId) {
          const positionPayload = {
            customer: relation(customer.id, 'customers'),
            location: relation(savedLocation.id, 'locations'),
            offer: relation(savedOffer.id, 'offers'),
            partner,
            meter: relation(savedMeter.id, 'meters'),
            tariff_catalog: relation(meter.tariffId, 'tariffs'),
            compare_tariff_catalog: meter.compareTariffId
              ? relation(meter.compareTariffId, 'tariffs')
              : null,
            current_provider: meter.current_provider || null,
            current_price_per_kwh: meter.current_price_per_kwh,
            current_baseprice: meter.current_baseprice,
            current_customer_no: meter.current_customer_no || null,
            switch_reason: meter.switch_reason || null,
            external_id: meter.external_id || null,
            meter_type: meter.meter_type,
            usage: meter.usage,
            start_date: meter.start_date,
            status: 'pending',
          }

          let savedPosition
          if (meter.positionDbId) {
            const positionResponse = await Api.updateEntity(positionsModule.makeEntity({
              id: meter.positionDbId,
              ...positionPayload,
            }))
            savedPosition = positionsModule.makeEntity(positionResponse.resource)
          } else {
            const positionResponse = await Api.createEntity(positionsModule.makeEntity(positionPayload))
            savedPosition = positionsModule.makeEntity(positionResponse.resource)
            meter.positionDbId = savedPosition.id
          }

          keptPositionIds.push(savedPosition.id)

          if (!savedPosition.offer?.id) {
            savedPosition.offer = relation(savedOffer.id, 'offers')
            savedPosition.customer = relation(customer.id, 'customers')
            savedPosition.location = relation(savedLocation.id, 'locations')
            savedPosition.meter = relation(savedMeter.id, 'meters')
            savedPosition.tariff_catalog = relation(meter.tariffId, 'tariffs')
            if (meter.compareTariffId) {
              savedPosition.compare_tariff_catalog = relation(meter.compareTariffId, 'tariffs')
            }
            await Api.updateEntity(savedPosition)
          }
        } else if (meter.positionDbId) {
          await Api.deleteEntity(positionsModule.makeEntity({ id: meter.positionDbId }))
          meter.positionDbId = null
        }
      }
    }

    if (editingOfferId.value) {
      const existingPositions = await Api.fetchEntities(positionsModule, 0, {
        pre_filters: [[{ column: 'offer.id', operator: '=', value: editingOfferId.value }]],
      })
      for (const position of existingPositions) {
        if (!keptPositionIds.includes(position.id)) {
          await Api.deleteEntity(positionsModule.makeEntity({ id: position.id }))
        }
      }
    }

    const offerEntity = offersModule.makeEntity({ id: savedOffer.id })

    if (calculateAndExport) {
      await BrezelActionFactory.create('CalculateOffer', offerEntity, {}, {}).fire(offerEntity)
      try {
        const offerForExport = await Api.fetchEntity(savedOffer.id, offersModule)
        await BrezelActionFactory.create('ExportOfferPdf', offerForExport, {}, {}).fire(offerForExport)
        showMessage('success', { content: t('widgets.quotation_wizard.success_finish') })
      } catch {
        // Offer is already calculated; PDF can still be exported from the offer page.
        showMessage('success', { content: t('widgets.quotation_wizard.success_calculated') })
      }
    } else {
      showMessage('success', {
        content: editingOfferId.value
          ? t('widgets.quotation_wizard.success_draft_updated')
          : t('widgets.quotation_wizard.success_draft'),
      })
    }

    brezelRouter.toModule('offers', 'module.show', savedOffer.id)
  } catch (error) {
    const message = error instanceof ClientError
      ? Object.values(error.response?.errors || {}).flat().join(' ')
      : error?.message || t('widgets.quotation_wizard.error')
    showMessage('error', { content: message })
  } finally {
    submitting.value = false
  }
}

async function resolveLocationAddress(customerId, contractAddress, shippingAddress, location) {
  if (location.deliveryAddressMode === 'contract') {
    return contractAddress
  }
  if (location.deliveryAddressMode === 'shipping') {
    return shippingAddress
  }
  return upsertAddress(
    customerId,
    locationAddressFields(location),
    location.addressDbId || null,
  )
}

function saveDraft() {
  createQuotation('draft')
}

function createOfferPdf() {
  createQuotation('offer')
}

function finishQuotation() {
  createQuotation('finish')
}
</script>

<style scoped lang="scss">
$slate-50: #f8fafc;
$slate-100: #f1f5f9;
$slate-200: #e2e8f0;
$slate-300: #cbd5e1;
$slate-400: #94a3b8;
$slate-500: #64748b;
$slate-600: #475569;
$slate-700: #334155;
$slate-800: #1e293b;
$blue-50: #f7fbe9;
$blue-100: #ecf5cc;
$blue-200: #dcf0a4;
$blue-600: #95c11f;
$blue-900: #5a7723;
$orange-50: #fff7ed;
$orange-200: #fed7aa;
$orange-300: #fdba74;
$orange-600: #ea580c;
$orange-900: #7c2d12;
$yellow-400: #facc15;
$green-600: #95c11f;
$green-700: #779c29;
$loewe-green: #95c11f;
$loewe-green-dark: #779c29;
$loewe-green-soft: #eef6d4;

.qw {
  background: $slate-100;
  color: $slate-800;
  margin: -1rem -1.25rem;
  padding: 2rem 1rem 6rem;
  min-height: calc(100vh - 120px);
  font-family: inherit;
}

.qw__page {
  max-width: 64rem;
  margin: 0 auto;
}

.qw__top {
  display: flex;
  flex-direction: column;
  margin-bottom: 2rem;
  gap: 0.35rem;
}

.qw__top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.qw__title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.qw__subtitle {
  margin: 0.35rem 0 0;
  color: $slate-500;
  font-size: 0.875rem;
}

.qw__link-btn {
  background: none;
  border: none;
  color: $slate-500;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: $slate-800;
  }
}

.qw-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.qw-section {
  position: relative;
  background: #fff;
  border-radius: 0.75rem;
  border: 1px solid $slate-200;
  box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
  margin-bottom: 2rem;
  overflow: visible;
}

.qw-section--locations .qw-locations {
  padding: 1.5rem;
  margin-left: 0.5rem;
  background: rgb(248 250 252 / 50%);
}

.qw-section__accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;

  &--blue { background: $blue-600; }
  &--yellow { background: $yellow-400; }
}

.qw-section__head {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1.25rem 1.25rem 1.25rem 1.75rem;
  border-bottom: 1px solid $slate-100;
  margin-left: 0.5rem;

  &--split {
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
  }
}

.qw-section__head-left {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.qw-section__num {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  background: $blue-600;
  color: #fff;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 0.1rem;
  line-height: 1;
  box-shadow: 0 1px 2px rgb(0 0 0 / 10%);
}

.qw-section__title {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.35;
}

.qw-section__desc {
  font-size: 0.875rem;
  color: $slate-500;
  margin: 0.2rem 0 0;
  line-height: 1.4;
}

.qw-energy {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  padding: 1.5rem 1.5rem 1.5rem 1.75rem;
  margin-left: 0.5rem;
}

.qw-energy__card {
  border: 2px solid $slate-200;
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;

  &:hover {
    border-color: #93c5fd;
  }

  &--active {
    border-color: $blue-600;
    background: $blue-50;

    .qw-radio-dot {
      background: $blue-600;
      border-color: $blue-600;
    }
  }
}

.qw-energy__icon {
  width: 3rem;
  height: 3rem;
  margin-bottom: 0.75rem;

  &--electricity { color: #eab308; }
  &--gas { color: #f97316; }
}

.qw-energy__label {
  font-size: 1.25rem;
  font-weight: 700;
}

.qw-radio-dot {
  margin-top: 1rem;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 999px;
  border: 2px solid $slate-300;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '';
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 999px;
    background: #fff;
  }
}

.qw-form {
  padding: 1.5rem 1.5rem 1.5rem 1.75rem;
  margin-left: 0.5rem;
}

.qw-form__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  margin-bottom: 1rem;

  &--2 {
    grid-template-columns: repeat(2, 1fr);
  }

  &--3 {
    grid-template-columns: repeat(3, 1fr);
  }
}

.qw-form__row {
  margin-bottom: 1rem;

  &--full {
    grid-column: 1 / -1;
  }
}

.qw-form__divider {
  margin-top: 1rem;
  padding-top: 1.25rem;
  border-top: 1px solid $slate-100;
}

.qw-form__subhead {
  font-size: 0.875rem;
  font-weight: 700;
  margin: 0 0 1rem;
}

.qw-form__block-title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: $slate-800;
  margin: 0 0 1rem;
  padding: 0.75rem 0 0;
}

.qw-form__numbered {
  font-size: 0.875rem;
  font-weight: 700;
  color: $slate-700;
  margin: 0 0 0.5rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid $slate-100;
}

.qw-form__span-2 {
  grid-column: span 2;
}

.qw-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: $slate-700;
  margin-bottom: 0.35rem;

  &--sm {
    font-size: 0.75rem;
  }

  &--accent {
    color: #c2410c;
    font-weight: 700;
  }
}

.qw-input {
  width: 100%;
  border: 1px solid $slate-300;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  background: #fff;

  &:focus {
    outline: none;
    border-color: $blue-600;
    box-shadow: 0 0 0 2px rgb(37 99 235 / 20%);
  }

  &--zip {
    max-width: 8rem;
  }

  &--mono {
    font-family: ui-monospace, monospace;
    text-transform: uppercase;
  }

  &--sm {
    padding: 0.35rem 0.6rem;
    font-size: 0.8125rem;
  }

  &--invalid {
    border-color: #ef4444;

    &:focus {
      border-color: #ef4444;
      box-shadow: 0 0 0 2px rgb(239 68 68 / 25%);
    }
  }

  &--accent {
    border-color: #fdba74;
    background: #fff7ed;
  }

  &--table {
    border: none;
    padding: 0.25rem 0;
    background: transparent;

    &:focus {
      box-shadow: none;
      border-bottom: 1px solid $blue-600;
      border-radius: 0;
    }
  }
}

.qw-address-grid {
  margin-bottom: 0;
}

.qw-address-inline {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    align-items: center;
    gap: 0.75rem;
  }

  &__street,
  &__house,
  &__zip,
  &__city {
    width: 100%;
    min-width: 0;
  }

  &--sm {
    margin-top: 0.5rem;
  }

  &--5 {
    @media (min-width: 768px) {
      grid-template-columns: repeat(12, minmax(0, 1fr));

      > :nth-child(1) {
        grid-column: span 6;
      }

      > :nth-child(2),
      > :nth-child(3) {
        grid-column: span 3;
      }

      > :nth-child(4) {
        grid-column: span 4;
      }

      > :nth-child(5) {
        grid-column: span 8;
      }
    }
  }
}

.qw-config {
  display: grid;
  grid-template-columns: minmax(0, 22rem) 1fr;
  gap: 1.5rem;
  align-items: center;
  padding: 0 1.5rem 1.5rem 1.75rem;
  margin-left: 0.5rem;
}

.qw-config__toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: $slate-700;
  cursor: pointer;
  margin-top: 1.35rem;
}

.qw-input--half {
  max-width: 24rem;
}

.qw-radio-inline {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: $slate-700;
  margin-right: 1rem;
  cursor: pointer;
}

.qw-meter-limit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.qw-meter-limit__label {
  color: $slate-600;
  font-weight: 500;
}

.qw-meter-limit__bars {
  display: flex;
  gap: 0.25rem;
}

.qw-meter-limit__bar {
  width: 0.5rem;
  height: 1.5rem;
  border-radius: 2px;
  background: $slate-200;

  &--on {
    background: $blue-600;
  }

  &--full {
    background: #ef4444;
  }
}

.qw-meter-limit__count {
  font-weight: 700;
  margin-left: 0.25rem;
}

.qw-location {
  background: #fff;
  border: 1px solid $slate-300;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  overflow: hidden;
  box-shadow: 0 1px 2px rgb(0 0 0 / 4%);
}

.qw-location__head {
  background: $slate-100;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid $slate-200;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.qw-location__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

.qw-location__name-input {
  flex: 1;
  min-width: 10rem;
  max-width: 20rem;
  border: 0;
  border-bottom: 1px dashed $slate-400;
  background: transparent;
  font: inherit;
  font-weight: 700;
  color: $slate-800;
  padding: 0.15rem 0.25rem;

  &:focus {
    outline: none;
    border-bottom-color: $loewe-green;
  }
}

.qw-location__delivery {
  padding: 1rem;
  border-bottom: 1px solid $slate-200;
  background: #fff;
}

.qw-location__delivery-head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;

  .qw-label {
    margin-bottom: 0;
  }
}

.qw-location__addr {
  font-weight: 400;
  color: $slate-500;
  font-size: 0.875rem;
}

.qw-location__meta {
  padding: 0.75rem 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
  align-items: flex-end;
  border-bottom: 1px solid $slate-100;
}

.qw-location__name {
  flex: 1;
  min-width: 12rem;
  max-width: 20rem;
}

.qw-location__address {
  padding: 0 1rem 0.75rem;
}

.qw-location__address-block {
  padding: 0 1rem 0.75rem;
}

.qw-subsection-label {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: $slate-500;
}

.qw-location__billing {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid $slate-200;
  background: $slate-50;

  &--open {
    background: rgb(239 246 255 / 50%);
  }
}

.qw-location__billing-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: $slate-600;

  .qw-location__billing--open & {
    color: $blue-900;
    margin-bottom: 0.35rem;
  }
}

.qw-location__billing-fields {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.qw-location__iban {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  max-width: 28rem;
}

.qw-location__billing-row {
  align-items: start;
  margin-bottom: 0;
}

.qw-location__billing-select {
  border-color: $blue-200;
  background: #fff;

  &:focus {
    border-color: $blue-600;
    box-shadow: 0 0 0 2px rgb(37 99 235 / 15%);
  }
}

.qw-location__billing-address {
  margin-top: 0.75rem;
}

.qw-location__edit {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid $slate-100;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.qw-location__edit-check {
  margin: 0;
}

.qw-location__delivery-address {
  margin-top: 0.75rem;
}

.qw-location__edit-actions {
  padding-top: 0.25rem;
}

.qw-table-wrap {
  padding: 0;
  overflow-x: auto;
}

.qw-meters {
  padding: 1rem;
  background: #fff;
}

.qw-meter-card {
  position: relative;
  border: 1px solid $slate-200;
  border-radius: 0.375rem;
  padding: 0.75rem 1rem 0.75rem 0.75rem;
  margin-bottom: 0.75rem;
  background: #fff;

  &:last-of-type {
    margin-bottom: 0;
  }
}

.qw-meter-card__remove {
  position: absolute;
  top: 0.35rem;
  right: 0.5rem;
  border: none;
  background: none;
  color: $slate-400;
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  padding: 0.15rem 0.35rem;

  &:hover {
    color: #ef4444;
  }
}

.qw-meter-card__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem 1rem;
  padding-right: 1.25rem;
}

.qw-meter-card__field {
  display: flex;
  flex-direction: column;
}

.qw-meter-card__rlm {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid $slate-100;
  max-width: 25%;
}

.qw-meters__footer {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid $slate-100;
}

.qw-table__footer {
  border-top: 1px solid $slate-100;
  background: #fff;
  padding: 0.75rem 1rem;
}

.qw-table__expand td {
  padding: 0 !important;
  vertical-align: top;
  border-top: 1px solid $slate-100;
}

.qw-table__action-head,
.qw-table__action,
.qw-table__action-col {
  width: 6.5rem;
  white-space: nowrap;
}

.qw-table__action {
  background: #fff;
  vertical-align: top;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.qw-meter-edit {
  padding: 1rem 1.25rem;
}

.qw-meter-edit__cols {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem 2rem;
}

.qw-meter-edit__col {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.qw-meter-edit__field {
  display: flex;
  flex-direction: column;
}

.qw-table__usage {
  font-weight: 500;
}

.qw-table__malo {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.8125rem;
  white-space: nowrap;
}

.qw-table__malo-col {
  width: 8.5rem;
}

.qw-table__date {
  white-space: nowrap;
}

.qw-table__date-col {
  width: 7rem;
}

.qw-icon-btn--edit {
  color: $slate-400;

  &:hover {
    color: $slate-600;
  }
}

.qw-add-meter {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: none;
  border: none;
  color: $blue-600;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: #1d4ed8;
  }
}

.qw-add-location {
  width: 100%;
  border: 2px dashed $slate-300;
  border-radius: 0.5rem;
  padding: 1rem;
  background: transparent;
  color: $slate-500;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  transition: border-color 0.15s, color 0.15s, background 0.15s;

  &:hover {
    background: #fff;
    border-color: #60a5fa;
    color: $blue-600;
  }
}

.qw-add-location__icon {
  font-size: 1.5rem;
  line-height: 1;
}

.qw-table {
  width: 100%;
  table-layout: fixed;
  font-size: 0.875rem;
  color: $slate-600;
  border-collapse: collapse;

  th {
    background: $slate-50;
    text-transform: uppercase;
    font-size: 0.75rem;
    font-weight: 600;
    color: $slate-500;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid $slate-200;
    text-align: left;

    &.qw-table__action-head {
      text-align: right;
    }
  }

  td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid $slate-100;

    &.qw-table__action {
      text-align: right;
    }
  }

  &__right {
    text-align: right;
  }

  &__medium {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    color: $slate-800;
  }
}

.qw-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;

  &--electricity { background: $yellow-400; }
  &--gas { background: #f97316; }
}

.qw-check {
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
}

.qw-toggle {
  position: relative;
  display: inline-flex;
  cursor: pointer;

  input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  input:checked + .qw-toggle__track {
    background: $blue-600;

    &::after {
      transform: translateX(1rem);
    }
  }
}

.qw-toggle__track {
  width: 2.25rem;
  height: 1.25rem;
  background: $slate-300;
  border-radius: 999px;
  position: relative;
  transition: background 0.15s;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 1rem;
    height: 1rem;
    background: #fff;
    border-radius: 999px;
    transition: transform 0.15s;
    box-shadow: 0 1px 2px rgb(0 0 0 / 15%);
  }
}

.qw-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: $slate-500;
}

.qw-icon-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: $slate-400;
  cursor: pointer;
  line-height: 1;
}

.qw-text-btn {
  background: none;
  border: none;
  color: $blue-600;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }

  &--danger {
    color: #dc2626;
  }

  &--outline {
    border: 1px solid $blue-200;
    background: #fff;
    border-radius: 0.25rem;
    padding: 0.25rem 0.75rem;
    font-weight: 700;
  }
}

.qw-tariff-head {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1.5rem;

  .qw-section__num {
    margin-top: 0.15rem;
  }
}

.qw-tariff-head__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.35;
}

.qw-meter-tariff {
  position: relative;
  background: #fff;
  border-radius: 0.75rem;
  border: 1px solid $slate-300;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 8%);
  margin-bottom: 2rem;
  overflow: hidden;
}

.qw-meter-tariff__head {
  background: $slate-100;
  padding: 1rem 1.25rem 1rem 1.5rem;
  border-bottom: 1px solid $slate-200;
  margin-left: 0.375rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.qw-meter-tariff__loc {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: $slate-500;
  margin-bottom: 0.25rem;
}

.qw-meter-tariff__meter {
  font-size: 1.125rem;
  font-weight: 700;
}

.qw-meter-tariff__meta {
  text-align: right;
  font-size: 0.875rem;
  color: $slate-500;
}

.qw-badge {
  display: inline-block;
  margin-top: 0.35rem;
  font-weight: 700;
  color: $blue-600;
  background: $blue-50;
  border: 1px solid $blue-100;
  border-radius: 0.25rem;
  padding: 0.15rem 0.5rem;
  font-size: 0.8125rem;
}

.qw-meter-tariff__body {
  padding: 1.25rem 1.25rem 1.25rem 1.5rem;
  margin-left: 0.375rem;
}

.qw-previous {
  background: $orange-50;
  border: 1px solid $orange-200;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;

  &--collapsed {
    background: $slate-50;
    border-color: $slate-200;
  }
}

.qw-previous__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  h3 {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 700;
    color: $orange-900;
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .qw-previous--collapsed & h3 {
    color: $slate-600;
    font-weight: 500;
  }
}

.qw-previous__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  &--calc {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    margin-top: 1rem;
  }

  &--secondary {
    margin-top: 1rem;
    grid-template-columns: repeat(2, 1fr);
  }
}

.qw-previous__calc {
  display: flex;
  align-items: flex-end;
}

.qw-previous__result {
  margin-top: 1rem;
  padding-top: 0.85rem;
  border-top: 1px solid $orange-200;
}

.qw-previous__result-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: $orange-900;

  strong {
    font-size: 1rem;
  }
}

.qw-previous__hint {
  margin: 0.5rem 0 0;
  font-size: 0.75rem;
  color: $orange-900;
  opacity: 0.85;
}

.qw-hint {
  margin: 0.25rem 0 0;
  font-size: 0.75rem;
  color: $slate-500;
}

.qw-hint--warning {
  color: #b45309;
}

.qw-textarea {
  min-height: 8rem;
  resize: vertical;
  line-height: 1.5;
}

.qw-file-input {
  display: block;
  width: 100%;
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.qw-file-list {
  list-style: none;
  margin: 0.75rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.qw-file-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.65rem 0.85rem;
  background: $slate-50;
  border: 1px solid $slate-200;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.qw-warning {
  margin: 1rem 0 0;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  color: #b91c1c;
  font-size: 0.875rem;
}

.qw-compare-hint {
  margin: 0 0 1rem;
  font-size: 0.8125rem;
  color: $slate-500;
}

.qw-tariff-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.qw-tariff-card {
  position: relative;
  text-align: left;
  border: 1px solid $slate-300;
  border-radius: 0.5rem;
  padding: 1rem;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:hover {
    border-color: #60a5fa;
  }

  &--selected {
    border: 2px solid $blue-600;
    background: $blue-50;
    box-shadow: 0 1px 2px rgb(0 0 0 / 6%);

    .qw-tariff-card__name,
    .qw-tariff-card__total {
      color: $blue-900;
    }
  }

  &--compare {
    border: 2px solid $slate-400;
    background: $slate-50;
  }
}

.qw-tariff-card__name {
  margin: 0.5rem 0 0.75rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: $slate-800;
}

.qw-tariff-card__badge {
  position: absolute;
  top: -0.75rem;
  left: 50%;
  transform: translateX(-50%);
  background: $blue-600;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.15rem 0.75rem;
  border-radius: 999px;

  &--compare {
    background: $slate-600;
  }
}

.qw-tariff-card__lines {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: $slate-600;
  padding-bottom: 0.5rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid $slate-200;
}

.qw-tariff-card__total {
  font-size: 1.875rem;
  font-weight: 800;
  color: $slate-800;
  line-height: 1.2;

  span {
    font-size: 0.875rem;
    font-weight: 400;
    color: $slate-500;
  }
}

.qw-tariff-card__savings {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;

  &--positive {
    color: $green-600;
  }

  &--neutral {
    color: $slate-500;
  }
}

.qw-empty {
  text-align: center;
  color: $slate-500;
  padding: 2rem;
}

.qw-footer {
  position: sticky;
  bottom: 1rem;
  z-index: 40;
  background: #fff;
  border: 1px solid $slate-200;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 8%);
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.qw-footer__total {
  font-size: 0.875rem;
  color: $slate-500;

  strong {
    color: $slate-800;
    font-size: 1.125rem;
    margin-left: 0.5rem;
  }
}

.qw-footer__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.qw-chip-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #dcf0a4;
  background: #f7fbe9;
  color: #5a7723;
  font: inherit;
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.2;
  cursor: pointer;
  box-shadow: 0 1px 2px rgb(90 119 35 / 12%);
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: #ecf5cc;
    border-color: #c5e672;
  }
}

.qw-btn {
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 700;
  font-size: 0.9375rem;
  cursor: pointer;
  border: none;
  transition: background 0.15s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &--outline {
    background: #fff;
    border: 1px solid $slate-300;
    color: $slate-700;

    &:hover:not(:disabled) {
      background: $slate-50;
    }
  }

  &--primary {
    background: $loewe-green;
    color: #fff;
    box-shadow: 0 8px 18px rgb(149 193 31 / 30%);

    &:hover:not(:disabled) {
      background: #a6d12a;
      color: #fff;
    }
  }

  &--success {
    background: $loewe-green-dark;
    color: #fff;
    box-shadow: 0 10px 15px -3px rgb(119 156 41 / 25%);

    &:hover:not(:disabled) {
      background: #5a7723;
    }
  }

  &--orange {
    background: #ea580c;
    color: #fff;

    &:hover:not(:disabled) {
      background: #c2410c;
    }
  }

  &--block {
    width: 100%;
  }

  &--sm {
    padding: 0.4rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 600;
  }

  &--xs {
    padding: 0.25rem 0.55rem;
    font-size: 0.7rem;
    font-weight: 600;
    line-height: 1.2;
  }
}

@media (max-width: 768px) {
  .qw-energy,
  .qw-form__grid,
  .qw-config,
  .qw-previous__grid,
  .qw-tariff-grid,
  .qw-meter-edit__cols,
  .qw-meter-card__grid {
    grid-template-columns: 1fr;
  }

  .qw-form__span-2 {
    grid-column: auto;
  }

  .qw-meter-card__rlm {
    max-width: none;
  }

  .qw-config__toggle {
    margin-top: 0;
  }

  .qw-meter-tariff__meta {
    text-align: left;
  }

  .qw-stepper {
    gap: 0.25rem;
  }

  .qw-stepper__label {
    display: none;
  }
}

.qw-vpbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding: 0.85rem 1.25rem;
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgb(15 23 42 / 18%);
}

.qw-vpbar__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.qw-vpbar__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  background: $loewe-green;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgb(0 0 0 / 12%);
}

.qw-vpbar__brand-name {
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #fff;
  white-space: nowrap;
}

.qw-vpbar__brand-light {
  font-weight: 300;
}

.qw-vpbar__vp {
  font-size: 0.875rem;
  font-weight: 500;
  color: #cbd5e1;
  white-space: nowrap;
}

.qw-vpbar__right {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
  flex-shrink: 0;
}

.qw-vpbar__divider {
  width: 1px;
  height: 1.25rem;
  background: #334155;
  flex-shrink: 0;
}

.qw-vpbar__surcharge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #1e293b;
  border: 1px solid #334155;
  color: #fff;
  border-radius: 0.5rem;
  padding: 0.4rem 0.75rem;
  min-height: 2.25rem;
  cursor: pointer;
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 500;
  white-space: nowrap;

  &:hover {
    background: #334155;
  }
}

.qw-vpbar__surcharge-icon {
  width: 1rem;
  height: 1rem;
  color: $loewe-green;
  flex-shrink: 0;
}

.qw-vpbar__surcharge-label {
  color: #fff;
}

.qw-vpbar__surcharge-value {
  color: $loewe-green;
  font-weight: 700;
}

.qw-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgb(15 23 42 / 50%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.qw-modal {
  width: min(24rem, 100%);
  background: #fff;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 20px 50px rgb(0 0 0 / 20%);
}

.qw-modal__head,
.qw-modal__foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: $slate-50;
  border-bottom: 1px solid $slate-200;
}

.qw-modal__foot {
  border-bottom: 0;
  border-top: 1px solid $slate-200;
  justify-content: flex-end;
}

.qw-modal__head h3 {
  margin: 0;
  font-size: 1rem;
}

.qw-modal__body {
  padding: 1.25rem;
}

.qw-surcharge-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.35rem;
}

.qw-stepper {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin: 1.5rem 0 1.75rem;
  padding: 0 0.25rem;
}

.qw-stepper__track,
.qw-stepper__progress {
  position: absolute;
  top: 1.25rem;
  left: 0;
  right: 0;
  height: 4px;
  border-radius: 999px;
  background: $slate-200;
  z-index: 0;
  pointer-events: none;
}

.qw-stepper__progress {
  background: $loewe-green;
  transition: width 0.25s ease;
}

.qw-stepper__item {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  background: none;
  border: 0;
  cursor: pointer;
  padding: 0;
  color: $slate-500;
  font: inherit;
  min-width: 4rem;
}

.qw-stepper__num {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  background: $slate-200;
  color: $slate-500;
  box-shadow: 0 0 0 4px $slate-100;
}

.qw-stepper__label {
  font-size: 0.7rem;
  font-weight: 600;
  text-align: center;
  line-height: 1.2;
  max-width: 5.5rem;
}

.qw-stepper__item--active .qw-stepper__num,
.qw-stepper__item--done .qw-stepper__num {
  background: $loewe-green;
  color: #fff;
}

.qw-stepper__item--active .qw-stepper__label,
.qw-stepper__item--done .qw-stepper__label {
  color: $slate-800;
  font-weight: 700;
}

.qw-step-nav {
  position: relative;
  z-index: 5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.25rem;
  padding: 0 1.25rem 1.25rem;

  .qw-btn {
    position: relative;
    z-index: 6;
  }
}

.qw-section__accent--green {
  background: linear-gradient(180deg, $loewe-green, $loewe-green-dark);
}

.qw-tariff-table-wrap {
  overflow: auto;
  max-height: 22rem;
  border: 1px solid $slate-200;
  border-radius: 0.5rem;
}

.qw-tariff-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  background: #fff;

  th,
  td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid $slate-100;
    vertical-align: middle;
  }

  thead th {
    position: sticky;
    top: 0;
    background: #fff;
    z-index: 1;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: $slate-500;
    box-shadow: 0 1px 0 $slate-200;
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
  }

  &__brand-text {
    min-width: 0;
  }

  &__name {
    font-weight: 700;
    color: $slate-800;
    line-height: 1.25;
  }

  &__meta {
    font-size: 0.75rem;
    color: $slate-500;
  }

  &__unit {
    font-size: 0.7rem;
    color: $slate-500;
    margin-left: 0.2rem;
  }

  &__muted {
    color: $slate-400;
    font-size: 0.75rem;
  }

  &__action {
    text-align: right;
    white-space: nowrap;
  }

  &__row--selected {
    background: $loewe-green-soft;
  }
}

.qw-tariff-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.qw-advantage {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 0.35rem;
  font-weight: 700;
  font-size: 0.8125rem;

  &--pos {
    color: #15803d;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
  }

  &--neg {
    color: #b91c1c;
    background: #fef2f2;
    border: 1px solid #fecaca;
  }
}

.qw-footer--inline {
  position: static;
  margin-top: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: none;
  border: 1px solid $slate-200;
}
</style>
