
export interface PieceStats {
    name: string;
    health: number;
    mana: number;
    attack: number;
    armor: number;
};

export class Piece {
    x: number;
    y: number;
    stats: PieceStats;

    constructor(x: number, y: number, stats: PieceStats) {
        this.x = x;
        this.y = y;
        this.stats = stats;
    }
}