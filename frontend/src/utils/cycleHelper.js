export function calculateAverageCycle(dates) {
    if (dates.length < 2) return null;
    const sorted = dates.map(d => new Date(d)).sort((a, b) => a - b);
    let total = 0;
    for (let i = 1; i < sorted.length; i++) {
        total += (sorted[i] - sorted[i - 1]) / (1000 * 60 * 60 * 24);
    }
    return Math.round(total / (sorted.length - 1));
}

export function predictNextDate(dates, avg) {
    if (!avg || dates.length === 0) return null;
    const last = new Date(dates.sort().slice(-1)[0]);
    last.setDate(last.getDate() + avg);
    return last;
}

export function buildPredictionWindow(predicted) {
    const days = [];
    for (let i = -3; i <= 1; i++) {
        const d = new Date(predicted);
        d.setDate(d.getDate() + i);
        days.push(d.toISOString().split("T")[0]);
    }
    return days;
}
