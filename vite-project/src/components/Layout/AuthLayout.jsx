export default function AuthLayout({ children }) {
  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-gray-50">
      <div className="w-full max-w-sm p-6 bg-white rounded shadow">
        {children}
      </div>
    </div>
  );
}