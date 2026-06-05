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

const AUTH_TOKEN = "QQdEYy";

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
