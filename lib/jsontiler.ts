import Tiler from './tiler';

/** Class representing a Tiler which delivers JSON data. */
export default class JsonTiler extends Tiler {
  
    /**
     * Create a JsonTiler.
     * @class
     * @param {string} url - URL of the server delivering the tiles.
     */
    constructor(url: string) {
        super(url);
    }

    /**
     * Overridden readTile() for JsonTiler.
     * @param {string} url - the URL.
     * @return {Promise<any>} a Promise resolving with parsed JSON data.
     */
    async readTile(url: string): Promise<any> {
        const response = await fetch(url, {
			signal: AbortSignal.timeout(30000)
		});
        const data = await response.json();
        return data;
    }
}
