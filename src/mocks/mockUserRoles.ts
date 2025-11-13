// Types
import { UserRole } from "../features/dropdown/dropdownTypes";

export const mockUserRoles: UserRole[] = [
  {
    id: 1,
    user_role: "ADMIN",
    active: 1,
  },
  {
    id: 2,
    user_role: "USER",
    active: 1,
  },
  {
    id: 3,
    user_role: "GUEST",
    active: 0,
  },
];
