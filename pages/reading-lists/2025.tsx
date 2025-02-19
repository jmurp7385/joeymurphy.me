import styles from '../../styles/ReadingLists.module.css';
import Footer from '../../components/Footer';
import commonStyles from '../../styles/common.module.css';
import Breadcrumbs, { tranformLabelHuman } from '../../components/Breadcrumbs';
import { Book, ReadingListPage } from '../../components/ReadingListPage';

const bookList: Book[] = [
  {
    title: 'Dear Reader: The Unauthorized Autobiography of Kim Jong Il',
    date: '2/19/25',
    link: '',
  },
];

export default function ReadingList2025() {
  const title = 'Reading List 2025';
  const description = 'Ordered by completion';

  return (
    <ReadingListPage title={title} description={description} books={bookList} />
  );
}
