'use client';

import Link from 'next/link';

export default function SpanishHomePage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-red-600 text-white p-4">
        <h1 className="text-2xl font-bold">SEMHYS - Excelencia en Ingeniería</h1>
      </nav>
      
      <main className="container mx-auto p-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          ¡Excelencia en Ingeniería Redefinida!
        </h1>
        <p className="text-xl text-gray-600">
          Soluciones avanzadas para desafíos de ingeniería de alto rendimiento. Bienvenido a SEMHYS.
        </p>
        <div className="mt-8 flex gap-4">
          <Link 
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            English 🇺🇸
          </Link>
          <Link 
            href="/pt"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Português 🇧🇷
          </Link>
        </div>
      </main>
    </div>
  );
}