import styles from "../../styles/ReadingLists.module.css";
import Footer from "../../components/Footer";
import commonStyles from "../../styles/common.module.css";
import Breadcrumbs, { tranformLabelHuman } from "../../components/Breadcrumbs";

const bookList = [
  { title: "Sword of Destiny", link: "" },
  { title: "Blood of Elves", link: "" },
  { title: "Time of Contempt", link: "" },
  { title: "Baptism of Fire", link: "" },
  { title: "Tower of Swallows", link: "" },
  { title: "Lady of the Lake", link: "" },
  { title: "Season of Storms", link: "" },
  { title: "She Comes First", link: "" },
  { title: "Fingerprints of the Gods", link: "" },
  { title: "Magicians of the Gods", link: "" },
];

export default function ReadingList2022() {
  return (
    <main className={styles.main}>
      <Breadcrumbs
        containerStyle={{ alignSelf: "flex-start", paddingBottom: "2.5rem" }}
        transformLabel={tranformLabelHuman}
      />
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
