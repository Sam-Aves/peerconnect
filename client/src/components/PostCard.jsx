export default function PostCard({ author, children }) {
  return (
    <div className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
      <h4 className="font-semibold text-gray-900">{author}</h4>

      <div className="mt-2 space-y-2 text-sm text-gray-600">
        {children}
      </div>
    </div>
  );
}