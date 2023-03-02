import { diagonalDirections, straightDirections } from "@/constants/Constans";
import { Positions, xyCoords, Color, Direction } from "@/constants/Types";
export const getLegalMoves = (
  positions: Positions,
  from: xyCoords,
  couldEnPassantOn: xyCoords | null
): xyCoords[] => {
  const figure = positions[from.x][from.y].figure;
  const color = positions[from.x][from.y].color;

  const moves: xyCoords[] = [];

  switch (figure) {
    case "R":
      moves.concat(straightMoves(from, positions));
      break;
    case "B":
      moves.concat(diagonalMoves(from, positions));
      break;
    case "Q":
      moves.concat(straightMoves(from, positions));
      moves.concat(diagonalMoves(from, positions));
      break;
    case "N":
      moves.concat(
        knightMoves(from).filter(({ x, y }) => positions[x][y].color !== color)
      );
      break;
    case "p":
      //en passaint
      //promotion
      moves.concat(pawnMoves(from, positions, couldEnPassantOn));
      break;
    case "K":
      //castle
      moves.concat(kingMoves(from, positions));
      break;
  }

  return moves.filter((coords) => !isMoveSelfChecking(from, coords));
};

const straightMoves = (from: xyCoords, positions: Positions): xyCoords[] => {
  return lineMoves(from, positions, straightDirections);
};
const diagonalMoves = (from: xyCoords, positions: Positions): xyCoords[] => {
  return lineMoves(from, positions, diagonalDirections);
};

const lineMoves = (
  from: xyCoords,
  positions: Positions,
  directions: Direction[]
): xyCoords[] => {
  const moves: xyCoords[] = [];
  const color = positions[from.x][from.y].color;
  directions.forEach((dir) => {
    let x = from.x;
    let y = from.y;
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
//
const isFieldAttacked = (
  coords: xyCoords,
  positions: Positions,
  victimColor: Color
): boolean => {
  const adjacent = getAdjasentFields(coords);
  if (
    adjacent.some(
      (coords) =>
        positions[coords.x][coords.y].figure === "K" &&
        positions[coords.x][coords.y].color !== victimColor
    )
  )
    return true; //king protects

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
  )
    return true; //pawn protects

  const knightFields = knightMoves(coords);
  if (
    knightFields.some(
      (coords) =>
        positions[coords.x][coords.y].figure === "N" &&
        positions[coords.x][coords.y].color !== victimColor
    )
  )
    return true; //knight protects

  straightDirections.forEach((dir) => {
    let x = coords.x;
    let y = coords.y;
    while (isOnBoard({ x: x, y: y }) && positions[x][y].color !== victimColor) {
      if (positions[x][y].color != null) {
        if (positions[x][y].figure == "Q" || positions[x][y].figure == "R")
          return true; // rook or queen protects
      }
      x = x + dir.xDelta;
      y = y + dir.yDelta;
    }
  });

  diagonalDirections.forEach((dir) => {
    let x = coords.x;
    let y = coords.y;
    while (isOnBoard({ x: x, y: y }) && positions[x][y].color !== victimColor) {
      if (positions[x][y].color != null) {
        if (positions[x][y].figure == "Q" || positions[x][y].figure == "B")
          return true; // bishop or queen protects
      }
      x = x + dir.xDelta;
      y = y + dir.yDelta;
    }
  });
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
  positions: Positions,
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
    if (positions[from.x][from.y + 2 * dir].figure === null)
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
    positions[from.x + 1][from.y + dir].color != color &&
    positions[from.x + 1][from.y + dir].color
  ) {
    moves.push({ x: from.x + 1, y: from.y + dir });
  }
  if (
    positions[from.x - 1][from.y + dir].color != color &&
    positions[from.x - 1][from.y + dir].color
  ) {
    moves.push({ x: from.x - 1, y: from.y + dir });
  }

  return moves;
}

const isOnBoard = (coords: xyCoords): boolean => {
  if (coords.x < 0 || coords.x > 7 || coords.y < 0 || coords.y > 7)
    return false;
  return true;
};
const isMoveSelfChecking = (
  from: xyCoords,
  to: xyCoords,
  positions: Positions
): boolean => {
  throw new Error("Function not implemented.");
};

//does not check legality
const move = (
  from: xyCoords,
  to: xyCoords,
  positions: Positions
): Positions => {
  const newPositions: Positions = JSON.parse(JSON.stringify(positions));

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

const filterChecks = (
  positions: Positions,
  coords: xyCoords,
  moves: xyCoords[],
  color: Color
): xyCoords[] => {
  const kingPosition = findKing(positions, color);
  //if king moves
  //if someone else moves
};

const findKing = (positions: Positions, color: Color): xyCoords => {
  const cols = positions.map((column) =>
    column.findIndex((field) => field.color === color && field.figure === "K")
  );
  const y = cols.find((y) => y >= 0);
  if (!y)
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
