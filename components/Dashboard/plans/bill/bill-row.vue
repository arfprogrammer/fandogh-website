<template>
    <div style="width: 100%; border-radius: 3px; background-color: rgba(41, 121, 255, 0.3); margin: 10px 0 0 0; padding: 2px 0; overflow-x: scroll">
        <table style="width: 100%; border: none; border-collapse: collapse; margin: 6px 0;" :style="{tableLayout: isReadable ? 'fixed' : null}">
            <tr class="data">
                <td :width="isReadable? null : '26%'">{{bill.local_name}}</td>
                <td class="number" :width="isReadable? null : '17%'">{{bill.quantity}}</td>
                <td :width="isReadable? null : '17%'">{{bill.local_unit}}</td>
                <td class="number" :width="isReadable? null : '20%'">{{(bill.description === 'cpu' ? '__' : bill.unit_price.toLocaleString())}}</td>
                <td class="number" :width="isReadable? null : '20%'">{{(bill.description === 'cpu' ? '__' : bill.total_price.toLocaleString())}}</td>
            </tr>
        </table>

    </div>
</template>

<script>
    export default {
        props: ['bill'],
        name: "bill-row",
        computed:{
            isReadable(){
                if (this.$route.path.indexOf('transaction-details') !== -1) {
                    return true
                }else {
                    return false
                }
            }
        }
    }
</script>

<style lang="stylus" scoped>

    *::-webkit-scrollbar
        display none
        -ms-overflow-style none
        overflow -moz-scrollbars-none

    tr.data
        height 20px
        border-collapse collapse

    tr.data td
        font-family iran-yekan
        font-size .8em
        line-height 20px
        color #000000
        text-align center
        border-left 2px solid #fff

    tr.data td.number
        font-family iran-sans
        font-size .8em
        line-height 20px
        color #000000
        direction ltr
        text-align center
        border-left 2px solid #fff

    tr.data td:last-child
        border none


</style>
