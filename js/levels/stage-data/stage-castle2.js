import { TILE_PALETTE_DEFAULT } from '../../graphics/sprite-data.js';

export const STAGE_CASTLE2 = {
    stageName: 'Wily Castle 2',
    bossType: 'final_boss',
    bgColor: '#080008',
    palette: TILE_PALETTE_DEFAULT,
    layout: `
BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB
B.................B............F................B...............G........B.........B............BBBB
B.2...........M...B.....6....M.....J1......U4...B...............G...............................BBBB
B.BBBBBBBBBBBBBBBTB.BBBBBBBBBBBBBBBBBBBBBBBBBBB.B...............G...............................BBBB
B...............BLB.........B...B...............B.............M.G65............................6BBBB
BM...J........2.BLBJ.M2....FB...B.....4M........B........J..BBBBBBBB..........................BBBB..
BBBBBBBBBBBBBBB.BLBBBBBBBBB.B.BTB.BBBBBBBBBBBBBBB...BBBBBBBBBBBBBBBB............................BBBB
B...............BLB.........B.BLB...............B...............BBBB...........................6BBBB
B.2............MBLB.........BFBLB...U4..........B...........U..5BBBB.........................BBBBBB.
B.BBBBBBBBBBBBBBBLB.BBBBBBBBB.BLBBBBBBBBBBBBBBB.B..BBBBBBBBBBBBBBBBB............................BBBB
B...............BLB...........BLB...............B...............BBBB........................BBBBBBBB
BM..............BLB..M2...F...BLB.4M..4J........B4M..........4..BBBB............................BBBB
BBBBBBBBBBBBBBB.BLBBBBBBBBBBBBBLB.BBBBBBBBBBBBBBBBBBBBBBBBBBBB..BBBB............................BBBB
B...............BL............FLB...............................BBBB....................*.......BBBB
B@........J....MB...........M2..B.............U4.............M4JBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB
BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB
`
};
