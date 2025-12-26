/** Class representing a Spherical Mercator projection. */

import Tile from './tile';
import Constants from './constants';
import { LonLat, EastNorth } from './point';

export default class SphMercProjection  {
    /**
     * Project a longitude and latitude into Spherical Mercator.
     * @param {LonLat} lonLat - the longitude/latitude.
     * @return {EastNorth} the Spherical Mercator coordinates. 
     */
    project (lonLat: LonLat) : EastNorth {
        return {e: this.#lonToSphMerc(lonLat.lon), n:this.#latToSphMerc(lonLat.lat)};
    }
    
    /**
     * Unproject Spherical Mercator into longitude/latitude.
     * @param {EastNorth} projected - the Spherical Mercator coordinates. 
     * @return {LonLat} the longitude/latitude.
     */
    unproject (projected: EastNorth): LonLat {
        return {lon: this.#sphMercToLon(projected[0]), lat:this.#sphMercToLat(projected[1])};
    }
    
    #lonToSphMerc(lon) : number {
        return (lon/180) * Constants.HALF_EARTH;
    }
    
    #latToSphMerc(lat) : number {
        var y = Math.log(Math.tan((90+lat)*Math.PI/360)) / (Math.PI/180);
        return y*Constants.HALF_EARTH/180.0;
    }
    
    #sphMercToLon(x) : number {
            return (x/Constants.HALF_EARTH) * 180.0;
    }
    
    #sphMercToLat(y) : number {
        var lat = (y/Constants.HALF_EARTH) * 180.0;
        lat = 180/Math.PI * (2*Math.atan(Math.exp(lat*Math.PI/180)) - Math.PI/2);
        return lat;
    }
    
    /**
     * Obtains a tile from a given Spherical Mercator position and zoom.
     * @param {EastNorth} p - the Spherical Mercator position.
     * @param {number} z - the zoom level. 
     */
    getTile (p: EastNorth, z: number) : Tile {
        var tile = new Tile(-1, -1, z);
        var metresInTile = tile.getMetresInTile(); 
        tile.x = Math.floor((Constants.HALF_EARTH+p.e) / metresInTile);
        tile.y = Math.floor((Constants.HALF_EARTH-p.n) / metresInTile);
        return tile;
    }
    
    /**
     * Obtains a tile from a given lon/lat and zoom.
     * @param {LonLat} lonLat - the longitude/latitude.
     * @param {number} z - the zoom level. 
     */
    getTileFromLonLat(lonLat: LonLat, z: number): Tile {
        return this.getTile(this.project(lonLat), z);
    }

    /**
     * Return the projection's ID.
     * @return {string} The value "epsg:3857".
     */
    getID(): string {
        return "epsg:3857";
    }
}
