import ContactForm from '@/components/ContactForm';
export const metadata = { title: 'Contact' };
export default function Contact() {
  return (<main className="px-6 pb-24 pt-36 md:px-12"><div className="mx-auto max-w-6xl"><h1 className="mb-12 text-5xl md:text-7xl">Contact</h1><ContactForm /></div></main>);
}
