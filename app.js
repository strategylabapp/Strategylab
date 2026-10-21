
function saveSimulation() {
    const getValue = id => document.getElementById(id)?.value ?? "";

    const simulation = {
        circuit: getValue("circuit"),
        weather: getValue("weather"),
        tyre: getValue("tyre"),
        aggression: getValue("aggression"),
        stops: getValue("stops")
    };

    const match = simulation.stops.match(/\d+/);
    const plannedStops = match ? Math.max(0, Math.min(3, Number(match[0]))) : 1;
    const totalLaps = 57;

    const wear = { soft: 70, medium: 55, hard: 40 };

    if (["Barcelona-Catalunya", "Bahrain", "Qatar"].includes(simulation.circuit)) {
        wear.soft = 85;
        wear.medium = 70;
        wear.hard = 55;
    } else if (["Monaco", "Canada"].includes(simulation.circuit)) {
        wear.soft = 55;
        wear.medium = 40;
        wear.hard = 30;
    }

    let confidence = 85;
    let engineer = "";
    let raceControl = "🟢 Green Flag";
    let raceLap = "-";
    let raceReason = "No incidents reported.";
    let raceMessage = "Race proceeded normally.";

    const tyreNames = {
        "Soft": "SOFT",
        "Medium": "MEDIUM",
        "Hard": "HARD",
        "Intermediate": "INTERMEDIATE",
        "Full Wet": "FULL WET"
    };

    const tyreEmoji = {
        "SOFT": "🔴",
        "MEDIUM": "🟡",
        "HARD": "⚪",
        "INTERMEDIATE": "🟢",
        "FULL WET": "🔵"
    };

    let startingTyre = tyreNames[simulation.tyre] || "MEDIUM";

    if (simulation.weather === "Rain" &&
        !["INTERMEDIATE", "FULL WET"].includes(startingTyre)) {
        startingTyre = "INTERMEDIATE";
    }

    if (simulation.weather === "Mixed Conditions" &&
        ["SOFT", "MEDIUM", "HARD"].includes(startingTyre)) {
        startingTyre = "INTERMEDIATE";
    }

    const stintCount = plannedStops + 1;
    const baseLength = Math.floor(totalLaps / stintCount);
    const stints = [];
    const pitLaps = [];

    let stintStart = 1;

    for (let i = 0; i < stintCount; i++) {
        const stintEnd = i === stintCount - 1
            ? totalLaps
            : (i + 1) * baseLength;

        let tyre;

        if (i === 0) {
            tyre = startingTyre;
        } else if (simulation.weather === "Rain") {
            tyre = i % 2 === 1 ? "FULL WET" : "INTERMEDIATE";
        } else if (simulation.weather === "Mixed Conditions") {
            tyre = i === stintCount - 1 ? "MEDIUM" : "INTERMEDIATE";
        } else {
            const sequence = ["SOFT", "MEDIUM", "HARD"];
            const startIndex = sequence.indexOf(startingTyre);
            const index = startIndex < 0 ? i % 3 : (startIndex + i) % 3;
            tyre = sequence[index];
        }

        stints.push({ tyre, start: stintStart, end: stintEnd });

        if (i < plannedStops) pitLaps.push(stintEnd);
        stintStart = stintEnd + 1;
    }

    const strategy = stints.map(s => s.tyre).join(" → ");
    const formatStint = s =>
        `${tyreEmoji[s.tyre] || "⚫"} ${s.tyre} | Lap ${s.start}-${s.end}`;

    const stint1 = formatStint(stints[0]);
    const stint2 = stints[1] ? formatStint(stints[1]) : "";
    const stint3 = stints[2] ? formatStint(stints[2]) : "";
    const pit1 = pitLaps.length ? `Lap ${pitLaps[0]}` : "-";
    const pit2 = pitLaps.length > 1 ? `Lap ${pitLaps[1]}` : "-";

    if (simulation.weather === "Rain") {
        engineer = "Wet race: monitor grip and changing track conditions.";
        confidence = 78;
    } else if (simulation.weather === "Mixed Conditions") {
        engineer = "Mixed conditions: monitor the drying line before changing tyres.";
        confidence = 80;
    } else if (simulation.aggression === "Aggressive") {
        engineer = "Aggressive approach: push when grip allows, but manage tyre wear.";
        confidence = 82;
    } else if (simulation.aggression === "Conservative") {
        engineer = "Conservative approach: prioritise tyre life and consistent lap times.";
        confidence = 88;
    } else {
        engineer = "Balanced approach: combine consistent pace with tyre management.";
        confidence = 85;
    }

    const randomEvent = Math.random();

    if (randomEvent < 0.10) {
        raceControl = "🚨 Safety Car";
        const events = [
            [12, "Multi-car collision"],
            [18, "Car stopped on track"],
            [22, "Heavy crash"],
            [31, "Mechanical failure"],
            [40, "Barrier damage"]
        ];
        const event = events[Math.floor(Math.random() * events.length)];
        raceLap = `Lap ${event[0]}`;
        raceReason = event[1];
        raceMessage = "Review whether a pit stop under Safety Car is beneficial.";
    } else if (randomEvent < 0.30) {
        raceControl = "🟡 Virtual Safety Car";
        const events = [
            [10, "Debris on track"],
            [17, "Slow car"],
            [24, "Minor collision"],
            [29, "Recovery vehicle"],
            [36, "Track inspection"]
        ];
        const event = events[Math.floor(Math.random() * events.length)];
        raceLap = `Lap ${event[0]}`;
        raceReason = event[1];
        raceMessage = "Review whether a pit stop under VSC is beneficial.";
    }

    let raceScore = 50;

    if (simulation.aggression === "Aggressive") raceScore += 5;
    else if (simulation.aggression === "Conservative") raceScore -= 2;
    else raceScore += 2;

    if (simulation.weather === "Rain") {
        raceScore += ["INTERMEDIATE", "FULL WET"].includes(startingTyre) ? 5 : -12;
    } else if (simulation.weather === "Mixed Conditions") {
        raceScore += startingTyre === "INTERMEDIATE" ? 4 : -3;
    } else {
        if (startingTyre === "SOFT") raceScore += 2 - wear.soft / 35;
        if (startingTyre === "MEDIUM") raceScore += 3 - wear.medium / 35;
        if (startingTyre === "HARD") raceScore += 1 - wear.hard / 45;
        if (["INTERMEDIATE", "FULL WET"].includes(startingTyre)) raceScore -= 10;
    }

    if (plannedStops === 0) raceScore -= 5;
    if (plannedStops === 1) raceScore += 3;
    if (plannedStops === 2) raceScore += 2;
    if (plannedStops === 3) raceScore -= 2;

    if (raceControl === "🚨 Safety Car") raceScore += 2;
    if (raceControl === "🟡 Virtual Safety Car") raceScore += 1;

    raceScore += Math.random() * 40 - 20;

    let finishingPosition = Math.round(10 - (raceScore - 50) / 3);
    finishingPosition = Math.max(1, Math.min(20, finishingPosition));
    const position = `P${finishingPosition}`;

    const result = {
        raceControl,
        raceLap,
        raceReason,
        raceMessage,
        ...simulation,
        plannedStops,
        strategy,
        engineer,
        confidence,
        position,
        stint1,
        stint2,
        stint3,
        pit1,
        pit2,
        wear
    };

    localStorage.setItem("strategySimulation", JSON.stringify(result));
    window.location.href = "results.html";
}
