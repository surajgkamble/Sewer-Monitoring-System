const API_URL = "http://192.168.43.81:5000/api/data";

let map;
let marker;
let markersLayer;
let currentMarker;
let dangerCircle;

let chart;
let pieChart;
let areaChart;

const matrixLocations = {
    2: [19.0760, 72.8777],
    3: [19.0330, 73.0297],
    4: [19.2183, 72.9781],
    5: [19.1136, 72.8697],
    6: [19.1197, 72.8464],
    7: [19.0825, 73.0297],
    8: [19.2403, 73.1305],
    9: [19.1645, 72.8490],
    10:[19.1964, 73.0110]
};

let matrixState = {};
let initialized = false;

function smoothChange(value, min, max, step) {
    let change = (Math.random() * step * 2) - step;
    value += change;

    if (value < min) value = min;
    if (value > max) value = max;

    return Math.round(value);
}

function initializeMatrices() {
    let matrices = [2,3,4,5,6,7,8,9,10];
    let shuffled = matrices.sort(() => Math.random() - 0.5);

    let normalSet = shuffled.slice(0, 3);
    let warningSet = shuffled.slice(3, 6);
    let criticalSet = shuffled.slice(6, 9);

    matrices.forEach(id => {
        let type;

        if (normalSet.includes(id)) type = "normal";
        else if (warningSet.includes(id)) type = "warning";
        else type = "critical";

        matrixState[id] = {
            type: type,
            gas: type === "normal" ? 60 : type === "warning" ? 140 : 220,
            water: type === "normal" ? 20 : type === "warning" ? 50 : 80
        };
    });

    initialized = true;
}

function generateDummyData(matrixId) {

    if (!initialized) initializeMatrices();

    let m = matrixState[matrixId];

    if (m.type === "normal") {
        m.gas = smoothChange(m.gas, 20, 120, 2);
        m.water = smoothChange(m.water, 10, 40, 0.3);
    }

    if (m.type === "warning") {
        m.gas = smoothChange(m.gas, 120, 200, 2);
        m.water = smoothChange(m.water, 40, 70, 0.3);
    }

    if (m.type === "critical") {
        m.gas = smoothChange(m.gas, 200, 260, 2);
        m.water = smoothChange(m.water, 70, 100, 0.5);
    }

    let risk = "NORMAL";
    let decision = "Monitor";

    if (m.gas >= 200 || m.water >= 70) {
        risk = "CRITICAL";
        decision = "Immediate Action";
    } 
    else if (m.gas >= 120 || m.water >= 40) {
        risk = "WARNING";
        decision = "Schedule Maintenance";
    }

    return {
        gas: m.gas,
        water: m.water,
        risk,
        decision,
        time: new Date().toLocaleTimeString()
    };
}

function handleRoleUI() {
    const role = localStorage.getItem("activeRole");

    const monitor = document.getElementById("section-monitor");
    const field = document.getElementById("section-field");
    const supervisor = document.getElementById("section-supervisor");

    if (monitor) monitor.style.display = "none";
    if (field) field.style.display = "none";
    if (supervisor) supervisor.style.display = "none";

    if (role === "field") {
        field.style.display = "block";
    } 
    else if (role === "supervisor") {
        supervisor.style.display = "block";
        initPieCharts();
    } 
    else {
        monitor.style.display = "block";
        initMap();
    }
}

