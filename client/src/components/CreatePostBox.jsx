export default function CreatePostBox({ user }) {
  return (
    <div className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">
        Welcome {user?.name || "Student"}
      </h3>

      <input
        disabled
        placeholder="What's on your mind?"
        className="mt-4 w-full rounded-xl border border-gray-200 p-4 text-sm disabled:bg-gray-50"
      />

      <button
        disabled
        className="mt-3 rounded-lg bg-[#35c7a2] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        Create Post
      </button>
    </div>
  );
}