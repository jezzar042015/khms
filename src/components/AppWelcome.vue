<template>
    <div class="main" id="welcome">
        <div id="wrapper">
            <div id="form">
                <div>
                    <p id="welcome">
                        Welcome!
                    </p>
                    <h3 id="message">
                        I am your meetings scheduler assistant!
                    </h3>
                </div>
                <div class="shoutout">
                    Let’s Get Started!
                </div>
                <div class="inputs">
                    <FormInput v-model="congStore.congregation.name" label="Congregation or Group Name"
                        :placeholder="'Name for schedule headers'" />
                    <FormSelect v-model="congStore.congregation.lang" label="Meeting Language"
                        :items="congStore.supportedLanguages" :id="'code'" :display="'lang'"
                        :placeholder="'Select Meeting Language'" />
                    <FormSelect v-model="congStore.congregation.classId" label="Ministry Classes"
                        :items="congStore.supportedClasses" :display="'display'"
                        :placeholder="'Select Ministry Class'" />
                    <div v-show="hasRequired">
                        <button id="start" @click="viewStore.exitWelcome">Confirm</button>
                    </div>
                </div>
            </div>
            <div id="background"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
   
   /**
     * @description Component to let the user enter the congregation details 
    */

    import { computed } from 'vue'
    import { useCongregationStore } from '@/stores/congregation';
    import { useViewStore } from '@/stores/views';
    import FormInput from './reusables/FormInput.vue';
    import FormSelect from './reusables/FormSelect.vue';

    const congStore = useCongregationStore()
    const viewStore = useViewStore()

    /**
     * @description the user can't proceed
     * if the congregation's class and language are not provided
     * 
     * @returns (boolean)  
    */
    const hasRequired = computed(() => {
        const hasClass = congStore.congregation.classId
        const hasLang = congStore.congregation.lang

        return hasClass && hasLang
    })


</script>

<style scoped>
    .main
    {
        display: grid;
        height: 100%;
        width: 100%;
        background: #F3F5F7;
        place-items: center;
    }

    #wrapper
    {
        height: 460px;
        width: 450px;
        position: relative;
        margin-top: -60px;
    }

    #form
    {
        background: linear-gradient(125deg, #ffffff, #fcfcfc, #d5c8e4c5, #b982f75b);
        position: relative;
        height: 100%;
        width: 100%;
        border-radius: 20px;
        box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
        z-index: 2;
        padding: 40px 50px;
        display: grid;
        grid-template-rows: 1fr 1fr 5fr;
    }

    #background
    {
        height: 100%;
        width: 100%;
        border-radius: 20px;
        transform: rotate(-15deg);
        z-index: 1;
        position: absolute;
        background: linear-gradient(135deg, #3DA8EA, #1e033d);
        top: 10px;
        left: -25px;
    }

    #welcome
    {
        color: rgba(128, 128, 128, 0.849);
        font-weight: 600;
    }

    #message
    {
        font-size: 22px;
        font-weight: 600;
        background: linear-gradient(135deg, #3DA8EA, #34004d);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .shoutout
    {
        font-weight: 600;
        display: flex;
        font-size: 18px;
        align-items: center;
        color: rgb(53, 53, 53);
    }

    button
    {
        background: #215d83;
        border: none;
        color: white;
        font-size: 12px;
        padding: 10px 35px;
        border-radius: 50px;
        cursor: pointer;
        transition: ease-in-out .2s;
        margin-top: 10px;
    }

    button:hover
    {
        background: #2878aa;
    }

    .inputs
    {
        display: flex;
        flex-direction: column;
        gap: 14px;
    }

</style>