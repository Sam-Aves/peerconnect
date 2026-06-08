export default function PostingPage({
  onLogout,
  onHome,
}) {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f2f5",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          background: "white",
          padding: "15px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ color: "#35c7a2" }}>PeerConnect</h2>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
          onClick={onHome}
          style={{
            padding: "10px 18px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Homepage
        </button>
          <button
            onClick={onLogout}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              border: "none",
              background: "#ff4d4f",
              color: "white",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Feed */}
      <div
        style={{
          maxWidth: "700px",
          margin: "30px auto",
          padding: "0 20px",
        }}
      >
        {/* Create Post */}
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "15px",
            marginBottom: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <h3 style={{ color: "#222" }}>
            Welcome {user?.name || "Student"}
          </h3>

          <input
            disabled
            placeholder="What's on your mind?"
            style={{
              width: "100%",
              marginTop: "15px",
              padding: "15px",
              borderRadius: "10px",
              border: "1px solid #ddd",
            }}
          />

          <button
            disabled
            style={{
              marginTop: "12px",
              padding: "10px 20px",
              background: "#35c7a2",
              color: "white",
              border: "none",
              borderRadius: "8px",
            }}
          >
            Create Post
          </button>
        </div>

        {/* Demo Post 1 */}
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "15px",
            marginBottom: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <h4 style={{ color: "#222" }}>PeerConnect Team</h4>

          <p style={{ color: "#555", marginTop: "10px" }}>
            Welcome to PeerConnect! 🎉
          </p>

          <p style={{ color: "#555" }}>
            Soon you'll be able to ask for help,
            find mentors, and connect with students
            in your city.
          </p>
        </div>

        {/* Demo Post 2 */}
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "15px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <h4 style={{ color: "#222" }}>Demo Student</h4>

          <p style={{ color: "#555", marginTop: "10px" }}>
            Looking for recommendations near CUET.
            Any good affordable hostels?
          </p>
        </div>
      </div>
    </div>
  );
}