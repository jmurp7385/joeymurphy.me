import styles from '../../styles/ReadingLists.module.css';
import Footer from '../../components/Footer';
import commonStyles from '../../styles/common.module.css';
import Breadcrumbs, { tranformLabelHuman } from '../../components/Breadcrumbs';
import { Book, ReadingListPage } from '../../components/ReadingListPage';

const bookList: Book[] = [
  { title: "Alice's Adventures in Wonderland", date: '4/11/24', link: '' },
  { title: 'Through the Looking Glass', date: '4/23/24', link: '' },
  { title: 'Eathlings', date: '5/3/24', link: '' },
  {
    title: 'The Zen of Climbing',
    date: '5/13/24',
    link: '',
  },
  { title: 'Buddha', date: '5/28/23', link: '' },
];

export default function ReadingList2024() {
  const title = 'Reading List 2024';
  const description = 'Ordered by completion';

  return (
    <ReadingListPage title={title} description={description} books={bookList} />
  );
}
