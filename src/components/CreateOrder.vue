<template>
    <div class="create-orders">
        <div class="products-wrapper">
            <div class="filter-bar">
                <span class="label">Kategorie:</span>
                <FieldSelect
                    v-model="filter.category"
                    :field="categorySelect"
                    class="filter-select"
                    @change="getProducts"
                 />
                <a-button @click="getProducts">
                    <template #icon>
                        <a-icon type="sync" :spin="loading.products" />
                    </template>
                </a-button>
            </div>
            <div class="loading-products" v-if="loading.products">
                <a-spin  size="large"/>
                <span>Artikel werden geladen</span>
            </div>
            <div class="products" v-else>
                <template v-for="product in products" :key="product.id">
                <div class="product-item" v-if="product.product_type == 'single' || product.childs.length > 0">
                    <div  class="product-image">
                        <template v-if="product.product_type === 'group'">
                            <img :src="product?.childs[0]?.imageURL" v-if="product.childs && product?.childs[0]?.imageURL"/>
                            <a-icon type="mdi:image-remove-outline" class="no-image" v-else />
                        </template>
                        <template v-else>
                            <img :src="product.imageURL" v-if="product.imageURL !== 'none'"/>
                            <a-icon type="mdi:image-remove-outline" class="no-image" v-else />
                        </template>
                    </div>
                    <div class="product-info">
                        <div class="product-name">
                            {{ product.name }}
                        </div>
                        <div class="product-description">
                            {{ product.description }}
                        </div>
                        <div class="product-price">
                            {{ product.product_type === 'group' ? formatPrice(product?.childs[0]?.price_netto) : formatPrice(product.price_netto) }}
                        </div>
                        <div class="product-action">
                            <a-button class="add-to-cart" @click="openDetail(product)">
                                <template #icon>
                                    <a-icon type="material-symbols:add-shopping-cart" />
                                </template>
                                Zum Warenkorb hinzufügen
                            </a-button>
                        </div>
                    </div>
                </div>
            </template>
            </div>
        </div>
        <div class="shopping-cart">
            <div class="headline">
                <a-icon type="material-symbols:shopping-cart-outline"></a-icon>
                Warenkorb
            </div>
            <div class="cart-content">
                <a-empty :description="'Ihr Warenkorb ist leer'" v-if="!shoppingCart.length" />
                <template v-for="(item, index) in shoppingCart" :key="index">
                    <div class="cart-item">
                        <div style="display: flex;">
                        <div style="flex:1">
                            <div class="cart-image">
                                <img :src="item.product.imageURL" />
                            </div>
                            <div class="cart-detail">
                                <div class="item-label">
                                    {{ item.product.brezel_name }}
                                </div>
                                <div class="item-number">
                                    Art. Nr.
                                    {{  item.product.item_number }}
                                </div>
                            </div>
                        </div>
                        <div class="close-btn">
                            <a-button @click="removeItem(item, index)" type="primary" danger>
                                <template #icon>
                                    <a-icon type="mdi:close" />
                                </template>
                            </a-button>
                        </div>
                        </div>
                        <div class="item-amount">
                            <span>Anzahl</span>
                            <a-input-group compact style="flex:0; display: inline-flex">
                                <a-button @click="item.amount > 1 ? item.amount-- : item.amount = 1">
                                    <template #icon><a-icon type="mdi:minus"/></template>
                                </a-button>
                                <a-input v-model:value="item.amount" style="width: 60px" />
                                <a-button @click="item.amount++">
                                    <template #icon><a-icon type="mdi:plus"/></template>
                                </a-button>
                            </a-input-group>
                        </div>
                        <div class="item-price-wrapper">
                            <div class="total-price">
                            {{   formatPrice(item.product.price_netto * item.amount) }}
                            </div> 
                            <div class="piece-price" v-if="item.amount > 1">
                                {{   formatPrice(item.product.price_netto)  }} / Stück
                            </div>
                        </div>
                    </div>

                </template>
                <div class="cart-summary" v-if="shoppingCart.length">
                    Gesamtpreis
                    <span>{{  getSummary(shoppingCart) }}</span>
                </div>
                <a-button class="btn-green btn-submit" :disabled="!shoppingCart.length" @click="createOrder(shoppingCart)">
                    Bestellung aufgeben
                </a-button>
            </div>
        </div>
    </div>
    <a-modal v-model:visible="visible.detail" width="700px" @cancel="closeDetail()">
        <template #title>
            <div v-if="detail.product_type === 'group'">
                {{ detail.childs[add.selectedChild].name }}
            </div>
            <div v-else>
                {{  detail.name }}
            </div>
        </template>

        <div v-if="detail.product_type === 'group'"  class="detail-wrapper">
            <div  class="detail-image">
                <img :src="detail.childs[add.selectedChild].imageURL"/>
            </div>
            <div>
                <div class="detail-price">
                    <strong>{{ formatPrice(detail.childs[add.selectedChild].price_netto) }}</strong>
                </div>
                <div class="detail-text">
                    <span class="label">Art. Nr. </span><span>{{ detail.childs[add.selectedChild].item_number }}</span>
                    <p class="detail-description">
                        {{  detail.childs[add.selectedChild].description }}
                    </p>
                </div>
                <div class="detail-childs" v-if="detail.childs">
                    <template v-for="(child, i) in detail.childs" :key="i">
                        <div class="child" :class="{ 'selected' : add.selectedChild == i }" @click="add.selectedChild = i">
                            {{ child.name }}
                        </div>
                    </template>
                </div>
            </div>
        </div>
        <div v-else class="detail-wrapper">
            <div  class="detail-image">
                <img :src="detail.imageURL"/>
            </div>
            <div>
                <div class="detail-price">
                    <strong>{{ formatPrice(detail.price_netto) }}</strong>
                </div>
                <div class="detail-text">
                    <span class="label">Art. Nr. </span><span>{{ detail.item_number }}</span>
                    <p class="detail-description">
                        {{  detail.description }}
                    </p>
                </div>
            </div>
        </div>
        <div style="margin-top:10px;">
            <a-collapse :bordered="false" v-model:activeKey="visible.description" style="background:rgb(5 81 0 / 5%)">
               <a-collapse-panel key="1" header="Artikel Beschreibung">
                    <p v-if="detail.product_type == 'group'">{{  detail.childs[add.selectedChild].description }}</p>
                    <p v-else>{{ detail.description }}</p>
                </a-collapse-panel>
            </a-collapse>
        </div>
        <div class="detail-amount">
            Anzahl
            <a-input-group compact style="flex:0; display: inline-flex">
                <a-button @click="add.amount > 1 ? add.amount-- : add.amount = 1">
                    <template #icon><a-icon type="mdi:minus"/></template>
                </a-button>
                <a-input v-model:value="add.amount" style="width: 60px" />
                <a-button @click="add.amount++">
                    <template #icon><a-icon type="mdi:plus"/></template>
                </a-button>
            </a-input-group>
        </div>
        <div class="detail-summary">
            Gesamtpreis:
            <span v-if="detail.product_type === 'group'">
                {{ formatPrice(detail.childs[add.selectedChild].price_netto * add.amount) }}
            </span>
            <span v-else>
                {{ formatPrice(detail.price_netto * add.amount) }}
            </span>
        </div>

        <template #footer>
            <a-button key="back" @click="closeDetail">Schließen</a-button>
            <a-button key="submit" type="primary" class="btn-green" @click="addToCard(detail, add)">Zum Warenkorb hinzufügen</a-button>
        </template>
    </a-modal>
