
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
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const targetUrl = 'http://catalog.industrie.gov.tn/dataset/9910662a-4594-453f-a710-b2f339e0d637/resource/1b7e3eba-b178-4902-83db-ef46f26e98a0/download/delegations.geojson';
    const secureUrl = proxyUrl + targetUrl;
    
    const data = await fetchData(secureUrl);
    
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

createChoropleth()

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

    Plotly.newPlot('histogramtn', data, layout);
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

    Plotly.newPlot('barcharttn', traces, layout);
}

// Call the createBarChart function to render the bar chart
createBarChart();


window.onload = function() {
    // Initialize the map centered on Tunisia
    const map = L.map('map').setView([33.8869, 9.5375], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Leaflet Draw Control
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
        edit: {
            featureGroup: drawnItems
        },
        draw: {
            polygon: true,
            polyline: false,
            rectangle: false,
            circle: false,
            marker: false,
            circlemarker: false
        }
    });
    map.addControl(drawControl);

    // Handle the creation of drawn polygons
    map.on(L.Draw.Event.CREATED, function (event) {
        const layer = event.layer;
        drawnItems.addLayer(layer);

        // Store the coordinates of the polygon
        const polygonCoordinates = layer.getLatLngs()[0].map(coord => [coord.lat, coord.lng]);
        console.log('Polygon coordinates:', polygonCoordinates);

        // Send the coordinates to the server (Flask backend)
        fetch('/save_polygon', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ coordinates: polygonCoordinates })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Polygon saved:', data);
            if (data.status === 'success') {
                alert('Polygon has been successfully registered!');
            } else {
                alert('Failed to register the polygon. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error saving polygon:', error);
            alert('An error occurred while saving the polygon. Please try again.');
        });
    });
};

//Second section 
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Fetch the CSV file
        const response = await fetch('static/2021_2022data.csv');
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
        const semee = data.map(row => row['Superficie semée (ha)']);
        const acceptee = data.map(row => row['Superficie acceptée (ha)']);
        const refusee = data.map(row => row['Superficie refusée (ha)']);

        // Prepare Plotly data
        const plotData = [
            {
                x: types,
                y: semee,
                name: 'Superficie semée (ha)',
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
            title: 'Superficies Semées, Acceptées et Refusées par Type de Céréale',
            xaxis: { title: 'Type de Céréale' },
            yaxis: { title: 'Superficie (ha)' },
            barmode: 'group'
        };

        // Render Plotly chart
        Plotly.newPlot('histogram-2021', plotData, layout);
    } catch (error) {
        console.error('Error loading or parsing CSV file:', error);
    }
});

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Fetch the CSV file
        const response = await fetch('static/2021_2022data.csv');
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
        const quantities = filteredData.map(row => row['Quantité de semences pour multiplication (q)']);

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
            title: 'Quantité de Semences pour Multiplication par Type de Céréale (q)'
        };

        // Render Plotly pie chart
        Plotly.newPlot('pie-2021-mul', pieData, pieLayout);
    } catch (error) {
        console.error('Error loading or parsing CSV file:', error);
    }
});


document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Fetch the CSV file
        const response = await fetch('static/2021_2022data.csv');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        // Read the response text
        const dataText = await response.text();
        
        // Parse the CSV data
        const results = Papa.parse(dataText, { header: true, dynamicTyping: true });
        const data = results.data;

        // Extract relevant columns from data
        const types = data.map(row => row['Type']);
        const quantities = data.map(row => row['Quantité de semences pour multiplication (q)']);

        // Prepare Plotly data for bar chart
        const barData = [
            {
                x: types,
                y: quantities,
                type: 'bar',
                marker: {
                    color: quantities,
                    colorscale: 'YlOrBr'
                }
            }
        ];

        // Plotly layout for bar chart
        const barLayout = {
            title: 'Quantité de Semences pour Multiplication par Type de Céréale(q)',
            xaxis: { title: 'Type de Céréale' },
            yaxis: { title: 'Quantité (q)' }
        };

        // Render Plotly bar chart
        Plotly.newPlot('bar-2021-mul', barData, barLayout);
    } catch (error) {
        console.error('Error loading or parsing CSV file:', error);
    }
});
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Fetch the CSV file
        const response = await fetch('static/2021_2022data.csv');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        // Read the response text
        const dataText = await response.text();
        
        // Parse the CSV data
        const results = Papa.parse(dataText, { header: true, dynamicTyping: true });
        const data = results.data;

        // Extract relevant columns from data
        const types = data.map(row => row['Type']);
        const quantities = data.map(row => row['Quantités collectées (q)']);

        // Prepare Plotly data for bar chart
        const barData = [
            {
                x: types,
                y: quantities,
                type: 'bar',
                marker: {
                    color: quantities,
                    colorscale: 'YlOrBr'
                }
            }
        ];

        // Plotly layout for bar chart
        const barLayout = {
            title: 'Quantités Collectées par Type de Céréale',
            xaxis: { title: 'Type de Céréale' },
            yaxis: { title: 'Quantités Collectées (q)' }
        };

        // Render Plotly bar chart
        Plotly.newPlot('bar-2021', barData, barLayout);
    } catch (error) {
        console.error('Error loading or parsing CSV file:', error);
    }
});

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Fetch the CSV file
        const response = await fetch('static/2021_2022data.csv');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        // Read the response text
        const dataText = await response.text();
        
        // Parse the CSV data
        const results = Papa.parse(dataText, { header: true, dynamicTyping: true });
        const data = results.data;

        // Filter out rows where 'Type' is 'Total'
        const filteredData = data.filter(row => row['Type'] !== 'Total');

        // Extract relevant columns from data
        const types = filteredData.map(row => row['Type']);
        const quantities = filteredData.map(row => row['Quantités collectées (q)']);

        // Prepare colors for the pie chart
        const colors = ['#d9f0a3', '#addd8e', '#78c679'];

        // Prepare Plotly data for pie chart
        const pieData = [
            {
                values: quantities,
                labels: types,
                type: 'pie',
                marker: {
                    colors: colors
                }
            }
        ];

        // Plotly layout for pie chart
        const pieLayout = {
            title: 'Quantités Collectées par Type de Céréale'
        };

        // Render Plotly pie chart
        Plotly.newPlot('pie-2021', pieData, pieLayout);
    } catch (error) {
        console.error('Error loading or parsing CSV file:', error);
    }
});
