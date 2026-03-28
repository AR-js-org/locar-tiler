/** Represents a Spherical Mercator point. 
 * @property {number} e -the easting.
 * @property {number} n -the northing.
 */
class EastNorth {
    e: number;
    n: number;

    /**
     * Creates an EastNorth.
     * @class
     * @param {number} e - the easting.
     * @param {number} n - the northing.
     */
    constructor(e, n) {
        this.e = e;
        this.n = n;
    }

    /**
     * Returns a string representation of the EastNorth. 
     * @return {string} the string representation. 
     */
    toString(): string {
        return `e: ${this.e}, n: ${this.n}`;
    }
}

/** Represents a longitude/latitude. 
 * @property {number} lon - the longitude.
 * @property {number} lat -the latitude.
 */
class LonLat {
    lon: number;
    lat: number;

    /**
     * Creates a LonLat.
     * @class
     * @param {number} lon - the longitude.
     * @param {number} lat - the latitude.
     */
    constructor(lon, lat) {
        this.lon = lon;
        this.lat = lat;
    }

    /**
     * Returns a string representation of the LonLat. 
     * @return {string} the string representation. 
     */
    toString(): string {
        return `lon: ${this.lon}, lat: ${this.lat}`;
    }
}

export  {
    EastNorth,
    LonLat
};
