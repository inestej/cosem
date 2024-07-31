
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


// first block
// Function to fetch and parse the CSV file
function fetchAndDisplayCSV(url, tableId, theadId, tbodyId) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            const rows = data.trim().split("\n");
            const headers = rows[0].split(",");
            const tbody = document.getElementById(tbodyId);
            const thead = document.getElementById(theadId);

            // Clear existing headers and rows
            thead.innerHTML = '';
            tbody.innerHTML = '';

            // Add headers to the table
            const headerRow = document.createElement('tr');
            headers.forEach(header => {
                const th = document.createElement('th');
                th.innerText = header;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);

            // Add data rows to the table
            rows.slice(1).forEach(row => {
                const tr = document.createElement('tr');
                const columns = row.split(",");
                columns.forEach(column => {
                    const td = document.createElement('td');
                    td.innerText = column;
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });

            // Initialize DataTable
            $(`#${tableId}`).DataTable();
        })
        .catch(error => console.error('Error fetching the CSV file:', error));
}

// Call the function with the paths to your CSV files
fetchAndDisplayCSV('static/2022_2023data.csv', 'myTable1', 'tableHeader1', 'tableBody1');
fetchAndDisplayCSV('static/qualite_semence.csv', 'myTable2', 'tableHeader2', 'tableBody2');



