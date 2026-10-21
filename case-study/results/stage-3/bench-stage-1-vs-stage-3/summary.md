# Bench A/B: stage-1 vs stage-3

- A: `44c01d06304b` (typesugar loader); B: `ac4966947a0e` (typesugar loader)
- Machine: Apple M4 Pro, 12 cores, 24 GB, darwin 25.6.0 arm64; Node v26.3.1
- Date: 2026-10-20T21:23:48.012Z to 2026-10-20T22:56:12.550Z
- Load average (1/5/15 min): start 3.75 5.38 4.57, end 4.98 5.47 5.42
- 5 rounds, interleaved A/B, one process at a time. Spread is the larger side's (max-min)/median.

| Package | Benchmark | A median ops/s | B median ops/s | Δ % | Spread % (A / B) | IQR % (A / B) | |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| turf-meta | segmentEach   - point | 50,078,721 | 49,313,687 | -1.5 | 3.8 / 5.5 | 3.5 / 3.6 | noise: spread > Δ |
| turf-meta | segmentReduce - point | 41,617,610 | 40,558,751 | -2.5 | 8.8 / 5.2 | 3.7 / 3.0 | noise: spread > Δ |
| turf-meta | flattenEach   - point | 39,582,891 | 37,334,677 | -5.7 | 24.7 / 10.1 | 13.7 / 3.1 | noise: spread > Δ |
| turf-meta | flattenReduce - point | 34,066,407 | 32,079,861 | -5.8 | 25.7 / 11.1 | 18.3 / 3.3 | noise: spread > Δ |
| turf-meta | coordEach     - point | 108,738,017 | 107,969,916 | -0.7 | 4.1 / 4.0 | 1.0 / 1.8 | noise: spread > Δ |
| turf-meta | coordReduce   - point | 58,350,369 | 57,770,364 | -1.0 | 5.0 / 4.6 | 3.6 / 3.5 | noise: spread > Δ |
| turf-meta | propEach      - point | 181,378,844 | 181,646,763 | +0.1 | 3.2 / 4.8 | 2.6 / 2.8 | noise: spread > Δ |
| turf-meta | propReduce    - point | 110,288,107 | 108,131,861 | -2.0 | 6.4 / 5.5 | 4.2 / 4.1 | noise: spread > Δ |
| turf-meta | geomEach      - point | 73,246,212 | 73,084,729 | -0.2 | 3.2 / 4.7 | 2.3 / 1.4 | noise: spread > Δ |
| turf-meta | geomReduce    - point | 57,926,768 | 57,231,494 | -1.2 | 4.2 / 5.7 | 2.4 / 3.3 | noise: spread > Δ |
| turf-meta | featureEach   - point | 183,590,152 | 180,902,788 | -1.5 | 26.7 / 37.1 | 0.9 / 2.4 | noise: spread > Δ |
| turf-meta | featureReduce - point | 109,688,935 | 110,779,343 | +1.0 | 34.1 / 24.0 | 4.6 / 5.3 | noise: spread > Δ |
| turf-meta | coordAll      - point | 44,895,937 | 45,152,677 | +0.6 | 18.2 / 7.0 | 6.2 / 5.0 | noise: spread > Δ |
| turf-meta | findSegment   - point | 106,023,672 | 106,378,648 | +0.3 | 7.5 / 7.8 | 3.0 / 3.3 | noise: spread > Δ |
| turf-meta | findPoint     - point | 43,250,136 | 40,822,131 | -5.6 | 22.4 / 10.0 | 14.1 / 8.9 | noise: spread > Δ |
| turf-meta | segmentEach   - points | 52,499 | 50,955 | -2.9 | 29.3 / 7.7 | 21.5 / 2.4 | noise: spread > Δ |
| turf-meta | segmentReduce - points | 53,077 | 50,936 | -4.0 | 26.7 / 8.2 | 21.4 / 3.8 | noise: spread > Δ |
| turf-meta | flattenEach   - points | 54,840 | 53,524 | -2.4 | 27.4 / 7.1 | 22.2 / 3.8 | noise: spread > Δ |
| turf-meta | flattenReduce - points | 54,135 | 49,106 | -9.3 | 28.1 / 27.5 | 22.1 / 20.2 | noise: spread > Δ |
| turf-meta | coordEach     - points | 148,784 | 147,172 | -1.1 | 2.3 / 8.6 | 0.8 / 3.2 | noise: spread > Δ |
| turf-meta | coordReduce   - points | 139,509 | 137,442 | -1.5 | 1.7 / 6.9 | 1.2 / 3.2 | noise: spread > Δ |
| turf-meta | propEach      - points | 2,117,162 | 2,130,614 | +0.6 | 1.8 / 3.2 | 1.1 / 0.4 | noise: spread > Δ |
| turf-meta | propReduce    - points | 240,913 | 241,332 | +0.2 | 3.1 / 4.5 | 1.0 / 1.8 | noise: spread > Δ |
| turf-meta | geomEach      - points | 148,824 | 148,037 | -0.5 | 2.6 / 7.5 | 2.0 / 2.6 | noise: spread > Δ |
| turf-meta | geomReduce    - points | 137,455 | 137,150 | -0.2 | 3.0 / 6.8 | 1.8 / 2.4 | noise: spread > Δ |
| turf-meta | featureEach   - points | 2,681,450 | 2,667,852 | -0.5 | 9.0 / 8.9 | 3.1 / 4.0 | noise: spread > Δ |
| turf-meta | featureReduce - points | 243,909 | 245,923 | +0.8 | 3.2 / 3.4 | 0.5 / 1.8 | noise: spread > Δ |
| turf-meta | coordAll      - points | 108,019 | 108,119 | +0.1 | 3.4 / 5.4 | 1.1 / 3.3 | noise: spread > Δ |
| turf-meta | findSegment   - points | 105,492,875 | 106,007,229 | +0.5 | 7.0 / 4.7 | 0.2 / 4.4 | noise: spread > Δ |
| turf-meta | findPoint     - points | 41,608,594 | 39,636,755 | -4.7 | 21.8 / 11.6 | 13.9 / 5.0 | noise: spread > Δ |
| turf-meta | segmentEach   - polygon | 9,330,572 | 9,217,216 | -1.2 | 12.1 / 5.6 | 3.9 / 5.5 | noise: spread > Δ |
| turf-meta | segmentReduce - polygon | 3,462,239 | 3,194,329 | -7.7 | 68.1 / 9.0 | 58.7 / 4.0 | noise: spread > Δ |
| turf-meta | flattenEach   - polygon | 34,633,987 | 34,215,478 | -1.2 | 23.5 / 6.1 | 15.9 / 2.0 | noise: spread > Δ |
| turf-meta | flattenReduce - polygon | 30,125,217 | 28,786,592 | -4.4 | 31.3 / 8.7 | 20.4 / 5.3 | noise: spread > Δ |
| turf-meta | coordEach     - polygon | 17,049,904 | 17,042,549 | -0.0 | 2.7 / 2.6 | 2.0 / 0.7 | noise: spread > Δ |
| turf-meta | coordReduce   - polygon | 14,253,226 | 14,371,744 | +0.8 | 6.2 / 4.6 | 3.1 / 2.6 | noise: spread > Δ |
| turf-meta | propEach      - polygon | 179,223,120 | 182,242,107 | +1.7 | 4.6 / 4.3 | 2.7 / 0.7 | noise: spread > Δ |
| turf-meta | propReduce    - polygon | 108,248,976 | 106,970,578 | -1.2 | 5.4 / 5.4 | 4.0 / 2.4 | noise: spread > Δ |
| turf-meta | geomEach      - polygon | 79,796,902 | 79,777,384 | -0.0 | 1.7 / 3.1 | 0.1 / 0.3 | noise: spread > Δ |
| turf-meta | geomReduce    - polygon | 57,762,167 | 58,172,887 | +0.7 | 4.3 / 5.0 | 1.2 / 1.0 | noise: spread > Δ |
| turf-meta | featureEach   - polygon | 179,360,725 | 180,780,260 | +0.8 | 4.1 / 3.1 | 2.4 / 1.9 | noise: spread > Δ |
| turf-meta | featureReduce - polygon | 107,706,344 | 107,859,115 | +0.1 | 6.1 / 5.3 | 2.9 / 4.0 | noise: spread > Δ |
| turf-meta | coordAll      - polygon | 12,700,062 | 12,487,761 | -1.7 | 5.0 / 4.7 | 1.9 / 2.3 | noise: spread > Δ |
| turf-meta | findSegment   - polygon | 35,912,650 | 31,749,040 | -11.6 | 76.4 / 14.5 | 62.7 / 7.4 | noise: spread > Δ |
| turf-meta | findPoint     - polygon | 42,069,137 | 40,238,396 | -4.4 | 24.8 / 6.9 | 3.4 / 1.0 | noise: spread > Δ |
| turf-meta | segmentEach   - polygons | 3,397 | 3,285 | -3.3 | 72.6 / 10.7 | 61.9 / 4.3 | noise: spread > Δ |
| turf-meta | segmentReduce - polygons | 3,303 | 3,163 | -4.2 | 69.0 / 12.0 | 51.0 / 4.1 | noise: spread > Δ |
| turf-meta | flattenEach   - polygons | 53,138 | 53,669 | +1.0 | 32.2 / 6.2 | 17.8 / 2.8 | noise: spread > Δ |
| turf-meta | flattenReduce - polygons | 50,888 | 51,726 | +1.6 | 30.7 / 25.1 | 20.3 / 21.3 | noise: spread > Δ |
| turf-meta | coordEach     - polygons | 18,810 | 18,895 | +0.5 | 6.0 / 3.1 | 2.1 / 3.0 | noise: spread > Δ |
| turf-meta | coordReduce   - polygons | 16,549 | 16,739 | +1.1 | 5.3 / 2.7 | 2.2 / 1.5 | noise: spread > Δ |
| turf-meta | propEach      - polygons | 2,114,735 | 2,109,759 | -0.2 | 5.2 / 3.5 | 1.4 / 0.8 | noise: spread > Δ |
| turf-meta | propReduce    - polygons | 242,029 | 240,980 | -0.4 | 3.5 / 3.2 | 3.0 / 1.4 | noise: spread > Δ |
| turf-meta | geomEach      - polygons | 140,648 | 146,230 | +4.0 | 5.3 / 4.3 | 5.2 / 2.0 | noise: spread > Δ |
| turf-meta | geomReduce    - polygons | 126,811 | 130,209 | +2.7 | 6.0 / 4.1 | 4.2 / 1.6 | noise: spread > Δ |
| turf-meta | featureEach   - polygons | 2,648,974 | 2,666,772 | +0.7 | 9.9 / 9.0 | 3.3 / 5.6 | noise: spread > Δ |
| turf-meta | featureReduce - polygons | 245,842 | 245,164 | -0.3 | 3.4 / 3.1 | 3.2 / 1.8 | noise: spread > Δ |
| turf-meta | coordAll      - polygons | 13,240 | 13,225 | -0.1 | 8.3 / 6.8 | 2.6 / 5.7 | noise: spread > Δ |
| turf-meta | findSegment   - polygons | 35,567,439 | 32,425,578 | -8.8 | 89.6 / 12.2 | 65.7 / 8.3 | noise: spread > Δ |
| turf-meta | findPoint     - polygons | 42,545,293 | 40,672,491 | -4.4 | 28.0 / 7.4 | 3.8 / 0.7 | noise: spread > Δ |
| turf-bbox | line | 42,664,135 | 42,759,038 | +0.2 | 2.4 / 2.3 | 1.4 / 1.7 | noise: spread > Δ |
| turf-centroid | polygon | 21,625,320 | 21,502,195 | -0.6 | 3.3 / 2.5 | 1.0 / 1.5 | noise: spread > Δ |
| turf-centroid | point | 48,771,934 | 49,265,570 | +1.0 | 8.7 / 1.8 | 2.0 / 1.3 | noise: spread > Δ |
| turf-centroid | linestring | 30,252,466 | 30,252,309 | -0.0 | 14.7 / 3.0 | 0.1 / 0.5 | noise: spread > Δ |
| turf-centroid | imbalanced-polygon | 10,635,331 | 10,662,397 | +0.3 | 4.9 / 3.0 | 2.2 / 1.0 | noise: spread > Δ |
| turf-centroid | feature-collection | 19,527,043 | 19,459,023 | -0.3 | 1.6 / 1.2 | 0.4 / 0.2 | noise: spread > Δ |
| turf-length | feature-collection | 858,761 | 862,984 | +0.5 | 1.9 / 2.4 | 0.8 / 0.5 | noise: spread > Δ |
| turf-length | multi-linestring | 1,556,128 | 1,576,020 | +1.3 | 2.3 / 1.5 | 0.4 / 0.8 | noise: spread > Δ |
| turf-length | multi-polygon | 1,161,026 | 1,166,439 | +0.5 | 4.2 / 2.3 | 0.0 / 0.8 | noise: spread > Δ |
| turf-length | polygon | 1,867,333 | 1,896,740 | +1.6 | 22.6 / 3.0 | 1.6 / 0.8 | noise: spread > Δ |
| turf-length | route1 | 3,111 | 3,077 | -1.1 | 8.4 / 10.3 | 5.1 / 2.7 | noise: spread > Δ |
| turf-length | route2 | 3,473 | 3,468 | -0.1 | 12.8 / 3.5 | 4.0 / 2.0 | noise: spread > Δ |
| turf-simplify | argentina | 96,630 | 99,333 | +2.8 | 4.4 / 4.1 | 1.4 / 0.8 | noise: spread > Δ |
| turf-simplify | featurecollection | 98,830 | 101,228 | +2.4 | 5.2 / 3.9 | 1.4 / 2.9 | noise: spread > Δ |
| turf-simplify | fiji-hiQ | 235,402 | 237,536 | +0.9 | 4.1 / 4.3 | 0.8 / 2.3 | noise: spread > Δ |
| turf-simplify | geometrycollection | 101,333 | 101,586 | +0.2 | 33.0 / 7.2 | 3.3 / 2.4 | noise: spread > Δ |
| turf-simplify | issue-#1144 | 755,652 | 763,556 | +1.0 | 29.8 / 6.9 | 1.0 / 1.1 | noise: spread > Δ |
| turf-simplify | linestring | 209,726 | 210,122 | +0.2 | 22.3 / 3.2 | 2.0 / 1.3 | noise: spread > Δ |
| turf-simplify | multilinestring | 158,851 | 161,386 | +1.6 | 6.6 / 3.3 | 3.3 / 1.0 | noise: spread > Δ |
| turf-simplify | multipoint | 11,804,475 | 11,746,772 | -0.5 | 2.8 / 4.8 | 0.1 / 1.5 | noise: spread > Δ |
| turf-simplify | multipolygon | 4,456 | 4,473 | +0.4 | 3.8 / 5.9 | 2.3 / 2.1 | noise: spread > Δ |
| turf-simplify | point | 17,595,955 | 17,411,155 | -1.1 | 4.1 / 4.1 | 1.9 / 3.1 | noise: spread > Δ |
| turf-simplify | poly-issue#555-5 | 87,810 | 86,986 | -0.9 | 4.4 / 6.8 | 2.2 / 0.6 | noise: spread > Δ |
| turf-simplify | polygon | 22,204 | 22,222 | +0.1 | 3.8 / 5.7 | 1.9 / 1.5 | noise: spread > Δ |
| turf-simplify | simple-polygon | 5,202 | 5,176 | -0.5 | 2.6 / 6.3 | 1.0 / 3.1 | noise: spread > Δ |
| turf-line-segment | 2-vertex-segment | 15,063,409 | 15,096,675 | +0.2 | 6.2 / 0.4 | 1.1 / 0.2 | noise: spread > Δ |
| turf-line-segment | feature-collection | 2,668,794 | 2,682,152 | +0.5 | 2.7 / 1.3 | 1.5 / 0.5 | noise: spread > Δ |
| turf-line-segment | geometry-collection | 2,901,398 | 2,898,367 | -0.1 | 0.7 / 1.4 | 0.4 / 0.5 | noise: spread > Δ |
| turf-line-segment | linestring | 10,050,151 | 10,007,386 | -0.4 | 8.1 / 1.9 | 0.3 / 0.2 | noise: spread > Δ |
| turf-line-segment | multi-linestring | 4,912,981 | 4,884,045 | -0.6 | 1.2 / 2.7 | 0.3 / 0.5 | noise: spread > Δ |
| turf-line-segment | multi-polygon | 4,914,110 | 4,933,034 | +0.4 | 1.0 / 1.0 | 0.4 / 0.3 | noise: spread > Δ |
| turf-line-segment | polygon-with-holes | 3,908,346 | 3,914,166 | +0.1 | 1.3 / 0.3 | 0.4 / 0.1 | noise: spread > Δ |
| turf-line-segment | polygon | 9,132,247 | 9,051,379 | -0.9 | 2.0 / 1.2 | 1.2 / 0.3 | noise: spread > Δ |
| turf-flatten | FeatureCollection | 12,238,202 | 12,222,739 | -0.1 | 1.4 / 1.2 | 0.6 / 0.6 | noise: spread > Δ |
| turf-flatten | GeometryCollection | 12,270,593 | 12,242,482 | -0.2 | 1.6 / 0.8 | 0.8 / 0.6 | noise: spread > Δ |
| turf-flatten | GeometryObject | 25,047,892 | 24,959,856 | -0.4 | 0.6 / 0.8 | 0.3 / 0.3 | noise: spread > Δ |
| turf-flatten | MultiLineString | 25,804,059 | 25,788,098 | -0.1 | 1.4 / 0.8 | 1.0 / 0.2 | noise: spread > Δ |
| turf-flatten | MultiPoint | 24,063,199 | 24,012,782 | -0.2 | 2.0 / 1.3 | 1.6 / 0.2 | noise: spread > Δ |
| turf-flatten | MultiPolygon | 25,450,638 | 25,558,853 | +0.4 | 2.0 / 1.6 | 0.4 / 0.9 | noise: spread > Δ |
| turf-flatten | Polygon | 35,970,264 | 36,056,337 | +0.2 | 0.8 / 0.7 | 0.4 / 0.4 | noise: spread > Δ |

100 of 100 deltas are smaller than their spread.
