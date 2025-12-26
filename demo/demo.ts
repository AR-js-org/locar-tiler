
import * as LocarTiler from '../lib/index';


interface DemoTiler {
    type: String;
    tiler: LocarTiler.Tiler;
}

const jsonTiler = new LocarTiler.JsonTiler("https://hikar.org/webapp/map/{z}/{x}/{y}.json?outProj=4326");
const demTiler = new LocarTiler.DemTiler("https://hikar.org/webapp/dem/{z}/{x}/{y}.png");
demo();

async function demo() {
    const tilers: DemoTiler[] = [{
        type : "json", tiler: jsonTiler
    }, {
        type: "dem", tiler: demTiler
    }];
    for(let curTiler of tilers) {
        console.log(`Tiler type: ${curTiler.type}`);
        const demTile = await curTiler.tiler.updateByLonLat(
            new LocarTiler.LonLat(-0.72, 51.05)
        );
        const tiles = curTiler.tiler.getCurrentTiles();
        console.log(tiles.map(dt => dt.tile));
        console.log(tiles.map(dt => dt.data));
    }

    console.log("DemApplier:\n----------");
    const jsonTiler2 = new LocarTiler.JsonTiler("https://hikar.org/webapp/map/{z}/{x}/{y}.json?outProj=4326");
    const demTiler2 = new LocarTiler.DemTiler("https://hikar.org/webapp/dem/{z}/{x}/{y}.png");
    const applier = new LocarTiler.DemApplier(demTiler2, jsonTiler2);
    const jsonTiles = await applier.updateByLonLat(
            new LocarTiler.LonLat(-0.72, 51.05)
    );
    console.log(JSON.stringify(jsonTiles));
}
