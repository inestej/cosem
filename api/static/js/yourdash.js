document.addEventListener("DOMContentLoaded", function(event) {
   
    const showNavbar = (toggleId, navId, bodyId, headerId) =>{
    const toggle = document.getElementById(toggleId),
    nav = document.getElementById(navId),
    bodypd = document.getElementById(bodyId),
    headerpd = document.getElementById(headerId)
    
    // Validate that all variables exist
    if(toggle && nav && bodypd && headerpd){
    toggle.addEventListener('click', ()=>{
    // show navbar
    nav.classList.toggle('show')
    // change icon
    toggle.classList.toggle('bx-x')
    // add padding to body
    bodypd.classList.toggle('body-pd')
    // add padding to header
    headerpd.classList.toggle('body-pd')
    })
    }
    }
    
    showNavbar('header-toggle','nav-bar','body-pd','header')
    
    /*===== LINK ACTIVE =====*/
    const linkColor = document.querySelectorAll('.nav_link')
    
    function colorLink(){
    if(linkColor){
    linkColor.forEach(l=> l.classList.remove('active'))
    this.classList.add('active')
    }
    }
    linkColor.forEach(l=> l.addEventListener('click', colorLink))
    
     // Your code to run since DOM is loaded and ready
});


function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        types: JSON.parse(decodeURIComponent(params.get('types')) || '[]'),
        superficie: JSON.parse(decodeURIComponent(params.get('superficie')) || '[]'),
        quantites: JSON.parse(decodeURIComponent(params.get('quantites')) || '[]'),
        rendement: JSON.parse(decodeURIComponent(params.get('rendement')) || '[]')
    };
}
async function createPieChart() {

    const { types, superficie, quantites, rendement } = getQueryParams();

    // Map for colors
    const colorMap = {
        'Blé dur': '#00441b',
        'Blé tendre': '#006d2c',
        'Orge': '#31a354',
        'Triticale': '#a1d99b',
        'Autres': '#c2c2c2'
    };
    const colors = types.map(type => colorMap[type] || '#d3d3d3'); // Default color if type not found

    const pieData = [{
        values: superficie,
        labels: types,
        type: 'pie',
        textinfo: 'label+percent',
        textposition: 'outside',
        automargin: true,
        marker: {
            colors: colors
        }
    }];

    const layout = {
        title: ' Répartition de la Superficie Semée (ha)    ',
        showlegend: true
    };

    Plotly.newPlot('pieChart', pieData, layout);
}

createPieChart();


async function createBarChart() {
    const { types, superficie, quantites, rendement } = getQueryParams();

    // Generate colors based on superficie values
    const colors = superficie.map(value => {
        if (value < 20) return '#ff9999'; // Light Red for low values
        if (value < 50) return '#66b3ff'; // Light Blue for medium values
        return '#99ff99'; // Light Green for high values
    });

    const barData = [{
        x: types,
        y: quantites,
        type: 'bar',
        marker: {
            color: colors,
            colorscale: 'Greens',
            colorbar: {
                title: 'Superficie semée (ha)'
            }
        },
        text: superficie.map(s => `Superficie semée (ha): ${s}`),
        hoverinfo: 'x+y+text'
    }];

    const layout = {
        title: ' Quantités Collectées (q) par Type de Culture    ',
        xaxis: {
            title: 'Type de Culture'
        },
        yaxis: {
            title: 'Quantités Collectées (q)'
        },
        barmode: 'group'
    };

    Plotly.newPlot('barChart', barData, layout);
}
createBarChart()



async function createPieChart1() {
    
    const { types, superficie, quantites, rendement } = getQueryParams();

    const colorMap = {
        'Blé dur': '#00441b',
        'Blé tendre': '#006d2c',
        'Orge': '#31a354',
        'Triticale': '#a1d99b',
        'Autres': '#c2c2c2'
    };
    const colors = types.map(type => colorMap[type] || '#d3d3d3'); // Default color if type not found

    const pieData = [{
        values: quantites,
        labels: types,
        type: 'pie',
        textinfo: 'label+percent',
        textposition: 'outside',
        automargin: true,
        marker: {
            colors: colors
        }
    }];

    const layout = {
        title: ' Répartition des Quantités Collectées (q)    ',
        showlegend: true
    };

    Plotly.newPlot('pieChart1', pieData, layout);
}

createPieChart1();


async function createBarChart1() {
    const { types, superficie, quantites, rendement } = getQueryParams();

    // Generate colors based on rendement values
    // Normalize rendement to a range of 0 to 1 for color scaling
    const maxRendement = Math.max(...rendement);
    const minRendement = Math.min(...rendement);
    const normalizedRendement = rendement.map(value => (value - minRendement) / (maxRendement - minRendement));

    // Map normalized rendement values to colors
    const colors = normalizedRendement.map(value => {
        // Define a color gradient from red to green
        const red = Math.floor((1 - value) * 255);
        const green = Math.floor(value * 255);
        return `rgb(${red}, ${green}, 0)`; // RGB color gradient
    });

    const barData = [{
        x: types,
        y: quantites,
        type: 'bar',
        marker: {
            color: colors,
            colorscale: 'Viridis', // Optional: Use a predefined colorscale
            colorbar: {
                title: 'Rendement (q/ha)'
            }
        },
        text: rendement.map(r => `Rendement (q/ha): ${r}`),
        hoverinfo: 'x+y+text'
    }];

    const layout = {
        title: ' Quantités Collectées (q) par Type de Culture    ',
        xaxis: {
            title: 'Type de Culture'
        },
        yaxis: {
            title: 'Quantités Collectées (q)'
        },
        barmode: 'group'
    };

    Plotly.newPlot('barChart1', barData, layout);
}

createBarChart1();