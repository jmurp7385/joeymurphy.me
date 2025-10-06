import Link from 'next/link';
import Breadcrumbs, { transformLabelHuman } from '../../components/Breadcrumbs';
import Footer from '../../components/Footer';
import commonStyles from '../../styles/common.module.css';
import styles from '../../styles/ReadingLists.module.css';

export default function ReadingLists() {
  return (
    <main className={styles.main}>
      <Breadcrumbs
        containerStyle={{ alignSelf: 'flex-start', paddingBottom: '2.5rem' }}
        transformLabel={transformLabelHuman}
      />
      <h1 className={styles.title} style={{ paddingBottom: '1.5rem' }}>
        Reading Lists
      </h1>
      <ul className={styles.container}>
        <li className={styles.listItem}>
          <Link href='/reading-lists/2025'>2025</Link>
        </li>
        <li className={styles.listItem}>
          <Link href='/reading-lists/2024'>2024</Link>
        </li>
        <li className={styles.listItem}>
          <Link href='/reading-lists/2023'>2023</Link>
        </li>
        <li className={styles.listItem}>
          <Link href='/reading-lists/2022'>2022</Link>
        </li>
        <li className={styles.listItem}>
          <Link href='/reading-lists/2021'>2021</Link>
        </li>
      </ul>
      <div className={commonStyles.spacer}></div>
      <Footer />
    </main>
  );
}
