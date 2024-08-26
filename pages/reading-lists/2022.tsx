import styles from '../../styles/ReadingLists.module.css';
import Footer from '../../components/Footer';
import commonStyles from '../../styles/common.module.css';
import Breadcrumbs, { tranformLabelHuman } from '../../components/Breadcrumbs';
import { Book, ReadingListPage } from '../../components/ReadingListPage';

const bookList: Book[] = [
  { title: 'Sword of Destiny', link: '' },
  { title: 'Blood of Elves', link: '' },
  { title: 'Time of Contempt', link: '' },
  { title: 'Baptism of Fire', link: '' },
  { title: 'Tower of Swallows', link: '' },
  { title: 'Lady of the Lake', link: '' },
  { title: 'Season of Storms', link: '' },
  { title: 'She Comes First', link: '' },
  { title: 'Fingerprints of the Gods', link: '' },
  { title: 'Magicians of the Gods', link: '' },
];

export default function ReadingList2022() {
  const title = 'Reading List 2022';
  const description = 'Ordered by completion';

  return (
    <ReadingListPage title={title} description={description} books={bookList} />
  );
}
