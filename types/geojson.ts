
export interface Point {
    type: string;
    coordinates: number[];
}

export interface LineString {
    type: string;
    coordinates: number[][];
}

export interface MultiLineString {
    type: string;
    coordinates: number[][][];
}
export interface Feature {
    type: string;
    properties: any; 
    geometry: Point | LineString | MultiLineString;
}

export interface FeatureCollection {
   type: string;
   features: Array<Feature>;
}
