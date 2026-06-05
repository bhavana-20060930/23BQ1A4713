"use client";
import { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Pagination from "@mui/material/Pagination";

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

export default function Home() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadPage(1);
  }, []);

  function loadPage(p: number) {
    setLoading(true);
    setError("");
    fetch(`/api/notifications?limit=10&page=${p}`)
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.notifications ?? []);
        setTotalPages(Math.ceil((data.total ?? 10) / 10));
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch: " + err.message);
        setLoading(false);
      });
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>All Notifications</Typography>
        <Button variant="contained" href="/priority">Priority Inbox</Button>
      </Stack>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && notifications.length === 0 && (
        <Alert severity="info">No notifications found.</Alert>
      )}

      {!loading && !error && notifications.map((n) => (
        <Card key={n.ID} sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
              <Chip label={n.Type} color={TYPE_COLOR[n.Type]} size="small" />
            </Stack>
            <Typography variant="body1" fontWeight={500}>{n.Message}</Typography>
            <Typography variant="caption" color="text.secondary">{n.Timestamp}</Typography>
          </CardContent>
        </Card>
      ))}

      {totalPages > 1 && (
        <Pagination count={totalPages} page={page} onChange={(_, v) => { setPage(v); loadPage(v); }} sx={{ mt: 2 }} />
      )}
    </Container>
  );
}
