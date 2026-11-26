export type {
  InstructorRole,
  Sport,
  Team,
  TeamDetails,
  TeamInput,
  TeamStatus,
  TrainingSession,
  TrainingSessionInput,
} from "./types.ts";

export {
  createTeam,
  deleteTeam,
  getLocationUsage,
  getNumberOfTeams,
  getRoleUsage,
  getTeamBySlug,
  getTeams,
  toSlug,
  updateTeam,
} from "./service.ts";
