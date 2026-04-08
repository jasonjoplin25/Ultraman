import { TILE_PALETTE_DEFAULT } from '../../graphics/sprite-data.js';

export const STAGE_CASTLE1 = {
    stageName: 'Wily Castle 1',
    bossType: 'castle_boss',
    bgColor: '#100020',
    palette: TILE_PALETTE_DEFAULT,
    layout: `
BBBB...................BB.......................................................................................................BBBB..........................................G.................BBBB
BB....................FBB.......................................................................................................BBBB..........................................G.................BBBB
BB.....................BB.............................F.........BBBB............................................................B..................F..........................G.................BBBB
BB.....................BB.......................................BBBB...........................................................5B.F...........................................G.................BBBB
BB...BBBBBB.........BBTBB....F.....M..........F..U.............BBBB.......4...M......J...1.........4....M....................BBBB......................1...........M.J..6.....G.................BBBB
BB.....BB...........BBLBB..........BBBBBB....BBBBBBBBB.........BBBB.....4BBBBBBBBB...BBBBB....BBBBBBBBBBB.....J.BBBBB.....BBBB....BBBBB........M.BBBBB.....BBBBBBBBBBBBBBBBBBBB.................BBBB
BB.....B.......PP...BBLBB.....BBBBBBBBBBBBBBBBBBBBBBBBBBB......BBBBBTBBBBB......BBBBBB...BBBBBB.........BBBBBBBBBBBBBBB.....BBBBBTBBBBBBBBBB...BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB.................BBBB
BBBB...B..........v.BBLBB4BB..BBBBBBBBBBBBBBBB........56BBB.v..BBBBBLBBBBB......B......J......B......4.......BBBBBBBBBBB....BBBBBLBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB.................BBBB
BB.....BB5..........BBLBBBBB4..BBBBBBBBBBBBBBB.........MBBB.....BBBBLBBBBBTBBBBTB...4..B......B..BBBBBB...J..BBBBBBBBBB......BBBBLBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB.................BBBB
BB...BBBBBB.........BBL...BBB...B....BBBBBBBBB..BBBBBBBBBBB.....BBBBLBBBBBLBBBBLB.BBBBBBBBBBBTB.......BBBBBBTBBBBBBBBB........BBBLBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB.................BBBB
BB..................BB....BBBB4..........................BB.....BBBBLBBBBBLBBBBLB...........BLB..4.........BLBBBBBBBB..........BBLBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB.................BBBB
BB.@........m....m..BBBBB..BBBB.........M.................B...F.BBBBLBBBBBLBBBBLB.M......4..BLBBBBBBJ......BLBBBBBBB.............L.BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB........*........BBBB
BBBB....................BF..BBBBBBBBBBBBBBBBBBBBBBBBBBBB..BB....BBBBLBBBBBLBBBBLBBBBBBBBBBB.BLBBBBBBBBBB..BBL...BBB...C..........U6BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB.................BBBB
BBBB....................B...................F..............B....BBB.L.....LBBB.L............BL............B.L........BBB........BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB
BBBBSSSSSSSSSSSSSSSSSSSSB.B.........M......................BSSSSBBB....5...BBB.....J........B.....J......MB........MBBBBSSSSBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB
BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB
`
};
