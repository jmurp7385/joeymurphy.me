import styles from '../../styles/ReadingLists.module.css';
import Footer from '../../components/Footer';
import commonStyles from '../../styles/common.module.css';
import Breadcrumbs, { tranformLabelHuman } from '../../components/Breadcrumbs';

const bookList = [
  { title: 'America Before', date: '1/10/23', link: '' },
  { title: 'Extreme Ownership', date: '1/25/23', link: '' },
  { title: 'The Dichotomy of Leadership', date: '2/10/23', link: '' },
  {
    title:
      'Ways of Being Animals, Plants, Machines: The Search for a Planetary Intelligence',
    date: '4/22/23',
    link: '',
  },
  { title: 'Into the wild', date: '5/1/23', link: '' },
  {
    title: 'The Cause - The American Revolution and Its Discontents',
    date: '5/4/23',
    link: '',
  },
  {
    title: 'The Quartet - Orchestrating the Second American Revolution',
    date: '6/5/23',
    link: '',
  },
  { title: 'The Ballad of Songbirds and Snakes', date: '6/6/23', link: '' },
  { title: 'Hunger games', date: '6/11/23', link: '' },
  { title: 'Catching Fire', date: '6/13/23', link: '' },
  { title: 'Mockingjay', date: '6/14/23', link: '' },
  { title: 'Four', date: '6/15/23', link: '' },
  { title: 'Rangers Apprentice: Ruins of Gorlan', date: '6/16/23', link: '' },
  {
    title: 'Rangers Apprentice: The Burning Bridge',
    date: '6/19/23',
    link: '',
  },
  { title: 'Rangers Apprentice: The Icebound Land', date: '6/20/23', link: '' },
  {
    title: 'Rangers Apprentice: The Battle for Skandia',
    date: '6/22/23',
    link: '',
  },
  { title: "Rangers Apprentice: Erak's Ransom", date: '7/3/23', link: '' },
  {
    title: 'Rangers Apprentice: The Sourcer of the North',
    date: '7/5/23',
    link: '',
  },
  {
    title: 'Rangers Apprentice: The Siege of Mackindaw',
    date: '7/17/23',
    link: '',
  },
  {
    title: 'Rangers Apprentice: The Kings of Clonmel',
    date: '7/19/23',
    link: '',
  },
  { title: "Rangers Apprentice: Halt's Peril", date: '7/23/23', link: '' },
  {
    title: 'Rangers Apprentice: The Emperor of Nihon-Ja',
    date: '7/27/23',
    link: '',
  },
  { title: 'Rangers Apprentice: The Lost Stories', date: '7/31/23', link: '' },
  {
    title: 'Rangers Apprentice: The Early Years: The Tournament at Gorlan',
    date: '8/21/23',
    link: '',
  },
  {
    title: 'Rangers Apprentice: The Early Years: Hackham Heath',
    date: '9/6/23',
    link: '',
  },
  { title: 'Rangers Apprentice: The Royal Ranger', date: '9/15/23', link: '' },
  {
    title: 'Rangers Apprentice: The Royal Ranger - A Beast from another Time',
    date: '9/15/23',
    link: '',
  },
  {
    title: 'Rangers Apprentice: The Royal Ranger - The Red Fox Clan',
    date: '9/21/23',
    link: '',
  },
  {
    title: 'Rangers Apprentice: The Royal Ranger - The Duel at Araluen',
    date: '10/1/23',
    link: '',
  },
  {
    title: 'Rangers Apprentice: The Royal Ranger - The Missing Prince',
    date: '10/5/23',
    link: '',
  },
  { title: 'The Subtle Art of Not Giving a Fuck', date: '10/9/23', link: '' },
  {
    title: 'Rangers Apprentice: The Royal Ranger - Escape from Falaise',
    date: '10/14/23',
    link: '',
  },
  {
    title: "Rangers Apprentice: The Royal Ranger - Arazan's Wolves",
    date: '10/24/23',
    link: '',
  },
  {
    title: 'Percy Jackson: The Chalice of the Gods',
    date: '11/19/23',
    link: '',
  },
  { title: 'The Fairy Tellers', date: '12/23/23', link: '' },
  { title: 'Founding Brothers', date: '12/28/23', link: '' },
];

export default function ReadingList2023() {
  return (
    <main className={styles.main}>
      <Breadcrumbs
        containerStyle={{ alignSelf: 'flex-start', paddingBottom: '2.5rem' }}
        transformLabel={tranformLabelHuman}
      />

      <h1 className={styles.title}>Reading List 2023</h1>
      <p className={styles.description}>Ordered by completion</p>
      <ol className={styles.container}>
        {bookList.map((book) => {
          return (
            <li className={styles.listItem} key={book.title}>
              <a href={book.link}>{book.title}</a>&nbsp;({book.date})
            </li>
          );
        })}
      </ol>
      <div className={commonStyles.spacer}></div>
      <Footer />
    </main>
  );
}
