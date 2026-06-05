"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

const API = "http://4.224.186.213/evaluation-service/notifications";
const AUTH_TOKEN = "QQdEYy";

const WEIGHT: Record<string, number> = { Placement: 3, Result: 2, Event: 1 };
const TYPE_COLOR: Record<string, "success" | "warning" | "info"> = {
  Placement: "success", Result: "warning", Event: "info",
};

interface Notification {
  ID: string;
  Type: "Event" | "Result" | "Placement";
  Message: string;
  Timestamp: string;
}

function score(n: Notification) {
  return (WEIGHT[n.Type] ?? 0) * 1e13 + new Date(n.Timestamp).getTime();
}

export default function PriorityPage() {
  const [all, setAll] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [topN, setTopN] = useState(10);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(API, {
        params: { limit: 100, page: 1 },
        headers: { Authorization: "Bearer " + AUTH_TOKEN }
      });
      setAll(data.notifications ?? []);
    } catch {
      setError("Failed to fetch notifications.");
    } finally {
      setLoading(false);
    }
  }

  const topNotifications = [...all]
    .sort((a, b) => score(b) - score(a))
    .slice(0, topN);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Priority Inbox</Typography>
        <Button variant="outlined" href="/">All Notifications</Button>
      </Stack>

      <Box mb={3}>
        <Typography gutterBottom>Show top <strong>{topN}</strong> notifications</Typography>
        <Slider
          value={topN}
          min={5} max={20} step={5}
          marks={[5,10,15,20].map(v => ({ value: v, label: `${v}` }))}
          onChange={(_, v) => setTopN(v as number)}
          sx={{ maxWidth: 300 }}
        />
      </Box>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && topNotifications.map((n, i) => (
        <Card key={n.ID} sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" gap={2}>
              <Typography variant="h6" color="text.secondary" sx={{ minWidth: 28 }}>
                #{i + 1}
              </Typography>
              <Box flex={1}>
                <Stack direction="row" gap={1} mb={0.5}>
                  <Chip label={n.Type} color={TYPE_COLOR[n.Type]} size="small" />
                </Stack>
                <Typography variant="body1" fontWeight={500}>{n.Message}</Typography>
                <Typography variant="caption" color="text.secondary">{n.Timestamp}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
}
