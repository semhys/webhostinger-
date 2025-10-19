import {useTranslations} from 'next-intl';

export default function HomePage() {
  const t = useTranslations('HomePage');

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">SEMHYS</h1>
      </nav>
      
      <main className="container mx-auto p-8">
        <h1 className="text-4xl font-bold mb-4">
          {t('hero.title')}
        </h1>
        <p className="text-xl text-gray-600">
          {t('hero.subtitle')}
        </p>
      </main>
    </div>
  );
}