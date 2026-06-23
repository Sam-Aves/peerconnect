import { useAuth } from "../context/AuthContext";
import CreatePostBox from "../components/CreatePostBox";
import PostCard from "../components/PostCard";

// No more onLogout/onHome props, no own <nav> - AppLayout (rendered by the
// router around this page) already provides the navbar, Feed/Profile
// links, and Logout button. This component only owns the feed content.
export default function PostingPage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <CreatePostBox user={user} />

      <PostCard author="PeerConnect Team">
        <p>Welcome to PeerConnect! 🎉</p>
        <p>
          Soon you'll be able to ask for help, find mentors, and connect
          with students in your city.
        </p>
      </PostCard>

      <PostCard author="Demo Student">
        <p>Looking for recommendations near CUET. Any good affordable hostels?</p>
      </PostCard>
    </div>
  );
}
