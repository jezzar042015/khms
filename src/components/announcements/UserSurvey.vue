<template>
    <div class="bg-dark">
        <div class="wrap">
            <p>Hi there!</p>
            <p>Thank you for using our app to manage your meeting assignments. We’d love to hear your quick feedback on
                how we can make it even better for you!</p>
            <div class="buttons">
                <button class="take-survey" @click="gotoSurvey">Send a Feedback</button>
                <button @click="storeDeclines">Not this time</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { useSurveysStore } from '@/stores/survey';

    const surveyStore = useSurveysStore()

    const emits = defineEmits(['exit-me'])
    const gotoSurvey = () => {
        const survey = "https://forms.gle/oiLvyuB1ZftmLChS9"
        window.open(survey, '_blank');
        storeAttempt()
    }

    const storeAttempt = () => {
        surveyStore.data.attempt = new Date()
        emits('exit-me') // temporary
    }

    const storeDeclines = () => {
        surveyStore.declined()
        emits('exit-me')
    }
</script>

<style scoped>
    .bg-dark
    {
        background: rgba(0, 0, 0, 0.616);
        position: absolute;
        display: flex;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10;
        justify-content: center;
        align-items: center
    }

    .wrap
    {
        background: white;
        width: 500px;
        padding: 30px;
        border-radius: 5px;
        display: flex;
        flex-direction: column;
        gap: 14px;
    }

    p
    {
        font-size: 18px;
    }

    .buttons
    {
        display: flex;
        gap: 15px;
        margin-top: 20px;
    }

    .take-survey,
    button
    {
        padding: 10px 20px;
        text-decoration: none;
        border: 2px solid #3DA8EA;
        border-radius: 2px;
        font-size: 15px;
        cursor: pointer;
    }

    .take-survey:hover,
    button:hover
    {
        box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 4px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
    }

    .take-survey
    {
        background: #3DA8EA;
        color: white;
    }

    button
    {
        background: none;
        color: gray;
    }
</style>