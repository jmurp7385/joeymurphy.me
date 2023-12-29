import styles from "../../styles/ReadingLists.module.css";
import Footer from "../../components/Footer";
import commonStyles from "../../styles/common.module.css";

const bookList = [
{title: 'Sword of Destiny',link: '',},
{title: 'Blood of Elves',link: '',},
{title: 'Time of contempt',link: '',},
{title: 'Baptism of Fire',link: '',},
{title: 'Tower of Swallows',link: '',},
{title: 'Lady of the Lake',link: '',},
{title: 'Season of Storms',link: '',},
{title: 'She comes first',link: '',},
{title: 'Fingerprints of the gods',link: '',},
{title: 'Magicians of the Gods',link: '',},
];

export default function ReadingList2022() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Reading List 2022</h1>
      <p className={styles.description}>Ordered by completion</p>
      <ol className={styles.container}>
        {bookList.map((book) => {
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