async function fetchData(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function mapCodeToText(code) {
    if (code === 1) return 'BD';
    if (code === 2) return 'BT';
    if (code === 3) return 'Tr';
    if (code === 4) return 'Or';
    return 'Unknown';
}

async function createChoropleth() {
    const localPath = 'static/delegations.geojson';

    const response = await fetch(localPath);
    const data = await response.json();
    
    const governorates = ['Manubah', 'Bizerte', 'Zaghouan', 'Siliana', 'Ben Arous', 'Béja', 'Jendouba', 'Le Kef', 'Ariana'];

    const features = data.features.filter(feature => governorates.includes(feature.properties.gov_name_f));

    features.forEach(feature => {
        feature.properties.code_cereale = getRandomInt(1, 4);
        feature.properties.code_variete = getRandomInt(1, 12);
        feature.properties.superficie = getRandomInt(10, 100);
        feature.properties.production = getRandomInt(20, 5000);
        feature.properties.cereale_text = mapCodeToText(feature.properties.code_cereale);
    });

    const mapData = [{
        type: 'choropleth',
        geojson: data,
        locations: features.map(feature => feature.id),
        z: features.map(feature => feature.properties.production),
        text: features.map(feature => `${feature.properties.gov_name_f}: ${feature.properties.cereale_text}`),
        colorscale: 'YlGn',
        marker: {
            line: {
                width: 0.5,
                color: 'rgba(0,0,0,0.5)'
            }
        },
        hoverinfo: 'location+z+text'
    }];

    const layout = {
        title: 'Map of Production by Governorate - Simulated Data',
        geo: {
            fitbounds: 'locations',
            visible: false
        },
        mapbox: {
            style: 'carto-positron',
            zoom: 7,
            center: { lat: 34.0, lon: 9.0 }
        },
        margin: { r: 0, t: 60, l: 0, b: 0 }
    };

    Plotly.newPlot('maptn', mapData, layout);
}

createChoropleth();


async function createHistogram() {
    // Load the CSV file
    const response = await fetch('static/cereal_data.csv');
    const dataText = await response.text();
    const cerealData = Papa.parse(dataText, { header: true }).data;

    // Debugging: log the loaded data
    console.log(cerealData);

    // Group data by governorate and sum the quantities of each cereal
    const governorateData = {};
    cerealData.forEach(row => {
        if (!governorateData[row.gov_name_f_y]) {
            governorateData[row.gov_name_f_y] = { BD: 0, BT: 0, Tr: 0, Or: 0 };
        }
        governorateData[row.gov_name_f_y].BD += parseFloat(row.BD);
        governorateData[row.gov_name_f_y].BT += parseFloat(row.BT);
        governorateData[row.gov_name_f_y].Tr += parseFloat(row.Tr);
        governorateData[row.gov_name_f_y].Or += parseFloat(row.Or);
    });

    const governorates = Object.keys(governorateData);

    // Separate the data by cereal type
    const bdData = {
        x: governorates,
        y: governorates.map(gov => governorateData[gov].BD),
        name: 'BD',
        type: 'bar'
    };

    const btData = {
        x: governorates,
        y: governorates.map(gov => governorateData[gov].BT),
        name: 'BT',
        type: 'bar'
    };

    const trData = {
        x: governorates,
        y: governorates.map(gov => governorateData[gov].Tr),
        name: 'Tr',
        type: 'bar'
    };

    const orData = {
        x: governorates,
        y: governorates.map(gov => governorateData[gov].Or),
        name: 'Or',
        type: 'bar'
    };

    const data = [bdData, btData, trData, orData];

    const layout = {
        title: 'Cereal Production by Governorate - Simulated Data',
        xaxis: { title: 'Governorate', tickangle: -45 },
        yaxis: { title: 'Total Quantity' },
        barmode: 'group',
        plot_bgcolor: 'white'
    };

    Plotly.newPlot('histogramtn', data, layout,{ responsive: true });
}

// Invoke the async function to create the histogram
createHistogram();


// Call the createHistogram function to render the histogram
createHistogram();

async function createBarChart() {
    // Load the CSV file
    const response = await fetch('static/cereal_data.csv');
    const dataText = await response.text();
    const cerealData = Papa.parse(dataText, { header: true }).data;

    // Debugging: log the loaded data
    console.log(cerealData);

    // Group data by governorate and sum the quantities and superficie
    const governorateData = {};
    cerealData.forEach(row => {
        if (!governorateData[row.gov_name_f_y]) {
            governorateData[row.gov_name_f_y] = { superficie: 0, BD: 0, BT: 0, Tr: 0, Or: 0 };
        }
        governorateData[row.gov_name_f_y].superficie += parseFloat(row.superficie);
        governorateData[row.gov_name_f_y].BD += parseFloat(row.BD);
        governorateData[row.gov_name_f_y].BT += parseFloat(row.BT);
        governorateData[row.gov_name_f_y].Tr += parseFloat(row.Tr);
        governorateData[row.gov_name_f_y].Or += parseFloat(row.Or);
    });

    // Debugging: log the grouped data
    console.log(governorateData);

    // Create the stacked bar chart
    const cereals = ['BD', 'BT', 'Tr', 'Or'];
    const colors = ['#440154', '#3b528b', '#21908d', '#5dc863'];
    const traces = cereals.map((cereal, i) => ({
        x: Object.keys(governorateData),
        y: Object.values(governorateData).map(data => data[cereal]),
        name: cereal,
        type: 'bar',
        marker: { color: colors[i] }
    }));

    const layout = {
        title: 'Cereal Production as Proportion of Area by Governorate - Simulated Data',
        xaxis: { title: 'Governorate', tickangle: -45 },
        yaxis: { title: 'Superficie' },
        barmode: 'stack',
        showlegend: true,
        plot_bgcolor: 'white'
    };

    Plotly.newPlot('barcharttn', traces, layout,{ responsive: true });
}

// Call the createBarChart function to render the bar chart
createBarChart();



//Second block 
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Fetch the CSV file
        const response = await fetch('static/2022_2023data.csv');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        // Read the response text
        const dataText = await response.text();
        
        // Parse the CSV data
        const results = Papa.parse(dataText, { header: true, dynamicTyping: true });
        const data = results.data;

        // Extract columns from data
        const types = data.map(row => row['Type']);
        const controle = data.map(row => row['Superficie contrôlée (ha)']);
        const acceptee = data.map(row => row['Superficie acceptée (ha)']);
        const refusee = data.map(row => row['Superficie refusée (ha)']);

        // Prepare Plotly data
        const plotData = [
            {
                x: types,
                y: controle,
                name: 'Superficie contrôlée (ha)',
                type: 'bar',
                marker: { color: '#d8b365' }
            },
            {
                x: types,
                y: acceptee,
                name: 'Superficie acceptée (ha)',
                type: 'bar',
                marker: { color: '#f4a582' }
            },
            {
                x: types,
                y: refusee,
                name: 'Superficie refusée (ha)',
                type: 'bar',
                marker: { color: '#a6611a' }
            }
        ];

        // Plotly layout
        const layout = {
            title: 'COSEM 2023 : Superficies Contrôlées, Acceptées et Refusées par Type de Céréale ',
            xaxis: { title: 'Type de Céréale' },
            yaxis: { title: 'Superficie (ha)' },
            barmode: 'group'
        };

        // Render Plotly chart
        Plotly.newPlot('histogram-2023', plotData, layout,{ responsive: true });
    } catch (error) {
        console.error('Error loading or parsing CSV file:', error);
    }
});

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Fetch the CSV file
        const response = await fetch('static/2022_2023data.csv');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        // Read the response text
        const dataText = await response.text();
        
        // Parse the CSV data
        const results = Papa.parse(dataText, { header: true, dynamicTyping: true });
        const data = results.data;

        // Filter out rows where Type is 'Total'
        const filteredData = data.filter(row => row['Type'] !== 'Total');

        // Extract relevant columns from filtered data
        const types = filteredData.map(row => row['Type']);
        const quantities = filteredData.map(row => row['Quantités collectées (q)']);

        // Define colors for the pie chart
        const colors = ['#d9f0a3', '#addd8e', '#78c679'];

        // Prepare Plotly data for pie chart
        const pieData = [
            {
                values: quantities,
                labels: types,
                type: 'pie',
                marker: { colors: colors }
            }
        ];

        // Plotly layout for pie chart
        const pieLayout = {
            title: 'COSEM 2023 : Quantités Collectées par Type de Céréale (QX)'
        };

        // Render Plotly pie chart
        Plotly.newPlot('pie-2023', pieData, pieLayout,{ responsive: true });
    } catch (error) {
        console.error('Error loading or parsing CSV file:', error);
    }
});

