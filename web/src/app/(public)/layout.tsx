import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-16 md:pt-20">{children}</main>
      <Footer />
    </div>
  );
}
