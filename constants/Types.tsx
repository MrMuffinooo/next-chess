export type Piece = "K" | "Q" | "R" | "B" | "N" | "p";
export type Color = "white" | "black";
// export type PositionsRelation =
//   | "N"
//   | "NE"
//   | "E"
//   | "SE"
//   | "S"
//   | "SW"
//   | "W"
//   | "NW";

export type Positions = {
  figure: Piece | null;
  color: Color | null;
}[][];

export type xyCoords = {
  x: number;
  y: number;
};
export type Direction = {
  xDelta: number;
  yDelta: number;
};

export type MoveLog = {
  from: xyCoords;
  to: xyCoords;
  takes: Piece | null;
};

export type castleMovementTrack = {
  black: {
    a: boolean;
    h: boolean;
    e: boolean;
  };
  white: {
    a: boolean;
    h: boolean;
    e: boolean;
  };
};
/*
K-king
Q-queen
R-rook
B-bishop
N-knight
p-pawn

*/
