import Breadcrumbs, { tranformLabelHuman } from './Breadcrumbs';
import styles from '../../styles/ReadingLists.module.css';
import commonStyles from '../../styles/common.module.css';
import Footer from './Footer';

export interface Book {
  title: string;
  date?: string;
  link?: string;
}

export interface ReadingListProps {
  title: string;
  description: string;
  books: Book[];
}

export function ReadingListPage(props: ReadingListProps) {
  const { title, description, books } = props;

  return (
    <main className={styles.main}>
      <Breadcrumbs
        containerStyle={{ alignSelf: 'flex-start', paddingBottom: '2.5rem' }}
        transformLabel={tranformLabelHuman}
      />

      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
      <ol className={styles.container}>
        {books.map((book) => {
          return (
            <li key={book.title}>
              <a href={book.link}>{book.title}</a>
            </li>
          );
        })}
      </ol>
      <div className={commonStyles.spacer}></div>
      <Footer />
    </main>
  );
}
