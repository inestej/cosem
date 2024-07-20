async function fetchGeojsonData() {
    const url = 'http://catalog.industrie.gov.tn/dataset/9910662a-4594-453f-a710-b2f339e0d637/resource/1b7e3eba-b178-4902-83db-ef46f26e98a0/download/delegations.geojson';
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

function mapCodeToText(code) {
    switch (code) {
        case 1: return 'BD';
        case 2: return 'BT';
        case 3: return 'Tr';
        case 4: return 'Or';
        default: return 'Unknown';
    }
}

async function createMap() {
    const governorates = ['Manubah', 'Bizerte', 'Zaghouan', 'Siliana', 'Ben Arous', 'Béja', 'Jendouba', 'Le Kef', 'Ariana'];
    const data = await fetchGeojsonData();
    const features = data.features.filter(feature => governorates.includes(feature.properties.gov_name_f));
    
    // Generate random values
    const randomSeed = 42;
    Math.seedrandom(randomSeed);
    const cerealeCodes = features.map(() => Math.floor(Math.random() * 4) + 1);
    const varieteCodes = features.map(() => Math.floor(Math.random() * 12) + 1);
    const superficies = features.map(() => Math.floor(Math.random() * 91) + 10);
    const productions = features.map(() => Math.floor(Math.random() * 4981) + 20);

    // Add new properties
    features.forEach((feature, index) => {
        feature.properties.code_cereale = cerealeCodes[index];
        feature.properties.code_variete = varieteCodes[index];
        feature.properties.superficie = superficies[index];
        feature.properties.production = productions[index];
        feature.properties.cereale_text = mapCodeToText(cerealeCodes[index]);
    });

    const geojson = {
        type: 'FeatureCollection',
        features: features
    };

    const dataTrace = {
        type: 'choropleth',
        geojson: geojson,
        locations: features.map((_, index) => index),
        z: features.map(feature => feature.properties.production),
        colorscale: 'YlGn',
        text: features.map(feature => `Cereale Type: ${feature.properties.cereale_text}<br>Production: ${feature.properties.production}`),
        hoverinfo: 'text',
        colorbar: {
            title: 'Production',
            tickvals: [Math.min(...productions), Math.max(...productions)],
            ticktext: [Math.min(...productions), Math.max(...productions)],
            x: 1.05,
            xanchor: 'left',
            y: 0.5,
            yanchor: 'middle'
        }
    };

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

    Plotly.newPlot('map', [dataTrace], layout);
}

// Call the createMap function to render the map
createMap();

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

    // Debugging: log the grouped data
    console.log(governorateData);

    const governorateDataMelted = [];
    Object.keys(governorateData).forEach(governorate => {
        governorateDataMelted.push({ gov_name_f_y: governorate, Cereal: 'BD', Quantity: governorateData[governorate].BD });
        governorateDataMelted.push({ gov_name_f_y: governorate, Cereal: 'BT', Quantity: governorateData[governorate].BT });
        governorateDataMelted.push({ gov_name_f_y: governorate, Cereal: 'Tr', Quantity: governorateData[governorate].Tr });
        governorateDataMelted.push({ gov_name_f_y: governorate, Cereal: 'Or', Quantity: governorateData[governorate].Or });
    });

    // Debugging: log the melted data
    console.log(governorateDataMelted);

    // Create the bar chart
    const trace = {
        x: governorateDataMelted.map(item => item.gov_name_f_y),
        y: governorateDataMelted.map(item => item.Quantity),
        type: 'bar',
        text: governorateDataMelted.map(item => item.Cereal),
        hoverinfo: 'x+y+text',
        name: 'Cereal Production',
        marker: {
            color: governorateDataMelted.map(item => {
                switch (item.Cereal) {
                    case 'BD': return '#440154';
                    case 'BT': return '#3b528b';
                    case 'Tr': return '#21908d';
                    case 'Or': return '#5dc863';
                    default: return '#000000';
                }
            })
        }
    };

    const layout = {
        title: 'Cereal Production by Governorate - Simulated Data',
        xaxis: { title: 'Governorate', tickangle: -45 },
        yaxis: { title: 'Total Quantity' },
        barmode: 'group',
        plot_bgcolor: 'white'
    };

    Plotly.newPlot('histogram', [trace], layout);
}

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

    Plotly.newPlot('barchart', traces, layout);
}

// Call the createBarChart function to render the bar chart
createBarChart();


window.onload = function() {
    const ctxProduction = document.getElementById('productionChart').getContext('2d');
    new Chart(ctxProduction, productionConfig);

    const ctxTrend = document.getElementById('trendChart').getContext('2d');
    new Chart(ctxTrend, trendConfig);

    const ctxDistribution = document.getElementById('distributionChart').getContext('2d');
    new Chart(ctxDistribution, distributionConfig);

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