</template>
<script>

import { Api, getFileURL, FieldSelect, FieldFile, FieldMultiselect } from '@kibro/brezel-spa'
import dayjs from 'dayjs'
import { groupBy } from 'lodash-es'

export default {
    components: { FieldSelect, FieldFile, FieldMultiselect },
    data() {
        return {
            loading: {
                products: false
            },
            visible: {
                detail: false,
                description: false
            },
            filter: {
                category: { "brezel_name": "Bestseller", "id": 18}
            },
            products: null,
            detail: [],
            add: {
                amount: 1,
                selectedChild: 0
            },
            shoppingCart: []
        }
    },
    computed: {
        categorySelect () {
            return {
                type: 'select',
                identifier: 'categories',
                options: {
                    references: 'products_categories',
                    placeholder: 'Kategorie',
                    allow_clear: false
                },
            }
        }
    },
    mounted() {
        this.getDefaultCategory()
        //this.getProducts()
    },
    methods: {
        getProducts() {
            this.loading.products = true
            const module = Api.getModule('products')
            const data = {
                categorie: this.filter.category
            }
            module.fireEvent('GetProducts', null, data).then(entity => {
                
                //this.products = entity.products
                console.log(entity)
                Promise.all(entity.products.map(async (product) => {
                    product.imageURL = product.image ? await this.getImageSrc(product.image) : 'none'
                    if(product.childs) {
                        for (const e of product.childs) {
                           e.imageURL = e.image ? await this.getImageSrc(e.image) : 'none'
                        }
                    } 
                    
                    return product
                })).then(p => {
                    this.products = p
                    this.loading.products = false
                })
            })
        },
        async getImageSrc (file) {
            return getFileURL(file.id).then(url => {
                return url
            }).catch(err => {
                console.log(err)
                return ''
            })
        },
        getDefaultCategory () {
            const params = new URLSearchParams({
                results: "1",
                pre_filters: JSON.stringify([
                    [
                        {column: 'name', operator: '=', value: "Bestseller"},
                    ],
                ]),
            })
             Api.fetchEntities('products_categories', 1, params.toString()).then(res => {
                this.filter.category = res[0]
             })
        },
        formatPrice (price) {
            return new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: 'EUR',
            }).format(price)
        },
        openDetail(product) {
            this.visible.detail = true
            this.detail = product
        },
        closeDetail() {
            this.visible.detail = false
            this.visible.description = 0
            this.detail = []
            this.add.amount = 1
        },
        addToCard( detail, add) {
            const product = detail.product_type === 'group' ? detail.childs[this.add.selectedChild] : detail

            const item = {
                product: product,
                amount: add.amount
            }
            const index = this.shoppingCart.findIndex(e => e.product.id == product.id)
            if(index != -1) {
                this.shoppingCart[index].amount = this.shoppingCart[index].amount + add.amount
            } else {
                this.shoppingCart.push(item)
            }

            this.closeDetail()
        },
        removeItem( item, index ) {
            this.shoppingCart.splice(index, 1)
        },
        getSummary(cart) {
            let sum = 0
            if(!cart.length) return
            cart.forEach( el => {
                sum += el.product.price_netto * el.amount
            })
            return this.formatPrice(sum)
        },
        createOrder(cart) {
            const module = Api.getModule('orders')
            const data = {
                cart
            }
            module.fireEvent('CreateOrder', null, data).then(entity => {
                this.shoppingCart = []
                this.$message.success("Bestellung erfolgreich abgeschickt")
            })
        }
    },
}
</script>
  
