import React, { useState } from "react";
import styles from "@/styles/Chessboard.module.css";
import { startCastleMovement, whiteBottom } from "@/constants/Constans";
import Tile from "./Tile";
import { xyCoords } from "@/constants/Types";
import { getLegalMoves, move } from "@/utils/getLegalMoves";

export default function Chessboard() {
  const [figurePlacement, setFigurePlacement] = useState(whiteBottom);
  const [whiteChecked, setWhiteChecked] = useState(false);
  const [blackChecked, setBlackChecked] = useState(false);
  const [tileSelected, setTileSelected] = useState<xyCoords | null>(null);
  const [availableTiles, setAvailableTiles] = useState<xyCoords[]>([]);
  const [movesHeap, setMovesHeap] = useState([]);
  const [isWhiteMove, setIsWhiteMove] = useState(true);
  const [castleMovementTrack, setCastleMovementTrack] =
    useState(startCastleMovement);

  const handleTileClick = (coords: xyCoords) => {
    if (!tileSelected) {
      if (
        figurePlacement[coords.x][coords.y].color ==
        (isWhiteMove ? "white" : "black")
      ) {
        setTileSelected(coords);
        setAvailableTiles(
          getLegalMoves(figurePlacement, coords, null, castleMovementTrack)
        );
      }
    } else {
      if (
        figurePlacement[coords.x][coords.y].color ==
        (isWhiteMove ? "white" : "black")
      ) {
        setTileSelected(coords);
        setAvailableTiles(
          getLegalMoves(figurePlacement, coords, null, castleMovementTrack)
        );
      } else if (
        availableTiles.some((possible) => {
          return possible.x == coords.x && possible.y == coords.y;
        })
      ) {
        setFigurePlacement(move(tileSelected, coords, figurePlacement));
        setAvailableTiles([]);
        setTileSelected(null);
        setIsWhiteMove((isWhiteMove) => {
          return !isWhiteMove;
        });
      } else {
        setAvailableTiles([]);
        setTileSelected(null);
      }
    }
  };
  return (
    <div className={styles.container}>
      {[...Array(8)].map((v, i) =>
        [...Array(8)].map((w, j) => (
          <Tile
            id={8 * (7 - i) + j}
            row={7 - i}
            col={j}
            key={8 * i + j}
            piece={figurePlacement[j][7 - i]}
            onClick={handleTileClick}
            isPossibleMove={availableTiles.some((coords) => {
              return coords.x == j && coords.y == i;
            })}
            isHighlighted={
              tileSelected ? tileSelected.x == j && tileSelected.y == i : false
            }
          />
        ))
      )}
    </div>
  );
}
