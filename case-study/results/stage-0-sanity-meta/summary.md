# Bench A/B: <v7.4.0 worktree> vs .

- A: `22acbd806adb` (typesugar loader); B: `87b8eb450c24` (typesugar loader)
- Machine: Apple M4 Pro, 12 cores, 24 GB, darwin 25.6.0 arm64; Node v26.3.1
- Date: 2026-10-20T13:34:47.683Z to 2026-10-20T14:07:20.735Z
- Load average (1/5/15 min): start 3.72 4.89 6.13, end 4.05 3.72 3.93
- 3 rounds, interleaved A/B, one process at a time. Spread is the larger side's (max-min)/median.

| Package | Benchmark | A median ops/s | B median ops/s | Δ % | Spread % (A / B) | IQR % (A / B) | |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| turf-meta | segmentEach   - point | 50,729,345 | 50,762,254 | +0.1 | 1.3 / 3.6 | 0.6 / 1.8 | noise: spread > Δ |
| turf-meta | segmentReduce - point | 41,590,429 | 41,743,523 | +0.4 | 5.7 / 3.6 | 2.9 / 1.8 | noise: spread > Δ |
| turf-meta | flattenEach   - point | 40,068,047 | 39,276,063 | -2.0 | 7.0 / 5.4 | 3.5 / 2.7 | noise: spread > Δ |
| turf-meta | flattenReduce - point | 33,206,145 | 33,341,453 | +0.4 | 6.4 / 8.0 | 3.2 / 4.0 | noise: spread > Δ |
| turf-meta | coordEach     - point | 109,094,531 | 107,758,468 | -1.2 | 7.2 / 4.9 | 3.6 / 2.4 | noise: spread > Δ |
| turf-meta | coordReduce   - point | 59,924,731 | 60,052,156 | +0.2 | 5.6 / 1.6 | 2.8 / 0.8 | noise: spread > Δ |
| turf-meta | propEach      - point | 179,038,307 | 179,332,118 | +0.2 | 4.0 / 3.7 | 2.0 / 1.8 | noise: spread > Δ |
| turf-meta | propReduce    - point | 110,125,260 | 111,129,982 | +0.9 | 5.5 / 0.7 | 2.7 / 0.4 | noise: spread > Δ |
| turf-meta | geomEach      - point | 74,082,829 | 73,622,823 | -0.6 | 6.4 / 0.5 | 3.2 / 0.3 | noise: spread > Δ |
| turf-meta | geomReduce    - point | 58,831,429 | 58,943,237 | +0.2 | 6.4 / 1.1 | 3.2 / 0.5 | noise: spread > Δ |
| turf-meta | featureEach   - point | 185,862,831 | 184,241,520 | -0.9 | 6.6 / 1.5 | 3.3 / 0.7 | noise: spread > Δ |
| turf-meta | featureReduce - point | 111,739,319 | 111,541,201 | -0.2 | 4.6 / 2.0 | 2.3 / 1.0 | noise: spread > Δ |
| turf-meta | coordAll      - point | 47,050,163 | 46,755,138 | -0.6 | 7.0 / 0.3 | 3.5 / 0.1 | noise: spread > Δ |
| turf-meta | findSegment   - point | 106,900,098 | 108,447,717 | +1.4 | 8.8 / 1.4 | 4.4 / 0.7 | noise: spread > Δ |
| turf-meta | findPoint     - point | 41,314,589 | 43,664,180 | +5.7 | 7.1 / 2.9 | 3.5 / 1.5 | noise: spread > Δ |
| turf-meta | segmentEach   - points | 54,135 | 54,977 | +1.6 | 9.7 / 3.8 | 4.8 / 1.9 | noise: spread > Δ |
| turf-meta | segmentReduce - points | 54,088 | 54,442 | +0.7 | 8.7 / 5.1 | 4.4 / 2.5 | noise: spread > Δ |
| turf-meta | flattenEach   - points | 56,605 | 56,868 | +0.5 | 8.4 / 3.4 | 4.2 / 1.7 | noise: spread > Δ |
| turf-meta | flattenReduce - points | 50,520 | 54,794 | +8.5 | 5.8 / 13.1 | 2.9 / 6.6 | noise: spread > Δ |
| turf-meta | coordEach     - points | 147,568 | 147,798 | +0.2 | 2.8 / 1.9 | 1.4 / 0.9 | noise: spread > Δ |
| turf-meta | coordReduce   - points | 139,325 | 139,517 | +0.1 | 2.9 / 8.9 | 1.5 / 4.4 | noise: spread > Δ |
| turf-meta | propEach      - points | 2,119,447 | 2,088,256 | -1.5 | 3.9 / 15.1 | 2.0 / 7.6 | noise: spread > Δ |
| turf-meta | propReduce    - points | 244,596 | 242,665 | -0.8 | 2.2 / 9.8 | 1.1 / 4.9 | noise: spread > Δ |
| turf-meta | geomEach      - points | 146,795 | 147,999 | +0.8 | 2.9 / 10.3 | 1.4 / 5.2 | noise: spread > Δ |
| turf-meta | geomReduce    - points | 136,519 | 139,059 | +1.9 | 2.9 / 11.1 | 1.5 / 5.6 | noise: spread > Δ |
| turf-meta | featureEach   - points | 2,755,849 | 2,803,861 | +1.7 | 7.0 / 19.7 | 3.5 / 9.9 | noise: spread > Δ |
| turf-meta | featureReduce - points | 250,938 | 247,970 | -1.2 | 1.3 / 9.8 | 0.6 / 4.9 | noise: spread > Δ |
| turf-meta | coordAll      - points | 110,275 | 111,434 | +1.1 | 0.7 / 11.5 | 0.4 / 5.7 | noise: spread > Δ |
| turf-meta | findSegment   - points | 105,926,884 | 108,399,549 | +2.3 | 3.7 / 12.8 | 1.8 / 6.4 | noise: spread > Δ |
| turf-meta | findPoint     - points | 42,438,510 | 42,534,930 | +0.2 | 10.8 / 11.4 | 5.4 / 5.7 | noise: spread > Δ |
| turf-meta | segmentEach   - polygon | 9,478,195 | 9,687,790 | +2.2 | 2.6 / 10.7 | 1.3 / 5.4 | noise: spread > Δ |
| turf-meta | segmentReduce - polygon | 3,408,830 | 3,461,923 | +1.6 | 7.7 / 11.8 | 3.8 / 5.9 | noise: spread > Δ |
| turf-meta | flattenEach   - polygon | 35,310,084 | 35,652,664 | +1.0 | 2.2 / 10.1 | 1.1 / 5.1 | noise: spread > Δ |
| turf-meta | flattenReduce - polygon | 30,136,512 | 30,929,320 | +2.6 | 0.6 / 9.9 | 0.3 / 4.9 | noise: spread > Δ |
| turf-meta | coordEach     - polygon | 17,147,103 | 17,400,093 | +1.5 | 0.5 / 10.7 | 0.2 / 5.3 | noise: spread > Δ |
| turf-meta | coordReduce   - polygon | 14,890,308 | 14,853,839 | -0.2 | 1.8 / 12.7 | 0.9 / 6.3 | noise: spread > Δ |
| turf-meta | propEach      - polygon | 181,885,316 | 178,283,684 | -2.0 | 1.6 / 9.5 | 0.8 / 4.8 | noise: spread > Δ |
| turf-meta | propReduce    - polygon | 111,549,759 | 109,664,639 | -1.7 | 0.9 / 12.3 | 0.4 / 6.2 | noise: spread > Δ |
| turf-meta | geomEach      - polygon | 80,408,989 | 79,196,294 | -1.5 | 3.3 / 10.2 | 1.6 / 5.1 | noise: spread > Δ |
| turf-meta | geomReduce    - polygon | 59,589,419 | 58,742,259 | -1.4 | 4.7 / 5.0 | 2.3 / 2.5 | noise: spread > Δ |
| turf-meta | featureEach   - polygon | 180,525,620 | 179,135,861 | -0.8 | 3.8 / 2.4 | 1.9 / 1.2 | noise: spread > Δ |
| turf-meta | featureReduce - polygon | 111,896,504 | 110,638,273 | -1.1 | 0.8 / 2.2 | 0.4 / 1.1 | noise: spread > Δ |
| turf-meta | coordAll      - polygon | 13,125,728 | 13,086,506 | -0.3 | 2.3 / 3.4 | 1.2 / 1.7 | noise: spread > Δ |
| turf-meta | findSegment   - polygon | 35,422,010 | 35,360,267 | -0.2 | 8.1 / 5.6 | 4.0 / 2.8 | noise: spread > Δ |
| turf-meta | findPoint     - polygon | 41,763,362 | 41,560,798 | -0.5 | 10.0 / 6.4 | 5.0 / 3.2 | noise: spread > Δ |
| turf-meta | segmentEach   - polygons | 3,519 | 3,451 | -1.9 | 6.6 / 9.1 | 3.3 / 4.5 | noise: spread > Δ |
| turf-meta | segmentReduce - polygons | 3,377 | 3,463 | +2.5 | 5.8 / 6.7 | 2.9 / 3.3 | noise: spread > Δ |
| turf-meta | flattenEach   - polygons | 56,153 | 55,986 | -0.3 | 1.0 / 0.7 | 0.5 / 0.3 | noise: spread > Δ |
| turf-meta | flattenReduce - polygons | 54,037 | 53,646 | -0.7 | 4.8 / 11.3 | 2.4 / 5.7 | noise: spread > Δ |
| turf-meta | coordEach     - polygons | 19,325 | 19,136 | -1.0 | 3.2 / 2.0 | 1.6 / 1.0 | noise: spread > Δ |
| turf-meta | coordReduce   - polygons | 17,029 | 17,026 | -0.0 | 0.6 / 0.7 | 0.3 / 0.4 | noise: spread > Δ |
| turf-meta | propEach      - polygons | 2,131,867 | 2,118,622 | -0.6 | 1.5 / 2.1 | 0.7 / 1.1 | noise: spread > Δ |
| turf-meta | propReduce    - polygons | 246,813 | 244,702 | -0.9 | 0.6 / 0.8 | 0.3 / 0.4 |  |
| turf-meta | geomEach      - polygons | 148,175 | 146,805 | -0.9 | 2.1 / 2.8 | 1.0 / 1.4 | noise: spread > Δ |
| turf-meta | geomReduce    - polygons | 133,650 | 131,513 | -1.6 | 2.5 / 2.0 | 1.2 / 1.0 | noise: spread > Δ |
| turf-meta | featureEach   - polygons | 2,741,467 | 2,770,876 | +1.1 | 3.3 / 5.5 | 1.7 / 2.7 | noise: spread > Δ |
| turf-meta | featureReduce - polygons | 251,358 | 250,301 | -0.4 | 2.0 / 0.8 | 1.0 / 0.4 | noise: spread > Δ |
| turf-meta | coordAll      - polygons | 13,699 | 13,818 | +0.9 | 4.2 / 3.3 | 2.1 / 1.7 | noise: spread > Δ |
| turf-meta | findSegment   - polygons | 34,605,264 | 36,329,162 | +5.0 | 5.5 / 5.9 | 2.8 / 2.9 | noise: spread > Δ |
| turf-meta | findPoint     - polygons | 41,324,841 | 42,917,890 | +3.9 | 7.6 / 1.5 | 3.8 / 0.8 | noise: spread > Δ |

59 of 60 deltas are smaller than their spread.
