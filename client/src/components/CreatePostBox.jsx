export default function CreatePostBox({ user }) {
  return (
    <div className="posting-card">
      <h3>Welcome {user?.name || "Student"}</h3>

      <input disabled placeholder="What's on your mind?" />

      <button disabled>Create Post</button>
    </div>
  );
}