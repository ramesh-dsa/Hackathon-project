import ClarityInit from '@/components/Clarity';
import { Navbar } from "../../components/layout/navbar";
import { Footer } from "../../components/layout/footer";
import { BackToTop } from "../../components/ui/back-to-top";

export default function PublicLayout({ children }) {
  return (
    <>
      <ClarityInit />   {/* 👈 ADDED THIS LINE */}

      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <BackToTop />
      </div>
    </>
  );
}