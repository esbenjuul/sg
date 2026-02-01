import { define } from "../../utils/state.ts";

export default define.page<void>(function DashboardPage(ctx) {
  const { user } = ctx.state;

  return (
    <>
        <div class="dashboard-header">
          <h2>Dashboard</h2>
          
          <div class="profile-section">
            <h3>Your Profile</h3>
            <div class="profile-info">
              <div class="profile-field">
                <span class="profile-label">Name:</span>
                <span class="profile-value">{user.name}</span>
              </div>
              <div class="profile-field">
                <span class="profile-label">Email:</span>
                <span class="profile-value">{user.email}</span>
              </div>
              <div class="profile-field">
                <span class="profile-label">User ID:</span>
                <span class="profile-value mono">{user._id}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="dashboard-grid">
          <div class="dashboard-card">
            <div class="card-header">
              <h3>Quick Stats</h3>
              <span class="icon">📊</span>
            </div>
            <p>Your dashboard statistics will appear here. Add your own data and features!</p>
          </div>

          <div class="dashboard-card">
            <div class="card-header">
              <h3>Recent Activity</h3>
              <span class="icon">🔔</span>
            </div>
            <p>Track your recent activities and notifications in this section.</p>
          </div>

          <div class="dashboard-card">
            <div class="card-header">
              <h3>Settings</h3>
              <span class="icon">⚙️</span>
            </div>
            <p>Customize your preferences and account settings here.</p>
          </div>
        </div>

        <div class="info-banner">
          <h3>🚀 Ready to build something amazing?</h3>
          <p>
            This is your authenticated dashboard. You can now add your own features,
            store user data in MongoDB, and build your application!
          </p>
        </div>
      </>
  );
});
