import { diagonalDirections, straightDirections } from "@/constants/Constans";
import {
  Position,
  xyCoords,
  Color,
  Direction,
  castleMovementTrack,
} from "@/constants/Types";
export const getLegalMoves = (
  positions: Position[][],
  from: xyCoords,
  couldEnPassantOn: xyCoords | null,
  castleMovementTrack: castleMovementTrack
): xyCoords[] => {
  const figure = positions[from.x][from.y].figure;
  const color = positions[from.x][from.y].color;
  if (!color) throw new Error("No color");

  let moves: xyCoords[] = [];

  switch (figure) {
    case "R":
      moves = straightMoves(from, positions);
      break;
    case "B":
      moves = diagonalMoves(from, positions);
      break;
    case "Q":
      moves = straightMoves(from, positions);
      moves = moves.concat(diagonalMoves(from, positions));
      break;
    case "N":
      moves = knightMoves(from).filter(
        ({ x, y }) => positions[x][y].color !== color
      );

      break;
    case "p":
      //en passaint
      //promotion
      moves = pawnMoves(from, positions, couldEnPassantOn);
      break;
    case "K":
      //castle
      moves = kingMoves(from, castleMovementTrack, positions);
      break;
  }
  return moves.filter(
    (coords) => !isKingInCheck(move(from, coords, positions), color)
  );
};

const isKingInCheck = (positions: Position[][], color: Color): boolean => {
  const kingPosition = findKing(positions, color);
  const isAttacked = isFieldAttacked(kingPosition, positions, color);

  return isAttacked;
};

const straightMoves = (from: xyCoords, positions: Position[][]): xyCoords[] => {
  return lineMoves(from, positions, straightDirections);
};
const diagonalMoves = (from: xyCoords, positions: Position[][]): xyCoords[] => {
  return lineMoves(from, positions, diagonalDirections);
};

const lineMoves = (
  from: xyCoords,
  positions: Position[][],
  directions: Direction[]
): xyCoords[] => {
  const moves: xyCoords[] = [];
  const color = positions[from.x][from.y].color;
  directions.forEach((dir) => {
    let x = from.x + dir.xDelta;
    let y = from.y + dir.yDelta;
    while (isOnBoard({ x: x, y: y }) && positions[x][y].color !== color) {
      moves.push({ x: x, y: y });
      if (positions[x][y].color != null) {
        break;
      }
      x = x + dir.xDelta;
      y = y + dir.yDelta;
    }
  });
  return moves;
};

//for checks, mates, castling and king moves
export const isFieldAttacked = (
  coords: xyCoords,
  positions: Position[][],
  victimColor: Color
): boolean => {
  const adjacent = getAdjasentFields(coords);
  if (
    adjacent.some(
      (coords) =>
        positions[coords.x][coords.y].figure === "K" &&
        positions[coords.x][coords.y].color !== victimColor
    )
  ) {
    console.log("King attacks ", coords);
    console.log(victimColor);
    return true; //king protects
  }

  const pawnDirection = victimColor === "white" ? 1 : -1;
  const pawnFields = [
    { x: coords.x - 1, y: coords.y + pawnDirection },
    { x: coords.x + 1, y: coords.y + pawnDirection },
  ].filter(isOnBoard);
  if (
    pawnFields.some(
      (coords) =>
        positions[coords.x][coords.y].figure === "p" &&
        positions[coords.x][coords.y].color !== victimColor
    )
  ) {
    console.log("pawn attacks ", coords);
    console.log(victimColor);
    return true; //pawn protects
  }
  const knightFields = knightMoves(coords);
  if (
    knightFields.some(
      (coords) =>
        positions[coords.x][coords.y].figure === "N" &&
        positions[coords.x][coords.y].color !== victimColor
    )
  ) {
    console.log("Knight attacks ", coords);
    console.log(victimColor);
    return true; //knight protects
  }
  for (const dir of straightDirections) {
    let x = coords.x + dir.xDelta;
    let y = coords.y + dir.yDelta;
    while (isOnBoard({ x: x, y: y }) && positions[x][y].color !== victimColor) {
      if (positions[x][y].color != null) {
        if (positions[x][y].figure == "Q" || positions[x][y].figure == "R") {
          console.log({ x: x, y: y }, "Rook or Queen attacks ", coords);
          console.log(victimColor);
          return true; // rook or queen protects
        }
        break;
      }
      x = x + dir.xDelta;
      y = y + dir.yDelta;
    }
  }

  for (const dir of diagonalDirections) {
    let x = coords.x + dir.xDelta;
    let y = coords.y + dir.yDelta;
    while (isOnBoard({ x: x, y: y }) && positions[x][y].color !== victimColor) {
      if (positions[x][y].color != null) {
        if (positions[x][y].figure == "Q" || positions[x][y].figure == "B") {
          console.log({ x: x, y: y }, "Bishop or Queen attacks ", coords);
          console.log(victimColor);
          return true; // bishop or queen protects
        }
        break;
      }
      x = x + dir.xDelta;
      y = y + dir.yDelta;
    }
  }
  return false; //nothing protects
};

