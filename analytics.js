const moistureCtx =
document.getElementById('moistureAnalyticsChart');

new Chart(moistureCtx, {

    type: 'line',

    data: {

        labels: ['Mon','Tue','Wed','Thu','Fri','Sat'],

        datasets: [{

            label: 'Soil Moisture (%)',

            data: [32,35,28,40,38,45]

        }]
    }
});

const waterCtx =
document.getElementById('waterChart');

new Chart(waterCtx, {

    type: 'bar',

    data: {

        labels: ['Mon','Tue','Wed','Thu','Fri','Sat'],

        datasets: [{

            label: 'Water Usage (L)',

            data: [20,15,10,25,18,22]

        }]
    }
});

const decisionCtx =
document.getElementById('decisionChart');

new Chart(decisionCtx, {

    type: 'pie',

    data: {

        labels: [

            'Water Now',

            'Wait For Rain',

            'Monitor'
        ],

        datasets: [{

            data: [8,12,5]

        }]
    }
});