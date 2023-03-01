import React, { useState } from "react";
import styles from "@/styles/Chessboard.module.css";
import { whiteBottom } from "@/constants/Constans";

export default function Chessboard() {
  const [figurePlacement, setFigurePlacement] = useState(whiteBottom);
  const [whiteChecked, setWhiteChecked] = useState(false);
  const [blackChecked, setBlackChecked] = useState(false);
  const [tileSelected, setTileSelected] = useState(null);
  const [availableTiles, setAvailableTiles] = useState([]);
  const [movesHeap, setMovesHeap] = useState([]);

  return <div className={styles.container}>Chessboard</div>;
}
