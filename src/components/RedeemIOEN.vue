<template>
    <dialog open>
        <header>
            <slot name="header">
                <h2>Redeem your IOEN via crypto.com</h2>
                <button @click="redeemClose()">Ok</button>
            </slot>
        </header>
    </dialog>
</template>

<script>
 export default {
    emits: ['close'],
    methods: {
                redeemClose() { 
                    this.$emit('close');
                    console.log("ok button pushed");
                }
            }
 };
</script>

<style scoped>
</style>