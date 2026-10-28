
import { useEffect, useState } from "react";
import "./styles.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function App() {
  const [movies, setMovies] = useState([]);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [rating, setRating] = useState("");
  const [status, setStatus] = useState("Plan to Watch");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadMovies() {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/movies`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not load movies");
      }

      const list = Array.isArray(result.data)
        ? result.data
        : result.data?.movies || [];

      setMovies(list);
    } catch (error) {
      setMessage(error.message || "Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMovies();
  }, []);

  async function addMovie(event) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/movies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          genre,
          releaseYear: Number(releaseYear),
          rating: rating === "" ? undefined : Number(rating),
          status,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not add movie");
      }

      setTitle("");
      setGenre("");
      setReleaseYear("");
      setRating("");
      setStatus("Plan to Watch");
      setMessage("Movie added successfully.");

      await loadMovies();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function updateStatus(id, newStatus) {
    try {
      const response = await fetch(`${API_URL}/movies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not update movie");
      }

      setMessage("Movie status updated.");
      await loadMovies();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteMovie(id) {
    if (!window.confirm("Are you sure you want to delete this movie?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/movies/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not delete movie");
      }

      setMessage("Movie deleted.");
      await loadMovies();
    } catch (error) {
      setMessage(error.message);
    }
  }

  const filteredMovies = movies.filter((movie) => {
    const searchableText =
      `${movie.title} ${movie.genre} ${movie.code || ""}`.toLowerCase();

    const matchesSearch = searchableText.includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || movie.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const planned = movies.filter(
    (movie) => movie.status === "Plan to Watch"
  ).length;

  const watching = movies.filter(
    (movie) => movie.status === "Watching"
  ).length;

  const completed = movies.filter(
    (movie) => movie.status === "Completed"
  ).length;

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <a className="brand" href="#home">
            <span className="brand-icon">M</span>
            <span>Movie<span className="brand-accent">Shelf</span></span>
          </a>

          <span className="header-label">PERSONAL MOVIE TRACKER</span>
        </div>
      </header>

      <main className="container" id="home">
        <section className="intro">
          <div>
            <p className="eyebrow">YOUR COLLECTION</p>
            <h1>Movie Watchlist</h1>
            <p className="intro-text">
              Keep your favourite movies organised and track what you want to watch.
            </p>
          </div>

          <div className="intro-icon" aria-hidden="true">▶</div>
        </section>

        <section className="stats">
          <div className="stat-card">
            <span className="stat-top">
              <span className="stat-dot purple"></span>
              Total Movies
            </span>
            <strong>{movies.length}</strong>
            <small>Movies in your list</small>
          </div>

          <div className="stat-card">
            <span className="stat-top">
              <span className="stat-dot grey"></span>
              Plan to Watch
            </span>
            <strong>{planned}</strong>
            <small>Up next</small>
          </div>

          <div className="stat-card">
            <span className="stat-top">
              <span className="stat-dot yellow"></span>
              Watching
            </span>
            <strong>{watching}</strong>
            <small>Currently in progress</small>
          </div>

          <div className="stat-card">
            <span className="stat-top">
              <span className="stat-dot green"></span>
              Completed
            </span>
            <strong>{completed}</strong>
            <small>Movies finished</small>
          </div>
        </section>

        {message && (
          <div className="message">
            <span>{message}</span>
            <button
              type="button"
              className="message-close"
              onClick={() => setMessage("")}
              aria-label="Close message"
            >
              ×
            </button>
          </div>
        )}

        <section className="content-grid">
          <section className="panel add-panel">
            <div className="panel-heading">
              <div className="heading-icon">+</div>
              <div>
                <h2>Add a Movie</h2>
                <p>Enter the details of a movie.</p>
              </div>
            </div>

            <form onSubmit={addMovie} className="movie-form">
              <label>
                Movie Title
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter movie title"
                  required
                />
              </label>

              <label>
                Genre
                <input
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="e.g. Drama, Action"
                  required
                />
              </label>

              <label>
                Release Year
                <input
                  type="number"
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(e.target.value)}
                  min="1888"
                  max={new Date().getFullYear() + 10}
                  placeholder="e.g. 2024"
                  required
                />
              </label>

              <label>
                Rating <span className="optional">(optional, 0–10)</span>
                <input
                  type="number"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  min="0"
                  max="10"
                  step="0.1"
                  placeholder="e.g. 8.5"
                />
              </label>

              <label>
                Watch Status
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option>Plan to Watch</option>
                  <option>Watching</option>
                  <option>Completed</option>
                </select>
              </label>

              <button className="primary-btn" type="submit">
                Add Movie
              </button>
            </form>
          </section>

          <section className="panel list-panel">
            <div className="panel-heading list-panel-heading">
              <div>
                <h2>My Movies</h2>
                <p>Browse and manage your collection.</p>
              </div>

              <button
                className="refresh-btn"
                type="button"
                onClick={loadMovies}
                title="Refresh movie list"
              >
                ↻ Refresh
              </button>
            </div>

            <div className="filters">
              <input
                className="search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search movies..."
                aria-label="Search movies"
              />

              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by status"
              >
                <option>All</option>
                <option>Plan to Watch</option>
                <option>Watching</option>
                <option>Completed</option>
              </select>
            </div>

            {loading && <p className="loading">Loading movies...</p>}

            {!loading && filteredMovies.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">▣</div>
                <h3>No movies found</h3>
                <p>Add a movie or try a different search.</p>
              </div>
            )}

            <div className="movie-list">
              {filteredMovies.map((movie) => (
                <article className="movie-card" key={movie._id}>
                  <div className="movie-card-top">
                    <div className="movie-poster">
                      <span>▶</span>
                    </div>

                    <div className="movie-info">
                      <h3>{movie.title}</h3>
                      <p>{movie.genre} · {movie.releaseYear}</p>
                      <span className="movie-code">
                        {movie.code || "No code"}
                      </span>
                    </div>

                    <button
                      className="delete-btn"
                      type="button"
                      onClick={() => deleteMovie(movie._id)}
                      aria-label={`Delete ${movie.title}`}
                      title="Delete movie"
                    >
                      ×
                    </button>
                  </div>

                  <div className="movie-card-bottom">
                    <div className="rating">
                      <span>★</span>
                      {movie.rating ?? "Not rated"}
                    </div>

                    <select
                      className={`status-select ${movie.status === "Completed"
                          ? "done"
                          : movie.status === "Watching"
                            ? "in-progress"
                            : "planned"
                        }`}
                      value={movie.status}
                      onChange={(e) =>
                        updateStatus(movie._id, e.target.value)
                      }
                      aria-label={`Status for ${movie.title}`}
                    >
                      <option>Plan to Watch</option>
                      <option>Watching</option>
                      <option>Completed</option>
                    </select>
                  </div>
                </article>
              ))}
            </div>

            {!loading && filteredMovies.length > 0 && (
              <p className="list-footer">
                Showing {filteredMovies.length} of {movies.length} movies
              </p>
            )}
          </section>
        </section>

        <footer className="footer">
          MovieShelf <span>·</span> Movie Watchlist Manager
        </footer>
      </main>
    </div>
  );
}

export default App;
