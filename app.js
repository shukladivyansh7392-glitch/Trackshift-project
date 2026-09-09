// ==========================================
// TRACKSHIFT FRONTEND
// ==========================================


// ==========================================
// CHART
// ==========================================

const ctx = document
    .getElementById("trendsChart")
    .getContext("2d");

const trendsChart = new Chart(ctx, {

    type: "line",

    data: {

        labels: [
            "Lap 12",
            "Lap 13",
            "Lap 14",
            "Lap 15",
            "Lap 16",
            "Lap 17",
            "Lap 18"
        ],

        datasets: [

            {
                label: "You (Car A)",

                data: [
                    240,
                    250,
                    255,
                    270,
                    275,
                    280,
                    284
                ],

                borderColor: "#0088ff",
                tension: 0.3
            },

            {
                label: "Opponent (Car B)",

                data: [
                    230,
                    235,
                    240,
                    250,
                    245,
                    255,
                    260
                ],

                borderColor: "#ff9100",
                tension: 0.3
            }

        ]
    },

    options: {

        responsive: true,
        maintainAspectRatio: false,

        plugins: {
            legend: {
                display: false
            }
        },

        scales: {

            x: {
                grid: {
                    display: false
                },

                ticks: {
                    color: "#8a99ad",
                    font: {
                        size: 10
                    }
                }
            },

            y: {

                grid: {
                    color: "#1a243d"
                },

                ticks: {
                    color: "#8a99ad",
                    font: {
                        size: 10
                    }
                }
            }
        }
    }
});


// ==========================================
// GAUGE
// ==========================================

function drawGauge(canvasId, percent, color) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const size = canvas.width;

    const stroke = 8;

    const radius = (size - stroke) / 2;

    ctx.clearRect(0, 0, size, size);


    // Background

    ctx.beginPath();

    ctx.arc(
        size / 2,
        size / 2,
        radius,
        0,
        2 * Math.PI
    );

    ctx.strokeStyle = "#1a243d";

    ctx.lineWidth = stroke;

    ctx.stroke();


    // Progress

    ctx.beginPath();

    ctx.arc(
        size / 2,
        size / 2,
        radius,
        -Math.PI / 2,
        (-Math.PI / 2) +
        (2 * Math.PI * (percent / 100))
    );

    ctx.strokeStyle = color;

    ctx.lineWidth = stroke;

    ctx.lineCap = "round";

    ctx.stroke();
}


// ==========================================
// SCREEN GLOW
// ==========================================

function applyScreenGlow(action) {

    const overlay =
        document.getElementById("glow-overlay");

    const banner =
        document.getElementById("action-banner");

    const actionText =
        document.getElementById("action-text");


    overlay.className = "glow-overlay";


    if (action === "ATTACK") {

        overlay.classList.add("glow-attack");

        banner.style.background = "#ff1744";

        banner.style.color = "#fff";

        actionText.innerText =
            "⚡ ATTACK NOW";

    }


    else if (action === "HOLD") {

        overlay.classList.add("glow-hold");

        banner.style.background = "#ffb300";

        banner.style.color = "#000";

        actionText.innerText =
            "⏸ HOLD POSITION";

    }


    else if (action === "SAVE") {

        overlay.classList.add("glow-save");

        banner.style.background = "#00e676";

        banner.style.color = "#000";

        actionText.innerText =
            "🔋 SAVE ENERGY";
    }
}


// ==========================================
// UPDATE REASONS
// ==========================================

function updateReasons(reasons) {

    const list =
        document.getElementById("reasons-list");

    if (!list || !reasons) return;

    list.innerHTML = "";

    reasons.forEach(reason => {

        const li = document.createElement("li");

        li.innerHTML = "✔ " + reason;

        list.appendChild(li);
    });
}


// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateDashboardUI(data) {


    // Speed

    document.getElementById("hud-speed")
        .innerText = data.speed;

    document.getElementById("telemetry-speed")
        .innerHTML =
        `${data.speed} <small>km/h</small>`;


    // Battery

    document.getElementById("hud-battery")
        .innerText =
        data.soc + "%";

    document.getElementById("telemetry-soc")
        .innerText =
        data.soc + "%";


    // Gap

    document.getElementById("telemetry-gap")
        .innerHTML =
        `${data.gap.toFixed(2)} <small>s</small>`;

    document.getElementById("order-gap")
        .innerText =
        `${data.gap.toFixed(2)}s`;


    // Closing speed

    document.getElementById("telemetry-closing")
        .innerHTML =
        `+${data.closing_speed} <small>km/h</small>`;


    // Tyre

    document.getElementById("telemetry-tyre")
        .innerText =
        data.tyre + "%";


    // ======================================
    // GAUGES
    // ======================================

    drawGauge(
        "gaugeOvertake",
        data.overtake_prob,
        "#00e676"
    );

    document.getElementById("val-overtake")
        .innerText =
        data.overtake_prob + "%";


    drawGauge(
        "gaugeEnergy",
        data.energy_req,
        "#0088ff"
    );

    document.getElementById("val-energy")
        .innerText =
        data.energy_req + "%";


    drawGauge(
        "gaugeRisk",
        data.risk_score,
        "#d500f9"
    );

    document.getElementById("val-risk")
        .innerText =
        data.risk_score + "%";


    // ======================================
    // CONFIDENCE
    // ======================================

    document.getElementById("bar-confidence")
        .style.width =
        data.confidence + "%";

    document.getElementById("val-confidence")
        .innerText =
        data.confidence + "%";


    // ======================================
    // DEPLOYMENT
    // ======================================

    document.getElementById("bar-deployment")
        .style.width =
        data.deployment + "%";

    document.getElementById("val-deployment")
        .innerText =
        data.deployment + "%";


    // ======================================
    // AI ACTION
    // ======================================

    applyScreenGlow(data.action);


    // ======================================
    // REASONS
    // ======================================

    updateReasons(data.reasons);


    // ======================================
    // CHART UPDATE
    // ======================================

    trendsChart.data.labels.push(
        "Live"
    );

    trendsChart.data.datasets[0]
        .data.push(data.speed);

    trendsChart.data.datasets[1]
        .data.push(data.speed - data.closing_speed);


    // Keep chart small

    if (trendsChart.data.labels.length > 12) {

        trendsChart.data.labels.shift();

        trendsChart.data.datasets.forEach(
            dataset => dataset.data.shift()
        );
    }

    trendsChart.update("none");
}


// ==========================================
// WEBSOCKET
// ==========================================

function connectWebSocket() {

    console.log(
        "Connecting to TrackShift backend..."
    );


    const ws =
        new WebSocket(
            "ws://127.0.0.1:8000/ws/telemetry"
        );


    ws.onopen = function () {

        console.log(
            "✅ TrackShift Backend Connected"
        );
    };


    ws.onmessage = function (event) {

        const data =
            JSON.parse(event.data);

        console.log(
            "Telemetry:",
            data
        );

        updateDashboardUI(data);
    };


    ws.onerror = function (error) {

        console.error(
            "❌ WebSocket Error",
            error
        );
    };


    ws.onclose = function () {

        console.log(
            "Backend disconnected. Reconnecting..."
        );

        setTimeout(
            connectWebSocket,
            2000
        );
    };
}


// ==========================================
// SIMULATOR
// ==========================================

function runSim() {

    const soc =
        parseInt(
            document.getElementById(
                "sim-soc"
            ).value
        );

    const tyre =
        parseInt(
            document.getElementById(
                "sim-tyre"
            ).value
        );

    const deploy =
        parseInt(
            document.getElementById(
                "sim-deploy"
            ).value
        );

    const defense =
        document.getElementById(
            "sim-defense"
        ).value;


    let defensePenalty = 0;

    if (defense === "Medium")
        defensePenalty = 10;

    if (defense === "High")
        defensePenalty = 20;


    const probability =
        Math.min(
            99,
            Math.max(
                5,
                Math.round(
                    (
                        soc +
                        tyre +
                        deploy -
                        defensePenalty
                    ) / 3
                )
            )
        );


    const energyCost =
        Math.round(
            deploy * 0.2
        );


    let risk = "Low";

    if (probability < 50)
        risk = "High";

    else if (probability < 70)
        risk = "Medium";


    document.getElementById(
        "sim-res-prob"
    ).innerText =
        probability + "%";


    document.getElementById(
        "sim-res-cost"
    ).innerText =
        energyCost + "%";


    document.getElementById(
        "sim-res-risk"
    ).innerText =
        risk;


    document.getElementById(
        "sim-res-gain"
    ).innerText =
        probability >= 70
            ? "+1"
            : "0";


    document.getElementById(
        "sim-res-badge"
    ).innerText =
        probability >= 70
            ? "ATTACK RECOMMENDED"
            : "HOLD RECOMMENDED";
}


// ==========================================
// SLIDER VALUES
// ==========================================

document.getElementById("sim-soc")
    .addEventListener("input", function () {

        document.getElementById(
            "sim-soc-val"
        ).innerText =
            this.value + "%";
    });


document.getElementById("sim-tyre")
    .addEventListener("input", function () {

        document.getElementById(
            "sim-tyre-val"
        ).innerText =
            this.value + "%";
    });


document.getElementById("sim-deploy")
    .addEventListener("input", function () {

        document.getElementById(
            "sim-deploy-val"
        ).innerText =
            this.value + "%";
    });


// ==========================================
// START
// ==========================================

window.onload = function () {

    drawGauge(
        "gaugeOvertake",
        87,
        "#00e676"
    );

    drawGauge(
        "gaugeEnergy",
        12,
        "#0088ff"
    );

    drawGauge(
        "gaugeRisk",
        18,
        "#d500f9"
    );

    connectWebSocket();
};