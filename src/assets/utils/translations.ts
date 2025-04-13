const translations: Translations = {
    mwbs140: {
        bcl: {
            title: 'Midweek na Pagtiripon',
            song: 'Kanta',
            gems: 'KAYAMANAN NA YAON SA TATARAMON NIN DIYOS',
            ministry: 'MAGIN ANDAM SA MINISTERYO',
            living: 'PAMUMUHAY BILANG KRISTIYANO',
            prayer: 'Pamibi',
            demo: 'Estudyante/Assistant',
            student: 'Estudyante',
            chairman: 'Tsirman',
            coCounselor: 'Parakonseho sa Second Hall',
            conductor: 'Makondukta'
        },
        war: {
            title: 'Midweek nga Katirok',
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
            title: 'Gitnang Sanlinggong Pulong',
            song: 'Awit Blg.',
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
        en: {
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
        },
        hil: {
            title: 'Iskedyul sa Midweek nga Miting',
            song: 'Ambahanon',
            gems: 'MGA BAHANDI SA PULONG SANG DIOS',
            ministry: 'MANGIN EPEKTIBO SA MINISTERYO',
            living: 'PAGKABUHI BILANG CRISTIANO',
            prayer: 'Pangamuyo',
            demo: 'Estudyante/Assistant',
            student: 'Estudyante',
            chairman: 'Tsirman',
            coCounselor: 'Manuglaygay sa Auxiliary Classroom',
            conductor: 'Konduktor'
        },
        pag: {
            title: 'Eskedyul na Aral ed Midweek',
            song: 'Kansion',
            gems: 'KAYAMANAN ED SALITA NA DIOS',
            ministry: 'MAGMALIW YA EPEKTIBO ED MINISTERYO',
            living: 'BILAY NA KRISTIANO',
            prayer: 'Pikakasi',
            demo: 'Estudyante/Assistant',
            student: 'Estudyante',
            chairman: 'Chairman',
            coCounselor: 'Auxiliary Classroom Counselor',
            conductor: 'Mangikondukta'
        },
        ilo: {
            title: 'Gimong iti Tengnga ti Lawas',
            song: 'Kanta',
            gems: 'GAMENG MANIPUD ITI SAO TI DIOS',
            ministry: 'AGBALIN A MAS EPEKTIBO ITI MINISTERIO',
            living: 'PANAGBIAG KAS KRISTIANO',
            prayer: 'Kararag',
            demo: 'Estudiante/Katulongan',
            student: 'Estudiante',
            chairman: 'Estudiante',
            coCounselor: 'Mamalbalakad iti Kanayonan a Klase',
            conductor: 'Conductor'
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

