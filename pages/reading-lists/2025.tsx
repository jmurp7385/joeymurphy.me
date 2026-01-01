import { Book, ReadingListPage } from '../../components/ReadingListPage';

const bookList: Book[] = [
  {
    title: 'Dear Reader: The Unauthorized Autobiography of Kim Jong Il',
    date: '2/19/25',
    link: '',
  },
   {
    title: "Frugal Wizard's Handbook for Surviving Medieval England",
    date: '3/6/25',
    link: '',
  },
   {
    title: "Sunrise on the Reaping",
    date: '8/21/25',
    link: '',
  },
   {
    title: 'The Iliad (Richmond Lattimore Translation)',
    date: '12/31/25',
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
