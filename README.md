# locar-tiler

Tiled download system for geodata, particularly useful for augmented reality applications.

## Introduction

In many geographically-aware applications, including (but not limited to) location-based augmented reality applications, it is useful to be able to download new data as we move around and then store it on the device for later use.

`locar-tiler`'s approach is to download data by *tiles*. It works out which tile corresponds to your current latitude and longitude, and then downloads all data for that tile. The tiling system is the Spherical Mercator-based system used by many web maps, such as Google Maps or OpenStreetMap (see [OGC](https://tiles.developer.ogc.org/background.html)). Each tile has an `x` (west-east), `y` (north-south) and `z` (zoom) coordinate.

This tiling system is normally used for rendered 2D maps but can also be used for pure data tiles. `locar-tiler` uses it, with a default zoom level of 13 (though this can be changed).

Consequently `locar-tiler` needs to be provided with a server URL which accepts `x`, `y` and `z` parameters and serves data fro that tile.

Note that `locar-tiler` does not include any mechanism to cache the tiled data - this is up to the developer to do. It merely downloads the tiled data when needed (i.e. the user moves into a new area) and holds it in memory so the data for that tile isn't downloaded if the user revisits that tile in the same session.

## Overview of classes

Full API documentation not yet present, but an outline is provided here. Further information can be obtained through the source code.

### LonLat and EastNorth

`locar-tiler` includes simple `LonLat` and `EastNorth` classes to represent longitude/latitude and Spherical Mercator coordinates, respectively. The former has `lon` and `lat` attributes, and the latter, `e` and `n` attributes.

### Tile

Represents a single xyz tile. Includes these methods:

- The constructor takes x, y and z parameters.
- `getMetresInTile()` - returns the number of Spherical Mercator "metres" in the tile for its zoom level.
- `getBottomLeft()` - returns the bottom left of the tile in Spherical Mercator coordinates (type `EastNorth`)
- `getTopRight()` - returns the top right of the tile in Spherical Mercator coordinates (type `EastNorth`).
- `getIndex()` - returns an index for the tile (a string) in format `z/x/y`.

### DataTile

Represents the association of a `Tile` and its data. Interface conaining a `tile` property (type `Tile`) and a `data` property (`any` or `null` for maximum flexibility on the type of data).

### Tiler

The `Tiler` class is in charge of downloading tiles when needed and storing them in memory. It is an abstract class so needs to be overridden in concrete implementations. Includes these methods:

- The constructor takes the URL of the tile server as a string. You should include the placeholders `{x}`, `{y}` and `{z}` in the URL.
- `setZoom(z: number)` - updates the zoom.
- `lonLatToSphMerc(lonLat: LonLat)` - converts a `LonLat` object to an `EastNorth` representing Spherical Mercator coordinates.
- `getTile(sphMercPos: EastNorth, zoom: number)` - returns the `Tile` containing a given Spherical Mercator position at a given zoom.
- `update(pos: EastNorth)` - performs an update, downloading new data if necessary. Returns a promise resolving with an array of `DataTile` objects representing the *new* tiles that were loaded. Existing tiles are not returned, making this a good place to implement caching logic.
- `updateByLonLat(lonLat: LonLat)` - as above but takes a `LonLat` rather than an `EastNorth` as a parameter.
- `getCurrentTiles()` - returns an array of `DataTile` objects representing the current tile and the eight surrounding tiles.
- `updateTile(pos: EastNorth)` - returns a new `Tile` object if we move into a new tile, otherwise `null`.
- `loadTile(tile: Tile)` - loads data associated with a given tile. Returns a promise resolving with a `DataTile` object containing the data associated with that tile.
- `readTile(url: string)` - *abstract method* to load the data associated with a given tile. The URL will already have `x`, `y` and `z` filled in (it's called from `loadTile()`). Should be overridden in subclasses of `Tiler`.
- `rawTileToStoredTile(tile: Tile, data: any)`. Converts the raw data downloaded from a tile server into a custom format, returning the result as a `DataTile`. Can be used if we wish to store the tile's data in a format other than the raw format provided by the server. Overridden in `DemTiler` to allow each tile to be stored as a `DEM` object.

### JsonTiler

Subclass of `Tiler` to load data from a JSON tile server. It overridden `readTile()` returns a promise resolving with the JSON data downloaded from the server.

### DemTiler

Subclass of `Tiler` to load data from a Terrarium PNG-based DEM server. Initially loads the data as raw PNG data but then converts it into a `DEM` object (see below). Overrides `rawTileToStoredTile()` to allow this. Also contains a couple of useful methods:
- `getElevation(sphMercPos: EastNorth)` - returns the elevation in metres at the given Spherical Mercator coordinates.
- `getElevationFromLonLat(lonLat: LonLat)` - returns the elevation in metres at the given longitude and latitude.

### DEM

Class to represent a Digital Elevation Model. When using `DemTile` the `data` property of the `DataTile`s returned contain a `DEM` object. When using the `DemTiler` the `DEM` objects are created for you, and similarly the `getElevation()` and `getElevationFromLonLat()` methods allow you to obtain the elevation at a given latitude/longitude. 

Attributes of `DEM` include:
- `elevs` (an array of the raw elevations. A one-dimensional array, arranged northernmost row to southernmost row). 
- `ptWidth` and `ptHeight` (number of points in the DEM in the horizontal and vertical direction); 
- `xSpacing` and `ySpacing` (the spacing in Spherical Mercator units between points);
- `bottomLeft` (an `EastNorth` representing the bottom left of the DEM).

Methods include:
- `constructor(elevs: number[], bottomLeft: EastNorth, ptWidth: number, ptHeight: number, xSpacing: number, ySpacing: number)` - call to create a DEM. Initialises the attributes above.
- `getElevation(x: number, y: number)` - get the elevation at a given Spherical Mercator coordinate, using bilinear interpolation.


## Based on

`locar-tiler` is based on [jsfreemaplib](https://gitlab.com/nickw1/jsfreemaplib), converted to TypeScript and with some API changes made. As author of `jsfreemaplib` I have re-licensed `locar-tiler` under the MIT License to be consistent with other AR.js code.
