import React from "react";
import styles from "@/styles/Chessboard.module.css";
import { type } from "os";

type Props = {
  id: number;
  row: number;
  col: number;
};

export default function Tile({ id, row, col }: Props) {
  const isBlack = Boolean(Math.abs(row - col) % 2);
  return (
    <div
      className={styles.tile}
      style={{ backgroundColor: isBlack ? "darkorange" : "white" }}
    >
      {id}
    </div>
  );
}
