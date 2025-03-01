import Breadcrumbs, { tranformLabelHuman } from './Breadcrumbs';
import styles from '../styles/ReadingLists.module.css';
import commonStyles from '../styles/common.module.css';
import Footer from './Footer';

export interface Book {
  title: string;
  date?: string;
  link?: string;
}

export interface ReadingListProperties {
  title: string;
  description: string;
  books: Book[];
}

export function ReadingListPage(properties: ReadingListProperties) {
  const { title, description, books } = properties;

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
            <li key={book.title} className={styles.listItem}>
              <div className={styles.book}>
                {book.link?.length ? (
                  <a href={book.link}>{book.title}</a>
                ) : (
                  <p className={styles.bookTitle}>{book.title}</p>
                )}
                {book.date && (
                  <p className={styles.date}>&nbsp;{`(${book.date})`}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <div className={commonStyles.spacer}></div>
      <Footer />
    </main>
  );
}
