# Bench A/B: v7.4.0 vs .

- A: `22acbd806adb`; B: `87b8eb450c24` (typesugar loader)
- Machine: Apple M4 Pro, 12 cores, 24 GB, darwin 25.6.0 arm64; Node v26.3.1
- Date: 2026-10-20T12:50:11.723Z to 2026-10-20T13:09:32.596Z
- Load average (1/5/15 min): start 17.86 22.72 20.12, end 4.51 6.42 11.27
- 3 rounds, interleaved A/B, one process at a time. Spread is the larger side's (max-min)/median.

| Package | Benchmark | A median ops/s | B median ops/s | Δ % | Spread % (A / B) | IQR % (A / B) | |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| turf-helpers | point + properties | 179,632,982 | 181,794,805 | +1.2 | 2.5 / 0.5 | 1.2 / 0.2 | noise: spread > Δ |
| turf-helpers | point | 178,847,764 | 180,724,267 | +1.0 | 2.5 / 1.6 | 1.3 / 0.8 | noise: spread > Δ |
| turf-helpers | round | 181,082,339 | 183,683,583 | +1.4 | 4.2 / 1.9 | 2.1 / 1.0 | noise: spread > Δ |
| turf-helpers | lineString | 179,938,412 | 180,937,591 | +0.6 | 0.6 / 1.8 | 0.3 / 0.9 | noise: spread > Δ |
| turf-helpers | polygon | 93,301,377 | 95,865,627 | +2.7 | 2.4 / 2.9 | 1.2 / 1.4 | noise: spread > Δ |
| turf-helpers | multiPoint | 179,951,102 | 188,141,019 | +4.6 | 3.0 / 0.7 | 1.5 / 0.4 |  |
| turf-helpers | multiLineString | 178,824,959 | 247,831,502 | +38.6 | 2.0 / 5.7 | 1.0 / 2.8 |  |
| turf-helpers | multiPolygon | 14,052,029 | 14,263,459 | +1.5 | 2.4 / 1.6 | 1.2 / 0.8 | noise: spread > Δ |
| turf-helpers | featureCollection | 174,892,745 | 227,241,191 | +29.9 | 2.3 / 7.7 | 1.1 / 3.9 |  |
| turf-helpers | geometryCollection | 180,163,999 | 243,777,560 | +35.3 | 2.9 / 5.4 | 1.4 / 2.7 |  |
| turf-distance | turf-distance | 18,344,351 | 18,375,177 | +0.2 | 1.6 / 1.1 | 0.8 / 0.5 | noise: spread > Δ |
| turf-clone | Point | 26,092,763 | 24,341,125 | -6.7 | 3.3 / 3.9 | 1.6 / 1.9 |  |
| turf-clone | Point -- JSON.parse + JSON.stringify | 2,151,379 | 1,956,432 | -9.1 | 8.5 / 4.4 | 4.2 / 2.2 |  |
| turf-clone | LineString | 19,665,789 | 18,295,122 | -7.0 | 12.4 / 2.1 | 6.2 / 1.1 | noise: spread > Δ |
| turf-clone | LineString -- JSON.parse + JSON.stringify | 1,784,356 | 1,654,460 | -7.3 | 15.0 / 3.6 | 7.5 / 1.8 | noise: spread > Δ |
| turf-clone | Polygon | 12,439,762 | 12,360,662 | -0.6 | 8.2 / 2.4 | 4.1 / 1.2 | noise: spread > Δ |
| turf-clone | Polygon -- JSON.parse + JSON.stringify | 1,377,436 | 1,354,728 | -1.6 | 9.8 / 2.2 | 4.9 / 1.1 | noise: spread > Δ |
| turf-clone | FeatureCollection | 4,733,009 | 4,749,866 | +0.4 | 6.0 / 10.2 | 3.0 / 5.1 | noise: spread > Δ |
| turf-clone | FeatureCollection -- JSON.parse + JSON.stringify | 513,208 | 480,435 | -6.4 | 5.6 / 5.7 | 2.8 / 2.9 |  |
| turf-invariant | getCoord -- pt | 120,237,853 | 124,135,987 | +3.2 | 10.3 / 1.2 | 5.1 / 0.6 | noise: spread > Δ |
| turf-invariant | getCoords -- line | 245,224,163 | 265,920,058 | +8.4 | 7.7 / 2.0 | 3.8 / 1.0 |  |
| turf-invariant | getCoords -- poly | 248,877,407 | 265,515,253 | +6.7 | 7.4 / 4.1 | 3.7 / 2.0 | noise: spread > Δ |
| turf-invariant | collectionOf -- fc | 126,328,226 | 128,016,462 | +1.3 | 7.2 / 3.3 | 3.6 / 1.6 | noise: spread > Δ |
| turf-invariant | getType -- pt | 247,728,354 | 258,324,473 | +4.3 | 3.7 / 13.8 | 1.8 / 6.9 | noise: spread > Δ |
| turf-bearing | initial bearing | 15,439,104 | 15,551,916 | +0.7 | 1.4 / 1.7 | 0.7 / 0.8 | noise: spread > Δ |
| turf-bearing | final bearing | 13,635,729 | 13,810,854 | +1.3 | 3.3 / 0.9 | 1.7 / 0.4 | noise: spread > Δ |
| turf-destination | turf-destination | 14,322,588 | 14,382,813 | +0.4 | 10.5 / 10.6 | 5.3 / 5.3 | noise: spread > Δ |
| turf-length | feature-collection | 894,287 | 895,620 | +0.1 | 0.9 / 1.5 | 0.5 / 0.7 | noise: spread > Δ |
| turf-length | multi-linestring | 1,602,562 | 1,617,600 | +0.9 | 2.1 / 1.7 | 1.0 / 0.9 | noise: spread > Δ |
| turf-length | multi-polygon | 1,208,800 | 1,211,981 | +0.3 | 2.6 / 3.6 | 1.3 / 1.8 | noise: spread > Δ |
| turf-length | polygon | 1,939,692 | 1,991,392 | +2.7 | 9.0 / 1.6 | 4.5 / 0.8 | noise: spread > Δ |
| turf-length | route1 | 3,221 | 3,185 | -1.1 | 12.0 / 3.6 | 6.0 / 1.8 | noise: spread > Δ |
| turf-length | route2 | 3,579 | 3,626 | +1.3 | 6.4 / 0.3 | 3.2 / 0.2 | noise: spread > Δ |
| turf-bbox | line | 43,832,697 | 43,151,084 | -1.6 | 0.2 / 1.4 | 0.1 / 0.7 |  |

25 of 34 deltas are smaller than their spread.
