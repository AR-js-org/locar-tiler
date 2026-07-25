import { FeatureCollection } from 'geojson';
import Tiler from './tiler';

/** Class representing a Tiler which delivers GeoJSON data specfically. 
 * BREAKING CHANGE from 0.9.0 - it is assumed that the data is GeoJSON, not some other type of JSON.
 */

export default class GeoJsonTiler extends Tiler<FeatureCollection> {

    /**
     * Create a JsonTiler.
     * @class
     * @param {string} url - URL of the server delivering the tiles.
     */
    constructor(url: string) {
        super(url);
    }

    /**
     * Overridden readTile() for JsonTiler.
     * @param {string} url - the URL.
     * @return {Promise<FeatureCollection>} a Promise resolving with a parsed GeoJSON feature collection (no check on format of data returned).
     */
    async readTile(url: string): Promise<FeatureCollection> {

        const response = await fetch(url, {
            signal: AbortSignal.timeout(30000)
        });
        const data = await response.json();
        return data;
    }
}
