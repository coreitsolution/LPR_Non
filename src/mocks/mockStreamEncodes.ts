import { StreamEncode } from "../features/dropdown/dropdownTypes"

export const mockStreamEncodes: StreamEncode[] = [
    {
        "id": 1,
        "encode_name": "H264 (NVIDIA)",
        "gstreamer_format": "latency=0 ! rtph264depay ! h264parse ! omxh264dec ! nvvidconv ! video/x-raw,format=(string)BGRx ! videoconvert ! appsink name=sink max-buffers=5",
        "visible": 1,
        "active": 1,
        "created_at": "2025-06-24T07:32:08.874Z",
        "updated_at": "2025-06-24T07:32:08.874Z"
    },
    {
        "id": 2,
        "encode_name": "H265 (NVIDIA)",
        "gstreamer_format": "latency=0 ! rtph265depay ! h265parse ! omxh265dec ! nvvidconv ! video/x-raw,format=(string)BGRx ! videoconvert ! appsink name=sink max-buffers=5",
        "visible": 1,
        "active": 1,
        "created_at": "2025-06-24T07:32:08.874Z",
        "updated_at": "2025-06-24T07:32:08.874Z"
    },
    {
        "id": 3,
        "encode_name": "MJPEG (NVIDIA)",
        "gstreamer_format": "latency=0 ! rtpjpegdepay ! nvjpegdec ! nvvidconv ! video/x-raw,format=BGRx ! videoconvert ! video/x-raw,format=BGR ! appsink name=sink max-buffers=5",
        "visible": 1,
        "active": 1,
        "created_at": "2025-06-24T07:32:08.874Z",
        "updated_at": "2025-06-24T07:32:08.874Z"
    },
    {
        "id": 4,
        "encode_name": "H264",
        "gstreamer_format": "drop-on-latency=1 latency=0 ! queue max-size-buffers=0 max-size-time=0 max-size-bytes=0 min-threshold-time=10 ! rtph264depay ! h264parse ! decodebin ! videoconvert ! video/x-raw,format=BGR ! videoconvert ! appsink name=sink max-buffers=5",
        "visible": 1,
        "active": 1,
        "created_at": "2025-06-24T07:32:08.874Z",
        "updated_at": "2025-06-24T07:32:08.874Z"
    },
    {
        "id": 5,
        "encode_name": "H265",
        "gstreamer_format": "drop-on-latency=1 latency=0 ! queue max-size-buffers=0 max-size-time=0 max-size-bytes=0 min-threshold-time=10 ! rtph265depay ! h265parse ! decodebin ! videoconvert ! video/x-raw,format=BGR ! videoconvert ! appsink name=sink max-buffers=5",
        "visible": 1,
        "active": 1,
        "created_at": "2025-06-24T07:32:08.874Z",
        "updated_at": "2025-06-24T07:32:08.874Z"
    },
    {
        "id": 6,
        "encode_name": "MJPEG",
        "gstreamer_format": "drop-on-latency=1 latency=0 ! queue max-size-buffers=0 max-size-time=0 max-size-bytes=0 min-threshold-time=10 ! rtpjpegdepay ! jpegdec ! videoconvert ! video/x-raw,format=BGR ! videoconvert ! appsink name=sink max-buffers=5",
        "visible": 1,
        "active": 1,
        "created_at": "2025-06-24T07:32:08.874Z",
        "updated_at": "2025-06-24T07:32:08.874Z"
    }
]