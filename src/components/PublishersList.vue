<template>
    <div id="pubslist">
        <div class="content">
            <div class="header">
                <div class="header-main">
                    <div class="flex-row gap-3">
                        <div class="page-name">Publishers List</div>
                        <div><input type="search" name="" id="filter" v-model="filter" placeholder="Filter Publishers">
                        </div>
                    </div>
                    <div>
                        <button id="to-schedules" @click="toSchedules">Schedules</button>
                    </div>
                </div>
                <div class="grid-col col-headers">
                    <div class="col-header">Name</div>
                    <div class="col-header">Assignable Parts and Privileges</div>
                </div>
            </div>
            <div class="list-holder">
                <PublisherRow :pub="newPublisher" />
                <transition-group name="publishers">
                    <template v-for="pub in filteredList" :key="pub.id">
                        <PublisherRow :pub="pub" />
                    </template>
                </transition-group>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue';
    import { usePublisherStore } from '@/stores/publisher';
    import { useViewStore } from '@/stores/views';
    import type { Publisher } from '@/types/publisher';

    import PublisherRow from '@/components/PublisherRow.vue'

    const viewStore = useViewStore()
    const pubStore = usePublisherStore()

    const newPublisher = ref<Publisher>({
        name: '',
        roles: ['demo']
    })

    const filter = ref<string | null>('')

    const filteredList = computed<Publisher[]>(() => {
        if (!filter.value) return pubStore.publishers
        const c = filter.value
        return pubStore.publishers.filter(p =>
            p.name.toLowerCase().includes(c.toLowerCase())
        )
    })

    function toSchedules(): void {
        viewStore.setView('mwb')
    }
</script>

<style scoped>
    .publishers-move
    {
        transition: all 1s;
    }

    #pubslist
    {
        height: 100%;
        width: 100%;
        overflow: hidden;
        display: flex;
        justify-content: center;
        font-size: 16px
    }

    .content
    {
        display: flex;
        flex-direction: column;
        max-width: 1080px;
        padding: 30px 50px;
        width: 80%;
        height: 100%;
        box-shadow: 6px 0 4px -4px #999, -6px 0 4px -4px #999;
        -moz-box-shadow: 6px 0 4px -4px #999, -6px 0 4px -4px #999;
        -webkit-box-shadow: 6px 0 4px -4px #999, -6px 0 4px -4px #999;
    }



    .list-holder
    {
        flex: 1;
        overflow: visible;
        overflow-y: visible;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        gap: 4px;
        z-index: 1;
    }

    .header
    {
        height: 80px;
        display: flex;
        flex-direction: column;
        border-bottom: 3px solid rgb(226, 226, 226)
    }

    .header-main
    {
        display: flex;
        justify-content: space-between;
    }

    .flex-row
    {
        display: flex;
    }

    .flex-col
    {
        display: flex;
        flex-direction: column;
    }

    .page-name
    {
        font-weight: 700;
        font-size: 1.5em;
        position: relative;
    }

    .page-name::before
    {
        content: "";
        height: 15px;
        width: 90%;
        background-color: #3da8ea7a;
        display: flex;
        position: absolute;
        z-index: -1;
        right: 4px;
        bottom: 0px;

    }

    .gap-3
    {
        gap: 3em
    }

    .justify-space-betwen
    {
        justify-content: space-between;
    }

    #filter
    {
        border: none;
        border: 1px solid rgb(185, 185, 185);
        padding: 6px 10px;
        border-radius: 6px;
        outline: none;
    }

    .col-header
    {
        font-size: .9em;
    }

    .col-headers
    {
        flex: 1;
        padding: 10px;
        align-items: end;
    }

    .grid-col
    {
        display: grid;
        grid-template-columns: 200px 1fr;
    }

    #to-schedules
    {
        padding: 6px 20px;
        background: #3DA8EA;
        border: none;
        color: white;
        border-radius: 4px;
        cursor: pointer;
        font-size: .85em;
    }
</style>