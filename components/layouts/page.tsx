import { Context } from "fresh";
import { AuthState } from "../../middleware/auth.ts";
import { Breadcrumb, buildBreadcrumbs } from "../breadcrumb/Breadcrumb.tsx";
import {
  LocationIcon,
  LogoIcon,
  OverviewIcon,
  UsersIcon,
} from "../icons/index.ts";
import LogoutIcon from "../icons/LogoutIcon.tsx";
import ThemeToggle from "../../islands/ThemeToggle.tsx";

export function PageLayout(ctx: Context<AuthState>) {
  const { Component, state } = ctx;
  if (!state.user) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/login" },
    });
  }

  const crumbs = buildBreadcrumbs(ctx.url.pathname);

  return (
    <>
      <header class="main-header">
        <nav>
          <div class="container nav-content">
            <div class="logo-avatar">
              <a href="/">
                <LogoIcon />
              </a>
              <div>
                <h1>TeamGym og Spring</h1>
                <span>Svendborg</span>
              </div>
            </div>
            <ul class="main-navigation">
              <li>
                <a class="nav-link" href="/dashboard">
                  <OverviewIcon />
                  <span>Oversigt</span>
                </a>
              </li>
              {state.user.role === "admin"
                ? (
                  <li>
                    <a class="nav-link" href="/users">
                      <UsersIcon />
                      <span>Instruktører</span>
                    </a>
                  </li>
                )
                : ""}
              <li>
                <a class="nav-link" href="/teams">
                  <UsersIcon />
                  <span>Hold</span>
                </a>
              </li>
              <li>
                <a class="nav-link" href="/teams">
                  <LocationIcon />
                  <span>Lokationer</span>
                </a>
              </li>
            </ul>
            <div class="nav-actions">
              <ThemeToggle />
              <span class="user-info">Welcome, {state.user.name}!</span>
              <a href="/api/auth/logout" class="nav-link">
                <LogoutIcon />
                <span>Logout</span>
              </a>
            </div>
          </div>
        </nav>
      </header>

      <main>
        {crumbs.length >= 2 && (
          <div class="container container-slim">
            <Breadcrumb items={crumbs} />
          </div>
        )}
        <Component />
      </main>
      <footer class="main-footer" />
    </>
  );
}
