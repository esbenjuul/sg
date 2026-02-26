import { Context } from "fresh";
import { AuthState } from "../../middleware/auth.ts";


export function PageLayout(ctx: Context<AuthState>) {
  const { Component, state } = ctx;
  // Redirect if not logged in
  if (!state.user) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/login" },
    });
  }
  return (
    <header class="main-header">
      <nav>
        <div class="container nav-content">
          <figure>
            <a href="/"><img src="/sg-logo.svg" alt="SG Logo" class="logo" /></a>
          </figure>
          <ul class="main-navigation">
            <li><a href="/dashboard">Home</a></li>
            {state.user.role === 'admin' ? <li>
              <a href="/users">Users</a>
              </li> : ''}
            <li><a href="/teams">Teams</a></li>
          </ul>
          <div class="nav-actions">
            <span class="user-info">Welcome, {state.user.name}!</span>
            <a href="/api/auth/logout" class="btn btn-secondary">Logout</a>
          </div>
        </div>
      </nav>

      <main>
        <Component />
      </main>
    </header>
  );
}
