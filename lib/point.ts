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
 * @property {number} longitude - the longitude.
 * @property {number} latitude -the latitude.
 */
class LonLat {
    longitude: number;
    latitude: number;

    /**
     * Creates a LonLat.
     * @class
     * @param {number} longitude - the longitude.
     * @param {number} latitude - the latitude.
     */
    constructor(longitude, latitude) {
        this.longitude = longitude;
        this.latitude = latitude;
    }

    /**
     * Returns a string representation of the LonLat. 
     * @return {string} the string representation. 
     */
    toString(): string {
        return `longitude: ${this.longitude}, latitude: ${this.latitude}`;
    }
}

export  {
    EastNorth,
    LonLat
};
