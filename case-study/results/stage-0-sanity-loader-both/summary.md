# Bench A/B: <v7.4.0 worktree> vs .

- A: `22acbd806adb` (typesugar loader); B: `87b8eb450c24` (typesugar loader)
- Machine: Apple M4 Pro, 12 cores, 24 GB, darwin 25.6.0 arm64; Node v26.3.1
- Date: 2026-10-20T13:10:14.592Z to 2026-10-20T13:23:04.066Z
- Load average (1/5/15 min): start 3.61 5.94 10.87, end 5.77 5.39 7.44
- 3 rounds, interleaved A/B, one process at a time. Spread is the larger side's (max-min)/median.

| Package | Benchmark | A median ops/s | B median ops/s | Δ % | Spread % (A / B) | IQR % (A / B) | |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| turf-helpers | point + properties | 182,742,928 | 182,529,647 | -0.1 | 1.5 / 0.6 | 0.8 / 0.3 | noise: spread > Δ |
| turf-helpers | point | 181,649,170 | 182,783,202 | +0.6 | 0.6 / 1.6 | 0.3 / 0.8 | noise: spread > Δ |
| turf-helpers | round | 185,352,286 | 185,780,662 | +0.2 | 1.6 / 0.3 | 0.8 / 0.1 | noise: spread > Δ |
| turf-helpers | lineString | 183,296,144 | 180,270,189 | -1.7 | 0.9 / 1.2 | 0.5 / 0.6 |  |
| turf-helpers | polygon | 95,764,696 | 95,504,373 | -0.3 | 1.2 / 0.5 | 0.6 / 0.2 | noise: spread > Δ |
| turf-helpers | multiPoint | 190,601,450 | 187,010,868 | -1.9 | 3.7 / 0.6 | 1.9 / 0.3 | noise: spread > Δ |
| turf-helpers | multiLineString | 243,165,352 | 236,276,832 | -2.8 | 8.7 / 4.7 | 4.3 / 2.4 | noise: spread > Δ |
| turf-helpers | multiPolygon | 14,371,076 | 14,406,299 | +0.2 | 3.7 / 0.4 | 1.9 / 0.2 | noise: spread > Δ |
| turf-helpers | featureCollection | 222,551,931 | 232,585,354 | +4.5 | 4.1 / 6.7 | 2.1 / 3.3 | noise: spread > Δ |
| turf-helpers | geometryCollection | 256,067,469 | 235,494,792 | -8.0 | 8.7 / 1.5 | 4.4 / 0.8 | noise: spread > Δ |
| turf-clone | Point | 26,987,558 | 26,806,768 | -0.7 | 3.0 / 1.1 | 1.5 / 0.5 | noise: spread > Δ |
| turf-clone | Point -- JSON.parse + JSON.stringify | 2,136,870 | 2,117,652 | -0.9 | 4.1 / 4.1 | 2.0 / 2.1 | noise: spread > Δ |
| turf-clone | LineString | 20,428,794 | 19,998,139 | -2.1 | 2.6 / 0.9 | 1.3 / 0.5 | noise: spread > Δ |
| turf-clone | LineString -- JSON.parse + JSON.stringify | 1,758,786 | 1,762,529 | +0.2 | 3.7 / 3.2 | 1.9 / 1.6 | noise: spread > Δ |
| turf-clone | Polygon | 13,260,168 | 13,402,810 | +1.1 | 4.7 / 1.2 | 2.4 / 0.6 | noise: spread > Δ |
| turf-clone | Polygon -- JSON.parse + JSON.stringify | 1,427,132 | 1,440,676 | +0.9 | 4.8 / 3.0 | 2.4 / 1.5 | noise: spread > Δ |
| turf-clone | FeatureCollection | 5,268,848 | 5,229,824 | -0.7 | 4.2 / 3.7 | 2.1 / 1.8 | noise: spread > Δ |
| turf-clone | FeatureCollection -- JSON.parse + JSON.stringify | 507,971 | 519,907 | +2.3 | 2.7 / 2.2 | 1.4 / 1.1 | noise: spread > Δ |
| turf-invariant | getCoord -- pt | 121,661,816 | 123,068,211 | +1.2 | 0.9 / 3.2 | 0.4 / 1.6 | noise: spread > Δ |
| turf-invariant | getCoords -- line | 251,713,878 | 256,672,726 | +2.0 | 5.7 / 4.7 | 2.9 / 2.3 | noise: spread > Δ |
| turf-invariant | getCoords -- poly | 255,682,590 | 251,330,107 | -1.7 | 3.0 / 5.5 | 1.5 / 2.8 | noise: spread > Δ |
| turf-invariant | collectionOf -- fc | 128,746,394 | 127,866,001 | -0.7 | 0.4 / 1.7 | 0.2 / 0.8 | noise: spread > Δ |
| turf-invariant | getType -- pt | 260,537,292 | 263,591,563 | +1.2 | 5.3 / 2.9 | 2.6 / 1.4 | noise: spread > Δ |

22 of 23 deltas are smaller than their spread.
