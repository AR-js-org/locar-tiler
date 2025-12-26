/*
 * DemApplier
 * 
 * Applies a given DEM tile to a given JSON tile.
 * 
 * Adds the elevation of each point in a way in metres as index 2 of the 
 * geometry.
 */

import DemTiler from './demtiler';
import JsonTiler from './jsontiler';
import { LonLat, EastNorth } from './point';
import type { DataTile } from './tile';
import DEM from './dem';

import type { FeatureCollection, Feature, Point, LineString } from '../types/geojson';

/**
 * Class to apply DEM tiles to GeoJSON tiles. The elevation in metres will be added as the third member of each geometry coordinate in the GeoJSON.
 * @property {DemTiler} demTiler - the DemTiler to use.
 * @property {JsonTiler} jsonTiler - the JsonTiler to use.
 */
export default class DemApplier {

    demTiler: DemTiler;
    jsonTiler: JsonTiler;

    /**
     * Creates a DemApplier.
     * @class
     * @param {DemTiler} demTiler - the DemTiler to use.
     * @param {JsonTiler} jsonTiler - the JsonTiler to use.
     */
    constructor(demTiler: DemTiler, jsonTiler: JsonTiler) {
        this.demTiler = demTiler;
        this.jsonTiler = jsonTiler;
    }

    /**
     *
     * Updates the DemApplier with a new longitude/latitude reading.
     *
     * Calls update() on the DemTiler and JsonTiler to get new tiles, and then applies each DEM tile to the corresponding JSON tile.
     *
     * @param {lonLat} lonLat - the longitude/latitude to update the tiles at.
     * @return {Promise<DataTile[]>} promise resolving with an array of updated JSON tiles with elevation added as a third member of the coordinates of each point. As for Tiler, only the newly-downloaded tiles are returned.
     */

    async updateByLonLat(lonLat: LonLat): Promise<DataTile[]> {
        const p = this.demTiler.sphMerc.project(lonLat);
        const demTiles: DataTile[]  = await this.demTiler.update(p);
        const jsonTiles: DataTile[]  = await this.jsonTiler.update(p);

        demTiles.forEach ( (demTile: DataTile, j: number) => { 
            this.#applyToTile(demTile, jsonTiles[j]);
        });
        return jsonTiles; 
    }

    async #applyToTile(demTile: DataTile, jsonTile: DataTile) {
         const data = jsonTile.data as FeatureCollection;
         data.features.forEach  ( (f: Feature, i: number)=> {
            const line = [];
            if(f.geometry.type=='LineString' && f.geometry.coordinates.length >= 2) {
                (f.geometry as LineString).coordinates.forEach (coord=> {
                    const projCoord = this.demTiler.sphMerc.project(new LonLat(coord[0], coord[1]));
                    const h = (demTile.data as DEM)?.getElevation(projCoord.e, projCoord.n) ?? 0;
                    if (h > Number.NEGATIVE_INFINITY) {
                        coord[2] = h; // raw geojson will contain elevations
                    }
               });
            } else if(f.geometry.type == 'Point') {
                const pt = f.geometry as Point;
                const projCoord = this.demTiler.sphMerc.project(new LonLat(f.geometry.coordinates[0], f.geometry.coordinates[1]));
                const h = demTile.data ? demTile.data.getElevation(projCoord.e, projCoord.n) : 0;
                if(h > Number.NEGATIVE_INFINITY) {
                    f.geometry.coordinates[2] = h;
                }
            }
        });
    }
}


