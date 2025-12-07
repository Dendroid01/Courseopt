import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen w-screen">
      <Header />
      <main className="flex-1 w-full flex flex-col items-center p-6 bg-gray-50">
        <div className="w-full max-w-[1000px]">
          {children}
        </div>
      </main>
    </div>
  );
}