//for king
const getAdjasentFields = (coords: xyCoords): xyCoords[] => {
  const fields = [
    { x: coords.x + 1, y: coords.y },
    { x: coords.x + 1, y: coords.y - 1 },
    { x: coords.x, y: coords.y - 1 },
    { x: coords.x - 1, y: coords.y - 1 },
    { x: coords.x - 1, y: coords.y },
    { x: coords.x - 1, y: coords.y + 1 },
    { x: coords.x, y: coords.y + 1 },
    { x: coords.x + 1, y: coords.y + 1 },
  ];
  return fields.filter(isOnBoard);
};

const knightMoves = (from: xyCoords): xyCoords[] => {
  return [
    { x: from.x - 1, y: from.y + 2 },
    { x: from.x + 1, y: from.y + 2 },
    { x: from.x - 1, y: from.y - 2 },
    { x: from.x + 1, y: from.y - 2 },
    { x: from.x - 2, y: from.y + 1 },
    { x: from.x - 2, y: from.y - 1 },
    { x: from.x + 2, y: from.y - 1 },
    { x: from.x + 2, y: from.y + 1 },
  ].filter(isOnBoard);
};

function pawnMoves(
  from: xyCoords,
  positions: Position[][],
  couldEnPassantOn: xyCoords | null
): xyCoords[] {
  const moves: xyCoords[] = [];
  const color = positions[from.x][from.y].color;
  const dir = color === "white" ? 1 : -1;
  if (positions[from.x][from.y + dir].figure === null) {
    moves.push({ x: from.x, y: from.y + dir });
  }
  //double forward
  if (
    (from.y === 1 && color === "white") ||
    (from.y === 6 && color === "black")
  ) {
    if (
      positions[from.x][from.y + 2 * dir].figure === null &&
      positions[from.x][from.y + dir].figure === null
    )
      moves.push({ x: from.x, y: from.y + 2 * dir });
  }
  //en passant
  if (
    couldEnPassantOn &&
    Math.abs(couldEnPassantOn.x - from.x) === 1 &&
    couldEnPassantOn.y === from.y
  ) {
    moves.push({ x: couldEnPassantOn.x, y: from.y + dir });
  }
  //takes
  if (
    from.x + 1 < 8 &&
    positions[from.x + 1][from.y + dir].color != color &&
    positions[from.x + 1][from.y + dir].color
  ) {
    moves.push({ x: from.x + 1, y: from.y + dir });
  }
  if (
    from.x - 1 >= 0 &&
    positions[from.x - 1][from.y + dir].color != color &&
    positions[from.x - 1][from.y + dir].color
  ) {
    moves.push({ x: from.x - 1, y: from.y + dir });
  }

  return moves;
}

