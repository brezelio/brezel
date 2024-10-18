{% verbatim %}
<template>
   <div class="main-div">
      <div class="header">
         <div class="header-left">
            <div style="font-size: 8pt;">
               BWA Sauerland GmbH Peter-Dassis-Ring 40a 57482 Wenden<br>
               02762-98 19 499 info@bwa-sauerland.de
            </div>
         </div>
         <div class="header-right">
            <div>
               <table class="noborder" style="font-size: 10pt;width: 100%">
                  <tr>
                     <td>Projektnummer</td>
                     <td class="number-td">{{this.entity.project.project_number}}</td>
                  </tr>
               </table>
            </div>
         </div>
      </div>
      <div class="customer-info" style="line-height:1;">
         <table class="additionalServicesSection fieldTable field">
               <tr>
                     <th>{{ $t('modules.additional_services.widget.service') }}</th>
                     <th>{{ $t('modules.additional_services.widget.description') }}</th>
                     <th>{{ $t('modules.additional_services.widget.single_price') }}</th>
                     <th>{{ $t('modules.additional_services.widget.quantity_type') }}</th>
                     <th>{{ $t('modules.additional_services.widget.quantity') }}</th>
                     <th>{{ $t('modules.additional_services.widget.total_price') }}</th>
               </tr>
               <!-- {{ this.services }} -->
               <tr v-for="serviceArr in services" :key="serviceArr.id">
                  <td>{{ serviceArr.service.name }}</td>
                  <td>{{ serviceArr.description }}</td>
                  <td>{{ serviceArr.single_price }}</td>
                  <td>{{ serviceArr.quantity_type }}</td>
                  <td>{{ serviceArr.quantity }}</td>
                  <td>{{ serviceArr.total_price }}</td>
               </tr>
         </table>
      </div>
      <div class="totalPriceSection">
         <div class="header-left">
            
         </div>
         <div class="header-right">
            <div>
               <table class="noborder" style="font-size: 10pt;width: 100%">
                  <tr>
                     <td>{{ $t('modules.additional_services.widget.taxrate') }}</td>
                     <td class="number-td">{{this.entity.taxrate}}</td>
                  </tr>
                  <tr>
                     <td>{{ $t('modules.additional_services.widget.tax_amount') }}</td>
                     <td class="number-td">{{formatPrice(this.entity.tax_amount)}} </td>
                  </tr>
                  <tr>
                     <td>{{ $t('modules.additional_services.widget.price_net') }}</td>
                     <td class="number-td">{{formatPrice(this.entity.price_net)}}</td>
                  </tr>
                  <tr>
                     <td>{{ $t('modules.additional_services.widget.price_total') }}</td>
                     <td class="number-td">{{formatPrice(this.entity.price_total)}}</td>
                  </tr>
               </table>
            </div>
         </div>
      </div>
   </div>
</template>
<script>
import Api from 'api'

export default {
    props: {
    },
   data() {
      return {
        loading: true,
        services: null
      }
   },
   mounted() {
      this.services = this.entity.services
      console.log(this.entity)
   },
   methods: {
      formatPrice (price) {
         return new Intl.NumberFormat('de-DE', {
               style: 'currency',
               currency: 'EUR',
         }).format(price)
      }
   }
}
</script>
<style scoped>
.header, .totalPriceSection {
   display: flex;
   justify-content: space-between;
}
.additionalServicesSection {
   margin-top: 15px;
   margin-bottom: 15px;
   width: 95%;
}
.totalPriceSection .header-right {
   width: 30%;
}
</style>
{% endverbatim %}
