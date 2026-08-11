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
        <figure style={{ backgroundImage: "url('/img/gymnastik_unge.webp')" }}>
        </figure>
      </section>

      <section className="hero-col">
        <div class="auth-card">
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
      </section>
    </div>
  );
});
