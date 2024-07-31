
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
// Function to create pie chart
async function createPieChart() {
    // Load the CSV file
    const response = await fetch('static/Firme_de_Krib.csv');
    const dataText = await response.text();
    const cerealData = Papa.parse(dataText, { header: true }).data;

    // Map data to Plotly.js format
    const values = cerealData.map(item => parseFloat(item['Superficie semée (ha)']));
    const labels = cerealData.map(item => item['Type Groupe']);
    const colorMap = {
        'Blé dur': '#00441b',
        'Blé tendre': '#006d2c',
        'Orge': '#31a354',
        'Triticale': '#a1d99b',
        'Autres': '#c2c2c2'
    };
    const colors = labels.map(label => colorMap[label]);

    const pieData = [{
        values: values,
        labels: labels,
        type: 'pie',
        textinfo: 'label+percent',
        textposition: 'outside',
        automargin: true,
        marker: {
            colors: colors
        }
    }];

    const layout = {
        title: 'COSEM 2023 : Répartition de la Superficie Semée (ha) à El Krib',
        showlegend: true
    };

    Plotly.newPlot('pieChart', pieData, layout);
}

// Create the pie chart
createPieChart();
// Function to create bar chart
async function createBarChart() {
    // Load the CSV file
    const response = await fetch('static/Firme_de_Krib.csv');
    const dataText = await response.text();
    const cerealData = Papa.parse(dataText, { header: true }).data;

    // Map data to Plotly.js format
    const x = cerealData.map(item => item['Type Groupe']);
    const y = cerealData.map(item => parseFloat(item['Quantités collectées (q)']));
    const colors = cerealData.map(item => parseFloat(item['Superficie semée (ha)']));

    const barData = [{
        x: x,
        y: y,
        type: 'bar',
        marker: {
            color: colors,
            colorscale: 'Greens',
            colorbar: {
                title: 'Superficie semée (ha)'
            }
        },
        text: colors.map(color => `Superficie semée (ha): ${color}`),
        hoverinfo: 'x+y+text'
    }];

    const layout = {
        title: 'COSEM 2023 : Quantités Collectées (q) par Type de Culture à El Krib',
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

// Create the bar chart
createBarChart();

// Function to create pie chart
async function createPieChart1() {
    // Load the CSV file
    const response = await fetch('static/Firme_de_Krib.csv');
    const dataText = await response.text();
    const cerealData = Papa.parse(dataText, { header: true }).data;

    // Map data to Plotly.js format
    const values = cerealData.map(item => parseFloat(item['Quantités collectées (q)']));
    const labels = cerealData.map(item => item['Type Groupe']);
    const colorMap = {
        'Blé dur': '#00441b',
        'Blé tendre': '#006d2c',
        'Orge': '#31a354',
        'Triticale': '#a1d99b',
        'Autres': '#c2c2c2'
    };
    const colors = labels.map(label => colorMap[label]);

    const pieData = [{
        values: values,
        labels: labels,
        type: 'pie',
        textinfo: 'label+percent',
        textposition: 'outside',
        automargin: true,
        marker: {
            colors: colors
        }
    }];

    const layout = {
        title: 'COSEM 2023 : Répartition des Quantités Collectées (q) à El Krib',
        showlegend: true
    };

    Plotly.newPlot('pieChart1', pieData, layout);
}

// Create the pie chart
createPieChart1();

// Function to create bar chart
async function createBarChart1() {
    // Load the CSV file
    const response = await fetch('static/Firme_de_Krib.csv');
    const dataText = await response.text();
    const cerealData = Papa.parse(dataText, { header: true }).data;

    // Map data to Plotly.js format
    const x = cerealData.map(item => item['Type Groupe']);
    const y = cerealData.map(item => parseFloat(item['Rendement (q/ha)']));
    const colors = cerealData.map(item => parseFloat(item['Rendement (q/ha)']));

    const barData = [{
        x: x,
        y: y,
        type: 'bar',
        marker: {
            color: colors,
            colorscale: 'Reds',
            colorbar: {
                title: 'Rendement (q/ha)'
            }
        },
        text: colors.map(color => `Rendement (q/ha): ${color}`),
        hoverinfo: 'x+y+text'
    }];

    const layout = {
        title: 'COSEM 2023 : Rendement (q/ha) par Type de Culture à El Krib avec Graduation de Couleur',
        xaxis: {
            title: 'Type de Culture'
        },
        yaxis: {
            title: 'Rendement (q/ha)'
        },
        barmode: 'group'
    };

    Plotly.newPlot('barChart1', barData, layout);
}

// Create the bar chart
createBarChart1();


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
fetchAndDisplayCSV('static/Firme_de_Krib.csv', 'myTable1', 'tableHeader1', 'tableBody1');

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
    


