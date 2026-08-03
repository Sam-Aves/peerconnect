export default function PostCard({ author, children }) {
  return (
    <div className="posting-card">
      <h4>{author}</h4>

      {children}
    </div>
  );
}
