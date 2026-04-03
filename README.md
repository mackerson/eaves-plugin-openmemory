# OpenMemory Plugin

Advanced cognitive memory system for Enclave agents with semantic search, graph associations, memory decay, and temporal knowledge tracking.

This plugin wraps the [OpenMemory](https://github.com/CaviraOSS/OpenMemory) service, providing agents with sophisticated memory capabilities that go far beyond simple key-value storage.

## Features

OpenMemory provides a **cognitive architecture** for AI memory:

### Core Capabilities
- **Multi-sector memory**: Automatic organization into semantic, episodic, procedural, emotional, and reflective sectors
- **Semantic search**: Vector embeddings enable finding memories by meaning, not just keywords
- **Graph associations**: Memories link to related memories with waypoint traces showing recall paths
- **Memory decay**: Memories naturally fade unless reinforced (mimics human forgetting)
- **Explainable recall**: See why a memory was retrieved via the associative path
- **Temporal knowledge graph**: Track how facts evolve over time with validity periods

### Performance
- 338 QPS throughput
- 95% recall@5 accuracy
- Handles 100k+ memory nodes
- Per-user memory isolation

## Prerequisites

You must have an OpenMemory service running. Choose one option:

### Option 1: Local Docker (Recommended for Development)

```bash
# Clone OpenMemory
git clone https://github.com/CaviraOSS/OpenMemory.git
cd OpenMemory

# Run with Docker Compose
docker-compose up -d

# Service will be available at http://localhost:3000
```

### Option 2: Cloud Deployment

Deploy to your preferred platform:
- **Vercel**: One-click deploy from GitHub
- **Railway**: Connect GitHub repo and deploy
- **DigitalOcean**: Deploy as a Docker app
- **Self-hosted**: Run the Node.js app on any server

See [OpenMemory deployment docs](https://github.com/CaviraOSS/OpenMemory#deployment) for details.

## Configuration

Configure the plugin in Enclave's plugin settings or via `plugin.json`:

```json
{
  "baseURL": "http://localhost:3000",  // Your OpenMemory service URL
  "userId": "default-user"              // User ID for memory isolation
}
```

**Multi-user setup**: Each `userId` gets isolated memory storage. Use different user IDs for different agents or contexts.

## Tools

The OpenMemory plugin registers 6 tools that agents can use:

### 1. `openmemory_store`

Store a memory with automatic sectoring and embedding.

**Parameters:**
- `text` (required): The memory content
- `metadata` (optional): Additional data
  - `tags` (array): Categorization tags
  - `importance` (number 0-1): Salience score (resists decay)

**Example:**
```javascript
{
  "text": "User prefers test-driven development and writes tests before implementation",
  "metadata": {
    "tags": ["development-practice", "testing"],
    "importance": 0.9
  }
}
```

**Returns:** Memory ID, sectors assigned, success status

### 2. `openmemory_search`

Search memories using semantic similarity.

**Parameters:**
- `query` (required): Search query (embedded and matched semantically)
- `limit` (optional): Max results (default: 5)
- `minSimilarity` (optional): Minimum score 0-1 (default: 0.5)

**Example:**
```javascript
{
  "query": "What are the user's coding preferences?",
  "limit": 3,
  "minSimilarity": 0.6
}
```

**Returns:** Array of relevant memories with similarity scores and waypoint traces showing why they were recalled

### 3. `openmemory_store_fact`

Store a time-bound fact in the temporal knowledge graph.

**Parameters:**
- `subject` (required): Entity (e.g., "user", "project")
- `predicate` (required): Relationship (e.g., "prefers", "uses")
- `object` (required): Value (e.g., "Python", "microservices")
- `validFrom` (optional): Start timestamp (default: now)
- `validTo` (optional): End timestamp (null = still valid)
- `confidence` (optional): Score 0-1 (default: 1.0)

**Example:**
```javascript
{
  "subject": "user",
  "predicate": "preferred_language",
  "object": "Python",
  "validFrom": "2024-01-01T00:00:00Z",
  "confidence": 0.95
}
```

**Returns:** Fact ID, validity period

### 4. `openmemory_query_timeline`

Query how a fact has changed over time.

**Parameters:**
- `subject` (required): Entity to track
- `predicate` (required): Property to track
- `startTime` (optional): Range start
- `endTime` (optional): Range end (default: now)

**Example:**
```javascript
{
  "subject": "user",
  "predicate": "preferred_language",
  "startTime": "2023-01-01T00:00:00Z"
}
```

**Returns:** Timeline of all values with timestamps and confidence scores

### 5. `openmemory_compare_facts`

Compare facts at two different points in time.

**Parameters:**
- `subject` (required): Entity to compare
- `timeA` (required): First timestamp
- `timeB` (optional): Second timestamp (default: now)

**Example:**
```javascript
{
  "subject": "user",
  "timeA": "2023-01-01T00:00:00Z",
  "timeB": "2024-01-01T00:00:00Z"
}
```

**Returns:** Added facts, removed facts, changed facts

### 6. `openmemory_stats`

Get memory system statistics and health metrics.

**Parameters:** None

**Returns:** Total memories, sector distribution, decay trends, system health

## Use Cases

### Long-term Agent Memory
```
Agent: I'll remember your coding preferences for future sessions.
[Calls openmemory_store with high importance]

Later session:
Agent: Let me check what I know about your preferences...
[Calls openmemory_search]
Based on what I remember, you prefer test-driven development.
```

### Temporal Knowledge Tracking
```
User: I used to prefer JavaScript, but now I prefer TypeScript.

Agent: I'll update the temporal knowledge graph.
[Calls openmemory_store_fact with old fact's validTo = now]
[Calls openmemory_store_fact with new fact's validFrom = now]

Later:
User: What languages have I preferred over time?

Agent: [Calls openmemory_query_timeline]
You preferred JavaScript from 2020-2023, and TypeScript from 2023-present.
```

### Semantic Discovery
```
User: What do you remember about my development workflow?

Agent: [Calls openmemory_search with "development workflow"]
You practice TDD, prefer pair programming, use Git with feature branches,
and like code reviews before merging. These memories are connected through
our knowledge graph.
```

## Comparison with Simple Memory Plugin

| Feature | Simple Memory | OpenMemory |
|---------|---------------|------------|
| Setup | Zero-config | Requires service |
| Storage | Key-value | Cognitive sectors |
| Search | Text substring | Semantic embeddings |
| Associations | None | Graph waypoints |
| Decay | No | Yes (adaptive) |
| Temporal | Timestamps only | Full knowledge graph |
| Performance | Very fast | Fast (338 QPS) |
| Use case | Quick storage | Sophisticated memory |

**When to use Simple Memory:**
- Quick preference storage
- No external dependencies needed
- Simple key-value operations sufficient

**When to use OpenMemory:**
- Long-term agent memory
- Semantic search required
- Need to track knowledge evolution
- Want explainable recall
- Complex associative memory needed

## Development

The plugin uses:
- `context.tools.register()` - Register tools
- `context.config` - Access plugin configuration
- `context.log` - Plugin-namespaced logging
- `fetch()` - HTTP client for OpenMemory REST API

## Troubleshooting

**Plugin activation fails:**
- Ensure OpenMemory service is running
- Check `baseURL` configuration is correct
- Verify network connectivity

**API errors:**
- Check OpenMemory logs: `docker-compose logs -f`
- Verify userId is set correctly
- Ensure OpenMemory has embedding provider configured

**Empty search results:**
- Memories need time to be embedded (usually < 1 second)
- Try lowering `minSimilarity` threshold
- Check if memories were stored successfully

## Resources

- [OpenMemory GitHub](https://github.com/CaviraOSS/OpenMemory)
- [OpenMemory Documentation](https://github.com/CaviraOSS/OpenMemory#readme)
- [Deployment Guide](https://github.com/CaviraOSS/OpenMemory#deployment)
- [API Reference](https://github.com/CaviraOSS/OpenMemory/tree/main/docs)

## Version

1.0.0 - Initial release with full OpenMemory API support
