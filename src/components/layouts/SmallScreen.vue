<template>
    <div id="small-screen">
        <div class="wrapper">
            <div>
                Hello there!
            </div>
            <div class="sm-msg">
                I am your Meetings Scheduler Assistant!
            </div>
            <div class="sm-title">
                Sorry! This application is not yet supported on small screens. Please use a tablet or larger screen to
                access the scheduler using the same link.
            </div>
            <div class="sm-sample">
                <img src="@/assets/img/samples.png" alt="">
            </div>

        </div>
    </div>
</template>

<script lang="ts" setup>

</script>

<style scoped>
    .wrapper
    {
        padding: 25px;
        display: flex;
        flex-direction: column;
        gap: 30px;
        color: gray;
    }

    .sm-title
    {
        background: orangered;
        font-size: 5vw;
        font-weight: 600;
        color: white;
        padding: 20px;
        border-radius: 10px;
    }

    .sm-msg
    {
        font-size: 5vw;
        font-weight: 600;
    }

    .sm-sample
    {
        display: grid;
        place-items: center;
    }

    .sm-sample img
    {
        width: 80%;
    }
</style>