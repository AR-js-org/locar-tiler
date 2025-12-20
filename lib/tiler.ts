import Tile from './tile';
import type { DataTile } from './tile';
import SphMercProjection from './sphmerc';
import { LonLat, EastNorth } from './point';

export default abstract class Tiler {
    tile: Tile;
    url: string;
    sphMerc: SphMercProjection;
    dataTiles: Map<string, DataTile>;

    constructor(url: string) {
        this.tile = new Tile(0, 0, 13); 
        this.url = url;
        this.sphMerc = new SphMercProjection();
        this.dataTiles = new Map<string,DataTile>();
    }

    setZoom(z : number) {
        this.tile.z = z;
    }

    lonLatToSphMerc(lonLat : LonLat) : EastNorth {
        return this.sphMerc.project(lonLat);
    }

    getTile(sphMercPos: EastNorth, z: number) : Tile {
        return this.sphMerc.getTile(sphMercPos, z);
    }

    async update(pos: EastNorth) : Promise<DataTile[]> {
        const loadedData: DataTile[] = [];
        let t : Tile | null = null;
        if(t = this.updateTile(pos)) {
            this.tile = t;    
            const tilesX = [t.x, t.x-1, t.x+1], tilesY = [t.y, t.y-1, t.y+1];
            for(let ix=0; ix<tilesX.length; ix++) {    
                for(let iy=0; iy<tilesY.length; iy++) {    
                    const thisTile = new Tile(tilesX[ix], tilesY[iy], t.z);
                    const dataTile = await this.loadTile(thisTile);
                    if(dataTile !== null) {
                        loadedData.push({ data: dataTile.data, tile: thisTile });
                    }
                }
            }
        } 
        return loadedData;
    }

    async updateByLonLat(lonLat: LonLat) : Promise<DataTile[]> {
        return this.update(this.lonLatToSphMerc(lonLat));
    }

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

    updateTile(pos: EastNorth) : Tile | null {
        if(this.tile) {
            const newTile = this.sphMerc.getTile(pos, this.tile.z);
            const needUpdate = newTile.x != this.tile.x || newTile.y != this.tile.y;
            return needUpdate ? newTile : null; 
        }
        return null;
    }

    async loadTile(tile: Tile) : Promise<DataTile> {
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

    abstract readTile(url: string): Promise<any>;

    // for a given sphmerc pos, downloads data if necessary and returns
    // the data at the tile corresponding to that position
    async getData (sphMercPos: EastNorth, z:number=13) : Promise<Tile> {
        await this.update(sphMercPos);
        const thisTile = this.sphMerc.getTile(sphMercPos, z);
        return this.dataTiles[`${z}/${thisTile.x}/${thisTile.y}`];
    }

    // can be overridden if we want to store something other than the raw data
    // (for example DEM objects if we are dealing with DEM tiles)
    rawTileToStoredTile(tile: Tile, data: any) : DataTile {
        return {tile, data};
    }
}

