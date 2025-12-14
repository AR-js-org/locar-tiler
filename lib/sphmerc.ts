
import Tile from './tile';
import Constants from './constants';
import { LonLat, EastNorth } from './point';

export default class SphMercProjection  {
    
    project (lonLat: LonLat) : EastNorth {
        return {e: this.#lonToSphMerc(lonLat.lon), n:this.#latToSphMerc(lonLat.lat)};
    }
    
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
    
    getTile (p: EastNorth, z: number) : Tile {
        var tile = new Tile(-1, -1, z);
        var metresInTile = tile.getMetresInTile(); 
        tile.x = Math.floor((Constants.HALF_EARTH+p.e) / metresInTile);
        tile.y = Math.floor((Constants.HALF_EARTH-p.n) / metresInTile);
        return tile;
    }
    
    getTileFromLonLat(lonLat: LonLat, z: number): Tile {
        return this.getTile(this.project(lonLat), z);
    }

    getID(): string {
        return "epsg:3857";
    }
}

