import { define } from "../utils/state.ts";
import LoginForm from "../islands/LoginForm.tsx";

export default define.page<void>(function LoginPage(ctx) {
  const { user } = ctx.state;

  // Redirect if already logged in
  if (user) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/dashboard" },
    });
  }

  return (
    <div class="background-primary hero hero-login">
      <section className="hero-col hero-image bg-panel">
        <div class="hero-container">
          <figure
            style={{ backgroundImage: "url('/img/gymnastik_unge.webp')" }}
          >
          </figure>
          <div class="hero-content">
            <img src="/img/sg-logo.svg" alt="SG Logo" />
            <div class="teaser">
              <h1>SG Team admin</h1>
              <p>Sign in to your account to continue</p>
            </div>
          </div>
          <div class="hero-footer">
            <blockquote class="text-quote">
              "Kraftcenter for bevægelse og fællesskab i Svendborg."
            </blockquote>
            <div class="row">
              <span class="teaser">
                <h1>45</h1>
                <p>Aktive hold</p>
              </span>
              <span class="teaser">
                <h1>45</h1>
                <p>Aktive hold</p>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="hero-col">
        <div class="hero-container hero-container-form">
          <div class="hero-content">
            <div class="auth-header">
              <h2>Welcome Back</h2>
              <p>Sign in to your account</p>
            </div>

            <LoginForm />

            <div class="auth-footer">
              <p>
                Don't have an account? <a href="/signup">Sign up</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});
