
export interface Point {
    type: string;
    coordinates: [number, number, number?];
}

export interface LineString {
    type: string;
    coordinates: Array<[number, number, number?]>;
}

export interface MultiLineString {
    type: string;
    coordinates: Array<Array<[number, number, number?]>>; 
}
export interface Feature {
    type: string;
    properties: Map<string, any>; 
    geometry: Point | LineString | MultiLineString;
}

export interface FeatureCollection {
   type: string;
   features: Array<Feature>;
}
