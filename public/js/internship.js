
window.onload = function(){
    var ctx = document.getElementById('myChart').getContext('2d');
    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['2016', '2017', '2018', '2019', '2020', '2021'],
            datasets: [{
                label: 'NO. of internship offers',
                data: [178, 198, 201, 219, 269, 215],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'linear',
                min: 100,
                max: 300
                }
            },
            font:{
                size: 20
            }
        }
    });

    // var ctx2 = document.getElementById('pieChart').getContext('2d');
    // window.myPieChart = new Chart(ctx2,{
    //     type: 'pie',
    //     data: {
    //         datasets: [{
    //             data: [10, 20, 30]
    //         }],
    //         backgroundColor: [
    //             'rgba(255, 99, 132, 1)',
    //                 'rgba(54, 162, 235, 1)',
    //                 'rgba(255, 206, 86, 1)'
    //           ],
    //         // These labels appear in the legend and in the tooltips when hovering different arcs
    //         labels: [
    //             'Red',
    //             'Yellow',
    //             'Blue'
    //         ]
    //     },
    //     options:{
    //         responsive: true,
    //         maintainAspectRatio: false
    //     }
    // });
}
