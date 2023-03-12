import React, { useState } from "react";
import styles from "@/styles/Chessboard.module.css";
import { startCastleMovement, whiteBottom } from "@/constants/Constans";
import Tile from "./Tile";
import { castleMovementTrack, xyCoords } from "@/constants/Types";
import { getLegalMoves, isFieldAttacked, move } from "@/utils/getLegalMoves";

export default function Chessboard() {
  const [figurePlacement, setFigurePlacement] = useState(whiteBottom);
  const [isWhiteMove, setIsWhiteMove] = useState(true);

  const [whiteKingPos, setWhiteKingPos] = useState({ x: 4, y: 0 });
  const [blackKingPos, setBlackKingPos] = useState({ x: 4, y: 7 });
  const [whiteChecked, setWhiteChecked] = useState(false);
  const [blackChecked, setBlackChecked] = useState(false);
  const [castleMovementTrack, setCastleMovementTrack] =
    useState(startCastleMovement);

  const [tileSelected, setTileSelected] = useState<xyCoords | null>(null);
  const [availableTiles, setAvailableTiles] = useState<xyCoords[]>([]);

  const [couldEnPassantOn, setCouldEnPassantOn] = useState<xyCoords | null>(
    null
  );
  const [movesHeap, setMovesHeap] = useState([]);

  const handleTileClick = (coords: xyCoords) => {
    if (!tileSelected) {
      //clicked my color
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
            castleMovementTrack,
            isWhiteMove ? whiteKingPos : blackKingPos
          )
        );
      }
    } else {
      //switched to my color
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
            castleMovementTrack,
            isWhiteMove ? whiteKingPos : blackKingPos
          )
        );
      } //clicked legal move
      else if (
        availableTiles.some((possible) => {
          return possible.x == coords.x && possible.y == coords.y;
        })
      ) {
        //set en passant
        if (
          figurePlacement[tileSelected.x][tileSelected.y].figure == "p" &&
          Math.abs(tileSelected.y - coords.y) == 2
        ) {
          setCouldEnPassantOn(coords);
        } else {
          setCouldEnPassantOn(null);
        }

        //track king position
        if (figurePlacement[tileSelected.x][tileSelected.y].figure == "K") {
          isWhiteMove ? setWhiteKingPos(coords) : setBlackKingPos(coords);
        }

        //track castling moves

        const newCastleMovementTrack = trackCastle(
          castleMovementTrack,
          tileSelected
        );
        setCastleMovementTrack(newCastleMovementTrack);

        //move
        const newPlacement = move(tileSelected, coords, figurePlacement);
        setFigurePlacement(newPlacement);

        //track checks
        if (isWhiteMove) {
          const blackChecked = isFieldAttacked(
            blackKingPos,
            newPlacement,
            "black"
          );
          setBlackChecked(blackChecked);
          setWhiteChecked(false);
        } else {
          const whiteChecked = isFieldAttacked(
            whiteKingPos,
            newPlacement,
            "white"
          );
          setWhiteChecked(whiteChecked);
          setBlackChecked(false);
        }

        //reset selection
        setAvailableTiles([]);
        setTileSelected(null);

        //switch sides
        setIsWhiteMove((isWhiteMove) => {
          return !isWhiteMove;
        });
      } //clicked somewhere else
      else {
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
    console.log("White is checked:");
    console.log(whiteChecked);
    console.log("Black is checked:");
    console.log(blackChecked);
    console.log("White king: ", whiteKingPos);
    console.log("Black king: ", blackKingPos);

    console.log("-------------------------------");
  };

  const trackCastle = (
    castleMovementTrack: castleMovementTrack,
    tileSelected: xyCoords
  ) => {
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
    return newCastleMovementTrack;
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
