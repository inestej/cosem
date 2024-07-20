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
    const url = 'http://catalog.industrie.gov.tn/dataset/9910662a-4594-453f-a710-b2f339e0d637/resource/1b7e3eba-b178-4902-83db-ef46f26e98a0/download/delegations.geojson';
    const data = await fetchData(url);

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

    Plotly.newPlot('histogram', data, layout);
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

    Plotly.newPlot('barchart', traces, layout);
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
