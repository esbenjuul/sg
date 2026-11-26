export type {
  AppSettings,
  InstructorRoleSetting,
  LocationSetting,
  LocationType,
  RoleTone,
  UpdateSettingsInput,
} from "./types.ts";

export {
  DEFAULT_INSTRUCTOR_ROLES,
  getSettings,
  updateSettings,
  withDefaults,
} from "./service.ts";
