import React, { useState } from "react";
import styles from "@/styles/Chessboard.module.css";
import { startCastleMovement, whiteBottom } from "@/constants/Constans";
import Tile from "./Tile";
import { castleMovementTrack, xyCoords } from "@/constants/Types";
import {
  findKing,
  getLegalMoves,
  isFieldAttacked,
  move,
} from "@/utils/getLegalMoves";

export default function Chessboard() {
  const [figurePlacement, setFigurePlacement] = useState(whiteBottom);
  const [whiteChecked, setWhiteChecked] = useState(false);
  const [blackChecked, setBlackChecked] = useState(false);
  const [tileSelected, setTileSelected] = useState<xyCoords | null>(null);
  const [couldEnPassantOn, setCouldEnPassantOn] = useState<xyCoords | null>(
    null
  );
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
          getLegalMoves(
            figurePlacement,
            coords,
            couldEnPassantOn,
            castleMovementTrack
          )
        );
      }
    } else {
      if (
        figurePlacement[coords.x][coords.y].color ==
          (isWhiteMove ? "white" : "black") &&
        (tileSelected.x != coords.x || tileSelected.y != coords.y)
      ) {
        setTileSelected(coords);
        setAvailableTiles(
          getLegalMoves(
            figurePlacement,
            coords,
            couldEnPassantOn,
            castleMovementTrack
          )
        );
      } else if (
        availableTiles.some((possible) => {
          return possible.x == coords.x && possible.y == coords.y;
        })
      ) {
        if (
          figurePlacement[tileSelected.x][tileSelected.y].figure == "p" &&
          Math.abs(tileSelected.y - coords.y) == 2
        ) {
          setCouldEnPassantOn(coords);
        } else {
          setCouldEnPassantOn(null);
        }
        const newPlacement = move(tileSelected, coords, figurePlacement);
        setFigurePlacement(newPlacement);

        const newCastleMovementTrack: castleMovementTrack = JSON.parse(
          JSON.stringify(castleMovementTrack)
        );
        if (tileSelected.y == 0) {
          if (tileSelected.x == 0) {
            newCastleMovementTrack.white.a = false;
          } else if (tileSelected.x == 4) {
            newCastleMovementTrack.white.e = false;
          } else if (tileSelected.x == 7) {
            newCastleMovementTrack.white.h = false;
          }
        } else if (tileSelected.y == 7) {
          if (tileSelected.x == 0) {
            newCastleMovementTrack.black.a = false;
          } else if (tileSelected.x == 4) {
            newCastleMovementTrack.black.e = false;
          } else if (tileSelected.x == 7) {
            newCastleMovementTrack.black.h = false;
          }
        }
        setCastleMovementTrack(newCastleMovementTrack); //TODO optimize

        if (isWhiteMove) {
          setBlackChecked(
            isFieldAttacked(
              findKing(newPlacement, isWhiteMove ? "black" : "white"),
              newPlacement,
              !isWhiteMove ? "black" : "white"
            )
          );
        } else {
          setWhiteChecked(
            isFieldAttacked(
              findKing(newPlacement, isWhiteMove ? "black" : "white"),
              newPlacement,
              !isWhiteMove ? "black" : "white"
            )
          );
        } //TODO optimize

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
    console.log("Can En Passant:");
    console.log(couldEnPassantOn);
    console.log("Who is checked:");
    console.log(whiteChecked ? "white" : blackChecked ? "black" : "none");

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
              canEnPassantOnto={
                tileSelected && couldEnPassantOn
                  ? couldEnPassantOn.x == colNo &&
                    couldEnPassantOn.y + (isWhiteMove ? 1 : -1) == rowNo &&
                    figurePlacement[tileSelected.x][tileSelected.y].figure ==
                      "p"
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
