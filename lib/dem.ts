// Direct conversion of freemaplib (Java)'s DEM class to JavaScript, then to TypeScript.

/** Class representing a Digital Elevation Model. 
 * @property {number[]} elevs - array of elevations.
 */
import { EastNorth } from './point';

export default class DEM  {
    #bottomLeft: EastNorth;
    #ptWidth: number;
    #ptHeight: number;
    #xSpacing: number;
    #ySpacing: number;
    elevs: number[];

    /**
     * Create a new DEM.
     * @class
     * @param {number[]} elevs - array of elevations in metres.
     * @param {EastNorth} bottomLeft - the bottom left coordinate of the DEM in Spherical Mercator.
     * @param {number} ptWidth - number of points within the DEM in the horizontal direction.
     * @param {number} ptHeight - number of points within the DEM in the vertical direction.
     * @param {number} xSpacing - spacing in Spherical Mercator units in the horizontal direction.
     * @param {number} ySpacing - spacing in Spherical Mercator units in the vertical direction.
     */
    constructor(elevs: number[], bottomLeft: EastNorth, ptWidth: number, ptHeight: number, xSpacing: number, ySpacing: number) {
        this.#bottomLeft=bottomLeft;
        this.#ptWidth = ptWidth;
        this.#ptHeight = ptHeight;
        this.elevs = elevs;
        this.#xSpacing = xSpacing;
        this.#ySpacing = ySpacing;
    }
    
    
        
    /** Obtains the elevation in metres at a given x and y Spherical Mercator coordinate using bilinear interpolation.
     * @param {number} x - the Spherical Mercator x coordinate.
     * @param {number} y - the Spherical Mercator y coordinate.
     * @return {number} the elevation in metres
     */
    getElevation(x: number, y: number): number {
        let p = [x,y];
        let xIdx = Math.floor((p[0]-this.#bottomLeft.e) / this.#xSpacing),
            yIdx = this.#ptHeight-(Math.ceil((p[1] - this.#bottomLeft.n) / this.#ySpacing));
        
        let x1: number,x2: number,y1:number,y2:number;
        let h1: number,h2: number,h3: number,h4: number;
        
        let h = Number.NEGATIVE_INFINITY;

        // 021114 change this so that points outside the DEM are given a height based on closest edge/corner
        // idea being to reduce artefacts at the edges of tiles
        // this means that a -1 return cannot now be used to detect whether a point is in the DEM or not
        // (hopefully this is NOT being done anywhere!)
        // 200215 turning this off again due to iffy results
 
        if(xIdx>=0 && yIdx>=0 && xIdx<this.#ptWidth-1 && yIdx<this.#ptHeight-1) {
            h1 = this.elevs[yIdx*this.#ptWidth+xIdx];
            h2 = this.elevs[yIdx*this.#ptWidth+xIdx+1];
            h3 = this.elevs[yIdx*this.#ptWidth+xIdx+this.#ptWidth];
            h4 = this.elevs[yIdx*this.#ptWidth+xIdx+this.#ptWidth+1];
            
            x1 = this.#bottomLeft.e + xIdx*this.#xSpacing;
            x2 = x1 + this.#xSpacing;
            
            // 041114 I think this was wrong change from this.#ptHeight-yIdx to this.#ptHeight-1-yIdx
            y1 = this.#bottomLeft.n + (this.#ptHeight-1-yIdx)*this.#ySpacing;
            y2 = y1 - this.#ySpacing;
            
//            console.log("x,y bounds " + x1 + " " + y1+ " " +x2 + " " +y2);
//            console.log("vertices " + h1 + " " + h2+ " " +h3 + " " +h4);
            
            let propX = (p[0]-x1)/this.#xSpacing;
            
            let htop = h1*(1-propX) + h2*propX,
                hbottom = h3*(1-propX) + h4*propX;
            
            let propY = (p[1]-y2)/this.#ySpacing;
            
            h = hbottom*(1-propY) + htop*propY;
            
            //console.log("*******************************height is: " + h);
            
        } 
        return h;
    }
}


