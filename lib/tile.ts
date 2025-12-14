import Constants from './constants';
import { EastNorth } from './point';

export default class Tile {

    x: number;
    y: number;
    z: number;
        
    constructor(x: number, y: number, z: number) {
        this.x=x; this.y=y; this.z=z;
    }

    getMetresInTile() : number {
        return Constants.EARTH/Math.pow(2,this.z);
    }

    getBottomLeft() : EastNorth {
        var metresInTile = this.getMetresInTile();
        return { e: this.x*metresInTile - Constants.HALF_EARTH, n: Constants.HALF_EARTH - (this.y+1)*metresInTile };    
    }

    getTopRight(): EastNorth {
        var p = this.getBottomLeft();
        var metresInTile = this.getMetresInTile();
        p.e += metresInTile;
        p.n += metresInTile;
        return p;    
    }

    getIndex(): string {
        return `${this.z}/${this.x}/${this.y}`;
    }
}

export interface DataTile {
    tile: Tile;
    data: any | null;
}
