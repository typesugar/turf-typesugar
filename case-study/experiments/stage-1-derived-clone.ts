// Stage 1 experiment (CASE-STUDY.md, finding F8): typesugar's auto-derived
// Clone instances for the @types/geojson shapes, in place of Turf's
// hand-written clone. Not used by Turf. To reproduce:
//
//   cp case-study/experiments/stage-1-derived-clone.ts packages/turf-clone/index.ts
//   cd packages/turf-clone && ../../case-study/with-typesugar.sh npx tsx test.ts
//   git checkout packages/turf-clone/index.ts
//
// `typesugar` must be resolvable from packages/turf-clone for the macro
// imports (it is, through the workspace's hoisted case-study dependency).
import type {
  Feature,
  FeatureCollection,
  GeometryCollection,
  LineString,
  MultiLineString,
  MultiPoint,
  MultiPolygon,
  Point,
  Polygon,
  GeoJsonProperties,
} from "geojson";
import { AllGeoJSON } from "@turf/helpers";
import { summon, Clone } from "typesugar";

// No instance is declared anywhere: summon falls back to deriving one from
// the type's structure (Generic auto-derivation).
const clonePoint = summon<Clone<Point>>();
const cloneLineString = summon<Clone<LineString>>();
const clonePolygon = summon<Clone<Polygon>>();
const cloneMultiPoint = summon<Clone<MultiPoint>>();
const cloneMultiLineString = summon<Clone<MultiLineString>>();
const cloneMultiPolygon = summon<Clone<MultiPolygon>>();
const cloneGeometryCollection = summon<Clone<GeometryCollection>>();
const cloneFeature = summon<Clone<Feature>>();
const cloneFeatureCollection = summon<Clone<FeatureCollection>>();

function clone<T extends AllGeoJSON>(geojson: T): T {
  if (!geojson) {
    throw new Error("geojson is required");
  }
  const g: any = geojson;
  switch (g.type) {
    case "Feature":
      return cloneFeature.clone(g) as any;
    case "FeatureCollection":
      return cloneFeatureCollection.clone(g) as any;
    case "Point":
      return clonePoint.clone(g) as any;
    case "LineString":
      return cloneLineString.clone(g) as any;
    case "Polygon":
      return clonePolygon.clone(g) as any;
    case "MultiPoint":
      return cloneMultiPoint.clone(g) as any;
    case "MultiLineString":
      return cloneMultiLineString.clone(g) as any;
    case "MultiPolygon":
      return cloneMultiPolygon.clone(g) as any;
    case "GeometryCollection":
      return cloneGeometryCollection.clone(g) as any;
    default:
      throw new Error("unknown GeoJSON type");
  }
}

function cloneProperties(properties: GeoJsonProperties) {
  return properties == null ? {} : { ...properties };
}

export { clone, cloneProperties };
export default clone;
