// Types
import { User } from "../features/types";

export const mockUsers: User[] = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  idcard: `123456789012${index}`, // 13-digit mock ID
  tokens: `token-${index + 1}-${Math.random().toString(36).substring(2, 10)}`,
  is_logged_in: index % 2 === 0,
  visible: index % 2 === 0,
  last_login: `2025-08-${String(index + 1).padStart(2, "0")}T0${index}:00:00Z`,
  created_at: `2025-01-${String(index + 1).padStart(2, "0")}T09:00:00Z`,
  updated_at: `2025-07-${String(index + 1).padStart(2, "0")}T18:00:00Z`,
  title_id: index % 2 === 0 ? 1 : 2,
  firstname: `User${index + 1}`,
  lastname: `Lastname${index + 1}`,
  email: `user${index + 1}@example.com`,
  phone: `08333333${index + 10}`,
  job_position: ["Engineer", "Manager", "Analyst", "Designer", "Tester"][index % 5],
  agency: ["IT Department", "HR Department", "Finance Department"][index % 3],
  permissions: {
    userRoleId: 1,
    center: {
      realtime: {
        select: true,
      },
      conditionSearch: {
        select: true,
      },
      specialPlateManage: {
        select: true,
      },
      manageUser: {
        select: true,
      },
      setting: {
        select: true,
      },
      manageCheckpointCameras: {
        select: true,
      },
    },
    checkpoint: {
      realtime: {
        select: true,
      },
      suspiciousPersonManage: {
        select: true,
      },
      suspiciousPersonSearch: {
        select: true,
      },
      specialPlateManage: {
        select: true,
      },
      specialPlateSearch: {
        select: true,
      },
    },
  },
  status: index % 2 === 0 ? "Active" : "Inactive",
  image_url: `/images/user${index + 1}.png`,
  user_group_id: (index % 3) + 1,
  username: `username${index + 1}`,
  password: `password${index + 1}`,
  dob: new Date(1990 + (index % 10), index % 12, (index % 28) + 1),
  uid: "",
  checkpoint_uid: "",
}));
