// Types
import { SuspectPersonSearch } from "../features/search/SearchTypes";

export const mockSuspectPersonSearch: SuspectPersonSearch[] = [
  {
    id: 1,
    prefix: "Mr.",
    name: "John Doe",
    nationalId: "1234567890123",
    imagesData: [
      {
        url: "/images/car_test.png",
        title: "Vehicle 1",
      },
      {
        url: "/images/car_test.png",
        title: "Vehicle 2",
      }
    ],
    startDate: "2025-03-01",
    endDate: "2025-03-10",
    department: "Criminal Investigation Department",
    departmentId: 101,
    area: "Central District",
    areaId: 201,
    province: "Bangkok",
    provinceId: 301,
    station: "Bangkok Police Station",
    stationId: 401,
    checkpoints: [
      { checkpointId: 501, checkpointName: "Checkpoint A" },
      { checkpointId: 502, checkpointName: "Checkpoint B" },
    ],
    percentConfidence: 85.5,
    dateTimeRange: "2025-03-01T08:00:00Z - 2025-03-10T20:00:00Z",
    remark: "Suspected of illegal activities.",
    person_class_id: 1,
  },
  {
    id: 2,
    prefix: "Ms.",
    name: "Jane Smith",
    nationalId: "9876543210987",
    imagesData: [
      {
        url: "/images/car_test.png",
        title: "Vehicle 2",
      }
    ],
    startDate: "2025-02-15",
    endDate: "2025-02-25",
    department: "Traffic Police Department",
    departmentId: 102,
    area: "Northern District",
    areaId: 202,
    province: "Chiang Mai",
    provinceId: 302,
    station: "Chiang Mai Police Station",
    stationId: 402,
    checkpoints: [
      { checkpointId: 503, checkpointName: "Checkpoint C" },
      { checkpointId: 504, checkpointName: "Checkpoint D" },
    ],
    percentConfidence: 72.3,
    dateTimeRange: "2025-02-15T10:30:00Z - 2025-02-25T18:45:00Z",
    remark: "Associated with a stolen vehicle case.",
    person_class_id: 2,
  },
];
