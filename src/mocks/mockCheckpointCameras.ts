// Types
import { CheckpointCamera } from "../features/types"

export const mockCheckpointCameras: CheckpointCamera[] = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  camera_name: `Camera ${index + 1}`,
  checkpoint_name: `Checkpoint ${index + 1}`,
  latitude: (13.70 + index * 0.01).toFixed(6),
  longitude: (100.50 + index * 0.01).toFixed(6),
  active: index % 2, // 0 or 1
  deleted: 0,
  reason: index % 2 === 0 ? "Routine operation" : "Maintenance",
  created_at: `2025-01-${String(index + 1).padStart(2, "0")}T09:00:00Z`,
  updated_at: `2025-07-${String(index + 1).padStart(2, "0")}T18:00:00Z`,
}));