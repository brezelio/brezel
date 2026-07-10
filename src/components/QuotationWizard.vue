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
      <!-- Step 1: Energy type -->
      <section class="qw-section">
        <div class="qw-section__accent qw-section__accent--blue" />
        <header class="qw-section__head">
          <span class="qw-section__num">1</span>
          <div>
            <h2 class="qw-section__title">{{ $t('widgets.quotation_wizard.sections.energy.title') }}</h2>
            <p class="qw-section__desc">{{ $t('widgets.quotation_wizard.sections.energy.desc') }}</p>
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
      </section>

      <!-- Step 2: Customer -->
      <section class="qw-section">
        <div class="qw-section__accent qw-section__accent--blue" />
        <header class="qw-section__head qw-section__head--split">
          <div class="qw-section__head-left">
            <span class="qw-section__num">2</span>
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

          <div class="qw-form__divider">
            <h3 class="qw-form__subhead">{{ $t('widgets.quotation_wizard.billing_payment') }}</h3>
            <div class="qw-form__grid qw-form__grid--2">
              <div>
                <label class="qw-label">{{ $t('widgets.quotation_wizard.billing_address') }}</label>
                <select
                  v-model="form.billingSameAsContract"
                  class="qw-input"
                >
                  <option :value="true">
                    {{ $t('widgets.quotation_wizard.billing_same') }}
                  </option>
                  <option :value="false">
                    {{ $t('widgets.quotation_wizard.billing_different') }}
                  </option>
                </select>
              </div>
              <div>
                <label class="qw-label">{{ $t('modules.customers.fields.iban') }} *</label>
                <input
                  v-model="form.iban"
                  type="text"
                  class="qw-input qw-input--mono"
                  placeholder="DE00 0000 0000 0000 0000 00"
                >
              </div>
            </div>
            <div
              v-if="!form.billingSameAsContract"
              class="qw-form__grid qw-form__grid--2 qw-address-grid qw-form__row--full"
            >
              <div>
                <label class="qw-label qw-label--sm">{{ $t('modules.addresses.fields.street') }}</label>
                <input
                  v-model="form.billingStreet"
                  type="text"
                  class="qw-input"
                >
              </div>
              <div>
                <label class="qw-label qw-label--sm">{{ $t('modules.addresses.fields.housenumber') }}</label>
                <input
                  v-model="form.billingHousenumber"
                  type="text"
                  class="qw-input"
                >
              </div>
              <div>
                <label class="qw-label qw-label--sm">{{ $t('modules.addresses.fields.zip') }}</label>
                <input
                  v-model="form.billingZip"
                  type="text"
                  class="qw-input"
                >
              </div>
              <div>
                <label class="qw-label qw-label--sm">{{ $t('modules.addresses.fields.city') }}</label>
                <input
                  v-model="form.billingCity"
                  type="text"
                  class="qw-input"
                >
              </div>
            </div>
          </div>

          <div class="qw-form__divider">
            <h3 class="qw-form__subhead">{{ $t('widgets.quotation_wizard.shipping_address') }}</h3>
            <div class="qw-form__grid qw-form__grid--2">
              <div>
                <label class="qw-label">{{ $t('widgets.quotation_wizard.shipping_address') }}</label>
                <select
                  v-model="form.shippingSameAsContract"
                  class="qw-input"
                >
                  <option :value="true">
                    {{ $t('widgets.quotation_wizard.shipping_same') }}
                  </option>
                  <option :value="false">
                    {{ $t('widgets.quotation_wizard.shipping_different') }}
                  </option>
                </select>
              </div>
            </div>
            <div
              v-if="!form.shippingSameAsContract"
              class="qw-form__grid qw-form__grid--2 qw-address-grid qw-form__row--full"
            >
              <div>
                <label class="qw-label qw-label--sm">{{ $t('modules.addresses.fields.street') }}</label>
                <input
                  v-model="form.shippingStreet"
                  type="text"
                  class="qw-input"
                >
              </div>
              <div>
                <label class="qw-label qw-label--sm">{{ $t('modules.addresses.fields.housenumber') }}</label>
                <input
                  v-model="form.shippingHousenumber"
                  type="text"
                  class="qw-input"
                >
              </div>
              <div>
                <label class="qw-label qw-label--sm">{{ $t('modules.addresses.fields.zip') }}</label>
                <input
                  v-model="form.shippingZip"
                  type="text"
                  class="qw-input"
                >
              </div>
              <div>
                <label class="qw-label qw-label--sm">{{ $t('modules.addresses.fields.city') }}</label>
                <input
                  v-model="form.shippingCity"
                  type="text"
                  class="qw-input"
                >
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Step 3: Locations & meters -->
      <section class="qw-section qw-section--locations">
        <div class="qw-section__accent qw-section__accent--blue" />
        <header class="qw-section__head qw-section__head--split">
          <div class="qw-section__head-left">
            <span class="qw-section__num">3</span>
            <div>
              <h2 class="qw-section__title">{{ $t('widgets.quotation_wizard.sections.locations.title') }}</h2>
              <p class="qw-section__desc">{{ $t('widgets.quotation_wizard.sections.locations.desc') }}</p>
            </div>
          </div>
          <div class="qw-meter-limit">
            <span class="qw-meter-limit__label">{{ $t('widgets.quotation_wizard.meter_limit') }}:</span>
            <div class="qw-meter-limit__bars">
              <span
                v-for="n in 5"
                :key="n"
                class="qw-meter-limit__bar"
                :class="{ 'qw-meter-limit__bar--on': n <= meterCount }"
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
                <span class="qw-location__title-text">
                  {{ $t('widgets.quotation_wizard.location') }} {{ locIndex + 1 }}<template v-if="locationDisplayName(location)">: {{ locationDisplayName(location) }}</template>
                </span>
                <span
                  v-if="locationAddressSummary(location)"
                  class="qw-location__addr"
                >| {{ locationAddressSummary(location) }}</span>
              </div>
              <button
                type="button"
                class="qw-icon-btn qw-icon-btn--edit"
                :title="$t('widgets.quotation_wizard.edit')"
                @click="toggleLocationEdit(location)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
            </div>

            <div
              v-if="location.editing"
              class="qw-location__edit"
            >
              <div>
                <label class="qw-label qw-label--sm">{{ $t('widgets.quotation_wizard.location_name') }}</label>
                <input
                  v-model="location.label"
                  type="text"
                  class="qw-input qw-input--sm"
                  :placeholder="$t('widgets.quotation_wizard.placeholders.location_name')"
                >
              </div>
              <div>
                <label class="qw-label qw-label--sm">{{ $t('widgets.quotation_wizard.different_delivery_address') }}</label>
                <select
                  v-model="location.deliveryAddressMode"
                  class="qw-input qw-input--sm qw-location__billing-select"
                >
                  <option value="contract">
                    {{ customerContractSummary() }}
                  </option>
                  <option
                    v-if="!form.shippingSameAsContract"
                    value="shipping"
                  >
                    {{ customerShippingSummary() }}
                  </option>
                  <option value="new">
                    {{ $t('widgets.quotation_wizard.shipping_new') }}
                  </option>
                </select>
                <div
                  v-if="location.deliveryAddressMode === 'new'"
                  class="qw-form__grid qw-form__grid--2 qw-address-grid qw-location__delivery-address"
                >
                  <div>
                    <label class="qw-label qw-label--sm">{{ $t('modules.addresses.fields.street') }}</label>
                    <input
                      v-model="location.street"
                      type="text"
                      class="qw-input qw-input--sm"
                      :placeholder="$t('widgets.quotation_wizard.placeholders.street')"
                    >
                  </div>
                  <div>
                    <label class="qw-label qw-label--sm">{{ $t('modules.addresses.fields.housenumber') }}</label>
                    <input
                      v-model="location.housenumber"
                      type="text"
                      class="qw-input qw-input--sm"
                    >
                  </div>
                  <div>
                    <label class="qw-label qw-label--sm">{{ $t('modules.addresses.fields.zip') }}</label>
                    <input
                      v-model="location.zip"
                      type="text"
                      class="qw-input qw-input--sm"
                    >
                  </div>
                  <div>
                    <label class="qw-label qw-label--sm">{{ $t('modules.addresses.fields.city') }}</label>
                    <input
                      v-model="location.city"
                      type="text"
                      class="qw-input qw-input--sm"
                    >
                  </div>
                </div>
              </div>
              <div
                v-if="form.locations.length > 1"
                class="qw-location__edit-actions"
              >
                <button
                  type="button"
                  class="qw-text-btn qw-text-btn--danger"
                  @click="removeLocation(locIndex)"
                >
                  {{ $t('widgets.quotation_wizard.remove_location') }}
                </button>
              </div>
            </div>

            <div
              class="qw-location__billing"
              :class="{ 'qw-location__billing--open': location.customBilling }"
            >
              <div class="qw-location__billing-head">
                <span>{{ $t('widgets.quotation_wizard.custom_billing') }}</span>
                <label class="qw-toggle">
                  <input
                    v-model="location.customBilling"
                    type="checkbox"
                  >
                  <span class="qw-toggle__track" />
                </label>
              </div>
              <div
                v-if="location.customBilling"
                class="qw-location__billing-fields"
              >
                <div class="qw-form__grid qw-form__grid--2 qw-location__billing-row">
                  <div>
                    <label class="qw-label qw-label--sm">{{ $t('widgets.quotation_wizard.different_billing_address') }}</label>
                    <select
                      v-model="location.billingAddressMode"
                      class="qw-input qw-input--sm qw-location__billing-select"
                    >
                      <option value="new">
                        {{ $t('widgets.quotation_wizard.billing_new') }}
                      </option>
                      <option value="default">
                        {{ customerBillingSummary() }}
                      </option>
                    </select>
                    <div
                      v-if="location.billingAddressMode === 'new'"
                      class="qw-form__grid qw-form__grid--2 qw-address-grid qw-location__billing-address"
                    >
                      <div>
                        <label class="qw-label qw-label--sm">{{ $t('modules.addresses.fields.street') }}</label>
                        <input
                          v-model="location.billingStreet"
                          type="text"
                          class="qw-input qw-input--sm"
                        >
                      </div>
                      <div>
                        <label class="qw-label qw-label--sm">{{ $t('modules.addresses.fields.housenumber') }}</label>
                        <input
                          v-model="location.billingHousenumber"
                          type="text"
                          class="qw-input qw-input--sm"
                        >
                      </div>
                      <div>
                        <label class="qw-label qw-label--sm">{{ $t('modules.addresses.fields.zip') }}</label>
                        <input
                          v-model="location.billingZip"
                          type="text"
                          class="qw-input qw-input--sm"
                        >
                      </div>
                      <div>
                        <label class="qw-label qw-label--sm">{{ $t('modules.addresses.fields.city') }}</label>
                        <input
                          v-model="location.billingCity"
                          type="text"
                          class="qw-input qw-input--sm"
                        >
                      </div>
                    </div>
                  </div>
                  <div>
                    <label class="qw-label qw-label--sm">{{ $t('widgets.quotation_wizard.different_iban') }}</label>
                    <input
                      v-model="location.iban"
                      type="text"
                      class="qw-input qw-input--sm qw-input--mono"
                      placeholder="DE00 0000 0000 0000 0000 00"
                    >
                  </div>
                </div>
              </div>
            </div>

            <div class="qw-table-wrap">
              <table class="qw-table">
                <colgroup>
                  <col>
                  <col>
                  <col class="qw-table__malo-col">
                  <col class="qw-table__date-col">
                  <col>
                  <col class="qw-table__action-col">
                </colgroup>
                <thead>
                  <tr>
                    <th>{{ $t('widgets.quotation_wizard.table.medium_type') }}</th>
                    <th>{{ $t('modules.meters.fields.meter_number') }}</th>
                    <th>{{ $t('modules.meters.fields.malo') }}</th>
                    <th>{{ $t('widgets.quotation_wizard.fields.start_date') }}</th>
                    <th>{{ $t('widgets.quotation_wizard.table.usage_year') }}</th>
                    <th class="qw-table__action-head">{{ $t('widgets.quotation_wizard.table.action') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <template
                    v-for="(meter, meterIndex) in location.meters"
                    :key="meter.uid"
                  >
                    <tr>
                      <td>
                        <div class="qw-table__medium">
                          <span
                            class="qw-dot"
                            :class="form.medium === 'electricity' ? 'qw-dot--electricity' : 'qw-dot--gas'"
                          />
                          {{ mediumLabel }} ({{ meter.meter_type.toUpperCase() }})
                        </div>
                      </td>
                      <td>{{ meter.meter_number || '—' }}</td>
                      <td class="qw-table__malo">{{ meter.malo || '—' }}</td>
                      <td class="qw-table__date">{{ meter.start_date ? formatDate(meter.start_date) : '—' }}</td>
                      <td class="qw-table__usage">
                        {{ meter.usage ? `${formatNumber(meter.usage)} kWh` : '—' }}
                      </td>
                      <td
                        class="qw-table__action"
                        :rowspan="meter.editing ? 2 : 1"
                      >
                        <button
                          v-if="!meter.editing"
                          type="button"
                          class="qw-text-btn"
                          @click="toggleMeterEdit(location, meter)"
                        >
                          {{ $t('widgets.quotation_wizard.edit') }}
                        </button>
                        <button
                          v-else
                          type="button"
                          class="qw-text-btn"
                          @click="toggleMeterEdit(location, meter)"
                        >
                          {{ $t('widgets.quotation_wizard.done') }}
                        </button>
                        <button
                          v-if="!meter.editing && (location.meters.length > 1 || form.locations.length > 1)"
                          type="button"
                          class="qw-text-btn qw-text-btn--danger qw-table__action-remove"
                          @click="removeMeter(locIndex, meterIndex)"
                        >
                          {{ $t('widgets.quotation_wizard.remove') }}
                        </button>
                      </td>
                    </tr>
                    <tr
                      v-if="meter.editing"
                      class="qw-table__expand"
                    >
                      <td
                        colspan="5"
                        class="qw-meter-edit__fields"
                      >
                        <div class="qw-meter-edit">
                          <div class="qw-meter-edit__cols">
                            <div class="qw-meter-edit__col">
                              <div class="qw-meter-edit__field">
                                <label class="qw-label qw-label--sm">{{ $t('modules.meters.fields.meter_type') }} *</label>
                                <select
                                  v-model="meter.meter_type"
                                  class="qw-input qw-input--sm"
                                  @change="onMeterTypeChange(meter)"
                                >
                                  <option value="slp">SLP</option>
                                  <option value="rlm">RLM</option>
                                </select>
                              </div>
                              <div class="qw-meter-edit__field">
                                <label class="qw-label qw-label--sm">{{ $t('modules.meters.fields.meter_number') }}</label>
                                <input
                                  v-model="meter.meter_number"
                                  type="text"
                                  class="qw-input qw-input--sm"
                                >
                              </div>
                              <div class="qw-meter-edit__field">
                                <label class="qw-label qw-label--sm">{{ $t('modules.meters.fields.malo') }}</label>
                                <input
                                  v-model="meter.malo"
                                  type="text"
                                  maxlength="11"
                                  class="qw-input qw-input--sm qw-input--mono"
                                >
                                <p
                                  v-if="!meter.malo?.trim()"
                                  class="qw-hint qw-hint--warning"
                                >
                                  {{ $t('widgets.quotation_wizard.malo_missing_warning') }}
                                </p>
                                <p
                                  v-else
                                  class="qw-hint"
                                >
                                  {{ $t('widgets.quotation_wizard.malo_hint') }}
                                </p>
                              </div>
                            </div>
                            <div class="qw-meter-edit__col">
                              <div class="qw-meter-edit__field">
                                <label class="qw-label qw-label--sm">{{ $t('widgets.quotation_wizard.fields.start_date') }} *</label>
                                <input
                                  v-model="meter.start_date"
                                  type="date"
                                  class="qw-input qw-input--sm"
                                >
                              </div>
                              <div class="qw-meter-edit__field">
                                <label class="qw-label qw-label--sm">{{ $t('widgets.quotation_wizard.table.usage_year') }} *</label>
                                <input
                                  v-model.number="meter.usage"
                                  type="number"
                                  min="1"
                                  class="qw-input qw-input--sm"
                                >
                              </div>
                              <template v-if="meter.meter_type === 'rlm'">
                                <div class="qw-meter-edit__field">
                                  <label class="qw-label qw-label--sm">{{ $t('modules.meters.fields.peak_power') }} *</label>
                                  <input
                                    v-model.number="meter.peak_power"
                                    type="number"
                                    class="qw-input qw-input--sm"
                                  >
                                </div>
                                <div class="qw-meter-edit__field">
                                  <label class="qw-label qw-label--sm">{{ $t('modules.meters.fields.annual_peak_power') }} *</label>
                                  <input
                                    v-model.number="meter.annual_peak_power"
                                    type="number"
                                    class="qw-input qw-input--sm"
                                  >
                                </div>
                              </template>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
              <div
                v-if="meterCount < 5"
                class="qw-table__footer"
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
            v-if="form.locations.length < MAX_LOCATIONS && meterCount < MAX_METERS"
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
      </section>

      <!-- Step 4: Tariff per meter -->
      <div class="qw-tariff-head">
        <span class="qw-section__num">4</span>
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
        <div class="qw-section__accent qw-section__accent--yellow" />
        <header class="qw-meter-tariff__head">
          <div>
            <div class="qw-meter-tariff__loc">
              {{ $t('widgets.quotation_wizard.location') }} {{ entry.locIndex + 1 }}: {{ entry.locationLabel }}
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
          <div
            class="qw-previous"
            :class="{
              'qw-previous--collapsed': !entry.meter.showPreviousSupplier,
              'qw-previous--expanded': entry.meter.showPreviousSupplier,
            }"
          >
            <div class="qw-previous__head">
              <h3>{{ $t('widgets.quotation_wizard.previous_supplier') }}</h3>
              <button
                v-if="!entry.meter.showPreviousSupplier"
                type="button"
                class="qw-text-btn qw-text-btn--outline"
                @click="entry.meter.showPreviousSupplier = true"
              >
                {{ $t('widgets.quotation_wizard.expand_capture') }}
              </button>
            </div>
            <div
              v-if="entry.meter.showPreviousSupplier"
              class="qw-previous__body"
            >
              <div class="qw-previous__grid qw-previous__grid--calc">
                <div>
                  <label class="qw-label qw-label--sm">{{ $t('modules.locations.fields.current_provider') }}</label>
                  <input
                    v-model="entry.meter.current_provider"
                    type="text"
                    class="qw-input qw-input--sm"
                    @input="onPreviousSupplierChange(entry.meter)"
                  >
                </div>
                <div>
                  <label class="qw-label qw-label--sm">{{ $t('modules.locations.fields.current_baseprice') }}</label>
                  <input
                    v-model.number="entry.meter.current_baseprice"
                    type="number"
                    step="0.01"
                    class="qw-input qw-input--sm"
                    @input="onPreviousSupplierChange(entry.meter)"
                  >
                </div>
                <div>
                  <label class="qw-label qw-label--sm">{{ $t('modules.locations.fields.current_price_per_kwh') }}</label>
                  <input
                    v-model.number="entry.meter.current_price_per_kwh"
                    type="number"
                    step="0.01"
                    class="qw-input qw-input--sm"
                    @input="onPreviousSupplierChange(entry.meter)"
                  >
                </div>
                <div class="qw-previous__calc">
                  <button
                    type="button"
                    class="qw-btn qw-btn--orange qw-btn--sm qw-btn--block"
                    @click="calculatePreviousTariff(entry.meter)"
                  >
                    {{ $t('widgets.quotation_wizard.calculate_tariffs') }}
                  </button>
                </div>
              </div>
              <div class="qw-previous__grid qw-previous__grid--secondary">
                <div>
                  <label class="qw-label qw-label--sm">{{ $t('modules.locations.fields.current_customer_no') }}</label>
                  <input
                    v-model="entry.meter.current_customer_no"
                    type="text"
                    class="qw-input qw-input--sm"
                    @input="onPreviousSupplierChange(entry.meter)"
                  >
                </div>
              </div>
              <div
                v-if="entry.meter.previousSupplierCalculated"
                class="qw-previous__result"
              >
                <div class="qw-previous__result-row">
                  <span>{{ $t('widgets.quotation_wizard.previous_yearly_cost') }}</span>
                  <strong>{{ formatCurrency(previousYearlyCost(entry.meter)) }}</strong>
                </div>
                <p
                  v-if="!entry.meter.usage"
                  class="qw-previous__hint"
                >
                  {{ $t('widgets.quotation_wizard.usage_required_for_comparison') }}
                </p>
              </div>
            </div>
          </div>

          <p class="qw-compare-hint">{{ $t('widgets.quotation_wizard.compare_hint') }}</p>

          <a-spin :spinning="loadingTariffs">
            <div
              v-if="tariffsForMeter(entry.meter).length === 0 && !loadingTariffs"
              class="qw-empty"
            >
              {{ $t('widgets.quotation_wizard.no_tariffs') }}
            </div>
            <div
              v-else
              class="qw-tariff-grid"
            >
              <button
                v-for="tariff in tariffsForMeter(entry.meter)"
                :key="tariff.id"
                type="button"
                class="qw-tariff-card"
                :class="{
                  'qw-tariff-card--selected': entry.meter.tariffId === tariff.id,
                  'qw-tariff-card--compare': entry.meter.compareTariffId === tariff.id,
                }"
                @click="selectTariff(entry.meter, tariff.id)"
              >
                <span
                  v-if="entry.meter.tariffId === tariff.id"
                  class="qw-tariff-card__badge"
                >{{ $t('widgets.quotation_wizard.selected') }}</span>
                <span
                  v-else-if="entry.meter.compareTariffId === tariff.id"
                  class="qw-tariff-card__badge qw-tariff-card__badge--compare"
                >{{ $t('widgets.quotation_wizard.compare_tariff') }}</span>
                <h4 class="qw-tariff-card__name">{{ tariff.name }}</h4>
                <div class="qw-tariff-card__lines">
                  <div>{{ $t('widgets.quotation_wizard.energy_rate') }}: {{ formatPrice(tariff.energy_price) }} ct/kWh</div>
                  <div>{{ $t('widgets.quotation_wizard.base_fee') }}: €{{ formatPrice(tariff.site_fixed_fee) }}/{{ $t('widgets.quotation_wizard.month') }}</div>
                </div>
                <div class="qw-tariff-card__total">
                  {{ formatCurrency(estimateYearlyCost(tariff, entry.meter)) }}
                  <span>/{{ $t('widgets.quotation_wizard.year') }}</span>
                </div>
                <div
                  v-if="entry.meter.previousSupplierCalculated"
                  class="qw-tariff-card__savings"
                  :class="{
                    'qw-tariff-card__savings--positive': savingsFor(entry.meter, tariff) > 0,
                    'qw-tariff-card__savings--neutral': savingsFor(entry.meter, tariff) <= 0,
                  }"
                >
                  <template v-if="savingsFor(entry.meter, tariff) > 0">
                    {{ $t('widgets.quotation_wizard.savings') }}: {{ formatCurrency(savingsFor(entry.meter, tariff)) }}
                    <span v-if="savingsPercentFor(entry.meter, tariff) > 0">
                      ({{ savingsPercentFor(entry.meter, tariff) }} %)
                    </span>
                  </template>
                  <template v-else>
                    {{ $t('widgets.quotation_wizard.no_savings') }}
                  </template>
                </div>
              </button>
            </div>
          </a-spin>
        </div>
      </section>

      <!-- Sticky footer -->
      <footer class="qw-footer">
        <div class="qw-footer__total">
          {{ $t('widgets.quotation_wizard.offer_total') }}:
          <strong>{{ formatCurrency(totalYearlyCost) }} / {{ $t('widgets.quotation_wizard.year') }}</strong>
        </div>
        <div class="qw-footer__actions">
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
            <span v-else>{{ $t('widgets.quotation_wizard.finish_offer') }}</span>
          </button>
        </div>
      </footer>
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
          {{ customer.brezel_name || customer.company || `#${customer.id}` }}
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
const MAX_LOCATIONS = 5
const OFFER_VALID_DAYS = 14

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
    current_provider: '',
    current_customer_no: '',
    current_price_per_kwh: null,
    current_baseprice: null,
    showPreviousSupplier: false,
    previousSupplierCalculated: false,
    tariffId: null,
    compareTariffId: null,
    editing: false,
    ...overrides,
  }
}

