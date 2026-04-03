import { jsx as e, jsxs as r } from "/node_modules/react/jsx-runtime";
import { useState as i, useEffect as L } from "/node_modules/react";
function P({ context: u }) {
  const [n, f] = i(null), [g, b] = i([]), [N, w] = i(!0), [m, k] = i(""), [l, F] = i(null), [o, x] = i("search"), [d, O] = i(null), [C, M] = i(!1), [j, s] = i(null), [h, T] = i(""), [p, S] = i(""), [c, v] = i(null), y = async () => {
    M(!0), s(null);
    try {
      const t = await u.tools.execute("openmemory_health", {});
      return O(t), t.connected;
    } catch (t) {
      return console.error("Failed to check connection:", t), O({
        connected: !1,
        status: "error",
        error: t.message
      }), s("Failed to check connection: " + t.message), !1;
    } finally {
      M(!1);
    }
  }, E = async () => {
    try {
      const t = await u.tools.execute("openmemory_stats", {});
      return f(t.stats || t), s(null), !0;
    } catch (t) {
      return console.error("Failed to load stats:", t), s("Failed to load statistics. Is OpenMemory running?"), !1;
    }
  }, _ = async () => {
    try {
      w(!0), await y() && await E();
    } catch (t) {
      console.error("Failed to load data:", t), s("Failed to load data: " + t.message);
    } finally {
      w(!1);
    }
  };
  L(() => {
    _();
    const t = setInterval(() => {
      y();
    }, 3e4);
    return () => clearInterval(t);
  }, []);
  const R = async () => {
    if (!m.trim()) {
      b([]);
      return;
    }
    if (!(d != null && d.connected)) {
      s("Cannot search: Not connected to OpenMemory");
      return;
    }
    try {
      s(null);
      const t = await u.tools.execute("openmemory_search", {
        query: m,
        limit: 20,
        minSimilarity: 0.5
      });
      b(t.memories || []);
    } catch (t) {
      console.error("Failed to search:", t), s("Search failed: " + t.message), b([]);
    }
  }, D = async () => {
    if (!h.trim() || !p.trim()) {
      s("Subject and predicate are required for timeline query");
      return;
    }
    if (!(d != null && d.connected)) {
      s("Cannot query timeline: Not connected to OpenMemory");
      return;
    }
    try {
      s(null);
      const t = await u.tools.execute("openmemory_query_timeline", {
        subject: h,
        predicate: p
      });
      v(t);
    } catch (t) {
      console.error("Failed to query timeline:", t), s("Timeline query failed: " + t.message), v(null);
    }
  };
  return N ? /* @__PURE__ */ e("div", { className: "p-8", children: /* @__PURE__ */ e("div", { className: "text-muted-foreground", children: "Loading OpenMemory data..." }) }) : /* @__PURE__ */ r("div", { className: "p-8 overflow-y-auto h-full", children: [
    /* @__PURE__ */ r("div", { className: "mb-6", children: [
      /* @__PURE__ */ r("div", { className: "flex items-center justify-between mb-2", children: [
        /* @__PURE__ */ e("h2", { className: "text-3xl font-semibold", children: "OpenMemory" }),
        /* @__PURE__ */ r("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ r("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ e("div", { className: `w-2 h-2 rounded-full ${d != null && d.connected ? "bg-green-500" : (d == null ? void 0 : d.status) === "error" ? "bg-red-500" : "bg-yellow-500"}` }),
            /* @__PURE__ */ e("span", { className: "text-sm text-muted-foreground", children: d != null && d.connected ? `Connected (${d.responseTime}ms)` : "Disconnected" })
          ] }),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: () => y(),
              disabled: C,
              className: "px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors disabled:opacity-50",
              children: C ? "Testing..." : "Test Connection"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ e("p", { className: "text-muted-foreground mt-2", children: "Advanced cognitive memory system with semantic search and graph associations" })
    ] }),
    j && /* @__PURE__ */ e("div", { className: "mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg", children: /* @__PURE__ */ r("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ e("span", { className: "text-destructive text-lg", children: "⚠️" }),
      /* @__PURE__ */ r("div", { className: "flex-1", children: [
        /* @__PURE__ */ e("div", { className: "text-sm font-medium text-destructive mb-1", children: "Error" }),
        /* @__PURE__ */ e("div", { className: "text-sm text-destructive/90", children: j })
      ] }),
      /* @__PURE__ */ e(
        "button",
        {
          onClick: () => s(null),
          className: "text-destructive hover:text-destructive/80",
          children: "✕"
        }
      )
    ] }) }),
    !(d != null && d.connected) && !N && /* @__PURE__ */ e("div", { className: "mb-6 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg", children: /* @__PURE__ */ r("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ e("span", { className: "text-yellow-600 text-2xl", children: "🔌" }),
      /* @__PURE__ */ r("div", { className: "flex-1", children: [
        /* @__PURE__ */ e("div", { className: "text-lg font-medium text-yellow-700 mb-2", children: "OpenMemory Service Offline" }),
        /* @__PURE__ */ r("div", { className: "text-sm text-yellow-700/90 space-y-2", children: [
          /* @__PURE__ */ r("p", { children: [
            "Cannot connect to OpenMemory at ",
            /* @__PURE__ */ e("code", { className: "px-2 py-1 bg-yellow-500/20 rounded text-xs", children: d == null ? void 0 : d.baseURL })
          ] }),
          /* @__PURE__ */ e("p", { children: "To use OpenMemory features:" }),
          /* @__PURE__ */ r("ul", { className: "list-disc list-inside ml-2 space-y-1", children: [
            /* @__PURE__ */ e("li", { children: "Start OpenMemory service locally (see Settings tab)" }),
            /* @__PURE__ */ e("li", { children: "Or configure a cloud instance in Settings" })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ e("div", { className: "mb-6 border-b border-border", children: /* @__PURE__ */ r("div", { className: "flex gap-4", children: [
      /* @__PURE__ */ e(
        "button",
        {
          onClick: () => x("search"),
          className: `px-4 py-2 border-b-2 transition-colors ${o === "search" ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`,
          children: "Search"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          onClick: () => x("stats"),
          className: `px-4 py-2 border-b-2 transition-colors ${o === "stats" ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`,
          children: "Statistics"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          onClick: () => x("temporal"),
          className: `px-4 py-2 border-b-2 transition-colors ${o === "temporal" ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`,
          children: "Temporal Knowledge"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          onClick: () => x("settings"),
          className: `px-4 py-2 border-b-2 transition-colors ${o === "settings" ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`,
          children: "Settings"
        }
      )
    ] }) }),
    o === "search" && /* @__PURE__ */ r("div", { children: [
      /* @__PURE__ */ r("div", { className: "mb-6 flex gap-2", children: [
        /* @__PURE__ */ e(
          "input",
          {
            type: "text",
            placeholder: "Semantic search for memories...",
            value: m,
            onChange: (t) => k(t.target.value),
            onKeyDown: (t) => t.key === "Enter" && R(),
            className: "flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: R,
            className: "px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors",
            children: "Search"
          }
        ),
        m && /* @__PURE__ */ e(
          "button",
          {
            onClick: () => {
              k(""), b([]);
            },
            className: "px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors",
            children: "Clear"
          }
        )
      ] }),
      g.length > 0 && /* @__PURE__ */ r("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ e("div", { className: "space-y-3 max-h-[600px] overflow-y-auto", children: g.map((t, a) => /* @__PURE__ */ r(
          "div",
          {
            onClick: () => F(t),
            className: `p-4 border rounded-lg cursor-pointer transition-colors ${l === t ? "border-primary bg-accent" : "border-border hover:bg-accent/50"}`,
            children: [
              /* @__PURE__ */ e("div", { className: "flex items-start justify-between mb-2", children: /* @__PURE__ */ r("div", { className: "flex items-center gap-2", children: [
                t.sector && /* @__PURE__ */ e("span", { className: "text-xs px-2 py-1 bg-primary/10 text-primary rounded", children: t.sector }),
                t.similarity && /* @__PURE__ */ r("span", { className: "text-xs text-muted-foreground", children: [
                  (t.similarity * 100).toFixed(0),
                  "% match"
                ] })
              ] }) }),
              /* @__PURE__ */ e("div", { className: "text-sm text-foreground line-clamp-3", children: t.text || t.content }),
              t.timestamp && /* @__PURE__ */ e("div", { className: "text-xs text-muted-foreground mt-2", children: new Date(t.timestamp).toLocaleString() })
            ]
          },
          a
        )) }),
        /* @__PURE__ */ e("div", { className: "border border-border rounded-lg p-6 bg-card max-h-[600px] overflow-y-auto", children: l ? /* @__PURE__ */ r("div", { children: [
          /* @__PURE__ */ r("div", { className: "mb-4", children: [
            /* @__PURE__ */ r("div", { className: "flex items-center gap-2 mb-2", children: [
              l.sector && /* @__PURE__ */ e("span", { className: "text-sm px-3 py-1 bg-primary/10 text-primary rounded", children: l.sector }),
              l.similarity && /* @__PURE__ */ r("span", { className: "text-sm text-muted-foreground", children: [
                "Similarity: ",
                (l.similarity * 100).toFixed(1),
                "%"
              ] })
            ] }),
            l.timestamp && /* @__PURE__ */ r("div", { className: "text-sm text-muted-foreground", children: [
              "Stored: ",
              new Date(l.timestamp).toLocaleString()
            ] })
          ] }),
          /* @__PURE__ */ r("div", { className: "space-y-4", children: [
            /* @__PURE__ */ r("div", { children: [
              /* @__PURE__ */ e("div", { className: "text-sm font-medium text-muted-foreground mb-2", children: "Content:" }),
              /* @__PURE__ */ e("div", { className: "bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap", children: l.text || l.content })
            ] }),
            l.waypoints && l.waypoints.length > 0 && /* @__PURE__ */ r("div", { children: [
              /* @__PURE__ */ e("div", { className: "text-sm font-medium text-muted-foreground mb-2", children: "Recall Path (Waypoints):" }),
              /* @__PURE__ */ e("div", { className: "bg-muted p-4 rounded-lg space-y-2", children: l.waypoints.map((t, a) => /* @__PURE__ */ r("div", { className: "text-sm", children: [
                /* @__PURE__ */ e("span", { className: "text-muted-foreground", children: "→" }),
                " ",
                t
              ] }, a)) })
            ] }),
            l.metadata && Object.keys(l.metadata).length > 0 && /* @__PURE__ */ r("div", { children: [
              /* @__PURE__ */ e("div", { className: "text-sm font-medium text-muted-foreground mb-2", children: "Metadata:" }),
              /* @__PURE__ */ e("pre", { className: "bg-muted p-4 rounded-lg text-xs overflow-x-auto", children: JSON.stringify(l.metadata, null, 2) })
            ] })
          ] })
        ] }) : /* @__PURE__ */ e("div", { className: "flex items-center justify-center h-full text-muted-foreground", children: "Select a memory to view details" }) })
      ] }),
      g.length === 0 && m && /* @__PURE__ */ e("div", { className: "text-center py-12 text-muted-foreground", children: "No memories found" }),
      g.length === 0 && !m && /* @__PURE__ */ e("div", { className: "text-center py-12 text-muted-foreground", children: "Enter a search query to find memories" })
    ] }),
    o === "stats" && n && /* @__PURE__ */ r("div", { className: "space-y-6", children: [
      /* @__PURE__ */ r("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ r("div", { className: "p-6 border border-border rounded-lg bg-card", children: [
          /* @__PURE__ */ e("div", { className: "text-sm text-muted-foreground mb-1", children: "Total Memories" }),
          /* @__PURE__ */ e("div", { className: "text-3xl font-semibold", children: n.totalMemories || 0 })
        ] }),
        /* @__PURE__ */ r("div", { className: "p-6 border border-border rounded-lg bg-card", children: [
          /* @__PURE__ */ e("div", { className: "text-sm text-muted-foreground mb-1", children: "System Health" }),
          /* @__PURE__ */ e("div", { className: "text-3xl font-semibold", children: n.health || "N/A" })
        ] }),
        /* @__PURE__ */ r("div", { className: "p-6 border border-border rounded-lg bg-card", children: [
          /* @__PURE__ */ e("div", { className: "text-sm text-muted-foreground mb-1", children: "Memory Tier" }),
          /* @__PURE__ */ e("div", { className: "text-3xl font-semibold capitalize", children: n.tier || "N/A" })
        ] })
      ] }),
      n.sectors && /* @__PURE__ */ r("div", { className: "border border-border rounded-lg p-6 bg-card", children: [
        /* @__PURE__ */ e("h3", { className: "text-lg font-semibold mb-4", children: "Memory Sectors" }),
        /* @__PURE__ */ e("div", { className: "space-y-3", children: Object.entries(n.sectors).map(([t, a]) => /* @__PURE__ */ r("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ r("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ e("div", { className: "text-sm font-medium capitalize", children: t }),
            /* @__PURE__ */ r("div", { className: "text-xs text-muted-foreground", children: [
              typeof a == "object" ? a.count : a,
              " memories"
            ] })
          ] }),
          /* @__PURE__ */ e("div", { className: "flex-1 mx-4 bg-muted rounded-full h-2 overflow-hidden", children: /* @__PURE__ */ e(
            "div",
            {
              className: "bg-primary h-full",
              style: {
                width: `${(typeof a == "object" ? a.count : a) / (n.totalMemories || 1) * 100}%`
              }
            }
          ) })
        ] }, t)) })
      ] }),
      n.performance && /* @__PURE__ */ r("div", { className: "border border-border rounded-lg p-6 bg-card", children: [
        /* @__PURE__ */ e("h3", { className: "text-lg font-semibold mb-4", children: "Performance Metrics" }),
        /* @__PURE__ */ e("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: Object.entries(n.performance).map(([t, a]) => /* @__PURE__ */ r("div", { children: [
          /* @__PURE__ */ e("div", { className: "text-xs text-muted-foreground mb-1 capitalize", children: t.replace(/_/g, " ") }),
          /* @__PURE__ */ e("div", { className: "text-lg font-semibold", children: a })
        ] }, t)) })
      ] }),
      /* @__PURE__ */ r("div", { className: "border border-border rounded-lg p-6 bg-card", children: [
        /* @__PURE__ */ e("h3", { className: "text-lg font-semibold mb-4", children: "Raw Statistics" }),
        /* @__PURE__ */ e("pre", { className: "bg-muted p-4 rounded-lg text-xs overflow-x-auto", children: JSON.stringify(n, null, 2) })
      ] })
    ] }),
    o === "temporal" && /* @__PURE__ */ r("div", { className: "space-y-6", children: [
      /* @__PURE__ */ r("div", { className: "border border-border rounded-lg p-6 bg-card", children: [
        /* @__PURE__ */ e("h3", { className: "text-lg font-semibold mb-4", children: "About Temporal Knowledge" }),
        /* @__PURE__ */ r("div", { className: "text-sm text-muted-foreground space-y-2", children: [
          /* @__PURE__ */ e("p", { children: "OpenMemory's temporal knowledge system tracks how facts change over time. Query timelines to see how values for a subject-predicate pair have evolved." }),
          /* @__PURE__ */ r("div", { className: "bg-muted p-4 rounded-lg mt-4", children: [
            /* @__PURE__ */ e("div", { className: "font-medium mb-2", children: "Examples:" }),
            /* @__PURE__ */ r("ul", { className: "list-disc list-inside space-y-1 text-xs", children: [
              /* @__PURE__ */ e("li", { children: 'Subject: "user", Predicate: "preferred_language" → See language preference history' }),
              /* @__PURE__ */ e("li", { children: 'Subject: "project", Predicate: "tech_stack" → Track technology changes' }),
              /* @__PURE__ */ e("li", { children: 'Subject: "settings", Predicate: "theme" → View theme changes over time' })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ r("div", { className: "border border-border rounded-lg p-6 bg-card", children: [
        /* @__PURE__ */ e("h3", { className: "text-lg font-semibold mb-4", children: "Query Timeline" }),
        /* @__PURE__ */ r("div", { className: "space-y-4", children: [
          /* @__PURE__ */ r("div", { children: [
            /* @__PURE__ */ e("label", { className: "block text-sm font-medium text-muted-foreground mb-2", children: "Subject (entity to track)" }),
            /* @__PURE__ */ e(
              "input",
              {
                type: "text",
                placeholder: "e.g., user, project, settings",
                value: h,
                onChange: (t) => T(t.target.value),
                className: "w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              }
            )
          ] }),
          /* @__PURE__ */ r("div", { children: [
            /* @__PURE__ */ e("label", { className: "block text-sm font-medium text-muted-foreground mb-2", children: "Predicate (property to track)" }),
            /* @__PURE__ */ e(
              "input",
              {
                type: "text",
                placeholder: "e.g., preferred_language, tech_stack, theme",
                value: p,
                onChange: (t) => S(t.target.value),
                onKeyDown: (t) => t.key === "Enter" && D(),
                className: "w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              }
            )
          ] }),
          /* @__PURE__ */ r("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ e(
              "button",
              {
                onClick: D,
                disabled: !(d != null && d.connected) || !h.trim() || !p.trim(),
                className: "px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                children: "Query Timeline"
              }
            ),
            (h || p || c) && /* @__PURE__ */ e(
              "button",
              {
                onClick: () => {
                  T(""), S(""), v(null);
                },
                className: "px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors",
                children: "Clear"
              }
            )
          ] })
        ] })
      ] }),
      c && /* @__PURE__ */ r("div", { className: "border border-border rounded-lg p-6 bg-card", children: [
        /* @__PURE__ */ e("h3", { className: "text-lg font-semibold mb-4", children: "Timeline Results" }),
        c.timeline && c.timeline.length > 0 ? /* @__PURE__ */ r("div", { className: "space-y-3", children: [
          /* @__PURE__ */ r("div", { className: "text-sm text-muted-foreground mb-4", children: [
            "Found ",
            c.timeline.length,
            " event(s) for",
            " ",
            /* @__PURE__ */ e("code", { className: "px-2 py-1 bg-muted rounded", children: c.subject }),
            " → ",
            /* @__PURE__ */ e("code", { className: "px-2 py-1 bg-muted rounded", children: c.predicate })
          ] }),
          /* @__PURE__ */ e("div", { className: "space-y-2", children: c.timeline.map((t, a) => /* @__PURE__ */ r(
            "div",
            {
              className: "p-4 bg-muted rounded-lg border-l-4 border-primary",
              children: [
                /* @__PURE__ */ r("div", { className: "flex items-start justify-between mb-2", children: [
                  /* @__PURE__ */ e("div", { className: "font-medium text-sm", children: t.object || t.value }),
                  t.confidence && /* @__PURE__ */ r("span", { className: "text-xs text-muted-foreground", children: [
                    "Confidence: ",
                    (t.confidence * 100).toFixed(0),
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ r("div", { className: "text-xs text-muted-foreground space-y-1", children: [
                  t.validFrom && /* @__PURE__ */ r("div", { children: [
                    "Valid from: ",
                    new Date(t.validFrom).toLocaleString()
                  ] }),
                  t.validTo && /* @__PURE__ */ r("div", { children: [
                    "Valid to: ",
                    new Date(t.validTo).toLocaleString()
                  ] }),
                  !t.validTo && t.validFrom && /* @__PURE__ */ e("div", { className: "text-green-600", children: "Currently active" })
                ] }),
                t.metadata && Object.keys(t.metadata).length > 0 && /* @__PURE__ */ r("details", { className: "mt-2", children: [
                  /* @__PURE__ */ e("summary", { className: "text-xs text-muted-foreground cursor-pointer hover:text-foreground", children: "Metadata" }),
                  /* @__PURE__ */ e("pre", { className: "mt-2 text-xs bg-background p-2 rounded overflow-x-auto", children: JSON.stringify(t.metadata, null, 2) })
                ] })
              ]
            },
            a
          )) })
        ] }) : /* @__PURE__ */ e("div", { className: "text-center py-8 text-muted-foreground", children: "No timeline events found for this subject-predicate pair" })
      ] }),
      !(d != null && d.connected) && /* @__PURE__ */ e("div", { className: "border border-border rounded-lg p-6 bg-card", children: /* @__PURE__ */ e("div", { className: "text-center py-8 text-muted-foreground", children: "Connect to OpenMemory to query temporal knowledge" }) })
    ] }),
    o === "settings" && /* @__PURE__ */ r("div", { className: "space-y-6 max-w-3xl", children: [
      /* @__PURE__ */ r("div", { className: "border border-border rounded-lg p-6 bg-card", children: [
        /* @__PURE__ */ e("h3", { className: "text-lg font-semibold mb-4", children: "Current Configuration" }),
        /* @__PURE__ */ r("div", { className: "space-y-4", children: [
          /* @__PURE__ */ r("div", { children: [
            /* @__PURE__ */ e("div", { className: "text-sm font-medium text-muted-foreground mb-1", children: "Base URL" }),
            /* @__PURE__ */ r("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ e("code", { className: "flex-1 px-4 py-2 bg-muted rounded text-sm font-mono", children: (d == null ? void 0 : d.baseURL) || "http://localhost:8080" }),
              /* @__PURE__ */ e("div", { className: `px-3 py-2 rounded text-xs font-medium ${d != null && d.connected ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700"}`, children: d != null && d.connected ? "Online" : "Offline" })
            ] })
          ] }),
          /* @__PURE__ */ r("div", { children: [
            /* @__PURE__ */ e("div", { className: "text-sm font-medium text-muted-foreground mb-1", children: "User ID" }),
            /* @__PURE__ */ e("code", { className: "block px-4 py-2 bg-muted rounded text-sm font-mono", children: (d == null ? void 0 : d.userId) || "default-user" })
          ] }),
          (d == null ? void 0 : d.version) && /* @__PURE__ */ r("div", { children: [
            /* @__PURE__ */ e("div", { className: "text-sm font-medium text-muted-foreground mb-1", children: "Service Version" }),
            /* @__PURE__ */ e("code", { className: "block px-4 py-2 bg-muted rounded text-sm font-mono", children: d.version })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ r("div", { className: "border border-border rounded-lg p-6 bg-card", children: [
        /* @__PURE__ */ e("h3", { className: "text-lg font-semibold mb-4", children: "Setup OpenMemory Service" }),
        /* @__PURE__ */ r("div", { className: "space-y-4 text-sm", children: [
          /* @__PURE__ */ r("div", { children: [
            /* @__PURE__ */ e("div", { className: "font-medium mb-2", children: "Option 1: Docker (Recommended)" }),
            /* @__PURE__ */ r("div", { className: "bg-muted p-4 rounded-lg space-y-2", children: [
              /* @__PURE__ */ e("div", { className: "text-muted-foreground mb-2", children: "Run OpenMemory locally with Docker:" }),
              /* @__PURE__ */ r("pre", { className: "bg-background p-3 rounded text-xs font-mono overflow-x-auto", children: [
                "docker run -d \\",
                `
`,
                "  ",
                "--name openmemory \\",
                `
`,
                "  ",
                "-p 8080:8080 \\",
                `
`,
                "  ",
                "-e OPENAI_API_KEY=your_key \\",
                `
`,
                "  ",
                "cavira/openmemory:latest"
              ] }),
              /* @__PURE__ */ e("div", { className: "text-xs text-muted-foreground mt-2", children: "Default port is 8080. Make sure it matches your configured Base URL." })
            ] })
          ] }),
          /* @__PURE__ */ r("div", { children: [
            /* @__PURE__ */ e("div", { className: "font-medium mb-2", children: "Option 2: Local Development" }),
            /* @__PURE__ */ r("div", { className: "bg-muted p-4 rounded-lg space-y-2", children: [
              /* @__PURE__ */ e("div", { className: "text-muted-foreground mb-2", children: "Clone and run from source:" }),
              /* @__PURE__ */ r("pre", { className: "bg-background p-3 rounded text-xs font-mono overflow-x-auto", children: [
                "git clone https://github.com/CaviraOSS/OpenMemory",
                `
`,
                "cd OpenMemory",
                `
`,
                "npm install",
                `
`,
                "npm start"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ r("div", { children: [
            /* @__PURE__ */ e("div", { className: "font-medium mb-2", children: "Option 3: Cloud Instance" }),
            /* @__PURE__ */ e("div", { className: "bg-muted p-4 rounded-lg", children: /* @__PURE__ */ r("div", { className: "text-muted-foreground", children: [
              "Deploy OpenMemory to a cloud provider and configure the Base URL in the plugin configuration. Edit ",
              /* @__PURE__ */ e("code", { className: "px-2 py-1 bg-background rounded text-xs", children: ".enclave/plugins.json" }),
              " to set a custom baseURL."
            ] }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ r("div", { className: "border border-border rounded-lg p-6 bg-card", children: [
        /* @__PURE__ */ e("h3", { className: "text-lg font-semibold mb-4", children: "Changing Configuration" }),
        /* @__PURE__ */ r("div", { className: "space-y-3 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ e("p", { children: "To change the OpenMemory connection settings:" }),
          /* @__PURE__ */ r("ol", { className: "list-decimal list-inside space-y-2 ml-2", children: [
            /* @__PURE__ */ r("li", { children: [
              "Open ",
              /* @__PURE__ */ e("code", { className: "px-2 py-1 bg-muted rounded text-xs", children: ".enclave/plugins.json" }),
              " in your project"
            ] }),
            /* @__PURE__ */ e("li", { children: "Find the OpenMemory plugin configuration" }),
            /* @__PURE__ */ r("li", { children: [
              "Update the settings:",
              /* @__PURE__ */ e("pre", { className: "bg-muted p-3 rounded text-xs font-mono mt-2 overflow-x-auto", children: `{
  "com.enclave.openmemory": {
    "enabled": true,
    "config": {
      "baseURL": "http://localhost:8080",
      "userId": "your-user-id"
    }
  }
}` })
            ] }),
            /* @__PURE__ */ e("li", { children: "Restart Enclave for changes to take effect" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ r("div", { className: "border border-border rounded-lg p-6 bg-card", children: [
        /* @__PURE__ */ e("h3", { className: "text-lg font-semibold mb-4", children: "Documentation & Resources" }),
        /* @__PURE__ */ r("div", { className: "space-y-2 text-sm", children: [
          /* @__PURE__ */ r(
            "a",
            {
              href: "https://github.com/CaviraOSS/OpenMemory",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "flex items-center gap-2 text-primary hover:underline",
              children: [
                /* @__PURE__ */ e("span", { children: "📚" }),
                /* @__PURE__ */ e("span", { children: "OpenMemory GitHub Repository" })
              ]
            }
          ),
          /* @__PURE__ */ r(
            "a",
            {
              href: "https://github.com/CaviraOSS/OpenMemory/blob/main/README.md",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "flex items-center gap-2 text-primary hover:underline",
              children: [
                /* @__PURE__ */ e("span", { children: "📖" }),
                /* @__PURE__ */ e("span", { children: "OpenMemory Documentation" })
              ]
            }
          ),
          /* @__PURE__ */ r("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
            /* @__PURE__ */ e("span", { children: "💡" }),
            /* @__PURE__ */ e("span", { children: "See the plugin README for more details on memory features" })
          ] })
        ] })
      ] })
    ] })
  ] });
}
function I() {
  return /* @__PURE__ */ e(P, { context: {
    tools: {
      execute: async (n, f) => await window.electron.executePluginTool("com.enclave.openmemory", n, f)
    }
  } });
}
export {
  I as OpenMemoryViewComponent,
  I as default
};
//# sourceMappingURL=index.js.map
