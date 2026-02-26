import { useState } from "preact/hooks";
import { define } from "../utils/state.ts";

import DialogTest from "../islands/DialogTest.tsx";

export default define.page<void>(function HomePage(ctx) {
  const { user } = ctx.state;
  const [isDialogOpen, setDialogOpen] = useState(false);
  const handleOpenDialog = (e: Event) => {
    console.log(e);
    setDialogOpen(true);
  };
  return (
    <div>
      <nav>
        <div class="container nav-content">
          <div>
            <h1>Fresh Auth</h1>
          </div>
          <div class="nav-actions">
            {user
              ? (
                <>
                  <span class="user-info">Welcome, {user.name}!</span>
                  <a href="/dashboard" class="btn btn-primary">Dashboard</a>
                  <a href="/api/auth/logout" class="btn btn-secondary">
                    Logout
                  </a>
                </>
              )
              : (
                <>
                  <a href="/login" class="btn btn-secondary">Login</a>
                  <a href="/signup" class="btn btn-primary">Sign Up</a>
                </>
              )}
          </div>
        </div>
      </nav>

      <main class="container hero">
        <h2>Welcome to Fresh Auth</h2>
        <p>
          A modern authentication system built with Deno Fresh 2 and MongoDB.
          Sign up to get started and explore the dashboard.
        </p>

        {!user && (
          <div class="hero-actions">
            <a href="/signup" class="btn btn-primary btn-large">Get Started</a>
            <a href="/login" class="btn btn-secondary btn-large">Sign In</a>
          </div>
        )}

        <div class="features">
          <div class="feature-card">
            <div class="icon">🔒</div>
            <h3>Secure Authentication</h3>
            <p>Password hashing with bcrypt and secure session management</p>
          </div>
          <div class="feature-card">
            <div class="icon">🗄️</div>
            <h3>MongoDB Integration</h3>
            <p>
              Reliable data storage with MongoDB for users and application data
            </p>
          </div>
          <div class="feature-card">
            <div class="icon">⚡</div>
            <h3>Fast & Modern</h3>
            <p>
              Built with Deno Fresh 2 for optimal performance and developer
              experience
            </p>
          </div>
        </div>
      </main>
      <DialogTest></DialogTest>
    </div>
  );
});
