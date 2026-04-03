/**
 * OpenMemory Plugin for Enclave
 * Provides advanced cognitive memory with semantic search, associations,
 * memory decay, and temporal knowledge tracking
 *
 * Implements the standard MemoryBackendAPI interface and registers
 * as a 'memory-backend' service for cross-plugin communication.
 *
 * Also provides advanced tools for temporal facts and timeline queries.
 *
 * Requires OpenMemory service running (https://github.com/CaviraOSS/OpenMemory)
 */

module.exports = {
  async activate(context) {
    context.log.info('OpenMemory plugin activated');

    // Get configuration
    const config = context.config || {};
    const baseURL = config.baseURL || 'http://localhost:8080';
    const userId = config.userId || 'default-user';

    context.log.info('OpenMemory config', { baseURL, userId });

    // =================================================================
    // HTTP Client
    // =================================================================

    async function apiCall(method, endpoint, data = null) {
      const url = `${baseURL}${endpoint}`;

      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OpenMemory API error (${response.status}): ${errorText}`);
        }

        return await response.json();
      } catch (error) {
        context.log.error('OpenMemory API call failed', { method, endpoint, error: error.message });
        throw error;
      }
    }

    // =================================================================
    // Memory Backend Service Implementation (Standard Interface)
    // =================================================================

    const memoryBackendAPI = {
      /**
       * Store a memory with optional metadata
       * Maps to OpenMemory's semantic storage with auto-sectoring
       */
      async store({ key, value, metadata = {} }) {
        if (!key || !value) {
          throw new Error('Both key and value are required');
        }

        const payload = {
          userId,
          text: value,
          metadata: {
            ...metadata,
            key, // Store the key in metadata for retrieval
            source: 'enclave',
            timestamp: Date.now(),
            importance: metadata.importance || 0.5
          }
        };

        const result = await apiCall('POST', '/api/memory', payload);

        context.log.info('Stored memory in OpenMemory', { key, memoryId: result.id });

        return {
          success: true,
          key,
          message: 'Memory stored with semantic embedding',
          storedAt: Date.now(),
          memoryId: result.id,
          sectors: result.sectors || []
        };
      },

      /**
       * Retrieve a memory by key
       * Uses semantic search to find the memory with matching key in metadata
       */
      async retrieve(key) {
        if (!key) {
          throw new Error('Key is required');
        }

        try {
          // Search for memories with this key in metadata
          const result = await apiCall('GET',
            `/api/memory/search?userId=${userId}&query=${encodeURIComponent(key)}&limit=10&minSimilarity=0.3`
          );

          // Find the memory with matching key in metadata
          const memory = result.memories?.find(m => m.metadata?.key === key);

          if (!memory) {
            return {
              success: false,
              key,
              message: `No memory found for key: ${key}`
            };
          }

          context.log.info('Retrieved memory from OpenMemory', { key });

          return {
            success: true,
            key,
            value: memory.text,
            metadata: memory.metadata
          };
        } catch (error) {
          return {
            success: false,
            key,
            message: `Failed to retrieve memory: ${error.message}`
          };
        }
      },

      /**
       * Search memories using semantic similarity
       */
      async search({ query, limit = 10, minSimilarity = 0.5, tags }) {
        if (!query) {
          throw new Error('Query is required');
        }

        let url = `/api/memory/search?userId=${userId}&query=${encodeURIComponent(query)}&limit=${limit}&minSimilarity=${minSimilarity}`;

        const result = await apiCall('GET', url);

        // Filter by tags if specified
        let memories = result.memories || [];
        if (tags && tags.length > 0) {
          memories = memories.filter(m => {
            const entryTags = m.metadata?.tags || [];
            return tags.some(tag => entryTags.includes(tag));
          });
        }

        context.log.info('OpenMemory search completed', { query, resultsCount: memories.length });

        return {
          success: true,
          query,
          count: memories.length,
          results: memories.map(m => ({
            key: m.metadata?.key || m.id,
            value: m.text,
            metadata: m.metadata,
            score: m.similarity,
            matchedOn: 'semantic'
          }))
        };
      },

      /**
       * List all memories
       * Note: OpenMemory doesn't have a direct "list all" - we use stats + search
       */
      async list(pattern) {
        try {
          // Get all memories by searching with empty-ish query
          // This is a workaround since OpenMemory is semantic-first
          const result = await apiCall('GET',
            `/api/memory/search?userId=${userId}&query=*&limit=1000&minSimilarity=0.0`
          );

          let memories = result.memories || [];

          // Filter by pattern if specified
          if (pattern) {
            const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
            memories = memories.filter(m => {
              const key = m.metadata?.key || m.id;
              return regex.test(key);
            });
          }

          return {
            success: true,
            count: memories.length,
            keys: memories.map(m => m.metadata?.key || m.id),
            memories: memories.map(m => ({
              key: m.metadata?.key || m.id,
              value: m.text,
              metadata: m.metadata
            })),
            total: result.total || memories.length
          };
        } catch (error) {
          return {
            success: false,
            count: 0,
            keys: [],
            message: `Failed to list memories: ${error.message}`
          };
        }
      },

      /**
       * Delete a memory by key
       */
      async delete(key) {
        if (!key) {
          throw new Error('Key is required');
        }

        try {
          // First, find the memory to get its ID
          const result = await apiCall('GET',
            `/api/memory/search?userId=${userId}&query=${encodeURIComponent(key)}&limit=10&minSimilarity=0.3`
          );

          const memory = result.memories?.find(m => m.metadata?.key === key);

          if (!memory) {
            return {
              success: false,
              key,
              message: `No memory found for key: ${key}`
            };
          }

          // Delete by ID
          await apiCall('DELETE', `/api/memory/${memory.id}?userId=${userId}`);

          context.log.info('Deleted memory from OpenMemory', { key, memoryId: memory.id });

          return {
            success: true,
            key,
            message: 'Memory deleted successfully'
          };
        } catch (error) {
          return {
            success: false,
            key,
            message: `Failed to delete memory: ${error.message}`
          };
        }
      },

      /**
       * Health check - test connection to OpenMemory service
       */
      async health() {
        const startTime = Date.now();

        try {
          const response = await fetch(`${baseURL}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
          });

          const responseTime = Date.now() - startTime;

          if (response.ok) {
            const data = await response.json().catch(() => ({}));

            return {
              connected: true,
              status: 'healthy',
              responseTime,
              baseURL,
              userId,
              version: data.version || 'unknown',
              backend: 'openmemory'
            };
          } else {
            throw new Error(`Health check failed with status ${response.status}`);
          }
        } catch (error) {
          const responseTime = Date.now() - startTime;

          return {
            connected: false,
            status: 'disconnected',
            responseTime,
            baseURL,
            userId,
            error: error.message,
            backend: 'openmemory'
          };
        }
      }
    };

    // =================================================================
    // Register as Memory Backend Service
    // =================================================================

    context.services.register('memory-backend', memoryBackendAPI, {
      version: '1.0',
      features: ['metadata', 'tags', 'semantic-search', 'embeddings', 'decay', 'sectoring'],
      description: 'Advanced cognitive memory with semantic search and memory decay',
      requiresService: true,
      serviceURL: baseURL
    });

    context.log.info('Registered as memory-backend service');

    // =================================================================
    // Standard Memory Tools (using the backend API)
    // =================================================================

    context.tools.register('openmemory_store', {
      description: 'Store a memory in OpenMemory with automatic sectoring (semantic, episodic, procedural, emotional, reflective). Memories decay over time unless reinforced.',
      parameters: {
        type: 'object',
        properties: {
          key: {
            type: 'string',
            description: 'Unique identifier for this memory'
          },
          text: {
            type: 'string',
            description: 'The memory content to store (will be automatically sectored and embedded)'
          },
          metadata: {
            type: 'object',
            description: 'Optional metadata (tags, importance, etc.)',
            properties: {
              tags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Tags for categorizing this memory'
              },
              importance: {
                type: 'number',
                description: 'Salience score (0-1, higher = more important, resists decay)'
              }
            }
          }
        },
        required: ['text']
      },
      execute: async (args) => {
        const { key, text, metadata = {} } = args;
        return memoryBackendAPI.store({
          key: key || `memory_${Date.now()}`,
          value: text,
          metadata
        });
      }
    });

    context.tools.register('openmemory_search', {
      description: 'Search memories using semantic similarity. Returns relevant memories with waypoint traces showing why they were recalled.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query (will be embedded and matched semantically)'
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results (default: 5)'
          },
          minSimilarity: {
            type: 'number',
            description: 'Minimum similarity score 0-1 (default: 0.5)'
          }
        },
        required: ['query']
      },
      execute: async (args) => memoryBackendAPI.search(args)
    });

    // =================================================================
    // Advanced Temporal Tools (OpenMemory-specific)
    // =================================================================

    context.tools.register('openmemory_store_fact', {
      description: 'Store a time-bound fact that can change over time (e.g., "user prefers Python" valid from 2024-01-01). Supports temporal queries and fact evolution tracking.',
      parameters: {
        type: 'object',
        properties: {
          subject: {
            type: 'string',
            description: 'The subject entity (e.g., "user", "project_architecture")'
          },
          predicate: {
            type: 'string',
            description: 'The relationship/property (e.g., "prefers", "uses", "lives_in")'
          },
          object: {
            type: 'string',
            description: 'The value (e.g., "Python", "microservices", "San Francisco")'
          },
          validFrom: {
            type: 'string',
            description: 'Start timestamp (ISO 8601 or Unix timestamp, default: now)'
          },
          validTo: {
            type: 'string',
            description: 'End timestamp (ISO 8601 or Unix timestamp, null = still valid)'
          },
          confidence: {
            type: 'number',
            description: 'Confidence score 0-1 (default: 1.0)'
          }
        },
        required: ['subject', 'predicate', 'object']
      },
      execute: async (args) => {
        const { subject, predicate, object, validFrom, validTo, confidence = 1.0 } = args;

        if (!subject || !predicate || !object) {
          throw new Error('Subject, predicate, and object are required');
        }

        const payload = {
          userId,
          subject,
          predicate,
          object,
          validFrom: validFrom || new Date().toISOString(),
          validTo: validTo || null,
          confidence,
          metadata: {
            source: 'enclave',
            timestamp: Date.now()
          }
        };

        const result = await apiCall('POST', '/api/temporal/fact', payload);

        context.log.info('Stored temporal fact', { factId: result.id, subject, predicate, object });

        return {
          success: true,
          factId: result.id,
          message: `Fact stored: ${subject} ${predicate} ${object}`,
          validFrom: payload.validFrom,
          validTo: payload.validTo
        };
      }
    });

    context.tools.register('openmemory_query_timeline', {
      description: 'Query how a fact has changed over time. Returns the timeline of all values for a subject-predicate pair.',
      parameters: {
        type: 'object',
        properties: {
          subject: {
            type: 'string',
            description: 'The subject entity'
          },
          predicate: {
            type: 'string',
            description: 'The relationship/property to track'
          },
          startTime: {
            type: 'string',
            description: 'Start of time range (ISO 8601 or Unix timestamp)'
          },
          endTime: {
            type: 'string',
            description: 'End of time range (ISO 8601 or Unix timestamp, default: now)'
          }
        },
        required: ['subject', 'predicate']
      },
      execute: async (args) => {
        const { subject, predicate, startTime, endTime } = args;

        if (!subject || !predicate) {
          throw new Error('Subject and predicate are required');
        }

        let url = `/api/temporal/timeline?userId=${userId}&subject=${encodeURIComponent(subject)}&predicate=${encodeURIComponent(predicate)}`;
        if (startTime) url += `&startTime=${encodeURIComponent(startTime)}`;
        if (endTime) url += `&endTime=${encodeURIComponent(endTime)}`;

        const result = await apiCall('GET', url);

        context.log.info('Retrieved temporal timeline', {
          subject,
          predicate,
          eventsCount: result.timeline?.length || 0
        });

        return {
          success: true,
          subject,
          predicate,
          timeline: result.timeline || [],
          message: `Found ${result.timeline?.length || 0} events in timeline`
        };
      }
    });

    context.tools.register('openmemory_compare_facts', {
      description: 'Compare the state of facts at two different points in time. Useful for understanding how knowledge has changed.',
      parameters: {
        type: 'object',
        properties: {
          subject: {
            type: 'string',
            description: 'The subject entity'
          },
          timeA: {
            type: 'string',
            description: 'First timestamp to compare (ISO 8601 or Unix timestamp)'
          },
          timeB: {
            type: 'string',
            description: 'Second timestamp to compare (ISO 8601 or Unix timestamp, default: now)'
          }
        },
        required: ['subject', 'timeA']
      },
      execute: async (args) => {
        const { subject, timeA, timeB } = args;

        if (!subject || !timeA) {
          throw new Error('Subject and timeA are required');
        }

        let url = `/api/temporal/compare?userId=${userId}&subject=${encodeURIComponent(subject)}&timeA=${encodeURIComponent(timeA)}`;
        if (timeB) url += `&timeB=${encodeURIComponent(timeB)}`;

        const result = await apiCall('GET', url);

        context.log.info('Compared temporal facts', { subject, timeA, timeB });

        return {
          success: true,
          subject,
          timeA,
          timeB: timeB || 'now',
          added: result.added || [],
          removed: result.removed || [],
          changed: result.changed || [],
          message: `Comparison complete: ${result.added?.length || 0} added, ${result.removed?.length || 0} removed, ${result.changed?.length || 0} changed`
        };
      }
    });

    context.tools.register('openmemory_stats', {
      description: 'Get statistics about memory usage: total memories, sector distribution, decay trends, and system health.',
      parameters: {
        type: 'object',
        properties: {}
      },
      execute: async (args) => {
        const result = await apiCall('GET', `/api/memory/stats?userId=${userId}`);

        context.log.info('Retrieved OpenMemory stats', { totalMemories: result.total });

        return {
          success: true,
          stats: result,
          message: `Memory system has ${result.total || 0} memories across ${result.sectors ? Object.keys(result.sectors).length : 0} sectors`
        };
      }
    });

    context.tools.register('openmemory_health', {
      description: 'Check connection health to OpenMemory service. Returns status, response time, and service version.',
      parameters: {
        type: 'object',
        properties: {}
      },
      execute: async () => memoryBackendAPI.health()
    });

    // Register view to display memories and stats
    context.ui.registerView({
      id: 'openmemory-viewer',
      title: 'OpenMemory',
      icon: '🧠',
      component: 'OpenMemoryView',
      showInSidebar: true
    });

    context.log.info('OpenMemory plugin tools registered successfully', {
      tools: [
        'openmemory_store',
        'openmemory_search',
        'openmemory_store_fact',
        'openmemory_query_timeline',
        'openmemory_compare_facts',
        'openmemory_stats',
        'openmemory_health'
      ],
      service: 'memory-backend',
      baseURL,
      userId
    });
  },

  async deactivate(context) {
    context.log.info('OpenMemory plugin deactivated');

    // Unregister service
    context.services.unregister('memory-backend');

    // Unregister all tools
    context.tools.unregister('openmemory_store');
    context.tools.unregister('openmemory_search');
    context.tools.unregister('openmemory_store_fact');
    context.tools.unregister('openmemory_query_timeline');
    context.tools.unregister('openmemory_compare_facts');
    context.tools.unregister('openmemory_stats');
    context.tools.unregister('openmemory_health');
  }
};
