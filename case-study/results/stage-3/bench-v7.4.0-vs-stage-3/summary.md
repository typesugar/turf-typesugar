# Bench A/B: v7.4.0 vs stage-3

- A: `22acbd806adb` (typesugar loader); B: `ac4966947a0e` (typesugar loader)
- Machine: Apple M4 Pro, 12 cores, 24 GB, darwin 25.6.0 arm64; Node v26.3.1
- Date: 2026-10-21T01:07:48.454Z to 2026-10-21T02:39:45.022Z
- Load average (1/5/15 min): start 4.37 4.54 9.48, end 3.43 3.42 3.31
- 5 rounds, interleaved A/B, one process at a time. Spread is the larger side's (max-min)/median.

| Package | Benchmark | A median ops/s | B median ops/s | Δ % | Spread % (A / B) | IQR % (A / B) | |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| turf-meta | segmentEach   - point | 48,939,703 | 48,902,009 | -0.1 | 1.4 / 1.3 | 0.9 / 0.7 | noise: spread > Δ |
| turf-meta | segmentReduce - point | 39,976,212 | 40,081,527 | +0.3 | 2.0 / 2.1 | 0.6 / 1.1 | noise: spread > Δ |
| turf-meta | flattenEach   - point | 38,252,676 | 37,268,945 | -2.6 | 19.5 / 2.8 | 1.6 / 1.6 | noise: spread > Δ |
| turf-meta | flattenReduce - point | 32,730,480 | 31,924,790 | -2.5 | 19.3 / 9.8 | 1.0 / 4.5 | noise: spread > Δ |
| turf-meta | coordEach     - point | 107,223,751 | 107,004,260 | -0.2 | 1.4 / 2.8 | 1.1 / 0.6 | noise: spread > Δ |
| turf-meta | coordReduce   - point | 57,931,928 | 57,153,595 | -1.3 | 3.6 / 1.9 | 1.9 / 0.8 | noise: spread > Δ |
| turf-meta | propEach      - point | 180,801,001 | 181,815,862 | +0.6 | 27.3 / 2.0 | 0.3 / 0.7 | noise: spread > Δ |
| turf-meta | propReduce    - point | 106,775,214 | 106,476,989 | -0.3 | 24.7 / 1.0 | 2.4 / 0.8 | noise: spread > Δ |
| turf-meta | geomEach      - point | 72,934,568 | 72,678,869 | -0.4 | 1.2 / 1.2 | 0.3 / 0.6 | noise: spread > Δ |
| turf-meta | geomReduce    - point | 57,202,449 | 56,720,937 | -0.8 | 3.0 / 4.8 | 1.2 / 0.9 | noise: spread > Δ |
| turf-meta | featureEach   - point | 227,400,585 | 182,286,830 | -19.8 | 26.1 / 26.8 | 21.2 / 18.7 | noise: spread > Δ |
| turf-meta | featureReduce - point | 132,828,911 | 106,687,087 | -19.7 | 22.4 / 28.3 | 19.8 / 22.9 | noise: spread > Δ |
| turf-meta | coordAll      - point | 45,226,108 | 45,258,312 | +0.1 | 3.5 / 2.1 | 2.9 / 1.1 | noise: spread > Δ |
| turf-meta | findSegment   - point | 105,517,706 | 104,988,782 | -0.5 | 4.3 / 5.8 | 2.0 / 1.1 | noise: spread > Δ |
| turf-meta | findPoint     - point | 39,945,063 | 39,012,824 | -2.3 | 18.3 / 6.4 | 3.1 / 3.4 | noise: spread > Δ |
| turf-meta | segmentEach   - points | 53,192 | 52,245 | -1.8 | 15.4 / 4.9 | 0.2 / 1.7 | noise: spread > Δ |
| turf-meta | segmentReduce - points | 53,175 | 52,223 | -1.8 | 16.6 / 4.7 | 0.6 / 1.3 | noise: spread > Δ |
| turf-meta | flattenEach   - points | 55,792 | 54,826 | -1.7 | 18.2 / 4.2 | 0.7 / 1.7 | noise: spread > Δ |
| turf-meta | flattenReduce - points | 48,404 | 48,792 | +0.8 | 31.8 / 24.0 | 10.5 / 11.6 | noise: spread > Δ |
| turf-meta | coordEach     - points | 146,396 | 146,594 | +0.1 | 4.1 / 6.0 | 1.0 / 1.0 | noise: spread > Δ |
| turf-meta | coordReduce   - points | 137,547 | 137,742 | +0.1 | 2.6 / 15.2 | 0.9 / 0.7 | noise: spread > Δ |
| turf-meta | propEach      - points | 2,130,174 | 2,110,029 | -0.9 | 1.0 / 8.4 | 0.6 / 4.4 | noise: spread > Δ |
| turf-meta | propReduce    - points | 240,907 | 239,609 | -0.5 | 0.9 / 2.1 | 0.6 / 0.6 | noise: spread > Δ |
| turf-meta | geomEach      - points | 146,863 | 148,055 | +0.8 | 3.1 / 6.1 | 1.1 / 3.0 | noise: spread > Δ |
| turf-meta | geomReduce    - points | 136,314 | 136,659 | +0.3 | 2.4 / 6.1 | 1.4 / 1.1 | noise: spread > Δ |
| turf-meta | featureEach   - points | 2,665,254 | 2,659,282 | -0.2 | 1.9 / 2.7 | 1.5 / 1.1 | noise: spread > Δ |
| turf-meta | featureReduce - points | 244,762 | 244,508 | -0.1 | 0.3 / 2.9 | 0.1 / 0.4 | noise: spread > Δ |
| turf-meta | coordAll      - points | 107,682 | 107,003 | -0.6 | 1.8 / 3.2 | 1.0 / 1.9 | noise: spread > Δ |
| turf-meta | findSegment   - points | 104,723,008 | 104,798,655 | +0.1 | 1.4 / 3.9 | 0.5 / 1.1 | noise: spread > Δ |
| turf-meta | findPoint     - points | 39,857,133 | 38,976,922 | -2.2 | 21.6 / 16.5 | 4.6 / 2.2 | noise: spread > Δ |
| turf-meta | segmentEach   - polygon | 9,344,894 | 9,122,287 | -2.4 | 4.9 / 5.8 | 0.2 / 2.1 | noise: spread > Δ |
| turf-meta | segmentReduce - polygon | 3,366,707 | 3,236,495 | -3.9 | 58.4 / 5.7 | 4.8 / 3.3 | noise: spread > Δ |
| turf-meta | flattenEach   - polygon | 34,559,976 | 34,452,963 | -0.3 | 15.6 / 4.1 | 1.1 / 2.7 | noise: spread > Δ |
| turf-meta | flattenReduce - polygon | 29,713,801 | 29,388,704 | -1.1 | 18.6 / 7.7 | 1.1 / 3.7 | noise: spread > Δ |
| turf-meta | coordEach     - polygon | 17,042,765 | 17,084,249 | +0.2 | 0.9 / 2.5 | 0.2 / 0.9 | noise: spread > Δ |
| turf-meta | coordReduce   - polygon | 14,265,385 | 14,108,270 | -1.1 | 2.0 / 5.4 | 0.9 / 1.9 | noise: spread > Δ |
| turf-meta | propEach      - polygon | 179,609,700 | 179,331,880 | -0.2 | 0.6 / 2.8 | 0.2 / 0.6 | noise: spread > Δ |
| turf-meta | propReduce    - polygon | 106,212,735 | 104,162,628 | -1.9 | 3.4 / 8.5 | 2.8 / 3.9 | noise: spread > Δ |
| turf-meta | geomEach      - polygon | 79,849,752 | 78,223,738 | -2.0 | 1.4 / 3.3 | 1.1 / 2.1 | noise: spread > Δ |
| turf-meta | geomReduce    - polygon | 57,290,993 | 56,425,737 | -1.5 | 1.9 / 5.0 | 0.9 / 2.6 | noise: spread > Δ |
| turf-meta | featureEach   - polygon | 179,375,258 | 183,244,586 | +2.2 | 32.8 / 38.1 | 0.6 / 24.6 | noise: spread > Δ |
| turf-meta | featureReduce - polygon | 106,262,614 | 111,047,367 | +4.5 | 28.5 / 26.5 | 0.4 / 21.7 | noise: spread > Δ |
| turf-meta | coordAll      - polygon | 12,557,004 | 12,440,963 | -0.9 | 2.4 / 7.4 | 1.1 / 3.7 | noise: spread > Δ |
| turf-meta | findSegment   - polygon | 33,103,883 | 33,259,010 | +0.5 | 73.5 / 12.1 | 8.6 / 4.8 | noise: spread > Δ |
| turf-meta | findPoint     - polygon | 41,218,925 | 40,966,498 | -0.6 | 12.6 / 8.1 | 1.8 / 4.0 | noise: spread > Δ |
| turf-meta | segmentEach   - polygons | 3,407 | 3,406 | -0.0 | 55.4 / 8.4 | 3.0 / 3.1 | noise: spread > Δ |
| turf-meta | segmentReduce - polygons | 3,354 | 3,317 | -1.1 | 50.8 / 8.6 | 1.9 / 3.5 | noise: spread > Δ |
| turf-meta | flattenEach   - polygons | 53,699 | 54,186 | +0.9 | 22.1 / 5.8 | 1.6 / 0.2 | noise: spread > Δ |
| turf-meta | flattenReduce - polygons | 46,226 | 51,521 | +11.5 | 30.8 / 31.0 | 14.7 / 11.2 | noise: spread > Δ |
| turf-meta | coordEach     - polygons | 18,822 | 18,861 | +0.2 | 3.0 / 2.1 | 0.7 / 1.1 | noise: spread > Δ |
| turf-meta | coordReduce   - polygons | 16,525 | 16,564 | +0.2 | 2.4 / 4.1 | 1.5 / 1.3 | noise: spread > Δ |
| turf-meta | propEach      - polygons | 2,125,647 | 2,134,625 | +0.4 | 8.2 / 1.8 | 1.8 / 0.7 | noise: spread > Δ |
| turf-meta | propReduce    - polygons | 240,587 | 240,462 | -0.1 | 1.8 / 2.5 | 0.2 / 1.3 | noise: spread > Δ |
| turf-meta | geomEach      - polygons | 142,050 | 142,352 | +0.2 | 7.2 / 6.1 | 1.3 / 0.6 | noise: spread > Δ |
| turf-meta | geomReduce    - polygons | 128,454 | 128,587 | +0.1 | 6.4 / 6.9 | 3.0 / 1.0 | noise: spread > Δ |
| turf-meta | featureEach   - polygons | 2,658,482 | 2,664,865 | +0.2 | 1.5 / 4.4 | 0.1 / 1.0 | noise: spread > Δ |
| turf-meta | featureReduce - polygons | 244,405 | 244,135 | -0.1 | 0.5 / 2.6 | 0.0 / 0.3 | noise: spread > Δ |
| turf-meta | coordAll      - polygons | 13,208 | 13,441 | +1.8 | 2.8 / 4.5 | 1.3 / 2.0 | noise: spread > Δ |
| turf-meta | findSegment   - polygons | 33,094,107 | 32,500,785 | -1.8 | 80.9 / 15.3 | 1.7 / 3.5 | noise: spread > Δ |
| turf-meta | findPoint     - polygons | 41,074,886 | 40,816,979 | -0.6 | 7.8 / 6.7 | 2.0 / 2.9 | noise: spread > Δ |
| turf-bbox | line | 43,980,068 | 43,797,224 | -0.4 | 1.3 / 0.9 | 0.4 / 0.4 | noise: spread > Δ |
| turf-centroid | polygon | 22,711,468 | 22,662,802 | -0.2 | 0.9 / 0.5 | 0.1 / 0.2 | noise: spread > Δ |
| turf-centroid | point | 51,018,492 | 51,107,773 | +0.2 | 1.3 / 0.9 | 0.3 / 0.4 | noise: spread > Δ |
| turf-centroid | linestring | 31,648,946 | 31,503,430 | -0.5 | 0.8 / 0.7 | 0.1 / 0.4 | noise: spread > Δ |
| turf-centroid | imbalanced-polygon | 11,158,541 | 11,110,287 | -0.4 | 2.1 / 3.4 | 0.2 / 0.8 | noise: spread > Δ |
| turf-centroid | feature-collection | 20,488,492 | 20,471,325 | -0.1 | 0.5 / 0.7 | 0.2 / 0.6 | noise: spread > Δ |
| turf-length | feature-collection | 907,181 | 911,779 | +0.5 | 0.8 / 2.1 | 0.4 / 0.6 | noise: spread > Δ |
| turf-length | multi-linestring | 1,646,819 | 1,649,635 | +0.2 | 1.2 / 1.5 | 0.3 / 1.1 | noise: spread > Δ |
| turf-length | multi-polygon | 1,231,381 | 1,229,785 | -0.1 | 1.4 / 1.8 | 0.4 / 0.6 | noise: spread > Δ |
| turf-length | polygon | 1,986,175 | 1,988,959 | +0.1 | 2.0 / 3.7 | 0.7 / 1.7 | noise: spread > Δ |
| turf-length | route1 | 3,263 | 3,295 | +1.0 | 4.5 / 5.8 | 3.8 / 1.7 | noise: spread > Δ |
| turf-length | route2 | 3,653 | 3,684 | +0.8 | 3.6 / 3.8 | 2.9 / 1.5 | noise: spread > Δ |
| turf-simplify | argentina | 103,158 | 101,770 | -1.3 | 3.1 / 1.3 | 0.2 / 0.4 | noise: spread > Δ |
| turf-simplify | featurecollection | 104,118 | 103,946 | -0.2 | 2.0 / 1.3 | 0.2 / 1.0 | noise: spread > Δ |
| turf-simplify | fiji-hiQ | 249,990 | 247,137 | -1.1 | 1.2 / 2.2 | 0.7 / 0.9 | noise: spread > Δ |
| turf-simplify | geometrycollection | 106,685 | 106,476 | -0.2 | 2.4 / 1.7 | 0.8 / 0.4 | noise: spread > Δ |
| turf-simplify | issue-#1144 | 797,122 | 797,103 | -0.0 | 1.4 / 1.0 | 0.5 / 0.2 | noise: spread > Δ |
| turf-simplify | linestring | 220,327 | 221,028 | +0.3 | 1.2 / 1.2 | 0.1 / 0.5 | noise: spread > Δ |
| turf-simplify | multilinestring | 168,897 | 168,868 | -0.0 | 1.6 / 1.2 | 1.0 / 0.5 | noise: spread > Δ |
| turf-simplify | multipoint | 12,303,039 | 12,336,832 | +0.3 | 2.6 / 2.2 | 1.8 / 0.4 | noise: spread > Δ |
| turf-simplify | multipolygon | 4,651 | 4,671 | +0.4 | 2.1 / 0.9 | 0.5 / 0.3 | noise: spread > Δ |
| turf-simplify | point | 18,283,478 | 18,218,383 | -0.4 | 1.0 / 2.5 | 0.8 / 0.9 | noise: spread > Δ |
| turf-simplify | poly-issue#555-5 | 91,807 | 91,433 | -0.4 | 1.2 / 2.1 | 1.0 / 0.3 | noise: spread > Δ |
| turf-simplify | polygon | 23,180 | 23,060 | -0.5 | 1.2 / 1.1 | 0.1 / 0.4 | noise: spread > Δ |
| turf-simplify | simple-polygon | 5,428 | 5,466 | +0.7 | 1.0 / 1.0 | 0.6 / 0.7 | noise: spread > Δ |
| turf-line-segment | 2-vertex-segment | 15,311,926 | 15,217,022 | -0.6 | 0.8 / 1.5 | 0.5 / 0.9 | noise: spread > Δ |
| turf-line-segment | feature-collection | 2,721,543 | 2,715,223 | -0.2 | 1.1 / 0.8 | 0.4 / 0.4 | noise: spread > Δ |
| turf-line-segment | geometry-collection | 2,940,136 | 2,945,327 | +0.2 | 1.0 / 1.0 | 0.2 / 0.3 | noise: spread > Δ |
| turf-line-segment | linestring | 10,169,702 | 10,215,817 | +0.5 | 1.7 / 1.2 | 0.6 / 0.6 | noise: spread > Δ |
| turf-line-segment | multi-linestring | 4,980,644 | 4,977,309 | -0.1 | 0.6 / 1.1 | 0.4 / 0.1 | noise: spread > Δ |
| turf-line-segment | multi-polygon | 4,975,349 | 4,983,552 | +0.2 | 0.7 / 1.0 | 0.2 / 0.2 | noise: spread > Δ |
| turf-line-segment | polygon-with-holes | 3,956,929 | 3,957,223 | +0.0 | 0.5 / 4.6 | 0.4 / 0.3 | noise: spread > Δ |
| turf-line-segment | polygon | 9,206,922 | 9,246,337 | +0.4 | 1.6 / 0.7 | 0.2 / 0.2 | noise: spread > Δ |
| turf-flatten | FeatureCollection | 12,415,357 | 12,379,593 | -0.3 | 0.4 / 1.0 | 0.1 / 0.1 | noise: spread > Δ |
| turf-flatten | GeometryCollection | 12,401,242 | 12,381,223 | -0.2 | 0.4 / 0.5 | 0.2 / 0.2 | noise: spread > Δ |
| turf-flatten | GeometryObject | 25,252,644 | 25,289,957 | +0.1 | 0.9 / 3.1 | 0.6 / 1.0 | noise: spread > Δ |
| turf-flatten | MultiLineString | 26,087,535 | 26,014,052 | -0.3 | 0.5 / 0.5 | 0.1 / 0.4 | noise: spread > Δ |
| turf-flatten | MultiPoint | 24,391,982 | 24,293,856 | -0.4 | 0.7 / 0.2 | 0.5 / 0.1 | noise: spread > Δ |
| turf-flatten | MultiPolygon | 25,723,686 | 25,790,266 | +0.3 | 1.3 / 1.1 | 0.8 / 0.2 | noise: spread > Δ |
| turf-flatten | Polygon | 36,277,436 | 36,342,265 | +0.2 | 0.8 / 0.7 | 0.2 / 0.2 | noise: spread > Δ |

100 of 100 deltas are smaller than their spread.