function initMap() {
    if (map) return;

    map = L.map('map').setView([19.0178, 72.8478], 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap & Carto',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    markersLayer = L.markerClusterGroup();

    Object.keys(matrixLocations).forEach(key => {
        const coords = matrixLocations[key];
        const m = L.marker(coords).bindPopup(`📍 Matrix No. ${key}`);
        markersLayer.addLayer(m);
    });

    map.addLayer(markersLayer);

    marker = L.marker([19.0178, 72.8478]).addTo(map);

    if (navigator.geolocation) {
        navigator.geolocation.watchPosition((pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            marker.setLatLng([lat, lng]);
            marker.bindPopup("📍 Matrix No. 1");
        });
    }
}

function setupMatrixSelector() {
    const select = document.getElementById("matrixSelect");
    if (!select) return;

    select.addEventListener("change", (e) => {
        const val = e.target.value;

        if (currentMarker) map.removeLayer(currentMarker);
        if (dangerCircle) map.removeLayer(dangerCircle);

        if (val === "1") {

            if (navigator.geolocation) {

                navigator.geolocation.getCurrentPosition((pos) => {

                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;

                    map.flyTo([lat, lng], 15, { duration: 0.5 });

                    currentMarker = L.marker([lat, lng]).addTo(map);
                    currentMarker.bindPopup("📍 Matrix No. 1").openPopup();

                }, null, {
                    enableHighAccuracy: true,
                    timeout: 1500
                });

            }

        } else {
            const coords = matrixLocations[val];
            if (coords) {
                moveMap(coords[0], coords[1], `Matrix No. ${val}`);
            }
        }
    });
}

function moveMap(lat, lng, name, isLive = false) {
    map.flyTo([lat, lng], 15, {
        duration: isLive ? 0.5 : 1.2
    });

    currentMarker = L.marker([lat, lng]).addTo(map);
    currentMarker.bindPopup("📍 " + name).openPopup();
}

function showDangerZone(lat, lng, risk) {
    if (dangerCircle) map.removeLayer(dangerCircle);

    if (risk === "CRITICAL") {
        dangerCircle = L.circle([lat, lng], {
            color: "red",
            fillColor: "#ff0000",
            fillOpacity: 0.3,
            radius: 300
        }).addTo(map);
    }
}

function updateUI(d) {
    document.getElementById("gas").innerText = d.gas + " ppm";
    document.getElementById("water").innerText = d.water + " mm";
    document.getElementById("risk").innerText = d.risk;
    document.getElementById("decision").innerText = d.decision;
    document.getElementById("time").innerText = d.time;

    const riskEl = document.getElementById("risk");

    riskEl.classList.remove("status-normal", "status-warning", "status-critical");

    if (d.risk === "NORMAL") riskEl.classList.add("status-normal");
    else if (d.risk === "WARNING") riskEl.classList.add("status-warning");
    else riskEl.classList.add("status-critical");
}

async function fetchData() {
    try {
        const selected = document.getElementById("matrixSelect")?.value;

if (selected === "1") {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (data.length === 0) {
        updateUI({
            gas: "--",
            water: "--",
            risk: "OFFLINE",
            decision: "Device is Offline",
            time: "-"
        });
        return;
    }

    const d = data[0];
    updateUI(d);
    initChart(data);
} 
        else {
            const dummy = generateDummyData(selected);
            updateUI(dummy);

            const coords = matrixLocations[selected];
            if (coords) {
                showDangerZone(coords[0], coords[1], dummy.risk);
            }
        }

    } catch (error) {
        console.log("Error fetching data:", error);
    }
}

function initChart(data) {
    const ctx = document.getElementById("trendChart");
    if (!ctx) return;

    const labels = data.map(d => d.time).reverse();
    const gasData = data.map(d => d.gas).reverse();
    const waterData = data.map(d => d.water).reverse();

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                { label: "Gas", data: gasData, borderColor: "red", tension: 0.4 },
                { label: "Water", data: waterData, borderColor: "blue", tension: 0.4 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function initPieCharts() {

    const ctx1 = document.getElementById("pieChart");
    if (ctx1 && !pieChart) {
        pieChart = new Chart(ctx1, {
            type: "pie",
            data: {
                labels: ["Jan", "Feb", "Mar", "Apr"],
                datasets: [{
                    data: [10, 7, 15, 5],
                    backgroundColor: ["red", "blue", "green", "orange"]
                }]
            }
        });
    }

    const ctx2 = document.getElementById("areaChart");
    if (ctx2 && !areaChart) {
        areaChart = new Chart(ctx2, {
            type: "pie",
            data: {
                labels: ["Mumbai", "Navi Mumbai", "Thane"],
                datasets: [{
                    data: [40, 30, 20],
                    backgroundColor: ["purple", "cyan", "yellow"]
                }]
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    handleRoleUI();
    fetchData();
    setupMatrixSelector();
    setInterval(fetchData, 5000);
});
