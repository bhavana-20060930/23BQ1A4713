import axios from "axios";

type NotificationType = "Placement" | "Result" | "Event";

interface Notification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string;
}

interface ApiResponse {
  notifications: Notification[];
}

function log(level: "INFO" | "WARN" | "ERROR", message: string, data?: unknown) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(data !== undefined && { data }),
  };
  console.log(JSON.stringify(entry));
}

const PRIORITY_WEIGHT: Record<NotificationType, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJiaGF2YW5hZWVzaGFAZ21haWwuY29tIiwiZXhwIjoxNzgwNjM5MDIzLCJpYXQiOjE3ODA2MzgxMjMsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiIzNGU1MTE1NC1iNTM2LTQ1MjQtODcyYi04YTY0Yjc5ZmFlNDYiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJkYXNhcmkgYmhhdmFuYSIsInN1YiI6ImRkMDkzMjk0LWQ2YjItNGIyZS1hYTA5LWU5YTIxYzg3NWU2YiJ9LCJlbWFpbCI6ImJoYXZhbmFlZXNoYUBnbWFpbC5jb20iLCJuYW1lIjoiZGFzYXJpIGJoYXZhbmEiLCJyb2xsTm8iOiIyM2JxMWE0NzEzIiwiYWNjZXNzQ29kZSI6IlFRZEVZeSIsImNsaWVudElEIjoiZGQwOTMyOTQtZDZiMi00YjJlLWFhMDktZTlhMjFjODc1ZTZiIiwiY2xpZW50U2VjcmV0IjoiUHBDRURnYkNlU2JiZVl1cyJ9.LBQW0cGgw9GP8yscjT1yv_IirVdqP254PlO61SRlgps";

async function fetchNotifications(): Promise<Notification[]> {
  const API_URL = "http://4.224.186.213/evaluation-service/notifications";
  log("INFO", "Fetching notifications from API", { url: API_URL });
  try {
    const response = await axios.get<ApiResponse>(API_URL, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`
      }
    });
    log("INFO", "Notifications fetched successfully", {
      count: response.data.notifications.length,
    });
    return response.data.notifications;
  } catch (error) {
    log("ERROR", "Failed to fetch notifications", { error });
    throw error;
  }
}

function score(n: Notification): number {
  const typeWeight = PRIORITY_WEIGHT[n.Type] ?? 0;
  const recency = new Date(n.Timestamp).getTime();
  return typeWeight * 1e13 + recency;
}

function getTopN(notifications: Notification[], n: number): Notification[] {
  log("INFO", `Computing top ${n} priority notifications`);
  const sorted = [...notifications].sort((a, b) => score(b) - score(a));
  const topN = sorted.slice(0, n);
  log("INFO", `Top ${n} notifications computed`, {
    topIds: topN.map((x) => x.ID),
  });
  return topN;
}

async function main() {
  log("INFO", "Priority Inbox Service starting");
  const notifications = await fetchNotifications();
  const TOP_N = 10;
  const topNotifications = getTopN(notifications, TOP_N);

  console.log("\n========== TOP 10 PRIORITY NOTIFICATIONS ==========\n");
  topNotifications.forEach((n, i) => {
    console.log(`${i + 1}. [${n.Type}] ${n.Message}`);
    console.log(`   ID: ${n.ID}`);
    console.log(`   Time: ${n.Timestamp}\n`);
  });

  log("INFO", "Priority Inbox Service completed");
}

main().catch((err) => {
  log("ERROR", "Unhandled error in main", { err });
  process.exit(1);
});
