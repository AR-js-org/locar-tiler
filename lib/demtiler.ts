import { decode, decodeApng } from 'fast-png';
import Tiler from './tiler';
import Tile from './tile';
import type { DataTile } from './tile';
import DEM from './dem'; 
import { EastNorth, LonLat } from './point';
import type { RawPngData } from '../types/rawpngdata';

/** Class representing a Tiler which delivers DEM data. 
 * @class
 */
export default class DemTiler extends Tiler {

    /**
     * Create a DemTiler.
     * @class
     * @param {string} URL of the server delivering the tiles.
     */
    constructor(url: string) {
        super(url);
    }

    /**
     * Overridden readTile() for DemTiler.
     * @param {string} url - the URL.
     * @return {Promise<any>} a Promise resolving with raw DEM data.
     */
    async readTile(url: string): Promise<RawPngData> {
        const response = await fetch(url, {
			signal: AbortSignal.timeout(30000)
		});
        const arrbuf = await response.arrayBuffer();
        const png = decode(arrbuf);
        let i: number, elev = 0;
        const elevs: number[] = new Array(png.width * png.height);
        
        for(let y = 0; y < png.height; y++) {
            for(let x = 0; x < png.width; x++) {
                i = (y * png.width + x) * png.channels;
                elevs[elev++] = Math.round((png.data[i] * 256 + png.data[i+1] + png.data[i+2] / 256) - 32768);
            }
        }
        return { w: png.width, h: png.height, elevs: elevs } ;
    }

    /**
     * Obtain the elevation in metres for a given Spherical Mercator position.
     * @param {EastNorth} sphMercPos - the Spherical Mercator position.
     * @return {number} the elevation in metres, or Number.NEGATIVE_INFINITY if this position is outside the extent of the DEM.
     */
    getElevation(sphMercPos: EastNorth): number {
        const tile = this.getTile(sphMercPos, this.tile.z);
        const indexedTile = this.dataTiles[`${tile.z}/${tile.x}/${tile.y}`];
        if(indexedTile) {
            return indexedTile.getElevation(sphMercPos[0], sphMercPos[1]);
        }
        return Number.NEGATIVE_INFINITY;
    }

    /**
     * Obtain the elevation in metres for a given longitude/latitude. 
     * @param {LonLat} lonLat - the longitude/latitude. 
     * @return {number} the elevation in metres, or Number.NEGATIVE_INFINITY if this position is outside the extent of the DEM.
     */
    getElevationFromLonLat(lonLat: LonLat): number {
        return this.getElevation(this.sphMerc.project(lonLat));
    }

    /**
     * Overridden rawTileToStoredTile() to convert the raw PNG tile to a DEM object.
     * @param {Tile} tile - the current tile.
     * @param {any} data - the raw downloaded data.
     * @return {DataTile} the DataTile pairing the Tile and the DEM data as a DEM object. 
     */
    rawTileToStoredTile(tile : Tile, data: RawPngData): DataTile {
         const topRight = tile.getTopRight();
         const bottomLeft = tile.getBottomLeft();
         const xSpacing = (topRight.e - bottomLeft.e) / (data.w-1);
         const ySpacing = (topRight.n - bottomLeft.n) / (data.h-1);
         const dem = new DEM (data.elevs, 
                            bottomLeft, 
                            data.w,
                            data.h, 
                            xSpacing, 
                            ySpacing);
        return { tile, data: dem };
    }
}

