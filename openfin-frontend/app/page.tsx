import { AsciiHeader } from "./components/AsciiHeader";
import { SearchForm } from "./components/SearchForm";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-(--page-bg)">
      <AsciiHeader />
      <SearchForm />
    </main>
  );
}
