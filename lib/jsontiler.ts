import Tiler from './tiler';

export default class JsonTiler extends Tiler {
    constructor(url: string) {
        super(url);
    }

    async readTile(url: string): Promise<any> {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }
}
