# Bench A/B: v7.4.0 vs stage-1

- A: `22acbd806adb` (typesugar loader); B: `c058cec532b1` (typesugar loader)
- Machine: Apple M4 Pro, 12 cores, 24 GB, darwin 25.6.0 arm64; Node v26.3.1
- Date: 2026-10-20T15:22:15.622Z to 2026-10-20T15:39:02.970Z
- Load average (1/5/15 min): start 4.72 4.60 5.41, end 2.55 2.97 3.87
- 5 rounds, interleaved A/B, one process at a time. Spread is the larger side's (max-min)/median.

| Package | Benchmark | A median ops/s | B median ops/s | Δ % | Spread % (A / B) | IQR % (A / B) | |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| turf-helpers | point + properties | 181,055,923 | 180,822,491 | -0.1 | 2.1 / 3.0 | 0.6 / 0.1 | noise: spread > Δ |
| turf-helpers | point | 182,366,838 | 180,127,364 | -1.2 | 1.5 / 3.3 | 0.6 / 0.4 | noise: spread > Δ |
| turf-helpers | round | 184,464,854 | 184,236,956 | -0.1 | 1.6 / 3.3 | 0.7 / 1.5 | noise: spread > Δ |
| turf-helpers | lineString | 181,069,596 | 182,133,391 | +0.6 | 3.9 / 2.7 | 2.6 / 2.0 | noise: spread > Δ |
| turf-helpers | polygon | 95,867,147 | 96,212,535 | +0.4 | 2.1 / 2.7 | 1.3 / 2.3 | noise: spread > Δ |
| turf-helpers | multiPoint | 188,044,664 | 191,210,050 | +1.7 | 6.9 / 6.3 | 3.0 / 1.8 | noise: spread > Δ |
| turf-helpers | multiLineString | 254,111,250 | 238,608,906 | -6.1 | 7.5 / 12.8 | 6.6 / 7.2 | noise: spread > Δ |
| turf-helpers | multiPolygon | 14,418,240 | 14,444,814 | +0.2 | 1.0 / 1.8 | 0.4 / 1.0 | noise: spread > Δ |
| turf-helpers | featureCollection | 232,133,319 | 220,859,222 | -4.9 | 7.2 / 6.8 | 2.3 / 2.9 | noise: spread > Δ |
| turf-helpers | geometryCollection | 250,532,676 | 247,097,471 | -1.4 | 3.6 / 13.4 | 2.4 / 5.5 | noise: spread > Δ |
| turf-clone | Point | 27,575,612 | 27,638,509 | +0.2 | 0.6 / 1.2 | 0.3 / 0.3 | noise: spread > Δ |
| turf-clone | Point -- JSON.parse + JSON.stringify | 2,154,796 | 2,152,943 | -0.1 | 2.8 / 1.8 | 1.6 / 1.1 | noise: spread > Δ |
| turf-clone | LineString | 20,706,811 | 20,685,245 | -0.1 | 1.1 / 0.9 | 0.4 / 0.2 | noise: spread > Δ |
| turf-clone | LineString -- JSON.parse + JSON.stringify | 1,788,278 | 1,798,023 | +0.5 | 3.2 / 2.4 | 1.1 / 1.1 | noise: spread > Δ |
| turf-clone | Polygon | 13,694,483 | 13,692,330 | -0.0 | 0.8 / 0.6 | 0.5 / 0.3 | noise: spread > Δ |
| turf-clone | Polygon -- JSON.parse + JSON.stringify | 1,459,758 | 1,466,443 | +0.5 | 3.4 / 2.6 | 1.5 / 0.7 | noise: spread > Δ |
| turf-clone | FeatureCollection | 5,414,550 | 5,402,987 | -0.2 | 3.0 / 5.4 | 1.8 / 0.5 | noise: spread > Δ |
| turf-clone | FeatureCollection -- JSON.parse + JSON.stringify | 527,947 | 523,560 | -0.8 | 3.3 / 3.8 | 0.9 / 2.7 | noise: spread > Δ |

18 of 18 deltas are smaller than their spread.
