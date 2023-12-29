import Link from "next/link";
import styles from "../../styles/ReadingLists.module.css";

export default function ReadingLists() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Reading Lists</h1>
      <ul>
        <li className={styles.list}>
          <Link href='/reading-lists/2023'>2023</Link>
        </li>
        <li className={styles.list}>
          <Link href='/reading-lists/2022'>2022</Link>
        </li>
        <li className={styles.list}>
          <Link href='/reading-lists/2021'>2021</Link>
        </li>
      </ul>
    </main>
  );
}
