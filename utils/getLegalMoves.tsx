import { diagonalDirections, straightDirections } from "@/constants/Constans";
import { Positions, xyCoords, Color, Direction } from "@/constants/Types";
export const getLegalMoves = (
  positions: Positions,
  from: xyCoords
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
      moves.concat(pawnMoves(from, positions));
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

/////////////////////////////////TODOVVV
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

const isOnBoard = (coords: xyCoords): boolean => {
  if (coords.x < 0 || coords.x > 7 || coords.y < 0 || coords.y > 7)
    return false;
  return true;
};
const isMoveSelfChecking = (from: xyCoords, to: xyCoords): boolean => {
  throw new Error("Function not implemented.");
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
