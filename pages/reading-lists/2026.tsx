import { Book, ReadingListPage } from '../../components/ReadingListPage';

const bookList: Book[] = [
  {
    title: 'Dark Matter',
    date: '1/12/26',
    link: 'https://www.goodreads.com/book/show/27833670-dark-matter',
  },
  {
    title: 'The Priory of the Orange Tree',
    date: '1/28/26',
    link: 'https://www.goodreads.com/book/show/40275288-the-priory-of-the-orange-tree',
  },
  {
    title: 'Muhammad: A Story of the Last Prophet',
    date: '2/3/26',
    link: 'https://www.goodreads.com/book/show/8295791-muhammad',
  },
  {
    title: 'A Knight of the Seven Kingdoms',
    date: '2/16/26',
    link: 'https://www.goodreads.com/book/show/18635622-a-knight-of-the-seven-kingdoms',
  },
  {
    title: 'Playing with FIRE (Financial Independence Retire Early)',
    date: '3/8/26',
    link: 'https://www.goodreads.com/book/show/41732254-playing-with-fire-financial-independence-retire-early',
  },
  {
    title: 'Dungeon Crawler Carl',
    date: '4/10/26',
    link: 'https://www.goodreads.com/book/show/54659324-dungeon-crawler-carl',
  },
  {
    title: "Carl's Doomsday Scenario",
    date: '4/12/26',
    link: 'https://www.goodreads.com/book/show/212393364-carl-s-doomsday-scenario',
  },
  {
    title: "The Dungeon Anarchist's Cookbook",
    date: '4/14/26',
    link: 'https://www.goodreads.com/book/show/211721809-the-dungeon-anarchist-s-cookbook',
  },
  {
    title: 'The Gate of the Feral Gods',
    date: '4/16/26',
    link: 'https://www.goodreads.com/book/show/220772908-the-gate-of-the-feral-gods',
  },
  {
    title: "The Butcher's Masquerade",
    date: '4/22/26',
    link: 'https://www.goodreads.com/book/show/220772913-the-butcher-s-masquerade',
  },
  {
    title: 'The Eye of the Bedlam Bride',
    date: '4/30/26',
    link: 'https://www.goodreads.com/book/show/220772912-the-eye-of-the-bedlam-bride',
  },
  {
    title: 'This Inevitable Ruin',
    date: '5/9/26',
    link: 'https://www.goodreads.com/book/show/232497556-this-inevitable-ruin',
  },
  {
    title: 'A Parade of Horribles',
    date: '5/19/26',
    link: 'https://www.goodreads.com/book/show/228928465-a-parade-of-horribles',
  },
  {
    title: 'A Touch of Darkness',
    date: '6/19/26',
    link: 'https://www.goodreads.com/book/show/43175155-a-touch-of-darkness',
  },
];

export default function ReadingList2026() {
  const title = 'Reading List 2026';
  const description = 'Ordered by completion';

  return (
    <ReadingListPage title={title} description={description} books={bookList} />
  );
}