// third block
const colors = {
    'Quantités nettes calibrées': '#e5f5e0',
    'Quantités certifiées semences de base': '#a1d99b',
    'Quantités certifiées semences R1': '#31a354',
    'Quantités certifiées semences R2': '#006d2c',
    'Quantités déclassées en semences ordinaires': '#00441b',
    'Quantités refusées pour faible capacité germinative': '#005a32'
};

// Data for each type of culture
const data = {
    'Blé dur': {
        'Quantités nettes calibrées': 66780,
        'Quantités certifiées semences de base': 4100.0,
        'Quantités certifiées semences R1': 26700.0,
        'Quantités certifiées semences R2': 1000.0,
        'Quantités déclassées en semences ordinaires': 25100.0,
        'Quantités refusées pour faible capacité germinative': 9880.0
    },
    'Blé tendre': {
        'Quantités nettes calibrées': 1350,
        'Quantités certifiées semences de base': 0.0,
        'Quantités certifiées semences R1': 0.0,
        'Quantités certifiées semences R2': 0.0,
        'Quantités déclassées en semences ordinaires': 200.0,
        'Quantités refusées pour faible capacité germinative': 1150.0
    },
    'Orge et triticale': {
        'Quantités nettes calibrées': 692,
        'Quantités certifiées semences de base': 0.0,
        'Quantités certifiées semences R1': 212.0,
        'Quantités certifiées semences R2': 0.0,
        'Quantités déclassées en semences ordinaires': 480.0,
        'Quantités refusées pour faible capacité germinative': 0.0
    }
};

// Function to create a pie chart for a specific type of culture
function createPieChart(typeCulture, elementId) {
    const categories = Object.keys(data[typeCulture]);
    const quantities = Object.values(data[typeCulture]);

    const trace = {
        labels: categories,
        values: quantities,
        type: 'pie',
        marker: {
            colors: categories.map(category => colors[category])
        }
    };

    const layout = {
        title: `COSEM 2023 : Quantités par Catégorie pour ${typeCulture}`
    };

    Plotly.newPlot(elementId, [trace], layout, {responsive: true});
}

// Create pie charts for each type of culture
createPieChart('Blé dur', 'ble-dur-chart');
createPieChart('Blé tendre', 'ble-tendre-chart');
createPieChart('Orge et triticale', 'orge-triticale-chart');