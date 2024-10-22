{% verbatim %}
<template>
  <div class="main-div">
    <h3>display PDF here..</h3>
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
              <td>
                Rechnungsdatum
              </td>
              <td class="number-td"><b>He</b></td>
            </tr>

            <tr>
              <td>Projektnummer</td>
              <td class="number-td"><b>d{{ this.entity.date }}</b></td>
            </tr>

          </table>
        </div>
      </div>
    </div>
    <div class="customer-info" style="line-height:1;">
      <p>customer name {{offers}}</p>
      <p>customer address</p>
    </div>
  </div>
</template>

<script>
import { Api } from '@kibro/brezel-spa'
// import Api from 'api'
// import { apiGet } from 'apiFunctions'

export default {
  data() {
  },
  props: {
    entity: {
      type: Object,
      required: true
    }
  },
  mounted(){
    console.log(this.entity)
  },
  methods: {
  }
}
// ------------------------------------------//


</script>
<style>
.header {
  display: flex;
  justify-content: space-between;
}
</style>
{% endverbatim %}