<style scoped>
.create-orders {
    display: flex;
    width: 100%;
}
/* ------------------------------------------- */
.products-wrapper {
    flex: 3;
}
.filter-bar {
    width: 100%;
    padding:10px 20px;
    border-bottom: 1px solid rgb(223, 223, 223);
    display:flex;
    gap:10px;
    align-items: center;
}
.filter-bar span.label {
    font-weight: 600;
    color:#4a545b;
}
.filter-bar :deep(.ant-select-selector){
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
}
.filter-select {
    min-width: 200px;
}
.loading-products {
    text-align: center;
    margin:20px 0px;
}
.loading-products .ant-spin {
    margin-bottom: 20px;
}
.loading-products span {
    color: #4a545b;
}
.products {
    padding:10px;
    display: flex;
    gap:10px;
    flex-wrap: wrap;
}
.product-item {
    border:1px solid #e7e7e7;
    flex: 0 0 auto;
    width: 23.5%;
    padding: 1rem;
    min-width: 240px;
}
.product-image {
    text-align: center;
    padding:15px;
    height: 130px;
}
.product-image img {
    display: block;
    max-width: 100%;
    max-height: 100px;
    margin: auto;
}
.no-image {
    font-size: 5rem;
    opacity: 0.5;
}
.product-name {
    color: #4a545b;
    font-size: 18px;
    line-height: 22px;
    font-weight: 600;
    height:40px;
}
.product-description {
    height: 54px;
    margin-top: 10px;
    font-size: 14px;
    line-height: 18px;
    display: -webkit-box;
   -webkit-line-clamp: 3;
   -webkit-box-orient: vertical;
   overflow: hidden;
   text-overflow: ellipsis;
}
.product-price {
    color:#4a545b;
    font-size: 18px;
    font-weight: 700;
    line-height: 20px;
    margin-top: 20px;
}
.product-action {
    margin-top: 20px;
}
.product-action .add-to-cart {
    text-align: center;
    width: 100%;
    background-color: #4daf46;
    border-color:#4daf46;
    color:white;
    text-wrap: wrap;
    height: auto;
    border-radius: 0px;
    padding:10px 0px;
}
.product-action .add-to-cart:hover {
    color: black;
    text-decoration: none;
    background-color: #d4d4d4;
    border-color: #c7c7c7;
}

