# Bench A/B: stage-0 vs stage-1

- A: `f7b309e048b3` (typesugar loader); B: `c058cec532b1` (typesugar loader)
- Machine: Apple M4 Pro, 12 cores, 24 GB, darwin 25.6.0 arm64; Node v26.3.1
- Date: 2026-10-20T15:05:24.794Z to 2026-10-20T15:22:06.261Z
- Load average (1/5/15 min): start 4.31 6.01 7.17, end 4.17 4.49 5.38
- 5 rounds, interleaved A/B, one process at a time. Spread is the larger side's (max-min)/median.

| Package | Benchmark | A median ops/s | B median ops/s | Δ % | Spread % (A / B) | IQR % (A / B) | |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| turf-helpers | point + properties | 179,761,795 | 178,821,895 | -0.5 | 2.6 / 4.8 | 0.2 / 4.3 | noise: spread > Δ |
| turf-helpers | point | 180,261,343 | 181,240,491 | +0.5 | 7.5 / 7.6 | 0.6 / 2.0 | noise: spread > Δ |
| turf-helpers | round | 182,499,142 | 185,317,127 | +1.5 | 9.7 / 4.5 | 0.6 / 2.5 | noise: spread > Δ |
| turf-helpers | lineString | 180,827,667 | 180,645,574 | -0.1 | 3.3 / 4.6 | 0.6 / 2.1 | noise: spread > Δ |
| turf-helpers | polygon | 95,148,376 | 92,878,540 | -2.4 | 4.5 / 2.9 | 1.5 / 2.0 | noise: spread > Δ |
| turf-helpers | multiPoint | 182,784,063 | 188,545,323 | +3.2 | 6.3 / 3.1 | 0.7 / 0.8 | noise: spread > Δ |
| turf-helpers | multiLineString | 234,553,306 | 240,884,838 | +2.7 | 34.5 / 3.6 | 7.3 / 1.1 | noise: spread > Δ |
| turf-helpers | multiPolygon | 14,038,126 | 14,186,742 | +1.1 | 5.4 / 6.0 | 3.8 / 1.8 | noise: spread > Δ |
| turf-helpers | featureCollection | 226,275,321 | 221,128,124 | -2.3 | 25.6 / 6.7 | 1.4 / 2.1 | noise: spread > Δ |
| turf-helpers | geometryCollection | 235,376,081 | 234,377,557 | -0.4 | 33.1 / 6.8 | 8.8 / 1.9 | noise: spread > Δ |
| turf-clone | Point | 26,972,601 | 27,123,428 | +0.6 | 1.8 / 4.1 | 0.9 / 1.6 | noise: spread > Δ |
| turf-clone | Point -- JSON.parse + JSON.stringify | 2,135,942 | 2,101,038 | -1.6 | 2.6 / 5.9 | 1.4 / 0.7 | noise: spread > Δ |
| turf-clone | LineString | 20,367,450 | 20,332,880 | -0.2 | 2.6 / 3.7 | 1.0 / 0.7 | noise: spread > Δ |
| turf-clone | LineString -- JSON.parse + JSON.stringify | 1,780,948 | 1,750,507 | -1.7 | 2.3 / 6.0 | 1.7 / 0.5 | noise: spread > Δ |
| turf-clone | Polygon | 13,301,257 | 13,440,570 | +1.0 | 3.6 / 1.5 | 2.0 / 0.6 | noise: spread > Δ |
| turf-clone | Polygon -- JSON.parse + JSON.stringify | 1,452,822 | 1,434,029 | -1.3 | 3.5 / 1.2 | 1.8 / 0.4 | noise: spread > Δ |
| turf-clone | FeatureCollection | 5,176,679 | 5,279,700 | +2.0 | 2.8 / 1.2 | 1.9 / 0.3 | noise: spread > Δ |
| turf-clone | FeatureCollection -- JSON.parse + JSON.stringify | 513,252 | 510,223 | -0.6 | 2.2 / 1.7 | 0.8 / 1.3 | noise: spread > Δ |

18 of 18 deltas are smaller than their spread.
