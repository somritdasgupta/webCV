import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex flex-col items-start text-gray-900 dark:text-gray-100">
      <div className="text-left">
        <h1 className="text-6xl font-bold mb-8 mt-6">Oops!</h1>
        <p className="text-xl font-semibold mb-4">GET / 404 - Page Not Found</p>
        <p className="text-xl font-semibold mb-4">GET / 200 - Cat Found</p>
        <Link href="/">
          <button className="mt-8 mb-8 py-2 px-8 rounded-lg transition duration-300 block px-2 py-2 text-sm font-medium bg-[#ec66524f] rounded-lg flex items-center justify-center max-w-[120px] w-full sm:w-auto tracking-tight">
            HOME
          </button>
        </Link>
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute bottom-0 right-0 w-full h-full max-w-[600px] max-h-[400px] sm:max-w-[400px] sm:max-h-[400px] md:max-w-[600px] md:max-h-[400px] overflow-hidden">
            <img
              src="/cat.png"
              alt="Meow!"
              className="object-cover object-top w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
