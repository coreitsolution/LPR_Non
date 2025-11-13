// Types
import { Log } from '../features/types';

export const mockLogs: Log[] = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  titleId: (index % 3) + 1,
  title: ["Mr.", "Ms.", "Dr."][index % 3],
  userId: 1000 + index,
  userName: `user${index + 1}`,
  name: `Name${index + 1}`,
  lastname: `Lastname${index + 1}`,
  nationId: `1234567890${index}${index + 1}`,
  checkpointId: 200 + index,
  checkpointName: `Checkpoint ${index + 1}`,
  lat: (13.7 + index * 0.01).toFixed(6),
  lng: (100.5 + index * 0.01).toFixed(6),
  actionId: (index % 4) + 1,
  action: ["Login", "Logout", "Access Granted", "Access Denied"][index % 4],
  detail: `Sample detail message for action ${index + 1}`,
  actionDateTime: `2025-08-${String(index + 1).padStart(2, "0")}T0${index}:30:00Z`,
  searchDateTimeRange: `2025-08-${String(index + 1).padStart(2, "0")} 08:00 - 2025-08-${String(index + 1).padStart(2, "0")} 17:00`,
}));
