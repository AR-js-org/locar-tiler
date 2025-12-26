`locar-tiler` is a tiled download system for geodata, particularly useful for augmented reality applications.

## Introduction

In many geographically-aware applications, including (but not limited to) location-based augmented reality applications, it is useful to be able to download new data as we move around and then store it on the device for later use.

`locar-tiler`'s approach is to download data by *tiles*. It works out which tile corresponds to your current latitude and longitude, and then downloads all data for that tile. The tiling system is the Spherical Mercator-based system used by many web maps, such as Google Maps or OpenStreetMap (see [OGC](https://tiles.developer.ogc.org/background.html)). Each tile has an `x` (west-east), `y` (north-south) and `z` (zoom) coordinate.

This tiling system is normally used for rendered 2D maps but can also be used for pure data tiles. `locar-tiler` uses it, with a default zoom level of 13 (though this can be changed).

Consequently `locar-tiler` needs to be provided with a server URL which accepts `x`, `y` and `z` parameters and serves data fro that tile.

Note that `locar-tiler` does not include any mechanism to cache the tiled data - this is up to the developer to do. It merely downloads the tiled data when needed (i.e. the user moves into a new area) and holds it in memory so the data for that tile isn't downloaded if the user revisits that tile in the same session.

## API Documentation

Available on [GitHub Pages](https://ar-js-org.github.io/locar-tiler).

## Based on

`locar-tiler` is based on [jsfreemaplib](https://gitlab.com/nickw1/jsfreemaplib), converted to TypeScript and with some API changes made. As author of `jsfreemaplib` I have re-licensed `locar-tiler` under the MIT License to be consistent with other AR.js code.
