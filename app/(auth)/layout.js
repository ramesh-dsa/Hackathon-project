export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
