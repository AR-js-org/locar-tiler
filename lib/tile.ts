import Constants from './constants';
import { EastNorth } from './point';

/** Represents an XYZ tile. Does not include the tile data, please see the DataTile interface for this.
 * @property {number} x - the x coordinate of the tile.
 * @property {number} y - the y coordinate of the tile.
 * @property {number} z - the zoom of the tile.
 */ 
export default class Tile {

    x: number;
    y: number;
    z: number;
        
    /**
     * Creates a new Tile.
     * @class
     * @param {number} x - the x coordinate of the tile.
     * @param {number} y - the y coordinate of the tile.
     * @param {number} z - the zoom of the tile.
     */
    constructor(x: number, y: number, z: number) {
        this.x=x; this.y=y; this.z=z;
    }

    /**
     * Get the number of Spherical Mercator "metres" in a given tile.
     * @return {number} the number of Spherical Mercator "metres" in a given tile.
     */
    getMetresInTile() : number {
        return Constants.EARTH/Math.pow(2,this.z);
    }

    /**
     * Get the bottom left coordinate of the tile.
     * @return {EastNorth} the bottom left coordinate of the tile in Spherical Mercator "metres".
     */
    getBottomLeft() : EastNorth {
        var metresInTile = this.getMetresInTile();
        return { e: this.x*metresInTile - Constants.HALF_EARTH, n: Constants.HALF_EARTH - (this.y+1)*metresInTile };    
    }

    /**
     * Get the top right coordinate of the tile.
     * @return {EastNorth} the top right coordinate of the tile in Spherical Mercator "metres".
     */
    getTopRight(): EastNorth {
        var p = this.getBottomLeft();
        var metresInTile = this.getMetresInTile();
        p.e += metresInTile;
        p.n += metresInTile;
        return p;    
    }

    /**
     * Get the index of the tile.
     * @return {string} a string indexing the tile in format z/x/y
     */
    getIndex(): string {
        return `${this.z}/${this.x}/${this.y}`;
    }
}

/** Represents the association of a Tile with its data. 
 * @property {Tile} tile - the tile.
 * @property {any | null} data - the data stored in the tile.
 */
export interface DataTile {
    tile: Tile;
    data: any | null;
}
