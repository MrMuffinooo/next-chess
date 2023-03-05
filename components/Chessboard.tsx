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
    console.log("clicked: " + JSON.stringify(coords));
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
          (isWhiteMove ? "white" : "black") &&
        tileSelected.x != coords.x &&
        tileSelected.y != coords.y
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
  const logState = () => {
    console.log("-------------STATE-------------");
    console.log("Positions:");
    console.log(figurePlacement);
    console.log("Is white move:");
    console.log(isWhiteMove);
    console.log("Selected tile:");
    console.log(tileSelected);
    console.log("Available move tiles:");
    console.log(availableTiles);
    console.log("Castling track:");
    console.log(castleMovementTrack);
    console.log("-------------------------------");
  };
  return (
    <div className={styles.container}>
      {[...Array(8)].map((v, i) =>
        [...Array(8)].map((w, colNo) => {
          const rowNo = 7 - i;
          return (
            <Tile
              id={8 * rowNo + colNo}
              row={rowNo}
              col={colNo}
              key={8 * rowNo + colNo}
              piece={figurePlacement[colNo][rowNo]}
              onClick={handleTileClick}
              isPossibleMove={availableTiles.some((coords) => {
                return coords.x == colNo && coords.y == rowNo;
              })}
              isHighlighted={
                tileSelected
                  ? tileSelected.x == colNo && tileSelected.y == rowNo
                  : false
              }
            />
          );
        })
      )}
      <button className={styles.logButton} onClick={logState}>
        Log state
      </button>
    </div>
  );
}
