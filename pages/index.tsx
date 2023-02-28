import Head from "next/head";
import styles from "@/styles/Home.module.css";
import Chessboard from "@/components/Chessboard";
import Controls from "@/components/Controls";

export default function Home() {
  return (
    <>
      <Head>
        <title>React Chess</title>
        <meta name="description" content="Chess built with React NextJS" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <Chessboard />
        <Controls />
      </main>
    </>
  );
}