.detail-image img {
    max-width: 200px;
}
.detail-amount {
    display: flex;
    align-items: center;
    gap:10px;
    justify-content: end;
    width: 100%;
    margin-top: 10px;
}
.btn-green, .btn-green:active,.btn-green:focus {
    background-color: #4daf46;
    border-color:#4daf46;
    box-shadow: unset;
    color:white;
}
.btn-green:hover, .btn-green:hover:focus{
    color: black !important;
    text-decoration: none;
    background-color: #d4d4d4 !important;
    border-color: #c7c7c7 !important;
}
.detail-childs{
    display:flex;
    gap:10px;
    flex-wrap: wrap;
}
.detail-childs  .child {
    padding: 5px 10px;
    border: 1px solid #bcc1c7;

}
.detail-childs  .child:hover {
    cursor: pointer;
    border: 1px solid #48af46;
}
.detail-childs  .child.selected {
    background-color: #48af46;
    color: #fff;
    border: 1px solid #48af46;
}
.detail-wrapper {
    display: flex;
    gap:1rem;
    padding: 20px 0px 0px 0px;
}
.detail-wrapper .detail-price {
    width:100%;
}
.detail-wrapper .detail-price strong {
    color: #4a545b;
    margin-bottom: 10px;
    font-size: 1.75rem;
}

.detail-text .label {
    font-weight: 700;
}
.detail-description {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}
.detail-summary {
    border-top: 1px solid #e2e2e2;
    padding: 10px 0px;
    margin:10px 0px 0px;
    font-weight: 700;
    margin: 1rem 0;
    color: #4a545b;
    display: flex;
    justify-content: end;
    gap:1rem;
}

/* ------------------------------------------- */
.shopping-cart {
    flex: 1;
    border-left: 1px solid rgb(214, 214, 214);
}
.shopping-cart .headline {
    width: 100%;
    padding:15px 20px;
    border-bottom: 1px solid rgb(223, 223, 223);
   /* background-color: rgb(238, 238, 238); */
}
.cart-content {
    padding:20px;
}
.cart-item {
    border-bottom: 1px solid #e2e2e2;
    padding:10px 0px;
}
.cart-image {
    display:inline-block;
    border:1px solid rgb(204, 204, 204);
}
.cart-image img {
    max-width: 60px;
}
.cart-detail {
    margin-bottom: 1rem;
}
.cart-detail .item-label{
    color: #4a545b;
    font-weight: 700;
}
.cart-detail .item-number {
    margin-bottom: 0.5rem;
    font-size: 0.75rem;
}
.cart-item .item-amount {
    display:flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}
.cart-item .item-amount span {
    color: #4a545b;
    font-weight: 700;
    font-size: 14px;
}
.cart-item .item-price-wrapper {
    text-align: end;
}
.cart-item .item-price-wrapper .total-price {
    font-weight: 700;
    text-align: right;
    color: #4a545b;
}
.cart-item  .item-price-wrapper  .piece-price {
    font-size: 0.75rem;
    font-style: italic;
}
.cart-summary {
    font-weight: 700;
    margin:1rem 0;
    color: #4a545b;
    display: flex;
    justify-content: space-between;
}
.btn-submit {
    width: 100%;
    padding:10px 0px;
    height: auto;
    margin-top: 20px
}
.btn-submit[disabled], .btn-submit.btn-green[disabled]:hover {
    background: rgb(228, 228, 228);
    border-color: rgb(228, 228, 228);
    color:gray;
}
</style>
  