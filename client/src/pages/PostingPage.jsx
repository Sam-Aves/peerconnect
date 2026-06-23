import "./PostingPage.css";

import PostingNavbar from "../Components/PostingNavbar";
import CreatePostBox from "../Components/CreatePostBox";
import PostCard from "../Components/PostCard";

export default function PostingPage({ onLogout, onHome }) {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="posting-page">
      <PostingNavbar onHome={onHome} onLogout={onLogout} />

      <main className="posting-feed">
        <CreatePostBox user={user} />

        <PostCard author="PeerConnect Team">
          <p>Welcome to PeerConnect! 🎉</p>

          <p>
            Soon you'll be able to ask for help, find mentors, and connect with
            students in your city.
          </p>
        </PostCard>

        <PostCard author="Demo Student">
          <p>
            Looking for recommendations near CUET. Any good affordable hostels?
          </p>
        </PostCard>
      </main>
    </div>
  );
}