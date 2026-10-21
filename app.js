
/* ==========================================
   StrategyLab - Strategy Engine
   Version 1.1 - Improved Race Results
========================================== */

function saveSimulation() {
    const simulation = {
        circuit: document.getElementById("circuit").value,
        weather: document.getElementById("weather").value,
        tyre: document.getElementById("tyre").value,
        aggression: document.getElementById("aggression").value,
        stops: document.getElementById("stops").value
    };

    // CIRCUIT TYRE WEAR
    let wear = {
        soft: 70,
        medium: 55,
        hard: 40
    };

    if (
        simulation.circuit === "Barcelona-Catalunya" ||
        simulation.circuit === "Bahrain" ||
        simulation.circuit === "Qatar"
    ) {
        wear.soft = 85;
        wear.medium = 70;
        wear.hard = 55;
    } else if (
        simulation.circuit === "Monaco" ||
        simulation.circuit === "Canada"
    ) {
        wear.soft = 55;
        wear.medium = 40;
        wear.hard = 30;
    }

    let strategy = "";
    let engineer = "";
    let confidence = 85;

    let raceControl = "🟢 Green Flag";
    let raceLap = "-";
    let raceReason = "No incidents reported.";
    let raceMessage = "Race proceeded normally.";

    let stint1 = "";
    let stint2 = "";
    let stint3 = "";
    let pit1 = "-";
    let pit2 = "-";

    // WEATHER AND STRATEGY
    if (simulation.weather === "Rain") {
        strategy = "INTERMEDIATE → FULL WET";
        stint1 = "🟢 Intermediate | Lap 1-22";
        stint2 = "🔵 Full Wet | Lap 23-Finish";
        pit1 = "Lap 22";

        engineer =
            "Rain conditions detected. Prioritise grip and monitor track evolution.";
        confidence = 88;

    } else if (simulation.weather === "Mixed Conditions") {
        strategy = "INTERMEDIATE → MEDIUM";
        stint1 = "🟢 Intermediate | Lap 1-18";
        stint2 = "🟡 Medium | Lap 19-Finish";
        pit1 = "Lap 18";

        engineer =
            "Mixed conditions. Adapt strategy depending on track drying speed.";
        confidence = 82;

    } else {
        if (simulation.aggression === "Aggressive") {
            strategy = "SOFT → MEDIUM → SOFT";
            stint1 = "🔴 Soft | Lap 1-15";
            stint2 = "🟡 Medium | Lap 16-42";
            stint3 = "🔴 Soft | Lap 43-Finish";
            pit1 = "Lap 15";
            pit2 = "Lap 42";

            engineer =
                "High degradation risk. Attack early but manage tyre temperature.";
            confidence = 84;

        } else if (simulation.aggression === "Conservative") {
            strategy = "MEDIUM → HARD";
            stint1 = "🟡 Medium | Lap 1-30";
            stint2 = "⚪ Hard | Lap 31-Finish";
            pit1 = "Lap 30";

            engineer =
                "Low risk strategy. Hard tyre selected to reduce degradation.";
            confidence = 90;

        } else {
            strategy = "MEDIUM → HARD";
            stint1 = "🟡 Medium | Lap 1-28";
            stint2 = "⚪ Hard | Lap 29-Finish";
            pit1 = "Lap 28";

            engineer =
                "Balanced strategy. Medium tyre offers the best compromise.";
            confidence = 86;
        }
    }

    // RACE CONTROL
    const randomEvent = Math.random();

    if (randomEvent < 0.10) {
        raceControl = "🚨 Safety Car";

        const scLaps = [12, 18, 22, 31, 40];
        const scReasons = [
            "Multi-car collision",
            "Car stopped on track",
            "Heavy crash",
            "Mechanical failure",
            "Barrier damage"
        ];

        const randomIndex = Math.floor(
            Math.random() * scLaps.length
        );

        raceLap = "Lap " + scLaps[randomIndex];
        raceReason = scReasons[randomIndex];
        raceMessage = "Consider a pit stop under Safety Car conditions.";

        pit1 = raceLap;

    } else if (randomEvent < 0.30) {
        raceControl = "🟡 Virtual Safety Car";

        const vscLaps = [10, 17, 24, 29, 36];
        const vscReasons = [
            "Debris on track",
            "Slow car",
            "Minor collision",
            "Recovery vehicle",
            "Track inspection"
        ];

        const randomIndex = Math.floor(
            Math.random() * vscLaps.length
        );

        raceLap = "Lap " + vscLaps[randomIndex];
        raceReason = vscReasons[randomIndex];
        raceMessage = "A pit stop may cost less time under VSC.";

        pit1 = raceLap;
    }

    // IMPROVED FINISHING POSITION CALCULATION
    // This is a simplified model, not real lap-time simulation.

    let raceScore = 50;

    // Driving approach
    if (simulation.aggression === "Aggressive") {
        raceScore += 7;
    } else if (simulation.aggression === "Conservative") {
        raceScore -= 3;
    } else {
        raceScore += 2;
    }

    // Tyre choice and degradation
    const tyre = simulation.tyre.toLowerCase();

    if (simulation.weather === "Rain") {
        if (tyre.includes("wet") || tyre.includes("inter")) {
            raceScore += 7;
        } else {
            raceScore -= 8;
        }
    } else if (simulation.weather === "Mixed Conditions") {
        if (tyre.includes("inter")) {
            raceScore += 5;
        } else if (
            tyre.includes("soft") ||
            tyre.includes("medium") ||
            tyre.includes("hard")
        ) {
            raceScore -= 2;
        }
    } else {
        if (tyre.includes("soft")) {
            raceScore += 4;
            raceScore -= wear.soft / 25;
        } else if (tyre.includes("medium")) {
            raceScore += 3;
            raceScore -= wear.medium / 35;
        } else if (tyre.includes("hard")) {
            raceScore += 1;
            raceScore -= wear.hard / 45;
        }
    }

    // Pit-stop choice: reward sensible one- or two-stop plans.
    const stopText = simulation.stops.toLowerCase();
    const stopNumber = parseInt(stopText, 10);

    if (!Number.isNaN(stopNumber)) {
        if (stopNumber === 1 || stopNumber === 2) {
            raceScore += 3;
        } else if (stopNumber >= 3) {
            raceScore -= 2;
        } else if (stopNumber === 0) {
            raceScore -= 5;
        }
    } else if (stopText.includes("one") || stopText.includes("two")) {
        raceScore += 2;
    }

    // Incident influence: no automatic position promotion.
    if (raceControl === "🚨 Safety Car") {
        raceScore += 2;
    } else if (raceControl === "🟡 Virtual Safety Car") {
        raceScore += 1;
    }

    // Race-to-race variation
    raceScore += Math.random() * 60 - 30;

    // Convert score into a finishing position from P1 to P20
    let finishingPosition = Math.round(
        10 - (raceScore - 50) / 3.5
    );

    finishingPosition = Math.max(
        1,
        Math.min(20, finishingPosition)
    );

    const position = "P" + finishingPosition;

    // SAVE RESULT
    const result = {
        raceControl: raceControl,
        raceLap: raceLap,
        raceReason: raceReason,
        raceMessage: raceMessage,

        ...simulation,

        strategy: strategy,
        engineer: engineer,
        confidence: confidence,
        position: position,

        stint1: stint1,
        stint2: stint2,
        stint3: stint3,

        pit1: pit1,
        pit2: pit2,

        wear: wear
    };

    localStorage.setItem(
        "strategySimulation",
        JSON.stringify(result)
    );

    window.location.href = "results.html";
}
