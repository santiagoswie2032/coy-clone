import { Header } from "@/components/Header";
import { TabBar } from "@/components/TabBar";
import { DiscoverContent } from "@/components/discover/DiscoverContent";

export default function DiscoverPage() {
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col pb-20 overflow-hidden">
        <DiscoverContent />
      </main>
      <TabBar />
    </>
  );
}
