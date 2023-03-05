import React from "react";
import styles from "@/styles/Chessboard.module.css";
import Image from "next/image";

import { Position, xyCoords } from "@/constants/Types";

type Props = {
  id: number;
  row: number;
  col: number;
  piece: Position;
  onClick: (coords: xyCoords) => void;
  isPossibleMove: boolean;
  isHighlighted: boolean;
};

export default function Tile({
  id,
  row,
  col,
  piece,
  onClick,
  isPossibleMove,
  isHighlighted,
}: Props) {
  const isBlack = Boolean(Math.abs(row - col) % 2);
  const fig = piece.figure?.toLowerCase();
  const color = piece.color?.toLowerCase()[0];
  return (
    <div
      className={styles.tile}
      style={{
        backgroundColor: isHighlighted
          ? "green"
          : !isBlack
          ? "darkorange"
          : "white",
      }}
      onClick={() => onClick({ x: col, y: row })}
    >
      {fig ? (
        <Image src={"/pieces/" + color + fig + ".png"} alt={color + fig} fill />
      ) : null}
      {fig && isPossibleMove ? (
        <Image src={"/takes.png"} alt={"take"} fill />
      ) : isPossibleMove ? (
        <Image src={"/move.png"} alt={"move"} fill />
      ) : null}
    </div>
  );
}
