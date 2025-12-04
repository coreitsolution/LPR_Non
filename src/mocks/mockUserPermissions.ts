// Types
import { UserPermission } from "../features/types";

export const mockUserPermission: UserPermission[] = [
  {
    userRoleId: 1,
    userRole: "ADMIN",
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
    },
  },
  {
    userRoleId: 2,
    userRole: "User",
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
    },
  },
  {
    userRoleId: 3,
    userRole: "Super User",
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
    },
  }
];
