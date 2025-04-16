import { Navbar } from "../components/chat/navbar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full relative">
      <Navbar />
      <main className="pt-16 h-full">
        {children}
      </main>
    </div>
  );
} 