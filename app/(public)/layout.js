import { Navbar } from "../../components/layout/navbar";
import { Footer } from "../../components/layout/footer";
import { BackToTop } from "../../components/ui/back-to-top";

export default function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
