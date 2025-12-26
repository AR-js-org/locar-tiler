import Tile from './tile';
import type { DataTile } from './tile';
import SphMercProjection from './sphmerc';
import { LonLat, EastNorth } from './point';

/** Represents a tiler, capable of delivering Tiles from a given URL. */
export default abstract class Tiler {
    tile: Tile;
    url: string;
    sphMerc: SphMercProjection;
    dataTiles: Map<string, DataTile>;

    /**
     * Creates a new Tiler.
     * Can only be called by subclasses as Tiler is abstract.
     * @class
     * @param {string} url - the URL of the tile server. Use the characters x, y and z in braces for placeholders for the x,y,z parameters. */
    constructor(url: string) {
        this.tile = new Tile(0, 0, 13); 
        this.url = url;
        this.sphMerc = new SphMercProjection();
        this.dataTiles = new Map<string,DataTile>();
    }

    /**
     * Sets the zoom.
     * @param {number} z - the zoom to use. 
     */
    setZoom(z : number) {
        this.tile.z = z;
    }

    /**
     * Convert longitude/latitude to Spherical Mercator coordinates.
     * @param {LonLat} lonLat - the LonLat to convert.
     * @return {EastNorth} the EastNorth (Spherical Mercator coordinates).
     */
    lonLatToSphMerc(lonLat : LonLat) : EastNorth {
        return this.sphMerc.project(lonLat);
    }

    /**
     * Obtain the Tile containing a given Spherical Mercator position.
     * @param {EastNorth} sphmercPos - the Spherical Mercator position.
     * @return {Tile} the Tile containing the position.
     */
    getTile(sphMercPos: EastNorth, z: number) : Tile {
        return this.sphMerc.getTile(sphMercPos, z);
    }

    /**
     * Download new tiles for a given Spherical Mercator position.
     * @param {EastNorth} pos - the Spherical Mercator position.
     * @return {Promise<DataTile[]>} a Promise resolving with an array of the newly-downloaded data tiles (only new tiles; existing ones are not returned)
     */
    async update(pos: EastNorth) : Promise<DataTile[]> {
        const loadedData: DataTile[] = [];
        let t : Tile | null = null;
        if(t = this.#updateTile(pos)) {
            this.tile = t;    
            const tilesX = [t.x, t.x-1, t.x+1], tilesY = [t.y, t.y-1, t.y+1];
            for(let ix=0; ix<tilesX.length; ix++) {    
                for(let iy=0; iy<tilesY.length; iy++) {    
                    const thisTile = new Tile(tilesX[ix], tilesY[iy], t.z);
                    const dataTile = await this.#loadTile(thisTile);
                    if(dataTile !== null) {
                        loadedData.push({ data: dataTile.data, tile: thisTile });
                    }
                }
            }
        } 
        return loadedData;
    }

    /**
     * Download new tiles for a given longitude/latitude.
     * @param {LonLat} lonLat - the position.
     * @return {Promise<DataTile[]>} a Promise resolving with an array of the newly-downloaded data tiles (only new tiles; existing ones are not returned)
     */
    async updateByLonLat(lonLat: LonLat) : Promise<DataTile[]> {
        return this.update(this.lonLatToSphMerc(lonLat));
    }

    /**
     * Obtain the current tiles surrounding the last-requested position.
     * @return {DataTile[]} array of 9 tiles, including the current tile and the 8 surrounding it.
     */
    getCurrentTiles(): DataTile[] {
        const tiles: DataTile[] = [];
        const tilesX = [this.tile.x, this.tile.x-1, this.tile.x+1], tilesY = [this.tile.y, this.tile.y-1, this.tile.y+1];
        for(let ix=0; ix<tilesX.length; ix++) {    
            for(let iy=0; iy<tilesY.length; iy++) {    
                const tile = new Tile(tilesX[ix], tilesY[iy], this.tile.z);
                const data = this.dataTiles[tile.getIndex()];
                if(data !== null) {
                    tiles.push({ data, tile });
                }
            }
        }
        return tiles;
    }

    #updateTile(pos: EastNorth) : Tile | null {
        if(this.tile) {
            const newTile = this.sphMerc.getTile(pos, this.tile.z);
            const needUpdate = newTile.x != this.tile.x || newTile.y != this.tile.y;
            return needUpdate ? newTile : null; 
        }
        return null;
    }

    async #loadTile(tile: Tile) : Promise<DataTile> {
        const tileIndex = tile.getIndex();
        if(this.dataTiles[tileIndex] === undefined) {
            const tData: any | null = await this.readTile(this.url
                .replace("{x}", tile.x.toString())
                .replace("{y}", tile.y.toString())
                .replace("{z}", tile.z.toString())
            );
            this.dataTiles[tileIndex] = this.rawTileToStoredTile(tile, tData);
            return this.dataTiles[tileIndex];
        } 
        return null;
    }

    /**
     * Abstract method to read the data from a URL. The placeholders will be replaced with the current actual values.
     * @param {string} url - the URL.
     * @return {Promise<any>} a Promise resolving with arbitrary data.
     */
    abstract readTile(url: string): Promise<any>;

    /**
     * For a given Spherical Mercator position and zoom, downloads data if necessary and returns the data at the tile corresponding to that position.
     * @param {EastNorth} sphMercPos - the Spherical Mercator position.
     * @param {number} z - zoom level to use (default 13)
     * @return {Promise<Tile>} Promise resolving with the given Tile.
     */
    async getData (sphMercPos: EastNorth, z:number=13) : Promise<Tile> {
        await this.update(sphMercPos);
        const thisTile = this.sphMerc.getTile(sphMercPos, z);
        return this.dataTiles[`${z}/${thisTile.x}/${thisTile.y}`];
    }

    /**
     * Converts the raw data from the server to a custom type of data.
     * By default, returns a DataTile object containing the Tile and the raw data returned from readTile(), but this can be overridden (e.g. in DemTile the `data` of the DataTile is a DEM object).
     * @param {Tile} tile - the current tile.
     * @param {any} data - the raw downloaded data.
     * @return {DataTile} the DataTile pairing the Tile and the data in the format we want.
     */
    rawTileToStoredTile(tile: Tile, data: any) : DataTile {
        return {tile, data};
    }
}

