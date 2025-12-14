class EastNorth {
    e: number;
    n: number;

    constructor(e, n) {
        this.e = e;
        this.n = n;
    }
}

class LonLat {
    lon: number;
    lat: number;

    constructor(lon, lat) {
        this.lon = lon;
        this.lat = lat;
    }
}

export  {
    EastNorth,
    LonLat
};
