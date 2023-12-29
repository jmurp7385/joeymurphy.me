import styles from '../../styles/ReadingLists.module.css';
import Footer from '../../components/Footer';
import commonStyles from '../../styles/common.module.css';
import Breadcrumbs, { tranformLabelHuman } from '../../components/Breadcrumbs';

const bookList = [
  { title: "Harry Potter and the Sorcerer's Stone", link: '' },
  { title: 'The Power of Now (audible)', link: '' },
  { title: 'Harry Potter and the Chamber of Secrets', link: '' },
  { title: 'Harry Potter and the Prisoner of Azkaban', link: '' },
  { title: 'Harry Potter and the Goblet of Fire', link: '' },
  { title: 'Harry Potter and the Order of the Phoenix', link: '' },
  { title: 'Harry Potter and the Half-Blood Prince', link: '' },
  { title: 'Harry Potter and the Deathly Hallows', link: '' },
  { title: 'The Grand Design (audible)', link: '' },
  { title: 'Algorithms to Live By (audible)', link: '' },
  { title: 'The Silk Roads a New History of the World', link: '' },
  { title: 'Slaughterhouse Five', link: '' },
  { title: 'Around the World in Eighty Days', link: '' },
  { title: 'Epic of Gilgamesh', link: '' },
  { title: 'A Bad Beginning', link: '' },
  { title: 'The Reptile Room', link: '' },
  { title: 'The Wide Window', link: '' },
  { title: 'The Miserable Mill', link: '' },
  { title: 'The Austere Academy', link: '' },
  { title: 'The Ersatz Elevator', link: '' },
  { title: 'The Vile Village', link: '' },
  { title: 'The Hostile Hospital', link: '' },
  { title: 'The Carnivorous Carnival', link: '' },
  { title: 'The Slippery Slope', link: '' },
  { title: 'The Grim Grotto', link: '' },
  { title: 'The Penultimate Peril', link: '' },
  { title: 'The End', link: '' },
  { title: 'Guns, Germs, and Steel', link: '' },
  { title: "Percy Jackson's Greek Gods", link: '' },
  { title: 'Snape: A Definitive Reading', link: '' },
  { title: 'Physics of the Future', link: '' },
  { title: 'Percy Jackson and the Greek Heroes', link: '' },
  { title: 'Elon Musk (audible)', link: '' },
  { title: 'American Revolutions (audible)', link: '' },
  { title: 'Into Thin Air (audible)', link: '' },
  { title: 'Antimatter', link: '' },
  { title: 'Fablehaven', link: '' },
  { title: 'Fablehaven Rise of the Evening Star', link: '' },
  { title: 'Fablehaven Grip of the Shadow Plague', link: '' },
  { title: 'Fablehaven Secrets of the Dragon Sanctuary', link: '' },
  { title: 'Fablehaven Keys to the Demon Prison', link: '' },
  { title: 'Fahrenheit 451', link: '' },
  { title: 'Brave New World', link: '' },
  { title: 'How to Lie with Statistics', link: '' },
  { title: 'King of The Wild Frontier', link: '' },
  { title: 'The Hobbit Companion', link: '' },
  { title: 'The Illustrated A Brief History of Time', link: '' },
  { title: 'The Universe in a Nutshell', link: '' },
  {
    title: 'Where Wizards Stay Up Late: The Origins of the Internet',
    link: '',
  },
  { title: 'In the Days of the Comet', link: '' },
  { title: 'The Last Wish', link: '' },
  { title: 'The Book Of Awakening', link: '' },
];

export default function ReadingList2021() {
  return (
    <main className={styles.main}>
      <Breadcrumbs
        containerStyle={{ alignSelf: 'flex-start', paddingBottom: '2.5rem' }}
        transformLabel={tranformLabelHuman}
      />

      <h1 className={styles.title}>Reading List 2021</h1>
      <p className={styles.description}>
        My aim in 2021 was to read 52 books. Here they are...
      </p>
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