function createLocation(label = '', overrides = {}) {
  return {
    uid: uid(),
    dbId: null,
    label,
    editing: false,
    deliveryAddressMode: 'contract',
    street: '',
    housenumber: '',
    zip: '',
    city: '',
    customBilling: false,
    billingAddressMode: 'new',
    billingStreet: '',
    billingHousenumber: '',
    billingZip: '',
    billingCity: '',
    iban: '',
    addressDbId: null,
    billingAddressDbId: null,
    meters: [createMeter()],
    ...overrides,
  }
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
const customFileInput = ref(null)
const customInquiry = reactive({
  notes: '',
  files: [],
})

const form = reactive({
  medium: 'electricity',
  type: 'b2b',
  company: '',
  firstname: '',
  name: '',
  email: '',
  phone: '',
  street: '',
  housenumber: '',
  zip: '',
  city: '',
  iban: '',
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
        locationLabel: location.label || t('widgets.quotation_wizard.unnamed_location'),
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
  if (route.query.custom === '1' || route.query.mode === 'custom') {
    mode.value = 'custom'
  }
  await maybeLoadOfferFromRoute()
})

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
  if (!form.street?.trim() || !form.housenumber?.trim() || !form.zip?.trim() || !form.city?.trim()) {
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
    const contractFields = contractAddressFields()
    const contractAddress = await upsertAddress(
      customer.id,
      contractFields.street,
      contractFields.housenumber,
      contractFields.zip,
      contractFields.city,
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
  if (meter.tariffId === tariffId) {
    meter.tariffId = meter.compareTariffId
    meter.compareTariffId = null
    return
  }
  if (meter.compareTariffId === tariffId) {
    meter.compareTariffId = null
    return
  }
  if (!meter.tariffId) {
    meter.tariffId = tariffId
    return
  }
  if (!meter.compareTariffId) {
    meter.compareTariffId = tariffId
    return
  }
  meter.compareTariffId = tariffId
}

function tariffsForMeter(meter) {
  return tariffs.value.filter(item => item.type === form.medium && item.meter_type === meter.meter_type)
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
    zip: form.shippingZip,
    city: form.shippingCity,
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
    current_provider: previous.current_provider,
    current_customer_no: previous.current_customer_no,
    current_price_per_kwh: previous.current_price_per_kwh,
    current_baseprice: previous.current_baseprice,
    showPreviousSupplier: !!(previous.current_provider || hasPreviousTariffPrices(previous)),
    previousSupplierCalculated: hasPreviousTariffPrices(previous),
    tariffId: positionEntity?.tariff_catalog?.id || null,
    compareTariffId: positionEntity?.compare_tariff_catalog?.id || null,
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

    const customer = await Api.fetchEntity(offer.customer.id, customersModule)
    existingCustomerId.value = customer.id
    form.type = customer.type || 'b2b'
    form.company = customer.company || ''
    form.firstname = customer.firstname || ''
    form.name = customer.name || ''
    form.email = customer.email || ''
    form.phone = customer.phone || ''
    form.iban = customer.iban || customer.default_iban || ''

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

        let customBilling = false
        let billingAddressMode = 'new'
        if (locationBillingAddress && billingAddressId.value) {
          const defaultBilling = await Api.fetchEntity(billingAddressId.value, addressesModule)
          customBilling = !addressFieldsMatch(locationBillingAddress, defaultBilling)
          billingAddressMode = customBilling ? 'new' : 'default'
        } else if (locationBillingAddress) {
          customBilling = true
        }

        locationForm = createLocation(locationEntity.label || '', {
          dbId: locationEntity.id,
          addressDbId: locationEntity.address?.id || null,
          billingAddressDbId: locationEntity.billing_address?.id || null,
          deliveryAddressMode,
          street: locationAddress?.street || '',
          housenumber: locationAddress?.housenumber || '',
          zip: locationAddress?.zip || '',
          city: locationAddress?.city || '',
          customBilling,
          billingAddressMode,
          billingStreet: locationBillingAddress?.street || '',
          billingHousenumber: locationBillingAddress?.housenumber || '',
          billingZip: locationBillingAddress?.zip || '',
          billingCity: locationBillingAddress?.city || '',
          iban: locationEntity.iban || '',
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

function toggleMeterEdit(location, meter) {
  const willOpen = !meter.editing
  if (willOpen) {
    location.meters.forEach((item) => {
      if (item.uid !== meter.uid) {
        item.editing = false
      }
    })
  }
  meter.editing = willOpen
}

function addLocation() {
  if (form.locations.length >= MAX_LOCATIONS || meterCount.value >= MAX_METERS) {
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
  const grid = (tariff.grid_usage_fee ?? 0) + (tariff.grid_fixed_fee ?? 0)
    + (tariff.concession_fee ?? 0) + (tariff.metering_fee ?? 0)
  const levies = (tariff.kwkg_levy ?? 0) + (tariff.special_grid_levy ?? 0)
    + (tariff.offshore_levy ?? 0) + (tariff.electricity_tax ?? 0)
  const usagePrice = (tariff.grid_usage_fee ?? 0) + (tariff.concession_fee ?? 0)
    + levies + (tariff.energy_price ?? 0)
  const supplier = (tariff.site_fixed_fee ?? 0) + (usage * usagePrice / 100)
  return grid + levies + supplier
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
  meter.previousSupplierCalculated = false
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
  form.firstname = customer.firstname || ''
  form.name = customer.name || ''
  form.email = customer.email || ''
  form.phone = customer.phone || ''
  form.iban = customer.iban || customer.default_iban || ''
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
  if (!form.firstname?.trim() || !form.name?.trim()) {
    showMessage('error', { content: t('widgets.quotation_wizard.validation.contact') })
    return false
  }
  if (!form.street?.trim() || !form.housenumber?.trim() || !form.zip?.trim() || !form.city?.trim()) {
    showMessage('error', { content: t('widgets.quotation_wizard.validation.address') })
    return false
  }
  if (!form.billingSameAsContract) {
    if (!form.billingStreet?.trim() || !form.billingZip?.trim() || !form.billingCity?.trim()) {
      showMessage('error', { content: t('widgets.quotation_wizard.validation.billing_address') })
      return false
    }
  }
  if (!form.shippingSameAsContract) {
    if (!form.shippingStreet?.trim() || !form.shippingZip?.trim() || !form.shippingCity?.trim()) {
      showMessage('error', { content: t('widgets.quotation_wizard.validation.shipping_address') })
      return false
    }
  }
  if (mode === 'finish') {
    if (!form.email?.trim()) {
      showMessage('error', { content: t('widgets.quotation_wizard.validation.email') })
      return false
    }
    if (!form.phone?.trim()) {
      showMessage('error', { content: t('widgets.quotation_wizard.validation.phone') })
      return false
    }
    if (!form.iban?.trim()) {
      showMessage('error', { content: t('widgets.quotation_wizard.validation.iban') })
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
    if (location.customBilling && location.billingAddressMode === 'new') {
      if (!location.billingStreet?.trim() || !location.billingZip?.trim() || !location.billingCity?.trim()) {
        showMessage('error', { content: t('widgets.quotation_wizard.validation.location_billing_address') })
        return false
      }
    }
    for (const meter of location.meters) {
      if (meter.malo && meter.malo.length !== 11) {
        showMessage('error', { content: t('widgets.quotation_wizard.validation.malo') })
        return false
      }
      if (mode === 'finish') {
        if (!meter.meter_number?.trim()) {
          showMessage('error', { content: t('widgets.quotation_wizard.validation.meter_number') })
          return false
        }
        if (!meter.current_provider?.trim()) {
          showMessage('error', { content: t('widgets.quotation_wizard.validation.previous_supplier') })
          return false
        }
        if (!hasPreviousTariffPrices(meter)) {
          showMessage('error', { content: t('widgets.quotation_wizard.validation.previous_tariff') })
          return false
        }
        if (!meter.usage || meter.usage <= 0) {
          showMessage('error', { content: t('widgets.quotation_wizard.validation.usage') })
          return false
        }
        if (!meter.start_date) {
          showMessage('error', { content: t('widgets.quotation_wizard.validation.start_date') })
          return false
        }
        if (meter.meter_type === 'rlm' && (!meter.peak_power || !meter.annual_peak_power)) {
          showMessage('error', { content: t('widgets.quotation_wizard.validation.peak_power') })
          return false
        }
        if (!meter.tariffId) {
          showMessage('error', { content: t('widgets.quotation_wizard.validation.tariff') })
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

async function resolveCustomer() {
  const partner = currentPartnerRelation()
  if (existingCustomerId.value) {
    const customer = customersModule.makeEntity({
      id: existingCustomerId.value,
      type: form.type,
      company: form.company || null,
      firstname: form.firstname || null,
      name: form.name || null,
      email: form.email || null,
      phone: form.phone || null,
      iban: form.iban || null,
      partner,
    })
    await Api.updateEntity(customer)
    return customer
  }
  const customer = customersModule.makeEntity({
    type: form.type,
    company: form.company || null,
    firstname: form.firstname || null,
    name: form.name || null,
    email: form.email || null,
    phone: form.phone || null,
    iban: form.iban || null,
    partner,
  })
  const response = await Api.createEntity(customer)
  return customersModule.makeEntity(response.resource)
}

async function upsertAddress(customerId, street, housenumber, zip, city, existingId = null) {
  const payload = {
    customer: relation(customerId, 'customers'),
    street,
    housenumber,
    zip,
    city,
    country: 'DE',
  }
  if (existingId) {
    const address = addressesModule.makeEntity({ id: existingId, ...payload })
    const response = await Api.updateEntity(address)
    return addressesModule.makeEntity(response.resource)
  }
  return createAddress(customerId, street, housenumber, zip, city)
}

async function createAddress(customerId, street, housenumber, zip, city) {
  const address = addressesModule.makeEntity({
    customer: relation(customerId, 'customers'),
    street,
    housenumber,
    zip,
    city,
    country: 'DE',
  })
  const response = await Api.createEntity(address)
  return addressesModule.makeEntity(response.resource)
}

async function createQuotation(mode = 'finish') {
  if (!validate(mode)) {
    return
  }
  if (mode === 'finish') {
    const missingMalo = form.locations.some(location => location.meters.some(meter => !meter.malo?.trim()))
    if (missingMalo) {
      showMessage('warning', { content: t('widgets.quotation_wizard.malo_missing_warning') })
    }
  }
  submitting.value = true
  try {
    const customer = await resolveCustomer()
    const partner = currentPartnerRelation()
    const contractFields = contractAddressFields()
    const billingFields = billingAddressFields()
    const shippingFields = shippingAddressFields()

    const contractAddress = await upsertAddress(
      customer.id,
      contractFields.street,
      contractFields.housenumber,
      contractFields.zip,
      contractFields.city,
      contractAddressId.value,
    )
    contractAddressId.value = contractAddress.id

    const billingAddress = form.billingSameAsContract
      ? contractAddress
      : await upsertAddress(
        customer.id,
        billingFields.street,
        billingFields.housenumber,
        billingFields.zip,
        billingFields.city,
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
        shippingFields.street,
        shippingFields.housenumber,
        shippingFields.zip,
        shippingFields.city,
        shippingAddressId.value,
      )
    if (!form.shippingSameAsContract) {
      shippingAddressId.value = shippingAddress.id
    } else {
      shippingAddressId.value = contractAddress.id
    }

    customer.default_address = relation(contractAddress.id, 'addresses')
    customer.default_billing_address = relation(billingAddress.id, 'addresses')
    customer.default_shipping_address = relation(shippingAddress.id, 'addresses')
    if (form.iban) {
      customer.default_iban = form.iban
      customer.iban = form.iban
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
      })
      if (mode === 'finish') {
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
        created_at: today,
        valid_till: mode === 'finish' ? formatDateISO(addDays(new Date(), OFFER_VALID_DAYS)) : null,
      })
      const offerResponse = await Api.createEntity(offer)
      savedOffer = offersModule.makeEntity(offerResponse.resource)
    }

    const keptPositionIds = []

    for (const location of form.locations) {
      const address = await resolveLocationAddress(customer.id, contractAddress, shippingAddress, location)

      let billingForLocation = billingAddress
      if (location.customBilling) {
        if (location.billingAddressMode === 'new') {
          billingForLocation = await upsertAddress(
            customer.id,
            location.billingStreet,
            location.billingHousenumber || '',
            location.billingZip,
            location.billingCity,
            location.billingAddressDbId || null,
          )
          location.billingAddressDbId = billingForLocation.id
        }
      }

      const locationPayload = {
        customer: relation(customer.id, 'customers'),
        partner,
        label: location.label?.trim() || null,
        address: relation(address.id, 'addresses'),
        billing_address: relation(billingForLocation.id, 'addresses'),
        iban: location.customBilling && location.iban ? location.iban : form.iban,
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

    if (mode === 'finish') {
      await BrezelActionFactory.create('CalculateOffer', offerEntity, {}, {}).fire(offerEntity)
      const offerForExport = await Api.fetchEntity(savedOffer.id, offersModule)
      await BrezelActionFactory.create('ExportOfferPdf', offerForExport, {}, {}).fire(offerForExport)
      showMessage('success', { content: t('widgets.quotation_wizard.success_finish') })
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
    location.street,
    location.housenumber || '',
    location.zip,
    location.city,
    location.addressDbId || null,
  )
}

function saveDraft() {
  createQuotation('draft')
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
$blue-50: #eff6ff;
$blue-100: #dbeafe;
$blue-200: #bfdbfe;
$blue-600: #2563eb;
$blue-900: #1e3a8a;
$orange-50: #fff7ed;
$orange-200: #fed7aa;
$orange-300: #fdba74;
$orange-600: #ea580c;
$orange-900: #7c2d12;
$yellow-400: #facc15;
$green-600: #16a34a;
$green-700: #15803d;

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
  overflow: hidden;
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
  align-items: center;
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
  align-items: center;
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
  box-shadow: 0 1px 2px rgb(0 0 0 / 10%);
}

.qw-section__title {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
}

.qw-section__desc {
  font-size: 0.875rem;
  color: $slate-500;
  margin: 0.15rem 0 0;
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

.qw-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: $slate-700;
  margin-bottom: 0.35rem;

  &--sm {
    font-size: 0.75rem;
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
    flex-direction: row;
    align-items: center;
  }

  &__street {
    flex: 1 1 auto;
  }

  &__house {
    @media (min-width: 768px) {
      width: 5rem;
      flex: 0 0 5rem;
    }
  }

  &__zip {
    @media (min-width: 768px) {
      width: 6rem;
      flex: 0 0 6rem;
    }
  }

  &__city {
    flex: 1 1 auto;
  }

  &--sm {
    margin-top: 0.5rem;
  }
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
}

.qw-location__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  flex-wrap: wrap;
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
    margin-bottom: 0.75rem;
  }
}

.qw-location__billing-fields {
  margin-top: 0.75rem;
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
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.qw-tariff-head__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
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

  &--success {
    background: $green-600;
    color: #fff;
    box-shadow: 0 10px 15px -3px rgb(22 163 74 / 25%);

    &:hover:not(:disabled) {
      background: $green-700;
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
}

@media (max-width: 768px) {
  .qw-energy,
  .qw-form__grid,
  .qw-previous__grid,
  .qw-tariff-grid,
  .qw-meter-edit__cols {
    grid-template-columns: 1fr;
  }

  .qw-meter-tariff__meta {
    text-align: left;
  }
}
</style>
