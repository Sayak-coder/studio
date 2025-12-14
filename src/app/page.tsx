import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to EduBot</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Link href="/help/student" className="p-6 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <h2 className="text-2xl font-semibold">Student</h2>
        </Link>
        <Link href="/help/class-representative" className="p-6 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <h2 className="text-2xl font-semibold">Class Representative</h2>
        </Link>
        <Link href="/help/senior" className="p-6 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <h2 className="text-2xl font-semibold">Senior</h2>
        </Link>
        <Link href="/help/officials" className="p-6 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <h2 className="text-2xl font-semibold">Officials</h2>
        </Link>
      </div>
    </main>
  );
}
