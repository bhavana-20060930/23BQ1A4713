# Stage 1 ? Notification System Design

## Approach

### Priority Scoring
Each notification gets a numeric score:

score = (typeWeight x 10^13) + timestamp_ms

### Type Weights
| Type      | Weight |
|-----------|--------|
| Placement | 3      |
| Result    | 2      |
| Event     | 1      |

- Type always dominates (multiplied by a large constant).
- Within the same type, recency (newer = higher timestamp_ms) breaks ties.

### Why This Works
- Placement notifications always appear above Results, which always appear above Events.
- Among same-type notifications, the most recent appears first.
- Simple O(n log n) sort efficient for any realistic notification volume.

### Maintaining Top 10 Efficiently as New Notifications Arrive
Since new notifications keep coming in, we use a Min-Heap of size N:
- Keep a min-heap of the top N notifications by score.
- For each new notification: if its score > heap minimum, pop the min and push the new one.
- This runs in O(log N) per new notification instead of re-sorting the entire list.
- N=10 means the heap stays tiny regardless of total notification count.

### Logging
All operations use structured JSON logging:
{"timestamp": "...", "level": "INFO", "message": "...", "data": {}}
No inbuilt language loggers or console.log for business events, only structured logs.
