import { decode, decodeApng } from 'fast-png';
import Tiler from './tiler';
import Tile from './tile';
import type { DataTile } from './tile';
import DEM from './dem'; 
import { EastNorth, LonLat } from './point';
import type { RawPngData } from '../types/rawpngdata';

export default class DemTiler extends Tiler {

    constructor(url: string) {
        super(url);
    }

    async readTile(url: string): Promise<RawPngData> {
        const response = await fetch(url);
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

    getElevation(sphMercPos: EastNorth): number {
        const tile = this.getTile(sphMercPos, this.tile.z);
        const indexedTile = this.dataTiles[`${tile.z}/${tile.x}/${tile.y}`];
        if(indexedTile) {
            return indexedTile.getElevation(sphMercPos[0], sphMercPos[1]);
        }
        return Number.NEGATIVE_INFINITY;
    }

    getElevationFromLonLat(lonLat: LonLat): number {
        return this.getElevation(this.sphMerc.project(lonLat));
    }

    // Overridden to store each tile as a DEM object
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

