// Sample data for the bar chart
const productionData = {
    labels: ['Wheat', 'Rice', 'Corn', 'Soybeans', 'Barley'],
    datasets: [{
        label: 'Production (tons)',
        backgroundColor: ['#4CAF50', '#FFC107', '#2196F3', '#FF5722', '#9C27B0'],
        data: [1200, 1900, 3000, 500, 800],
    }]
};

const productionConfig = {
    type: 'bar',
    data: productionData,
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Crop Production Statistics'
            }
        }
    },
};

// Sample data for the line chart
const trendData = {
    labels: ['2016', '2017', '2018', '2019', '2020'],
    datasets: [
        {
            label: 'Wheat',
            borderColor: '#4CAF50',
            data: [1000, 1100, 1200, 1300, 1400],
            fill: false,
        },
        {
            label: 'Rice',
            borderColor: '#FFC107',
            data: [1500, 1600, 1700, 1800, 1900],
            fill: false,
        },
        {
            label: 'Corn',
            borderColor: '#2196F3',
            data: [2500, 2600, 2700, 2800, 3000],
            fill: false,
        },
        {
            label: 'Soybeans',
            borderColor: '#FF5722',
            data: [400, 450, 500, 550, 600],
            fill: false,
        },
        {
            label: 'Barley',
            borderColor: '#9C27B0',
            data: [600, 650, 700, 750, 800],
            fill: false,
        }
    ]
};

const trendConfig = {
    type: 'line',
    data: trendData,
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Crop Production Trends Over Time'
            }
        }
    },
};

// Sample data for the pie chart
const distributionData = {
    labels: ['Wheat', 'Rice', 'Corn', 'Soybeans', 'Barley'],
    datasets: [{
        label: 'Crop Distribution',
        backgroundColor: ['#4CAF50', '#FFC107', '#2196F3', '#FF5722', '#9C27B0'],
        data: [20, 30, 40, 5, 5],
    }]
};

const distributionConfig = {
    type: 'pie',
    data: distributionData,
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Crop Distribution'
            }
        }
    },
};

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
        const polygonCoordinates = layer.getLatLngs();
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
        })
        .catch(error => {
            console.error('Error saving polygon:', error);
        });
    });
};
