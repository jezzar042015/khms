const translations: Translations = {
    mwbs140: {
        war: {
            title: 'Eskedyul han Katirok ha Midweek',
            song: 'Karantahon',
            gems: 'MGA BAHANDI TIKANG HA PULONG HAN DIOS',
            ministry: 'MAGIN MAS EPEKTIBO HA MINISTERYO',
            living: 'PAGKINABUHI SUGAD NGA MGA KRISTIANO',
            prayer: 'Pag-ampo',
            demo: 'Estudyante/Kabulig',
            student: 'Estudyante',
            chairman: 'Tsirman',
            coCounselor: 'Magsaragdon ha Dugang nga Klase',
            conductor: 'Magdudumara'
        },
        tl: {
            title: 'Iskedyul ng Pulong sa Gitnang Sanlinggo',
            song: 'Awit',
            gems: 'KAYAMANAN MULA SA SALITA NG DIYOS',
            ministry: 'MAGING MAHUSAY SA MINISTERYO',
            living: 'PAMUMUHAY BILANG KRISTIYANO',
            prayer: 'Panalangin',
            demo: 'Estudyante/Assistant',
            student: 'Estudyante',
            chairman: 'Chairman',
            coCounselor: 'Tagapayo sa Karagdagang Klase',
            conductor: 'Konduktor'
        },
        psp: {
            title: 'Midweek Meeting Schedule',
            song: 'Song',
            gems: 'TREASURES FROM GOD’S WORD',
            ministry: 'APPLY YOURSELF TO THE FIELD MINISTRY',
            living: 'LIVING AS CHRISTIANS',
            prayer: 'Prayer',
            demo: 'Student/Assistant',
            student: 'Student',
            chairman: 'Chairman',
            coCounselor: 'Auxiliary Class Counselor',
            conductor: 'Conductor'

        },
        ceb: {
            title: 'Eskedyul sa Midweek nga Tigom',
            song: 'Awit',
            gems: 'BAHANDI GIKAN SA PULONG SA DIYOS',
            ministry: 'MAGMAEPEKTIBO SA MINISTERYO',
            living: 'KRISTOHANONG PAGKINABUHI',
            prayer: 'Pag-ampo',
            demo: 'Estudyante/Asistant',
            student: 'Estudyante',
            chairman: 'Tsirman',
            coCounselor: 'Magtatambag sa Ikaduhang Lawak',
            conductor: 'Tigdumala'
        }
    }
}

export default translations;

interface Translations {
    mwbs140: MwbS140Languages
}

interface MwbS140Languages {
    [keys: string]: TranslationKeys
}

interface TranslationKeys {
    [keys: string]: string
}

