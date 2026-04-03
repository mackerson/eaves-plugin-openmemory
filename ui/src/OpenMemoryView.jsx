import React, { useState, useEffect } from 'react';

export function OpenMemoryView({ context }) {
  const [stats, setStats] = useState(null);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [activeTab, setActiveTab] = useState('search');
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [error, setError] = useState(null);
  const [timelineSubject, setTimelineSubject] = useState('');
  const [timelinePredicate, setTimelinePredicate] = useState('');
  const [timelineResults, setTimelineResults] = useState(null);

  const checkConnection = async () => {
    setCheckingConnection(true);
    setError(null);
    try {
      const result = await context.tools.execute('openmemory_health', {});
      setConnectionStatus(result);
      return result.connected;
    } catch (error) {
      console.error('Failed to check connection:', error);
      setConnectionStatus({
        connected: false,
        status: 'error',
        error: error.message
      });
      setError('Failed to check connection: ' + error.message);
      return false;
    } finally {
      setCheckingConnection(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await context.tools.execute('openmemory_stats', {});
      setStats(result.stats || result);
      setError(null);
      return true;
    } catch (error) {
      console.error('Failed to load stats:', error);
      setError('Failed to load statistics. Is OpenMemory running?');
      return false;
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const connected = await checkConnection();
      if (connected) {
        await loadStats();
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Check connection every 30 seconds
    const interval = setInterval(() => {
      checkConnection();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setMemories([]);
      return;
    }

    if (!connectionStatus?.connected) {
      setError('Cannot search: Not connected to OpenMemory');
      return;
    }

    try {
      setError(null);
      const result = await context.tools.execute('openmemory_search', {
        query: searchQuery,
        limit: 20,
        minSimilarity: 0.5
      });
      setMemories(result.memories || []);
    } catch (error) {
      console.error('Failed to search:', error);
      setError('Search failed: ' + error.message);
      setMemories([]);
    }
  };

  const handleQueryTimeline = async () => {
    if (!timelineSubject.trim() || !timelinePredicate.trim()) {
      setError('Subject and predicate are required for timeline query');
      return;
    }

    if (!connectionStatus?.connected) {
      setError('Cannot query timeline: Not connected to OpenMemory');
      return;
    }

    try {
      setError(null);
      const result = await context.tools.execute('openmemory_query_timeline', {
        subject: timelineSubject,
        predicate: timelinePredicate
      });
      setTimelineResults(result);
    } catch (error) {
      console.error('Failed to query timeline:', error);
      setError('Timeline query failed: ' + error.message);
      setTimelineResults(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-muted-foreground">Loading OpenMemory data...</div>
      </div>
    );
  }

  return (
    <div className="p-8 overflow-y-auto h-full">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-semibold">OpenMemory</h2>

          {/* Connection Status Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus?.connected
                  ? 'bg-green-500'
                  : connectionStatus?.status === 'error'
                    ? 'bg-red-500'
                    : 'bg-yellow-500'
              }`} />
              <span className="text-sm text-muted-foreground">
                {connectionStatus?.connected
                  ? `Connected (${connectionStatus.responseTime}ms)`
                  : 'Disconnected'}
              </span>
            </div>
            <button
              onClick={() => checkConnection()}
              disabled={checkingConnection}
              className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors disabled:opacity-50"
            >
              {checkingConnection ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </div>
        <p className="text-muted-foreground mt-2">
          Advanced cognitive memory system with semantic search and graph associations
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-destructive text-lg">⚠️</span>
            <div className="flex-1">
              <div className="text-sm font-medium text-destructive mb-1">Error</div>
              <div className="text-sm text-destructive/90">{error}</div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-destructive hover:text-destructive/80"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Offline Warning */}
      {!connectionStatus?.connected && !loading && (
        <div className="mb-6 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-yellow-600 text-2xl">🔌</span>
            <div className="flex-1">
              <div className="text-lg font-medium text-yellow-700 mb-2">OpenMemory Service Offline</div>
              <div className="text-sm text-yellow-700/90 space-y-2">
                <p>Cannot connect to OpenMemory at <code className="px-2 py-1 bg-yellow-500/20 rounded text-xs">{connectionStatus?.baseURL}</code></p>
                <p>To use OpenMemory features:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Start OpenMemory service locally (see Settings tab)</li>
                  <li>Or configure a cloud instance in Settings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-border">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'search'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Search
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'stats'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Statistics
          </button>
          <button
            onClick={() => setActiveTab('temporal')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'temporal'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Temporal Knowledge
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div>
          {/* Search Box */}
          <div className="mb-6 flex gap-2">
            <input
              type="text"
              placeholder="Semantic search for memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Search
            </button>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setMemories([]);
                }}
                className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Results */}
          {memories.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* List */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {memories.map((memory, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedMemory(memory)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedMemory === memory
                        ? 'border-primary bg-accent'
                        : 'border-border hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {memory.sector && (
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                            {memory.sector}
                          </span>
                        )}
                        {memory.similarity && (
                          <span className="text-xs text-muted-foreground">
                            {(memory.similarity * 100).toFixed(0)}% match
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-foreground line-clamp-3">
                      {memory.text || memory.content}
                    </div>
                    {memory.timestamp && (
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(memory.timestamp).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Detail View */}
              <div className="border border-border rounded-lg p-6 bg-card max-h-[600px] overflow-y-auto">
                {selectedMemory ? (
                  <div>
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        {selectedMemory.sector && (
                          <span className="text-sm px-3 py-1 bg-primary/10 text-primary rounded">
                            {selectedMemory.sector}
                          </span>
                        )}
                        {selectedMemory.similarity && (
                          <span className="text-sm text-muted-foreground">
                            Similarity: {(selectedMemory.similarity * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>
                      {selectedMemory.timestamp && (
                        <div className="text-sm text-muted-foreground">
                          Stored: {new Date(selectedMemory.timestamp).toLocaleString()}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-2">Content:</div>
                        <div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap">
                          {selectedMemory.text || selectedMemory.content}
                        </div>
                      </div>

                      {selectedMemory.waypoints && selectedMemory.waypoints.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-2">
                            Recall Path (Waypoints):
                          </div>
                          <div className="bg-muted p-4 rounded-lg space-y-2">
                            {selectedMemory.waypoints.map((waypoint, i) => (
                              <div key={i} className="text-sm">
                                <span className="text-muted-foreground">→</span> {waypoint}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedMemory.metadata && Object.keys(selectedMemory.metadata).length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-2">Metadata:</div>
                          <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                            {JSON.stringify(selectedMemory.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Select a memory to view details
                  </div>
                )}
              </div>
            </div>
          )}

          {memories.length === 0 && searchQuery && (
            <div className="text-center py-12 text-muted-foreground">
              No memories found
            </div>
          )}

          {memories.length === 0 && !searchQuery && (
            <div className="text-center py-12 text-muted-foreground">
              Enter a search query to find memories
            </div>
          )}
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          {/* Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 border border-border rounded-lg bg-card">
              <div className="text-sm text-muted-foreground mb-1">Total Memories</div>
              <div className="text-3xl font-semibold">{stats.totalMemories || 0}</div>
            </div>
            <div className="p-6 border border-border rounded-lg bg-card">
              <div className="text-sm text-muted-foreground mb-1">System Health</div>
              <div className="text-3xl font-semibold">{stats.health || 'N/A'}</div>
            </div>
            <div className="p-6 border border-border rounded-lg bg-card">
              <div className="text-sm text-muted-foreground mb-1">Memory Tier</div>
              <div className="text-3xl font-semibold capitalize">{stats.tier || 'N/A'}</div>
            </div>
          </div>

          {/* Sector Distribution */}
          {stats.sectors && (
            <div className="border border-border rounded-lg p-6 bg-card">
              <h3 className="text-lg font-semibold mb-4">Memory Sectors</h3>
              <div className="space-y-3">
                {Object.entries(stats.sectors).map(([sector, count]) => (
                  <div key={sector} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium capitalize">{sector}</div>
                      <div className="text-xs text-muted-foreground">
                        {typeof count === 'object' ? count.count : count} memories
                      </div>
                    </div>
                    <div className="flex-1 mx-4 bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-full"
                        style={{
                          width: `${((typeof count === 'object' ? count.count : count) / (stats.totalMemories || 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          {stats.performance && (
            <div className="border border-border rounded-lg p-6 bg-card">
              <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.performance).map(([metric, value]) => (
                  <div key={metric}>
                    <div className="text-xs text-muted-foreground mb-1 capitalize">
                      {metric.replace(/_/g, ' ')}
                    </div>
                    <div className="text-lg font-semibold">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Stats */}
          <div className="border border-border rounded-lg p-6 bg-card">
            <h3 className="text-lg font-semibold mb-4">Raw Statistics</h3>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
              {JSON.stringify(stats, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Temporal Knowledge Tab */}
      {activeTab === 'temporal' && (
        <div className="space-y-6">
          <div className="border border-border rounded-lg p-6 bg-card">
            <h3 className="text-lg font-semibold mb-4">About Temporal Knowledge</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                OpenMemory's temporal knowledge system tracks how facts change over time.
                Query timelines to see how values for a subject-predicate pair have evolved.
              </p>
              <div className="bg-muted p-4 rounded-lg mt-4">
                <div className="font-medium mb-2">Examples:</div>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Subject: "user", Predicate: "preferred_language" → See language preference history</li>
                  <li>Subject: "project", Predicate: "tech_stack" → Track technology changes</li>
                  <li>Subject: "settings", Predicate: "theme" → View theme changes over time</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Timeline Query */}
          <div className="border border-border rounded-lg p-6 bg-card">
            <h3 className="text-lg font-semibold mb-4">Query Timeline</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Subject (entity to track)
                </label>
                <input
                  type="text"
                  placeholder="e.g., user, project, settings"
                  value={timelineSubject}
                  onChange={(e) => setTimelineSubject(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Predicate (property to track)
                </label>
                <input
                  type="text"
                  placeholder="e.g., preferred_language, tech_stack, theme"
                  value={timelinePredicate}
                  onChange={(e) => setTimelinePredicate(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQueryTimeline()}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleQueryTimeline}
                  disabled={!connectionStatus?.connected || !timelineSubject.trim() || !timelinePredicate.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Query Timeline
                </button>
                {(timelineSubject || timelinePredicate || timelineResults) && (
                  <button
                    onClick={() => {
                      setTimelineSubject('');
                      setTimelinePredicate('');
                      setTimelineResults(null);
                    }}
                    className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Timeline Results */}
          {timelineResults && (
            <div className="border border-border rounded-lg p-6 bg-card">
              <h3 className="text-lg font-semibold mb-4">Timeline Results</h3>
              {timelineResults.timeline && timelineResults.timeline.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground mb-4">
                    Found {timelineResults.timeline.length} event(s) for{' '}
                    <code className="px-2 py-1 bg-muted rounded">{timelineResults.subject}</code>
                    {' → '}
                    <code className="px-2 py-1 bg-muted rounded">{timelineResults.predicate}</code>
                  </div>
                  <div className="space-y-2">
                    {timelineResults.timeline.map((event, index) => (
                      <div
                        key={index}
                        className="p-4 bg-muted rounded-lg border-l-4 border-primary"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-medium text-sm">
                            {event.object || event.value}
                          </div>
                          {event.confidence && (
                            <span className="text-xs text-muted-foreground">
                              Confidence: {(event.confidence * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          {event.validFrom && (
                            <div>
                              Valid from: {new Date(event.validFrom).toLocaleString()}
                            </div>
                          )}
                          {event.validTo && (
                            <div>
                              Valid to: {new Date(event.validTo).toLocaleString()}
                            </div>
                          )}
                          {!event.validTo && event.validFrom && (
                            <div className="text-green-600">Currently active</div>
                          )}
                        </div>
                        {event.metadata && Object.keys(event.metadata).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                              Metadata
                            </summary>
                            <pre className="mt-2 text-xs bg-background p-2 rounded overflow-x-auto">
                              {JSON.stringify(event.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No timeline events found for this subject-predicate pair
                </div>
              )}
            </div>
          )}

          {/* No Connection Warning */}
          {!connectionStatus?.connected && (
            <div className="border border-border rounded-lg p-6 bg-card">
              <div className="text-center py-8 text-muted-foreground">
                Connect to OpenMemory to query temporal knowledge
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-3xl">
          {/* Current Configuration */}
          <div className="border border-border rounded-lg p-6 bg-card">
            <h3 className="text-lg font-semibold mb-4">Current Configuration</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Base URL</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-4 py-2 bg-muted rounded text-sm font-mono">
                    {connectionStatus?.baseURL || 'http://localhost:8080'}
                  </code>
                  <div className={`px-3 py-2 rounded text-xs font-medium ${
                    connectionStatus?.connected
                      ? 'bg-green-500/10 text-green-700'
                      : 'bg-red-500/10 text-red-700'
                  }`}>
                    {connectionStatus?.connected ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">User ID</div>
                <code className="block px-4 py-2 bg-muted rounded text-sm font-mono">
                  {connectionStatus?.userId || 'default-user'}
                </code>
              </div>
              {connectionStatus?.version && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Service Version</div>
                  <code className="block px-4 py-2 bg-muted rounded text-sm font-mono">
                    {connectionStatus.version}
                  </code>
                </div>
              )}
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="border border-border rounded-lg p-6 bg-card">
            <h3 className="text-lg font-semibold mb-4">Setup OpenMemory Service</h3>
            <div className="space-y-4 text-sm">
              <div>
                <div className="font-medium mb-2">Option 1: Docker (Recommended)</div>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="text-muted-foreground mb-2">Run OpenMemory locally with Docker:</div>
                  <pre className="bg-background p-3 rounded text-xs font-mono overflow-x-auto">
                    docker run -d \{'\n'}
                    {'  '}--name openmemory \{'\n'}
                    {'  '}-p 8080:8080 \{'\n'}
                    {'  '}-e OPENAI_API_KEY=your_key \{'\n'}
                    {'  '}cavira/openmemory:latest
                  </pre>
                  <div className="text-xs text-muted-foreground mt-2">
                    Default port is 8080. Make sure it matches your configured Base URL.
                  </div>
                </div>
              </div>

              <div>
                <div className="font-medium mb-2">Option 2: Local Development</div>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="text-muted-foreground mb-2">Clone and run from source:</div>
                  <pre className="bg-background p-3 rounded text-xs font-mono overflow-x-auto">
                    git clone https://github.com/CaviraOSS/OpenMemory{'\n'}
                    cd OpenMemory{'\n'}
                    npm install{'\n'}
                    npm start
                  </pre>
                </div>
              </div>

              <div>
                <div className="font-medium mb-2">Option 3: Cloud Instance</div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-muted-foreground">
                    Deploy OpenMemory to a cloud provider and configure the Base URL in the plugin configuration.
                    Edit <code className="px-2 py-1 bg-background rounded text-xs">.enclave/plugins.json</code> to set a custom baseURL.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Help */}
          <div className="border border-border rounded-lg p-6 bg-card">
            <h3 className="text-lg font-semibold mb-4">Changing Configuration</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>To change the OpenMemory connection settings:</p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>Open <code className="px-2 py-1 bg-muted rounded text-xs">.enclave/plugins.json</code> in your project</li>
                <li>Find the OpenMemory plugin configuration</li>
                <li>
                  Update the settings:
                  <pre className="bg-muted p-3 rounded text-xs font-mono mt-2 overflow-x-auto">
{`{
  "com.enclave.openmemory": {
    "enabled": true,
    "config": {
      "baseURL": "http://localhost:8080",
      "userId": "your-user-id"
    }
  }
}`}
                  </pre>
                </li>
                <li>Restart Enclave for changes to take effect</li>
              </ol>
            </div>
          </div>

          {/* Documentation Links */}
          <div className="border border-border rounded-lg p-6 bg-card">
            <h3 className="text-lg font-semibold mb-4">Documentation & Resources</h3>
            <div className="space-y-2 text-sm">
              <a
                href="https://github.com/CaviraOSS/OpenMemory"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <span>📚</span>
                <span>OpenMemory GitHub Repository</span>
              </a>
              <a
                href="https://github.com/CaviraOSS/OpenMemory/blob/main/README.md"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <span>📖</span>
                <span>OpenMemory Documentation</span>
              </a>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>💡</span>
                <span>See the plugin README for more details on memory features</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
