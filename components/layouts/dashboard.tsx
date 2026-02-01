import { Context } from "fresh";
import { AuthState } from "../../middleware/auth.ts";

export function DashboardLayout(ctx: Context<AuthState>) {
  const { Component, state } = ctx;
  // Redirect if not logged in
  if (!state.user) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/login" },
    });
  }
  return (
    <div>
      <nav>
        <div class="container nav-content">
          <figure>
            <img src="/sg-logo.svg" alt="SG Logo" class="logo" />
          </figure>
          <div class="nav-actions">
            <span class="user-info">Welcome, {state.user.name}!</span>
            <a href="/api/auth/logout" class="btn btn-secondary">Logout</a>
          </div>
        </div>
      </nav>

      <main class="container dashboard">
        <Component />
      </main>
    </div>
  );
}