const kingMoves = (
  from: xyCoords,
  castleMovementTrack: castleMovementTrack,
  positions: Position[][]
): xyCoords[] => {
  const color = positions[from.x][from.y].color;
  if (!color) throw new Error("No color");
  const moves = getAdjasentFields(from).filter((coords) => {
    return positions[coords.x][coords.y].color != color;
  });

  const row = color === "black" ? 7 : 0;
  //castles
  //king didn't move
  if (castleMovementTrack[color].e) {
    //a rook didn't move
    if (castleMovementTrack[color].a) {
      //king doesn't pass attacked field
      if (
        positions[0][row].color == color &&
        positions[0][row].figure == "R" &&
        !isFieldAttacked(from, positions, color) &&
        !isFieldAttacked({ x: from.x - 1, y: from.y }, positions, color)
      ) {
        //empty space between
        if (
          !positions[1][row].figure &&
          !positions[2][row].figure &&
          !positions[3][row].figure
        ) {
          moves.push({ x: from.x - 2, y: from.y });
        }
      }
    }
    //h rook didn't move
    if (castleMovementTrack[color].h) {
      //king doesn't pass attacked field
      if (
        positions[7][row].color == color &&
        positions[7][row].figure == "R" &&
        !isFieldAttacked(from, positions, color) &&
        !isFieldAttacked({ x: from.x + 1, y: from.y }, positions, color)
      ) {
        //empty space between
        if (!positions[6][row].figure && !positions[5][row].figure) {
          moves.push({ x: from.x + 2, y: from.y });
        }
      }
    }
  }
  return moves;
};

const isOnBoard = (coords: xyCoords): boolean => {
  if (coords.x < 0 || coords.x > 7 || coords.y < 0 || coords.y > 7)
    return false;
  return true;
};

//does not check legality
export const move = (
  from: xyCoords,
  to: xyCoords,
  positions: Position[][]
): Position[][] => {
  const newPositions: Position[][] = JSON.parse(JSON.stringify(positions));

  if (newPositions[from.x][from.y].figure === "K") {
    //castle
    if (from.x - to.x === 2) {
      //short
      newPositions[to.x][to.y].figure = "K";
      newPositions[to.x][to.y].color = newPositions[from.x][from.y].color;
      newPositions[from.x][from.y] = { figure: null, color: null };

      newPositions[to.x + 1][to.y].figure = "R";
      newPositions[to.x + 1][to.y].color = newPositions[0][from.y].color;
      newPositions[0][from.y] = { figure: null, color: null };
      return newPositions;
    } else if (from.x - to.x === -2) {
      //long
      newPositions[to.x][to.y].figure = "K";
      newPositions[to.x][to.y].color = newPositions[from.x][from.y].color;
      newPositions[from.x][from.y] = { figure: null, color: null };

      newPositions[to.x - 1][to.y].figure = "R";
      newPositions[to.x - 1][to.y].color = newPositions[7][from.y].color;
      newPositions[7][from.y] = { figure: null, color: null };
      return newPositions;
    }
  }
  //en passant
  if (
    newPositions[from.x][from.y].figure === "p" &&
    from.x != to.x &&
    newPositions[to.x][to.y].figure === null
  ) {
    newPositions[to.x][from.y] = { figure: null, color: null };
  }

  newPositions[to.x][to.y].figure = newPositions[from.x][from.y].figure;
  newPositions[to.x][to.y].color = newPositions[from.x][from.y].color;
  newPositions[from.x][from.y] = { figure: null, color: null };
  return newPositions;
};

export const findKing = (positions: Position[][], color: Color): xyCoords => {
  const cols = positions.map((column) =>
    column.findIndex((field) => field.color === color && field.figure === "K")
  );
  const y = cols.find((y) => y >= 0);
  if (y == undefined)
    throw new Error(
      color.charAt(0).toUpperCase() + color.slice(1) + " king not found!!!"
    );
  const x = cols.indexOf(y);
  if (x === -1)
    throw new Error(
      color.charAt(0).toUpperCase() + color.slice(1) + " king not found!!!"
    );
  return { x: x, y: y };
};
