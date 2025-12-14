// Direct conversion of freemaplib's DEM class to JavaScript, then to TypeScript.

import { EastNorth } from './point';

export default class DEM  {
    bottomLeft: EastNorth;
    ptWidth: number;
    ptHeight: number;
    xSpacing: number;
    ySpacing: number;
    elevs: number[];

    constructor(elevs: number[], bottomLeft: EastNorth, ptWidth: number, ptHeight: number, xSpacing: number, ySpacing: number) {
        this.bottomLeft=bottomLeft;
        this.ptWidth = ptWidth;
        this.ptHeight = ptHeight;
        this.elevs = elevs;
        this.xSpacing = xSpacing;
        this.ySpacing = ySpacing;
    }
    
    
        
    // Uses bilinear interpolation
    // Based on Footnav code
    // x,y must be in projection of the geometry with scaling factor 
    // already applied
    getElevation(x: number, y: number): number {
        let p = [x,y];
        let xIdx = Math.floor((p[0]-this.bottomLeft.e) / this.xSpacing),
            yIdx = this.ptHeight-(Math.ceil((p[1] - this.bottomLeft.n) / this.ySpacing));
        
        let x1: number,x2: number,y1:number,y2:number;
        let h1: number,h2: number,h3: number,h4: number;
        
        let h = Number.NEGATIVE_INFINITY;

        // 021114 change this so that points outside the DEM are given a height based on closest edge/corner
        // idea being to reduce artefacts at the edges of tiles
        // this means that a -1 return cannot now be used to detect whether a point is in the DEM or not
        // (hopefully this is NOT being done anywhere!)
        // 200215 turning this off again due to iffy results
        
        if(xIdx>=0 && yIdx>=0 && xIdx<this.ptWidth-1 && yIdx<this.ptHeight-1) {
            h1 = this.elevs[yIdx*this.ptWidth+xIdx];
            h2 = this.elevs[yIdx*this.ptWidth+xIdx+1];
            h3 = this.elevs[yIdx*this.ptWidth+xIdx+this.ptWidth];
            h4 = this.elevs[yIdx*this.ptWidth+xIdx+this.ptWidth+1];
            
            x1 = this.bottomLeft[0] + xIdx*this.xSpacing;
            x2 = x1 + this.xSpacing;
            
            // 041114 I think this was wrong change from this.ptHeight-yIdx to this.ptHeight-1-yIdx
            y1 = this.bottomLeft[1] + (this.ptHeight-1-yIdx)*this.ySpacing;
            y2 = y1 - this.ySpacing;
            
//            console.log("x,y bounds " + x1 + " " + y1+ " " +x2 + " " +y2);
 //           console.log("vertices " + h1 + " " + h2+ " " +h3 + " " +h4);
            
            let propX = (p[0]-x1)/this.xSpacing;
            
            let htop = h1*(1-propX) + h2*propX,
                hbottom = h3*(1-propX) + h4*propX;
            
            let propY = (p[1]-y2)/this.ySpacing;
            
            h = hbottom*(1-propY) + htop*propY;
            
            //console.log("*******************************height is: " + h);
            
        } 
        return h;
    }
}


