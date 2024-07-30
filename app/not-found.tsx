import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="flex flex-col items-start text-gray-900 dark:text-gray-100">
      <div className="text-left">
        <h1 className="text-6xl font-bold mb-4">Oops!</h1>
        <p className="text-2xl mb-4">404 - Page Not Found</p>
        <p className="mb-8">It seems the page you're looking for was a glitch in the matrix.</p>
        <Link href="/">
          <button className="py-2 px-4 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-300">
            Go Back Home
          </button>
        </Link>
      </div>
    </section>
  );
}
