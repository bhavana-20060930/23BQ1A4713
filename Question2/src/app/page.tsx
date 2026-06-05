"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Pagination from "@mui/material/Pagination";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";

const API = "http://4.224.186.213/evaluation-service/notifications";
const PAGE_SIZE = 10;
const AUTH_TOKEN = "QQdEYy";
const VIEWED_KEY = "viewed_notification_ids";

type NType = "Event" | "Result" | "Placement" | "all";

interface Notification {
  ID: string;
  Type: "Event" | "Result" | "Placement";
  Message: string;
  Timestamp: string;
}

const TYPE_COLOR: Record<string, "success" | "warning" | "info"> = {
  Placement: "success",
  Result: "warning",
  Event: "info",
};

function getViewed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  return new Set(JSON.parse(localStorage.getItem(VIEWED_KEY) ?? "[]"));
}

function markViewed(id: string) {
  const v = getViewed();
  v.add(id);
  localStorage.setItem(VIEWED_KEY, JSON.stringify([...v]));
}

export default function Home() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<NType>("all");
  const [page, setPage] = useState(1);
  const [viewed, setViewed] = useState<Set<string>>(new Set());

  useEffect(() => {
    setViewed(getViewed());
    fetchAll();
  }, []);

  async function fetchAll(type?: string) {
    setLoading(true);
    setError("");
    try {
      const params: Record<string, string | number> = { limit: 100, page: 1 };
      if (type && type !== "all") params.notification_type = type;
      const { data } = await axios.get(API, {
        params,
        headers: { Authorization: "Bearer " + AUTH_TOKEN }
      });
      setNotifications(data.notifications ?? []);
    } catch {
      setError("Failed to fetch notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleFilter(_: unknown, val: NType) {
    if (!val) return;
    setFilter(val);
    setPage(1);
    fetchAll(val);
  }

  function handleOpen(id: string) {
    markViewed(id);
    setViewed((prev) => new Set([...prev, id]));
  }

  const paginated = notifications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(notifications.length / PAGE_SIZE);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>All Notifications</Typography>
        <Button variant="contained" href="/priority">Priority Inbox</Button>
      </Stack>

      <ToggleButtonGroup value={filter} exclusive onChange={handleFilter} sx={{ mb: 3 }}>
        {["all", "Placement", "Result", "Event"].map((t) => (
          <ToggleButton key={t} value={t}>{t === "all" ? "All" : t}</ToggleButton>
        ))}
      </ToggleButtonGroup>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && paginated.map((n) => {
        const isNew = !viewed.has(n.ID);
        return (
          <Card
            key={n.ID}
            sx={{ mb: 2, border: isNew ? "2px solid #1976d2" : "1px solid #e0e0e0", cursor: "pointer" }}
            onClick={() => handleOpen(n.ID)}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
                <Chip label={n.Type} color={TYPE_COLOR[n.Type]} size="small" />
                {isNew && <Chip label="New" color="primary" size="small" />}
              </Stack>
              <Typography variant="body1" fontWeight={500}>{n.Message}</Typography>
              <Typography variant="caption" color="text.secondary">{n.Timestamp}</Typography>
            </CardContent>
          </Card>
        );
      })}

      {totalPages > 1 && (
        <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} sx={{ mt: 2 }} />
      )}
    </Container>
  );
}
