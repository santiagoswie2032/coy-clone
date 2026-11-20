import { Header } from "@/components/Header";
import { TabBar } from "@/components/TabBar";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center pb-20">
        <p className="text-muted text-sm">Home</p>
      </main>
      <TabBar />
    </>
  );
}
