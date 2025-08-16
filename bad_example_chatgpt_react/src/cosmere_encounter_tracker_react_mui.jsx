import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Tabs,
  Tab,
  Container,
  Grid,
  Paper,
  Button,
  Chip,
  TextField,
  Switch,
  FormControlLabel,
  Tooltip,
  Divider,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Stack,
  Snackbar,
  Alert,
  Checkbox
} from "@mui/material";
import {
  PlayArrow,
  SkipNext,
  RestartAlt,
  Add,
  Edit,
  Delete,
  Bolt,
  CheckCircle,
  RadioButtonUnchecked,
  Cloud,
  NightsStay,
  Thunderstorm,
  OfflineBolt,
  Refresh,
  VisibilityOff,
  Visibility,
  RocketLaunch,
  SwapVert,
  Save,
  UploadFile,
  Download,
  Settings,
  AccessTime,
  Loop
} from "@mui/icons-material";

// ---------------------- Utility ----------------------
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const PHASES = [
  { key: "fast_players", label: "Fast • Players" },
  { key: "fast_enemies", label: "Fast • Enemies" },
  { key: "slow_players", label: "Slow • Players" },
  { key: "slow_enemies", label: "Slow • Enemies" }
];

const DEFAULT_CONDITIONS = [
  "Stunned",
  "Slowed",
  "Prone",
  "Grappled",
  "Poisoned",
  "Blinded",
  "Deafened",
  "Restrained",
  "On Fire",
  "Frozen",
  "Unconscious"
];

// ---------------------- Theme (Stormy Roshar) ----------------------
const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0b1020",
      paper: "#111735"
    },
    primary: {
      main: "#3b82f6" // stormlight blue
    },
    secondary: {
      main: "#8b5cf6" // warlight purple
    },
    success: { main: "#10b981" }, // lifelight green
    info: { main: "#60a5fa" },
    warning: { main: "#f59e0b" },
    error: { main: "#f87171" },
    text: {
      primary: "#e6efff",
      secondary: "#b7c6ff"
    }
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily:
      "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
    fontSize: 15,
    button: { textTransform: "none", fontWeight: 700 },
    h6: { letterSpacing: 0.2 },
    body1: { letterSpacing: 0.15, lineHeight: 1.6 }
  },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage:
            "linear-gradient(180deg, rgba(59,130,246,0.12), rgba(139,92,246,0.08))",
          border: "1px solid rgba(99,102,241,0.25)",
          backdropFilter: "blur(4px)"
        }
      }
    }
  }
});

// ---------------------- Storage Abstraction ----------------------
const STORAGE_DEFAULT_KEY = "cosmere_rpg_app_v1";

function loadState(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load state", e);
    return null;
  }
}

function saveState(key, state) {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state", e);
  }
}

// ---------------------- Models ----------------------
// Entity: player or enemy tracked in encounter
// statusEffects: { id, category: 'condition'|'investiture', name, duration? }

const sampleState = () => ({
  round: 1,
  phaseIndex: 0, // start at Fast • Players
  settings: {
    storageType: "local", // 'local' | 'none'
    storageKey: STORAGE_DEFAULT_KEY,
    resetSegmentsEachRound: false
  },
  entities: [
    {
      id: uid(),
      name: "Kalak",
      type: "player",
      defaultSegment: "fast",
      currentSegment: "fast",
      isUnconscious: false,
      reactionUsed: false,
      statusEffects: []
    },
    {
      id: uid(),
      name: "Lopen",
      type: "player",
      defaultSegment: "slow",
      currentSegment: "slow",
      isUnconscious: false,
      reactionUsed: false,
      statusEffects: []
    },
    {
      id: uid(),
      name: "Fused Spear",
      type: "enemy",
      defaultSegment: "fast",
      currentSegment: "fast",
      isUnconscious: false,
      reactionUsed: false,
      statusEffects: []
    },
    {
      id: uid(),
      name: "Voidspren Host",
      type: "enemy",
      defaultSegment: "slow",
      currentSegment: "slow",
      isUnconscious: false,
      reactionUsed: false,
      statusEffects: []
    }
  ]
});

// ---------------------- Main App ----------------------
export default function CosmereEncounterTrackerApp() {
  const [state, setState] = useState(() => {
    const initial = loadState(STORAGE_DEFAULT_KEY);
    return initial || sampleState();
  });
  const [page, setPage] = useState("encounter");
  const [toast, setToast] = useState(null);
  const saveTimer = useRef(null);

  // Auto-save
  useEffect(() => {
    if (state.settings.storageType !== "local") return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveState(state.settings.storageKey || STORAGE_DEFAULT_KEY, state);
    }, 350);
    return () => saveTimer.current && clearTimeout(saveTimer.current);
  }, [state]);

  // Ensure we load from the configured key if it changes
  useEffect(() => {
    if (state.settings.storageType === "local") {
      const loaded = loadState(state.settings.storageKey);
      if (loaded) setState(loaded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.settings.storageKey]);

  const setSettings = (patch) =>
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));

  const setEntities = (updater) =>
    setState((s) => ({ ...s, entities: typeof updater === "function" ? updater(s.entities) : updater }));

  const currentPhase = PHASES[state.phaseIndex];

  const nextPhase = () => {
    setState((s) => {
      let nextIndex = (s.phaseIndex + 1) % PHASES.length;
      let nextRound = s.round;
      let ents = s.entities.map((e) => ({ ...e }));
      // If we looped, advance round
      if (nextIndex === 0) {
        nextRound += 1;
        // Reset reactions and tick durations
        ents = ents.map((e) => ({
          ...e,
          reactionUsed: false,
          statusEffects: e.statusEffects
            .map((fx) =>
              fx.duration != null ? { ...fx, duration: fx.duration - 1 } : fx
            )
            .filter((fx) => fx.duration == null || fx.duration > 0),
          currentSegment: s.settings.resetSegmentsEachRound ? e.defaultSegment : e.currentSegment
        }));
      }
      const nextState = { ...s, entities: ents, round: nextRound, phaseIndex: nextIndex };
      return nextState;
    });
  };

  const prevPhase = () => {
    setState((s) => {
      let prevIndex = (s.phaseIndex - 1 + PHASES.length) % PHASES.length;
      let prevRound = s.round;
      if (s.phaseIndex === 0) {
        prevRound = Math.max(1, s.round - 1);
      }
      return { ...s, phaseIndex: prevIndex, round: prevRound };
    });
  };

  const resetRound = () => {
    setState((s) => ({ ...s, round: 1, phaseIndex: 0 }));
  };

  const resetReactions = () =>
    setEntities((ents) => ents.map((e) => ({ ...e, reactionUsed: false })));

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cosmere-encounter-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        setState(data);
        setToast({ severity: "success", msg: "Imported encounter state." });
      } catch (e) {
        setToast({ severity: "error", msg: "Failed to import JSON." });
      }
    };
    reader.readAsText(file);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "radial-gradient(1200px 500px at 25% -10%, rgba(59,130,246,0.25), rgba(59,130,246,0) 60%), radial-gradient(1200px 600px at 110% 10%, rgba(139,92,246,0.25), rgba(139,92,246,0) 60%), linear-gradient(180deg, #0b1020 0%, #0b1020 40%, #0a1430 100%)"
        }}
      >
        <AppBar position="sticky" color="transparent" elevation={0} sx={{ backdropFilter: "blur(8px)" }}>
          <Toolbar>
            <Thunderstorm sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, mr: 2 }}>
              Cosmere Encounter Tracker
            </Typography>

            <Tabs
              value={page}
              onChange={(_, v) => setPage(v)}
              textColor="primary"
              indicatorColor="primary"
              sx={{ flexGrow: 1 }}
            >
              <Tab value="encounter" label="Encounter" />
              <Tab value="admin" label="Admin" icon={<Settings />} iconPosition="start" />
            </Tabs>

            {/* Round/Phase Controls */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tooltip title="Previous Phase">
                <span>
                  <IconButton onClick={prevPhase} color="primary" aria-label="Previous Phase">
                    <Loop sx={{ transform: "scaleX(-1)" }} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Next Phase">
                <IconButton onClick={nextPhase} color="primary" aria-label="Next Phase">
                  <Loop />
                </IconButton>
              </Tooltip>
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
              <Tooltip title="Reset to Round 1">
                <IconButton onClick={resetRound} color="secondary" aria-label="Reset Rounds">
                  <RestartAlt />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
          <Toolbar sx={{ pt: 0, mt: -1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%", justifyContent: "flex-end" }}>
              <Badge
                color="primary"
                badgeContent={`R${state.round}`}
                anchorOrigin={{ vertical: "top", horizontal: "left" }}
              >
                <Chip
                  icon={<AccessTime />}
                  label={`Phase: ${PHASES[state.phaseIndex].label}`}
                  color="primary"
                  sx={{ fontWeight: 700 }}
                />
              </Badge>
              <Tooltip title="Reset all reactions (also happens automatically on new round)">
                <Button onClick={resetReactions} startIcon={<Refresh />} variant="outlined" color="info">
                  Reset Reactions
                </Button>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>

        {page === "encounter" ? (
          <EncounterPage state={state} setState={setState} setEntities={setEntities} setToast={setToast} />
        ) : (
          <AdminPage
            state={state}
            setSettings={setSettings}
            exportJSON={exportJSON}
            importJSON={importJSON}
            clearAll={() => setState(sampleState())}
          />
        )}

        <Snackbar
          open={!!toast}
          autoHideDuration={3200}
          onClose={() => setToast(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          {toast && (
            <Alert onClose={() => setToast(null)} severity={toast.severity} sx={{ width: "100%" }}>
              {toast.msg}
            </Alert>
          )}
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

// ---------------------- Encounter Page ----------------------
function EncounterPage({ state, setState, setEntities, setToast }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEntity, setEditEntity] = useState(null);

  const addEntity = (entity) => setEntities((ents) => [...ents, entity]);

  const updateEntity = (id, patch) =>
    setEntities((ents) => ents.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const removeEntity = (id) => setEntities((ents) => ents.filter((e) => e.id !== id));

  const groups = useMemo(() => {
    const by = { fast: { player: [], enemy: [] }, slow: { player: [], enemy: [] } };
    for (const e of state.entities) {
      by[e.currentSegment][e.type].push(e);
    }
    return by;
  }, [state.entities]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <PhaseCard
            titleLeft="Fast • Players"
            titleRight="Fast • Enemies"
            leftList={groups.fast.player}
            rightList={groups.fast.enemy}
            updateEntity={updateEntity}
            removeEntity={removeEntity}
            setEditEntity={setEditEntity}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <PhaseCard
            titleLeft="Slow • Players"
            titleRight="Slow • Enemies"
            leftList={groups.slow.player}
            rightList={groups.slow.enemy}
            updateEntity={updateEntity}
            removeEntity={removeEntity}
            setEditEntity={setEditEntity}
          />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: "flex", gap: 1, alignItems: "center" }}>
            <Typography sx={{ flexGrow: 1 }}>
              Player characters act before enemies in both Fast and Slow phases.
            </Typography>
            <Tooltip title="Add player or enemy">
              <Button startIcon={<Add />} variant="contained" onClick={() => setDialogOpen(true)}>
                Add Entity
              </Button>
            </Tooltip>
          </Paper>
        </Grid>
      </Grid>

      <EntityDialog
        open={dialogOpen || !!editEntity}
        onClose={() => {
          setDialogOpen(false);
          setEditEntity(null);
        }}
        onSubmit={(e) => {
          if (editEntity) {
            updateEntity(editEntity.id, e);
          } else {
            addEntity({ id: uid(), reactionUsed: false, isUnconscious: false, statusEffects: [], ...e });
          }
          setDialogOpen(false);
          setEditEntity(null);
        }}
        initial={editEntity}
      />
    </Container>
  );
}

function PhaseCard({ titleLeft, titleRight, leftList, rightList, updateEntity, removeEntity, setEditEntity }) {
  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <RocketLaunch />
            <Typography variant="h6">{titleLeft.split(" • ")[0]}</Typography>
          </Box>
        }
        subheader="Players act first; then Enemies"
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Section title={titleLeft} items={leftList} updateEntity={updateEntity} removeEntity={removeEntity} setEditEntity={setEditEntity} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Section title={titleRight} items={rightList} updateEntity={updateEntity} removeEntity={removeEntity} setEditEntity={setEditEntity} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

function Section({ title, items, updateEntity, removeEntity, setEditEntity }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, minHeight: 180 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
        {title}
      </Typography>
      <Stack spacing={1.2}>
        {items.length === 0 && (
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            No entities.
          </Typography>
        )}
        {items.map((e) => (
          <EntityCard key={e.id} entity={e} updateEntity={updateEntity} removeEntity={removeEntity} onEdit={() => setEditEntity(e)} />
        ))}
      </Stack>
    </Paper>
  );
}

function EntityCard({ entity, updateEntity, removeEntity, onEdit }) {
  const { id, name, type, defaultSegment, currentSegment, isUnconscious, reactionUsed, statusEffects } = entity;

  const toggleSegment = () =>
    updateEntity(id, { currentSegment: currentSegment === "fast" ? "slow" : "fast" });

  const toggleReaction = () => updateEntity(id, { reactionUsed: !reactionUsed });

  const toggleUnconscious = () => {
    const next = !isUnconscious;
    let nextEffects = statusEffects;
    // Ensure Unconscious condition chip parity
    const hasUnc = statusEffects.some((fx) => fx.name === "Unconscious" && fx.category === "condition");
    if (next && !hasUnc) {
      nextEffects = [...statusEffects, { id: uid(), category: "condition", name: "Unconscious" }];
    } else if (!next && hasUnc) {
      nextEffects = statusEffects.filter((fx) => !(fx.name === "Unconscious" && fx.category === "condition"));
    }
    updateEntity(id, { isUnconscious: next, statusEffects: nextEffects });
  };

  const addEffect = (fx) => updateEntity(id, { statusEffects: [...statusEffects, fx] });
  const removeEffect = (fxId) => updateEntity(id, { statusEffects: statusEffects.filter((fx) => fx.id !== fxId) });
  const setDefaultSegment = (seg) => updateEntity(id, { defaultSegment: seg });

  const semanticDisabled = isUnconscious ? 0.45 : 1;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1,
        borderRadius: 2,
        border: "1px solid rgba(96,165,250,0.35)",
        opacity: semanticDisabled,
        position: "relative"
      }}
    >
      {isUnconscious && (
        <Chip
          size="small"
          icon={<VisibilityOff />}
          label="Unconscious"
          color="warning"
          sx={{ position: "absolute", top: -10, right: -10 }}
        />
      )}
      <Grid container spacing={1} alignItems="center">
        <Grid item xs={12} md={4} lg={3}>
          <Typography sx={{ fontWeight: 800 }}>{name}</Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {type === "player" ? "Player" : "Enemy"}
          </Typography>
        </Grid>
        <Grid item xs={12} md={8} lg={9}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Tooltip title="Toggle Fast/Slow for this round (also available by defaults below)">
              <Button size="small" onClick={toggleSegment} variant="outlined" startIcon={<SwapVert />} aria-label="Toggle Fast/Slow">
                {currentSegment === "fast" ? "Fast" : "Slow"}
              </Button>
            </Tooltip>

            <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />

            <Tooltip title={reactionUsed ? "Reaction used (resets each round)" : "Available reaction"}>
              <Button
                size="small"
                onClick={toggleReaction}
                variant={reactionUsed ? "contained" : "outlined"}
                color={reactionUsed ? "secondary" : "info"}
                startIcon={reactionUsed ? <CheckCircle /> : <RadioButtonUnchecked />}
                aria-label="Toggle Reaction Used"
              >
                Reaction
              </Button>
            </Tooltip>

            <Tooltip title={isUnconscious ? "Mark conscious" : "Mark unconscious"}>
              <Button size="small" onClick={toggleUnconscious} variant="outlined" color="warning" startIcon={isUnconscious ? <Visibility /> : <VisibilityOff />} aria-label="Toggle Unconscious">
                {isUnconscious ? "Conscious" : "Unconscious"}
              </Button>
            </Tooltip>

            <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />

            <StatusEditor statusEffects={statusEffects} addEffect={addEffect} removeEffect={removeEffect} />

            <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />

            <Tooltip title="Default phase for Enemies each round (Players can use too)">
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Default Segment</InputLabel>
                <Select
                  value={defaultSegment}
                  label="Default Segment"
                  onChange={(e) => setDefaultSegment(e.target.value)}
                >
                  <MenuItem value="fast">Fast</MenuItem>
                  <MenuItem value="slow">Slow</MenuItem>
                </Select>
              </FormControl>
            </Tooltip>

            <Box sx={{ flexGrow: 1 }} />

            <Tooltip title="Edit entity">
              <IconButton onClick={onEdit} size="small" aria-label="Edit">
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remove entity">
              <IconButton onClick={() => removeEntity(id)} size="small" aria-label="Delete">
                <Delete />
              </IconButton>
            </Tooltip>
          </Stack>

          {/* Status chips */}
          <Box sx={{ mt: 1, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {statusEffects.map((fx) => (
              <Chip
                key={fx.id}
                label={`${fx.name}${fx.duration != null ? ` (${fx.duration})` : ""}`}
                onDelete={() => removeEffect(fx.id)}
                size="small"
                color={fx.category === "investiture" ? "success" : fx.name === "Unconscious" ? "warning" : "default"}
                variant={fx.category === "investiture" ? "outlined" : "filled"}
                sx={{ borderStyle: fx.category === "investiture" ? "dashed" : "solid" }}
              />)
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

function StatusEditor({ statusEffects, addEffect, removeEffect }) {
  const [open, setOpen] = useState(false);
  const [cond, setCond] = useState("");
  const [invName, setInvName] = useState("");
  const [invDur, setInvDur] = useState(1);

  const addCondition = () => {
    if (!cond) return;
    addEffect({ id: uid(), category: "condition", name: cond });
    setCond("");
    setOpen(false);
  };

  const addInvestiture = () => {
    if (!invName) return;
    addEffect({ id: uid(), category: "investiture", name: invName, duration: Number(invDur) || undefined });
    setInvName("");
    setInvDur(1);
    setOpen(false);
  };

  return (
    <>
      <Tooltip title="Add or manage status effects / Investiture">
        <Button size="small" variant="outlined" startIcon={<OfflineBolt />} onClick={() => setOpen(true)} aria-label="Status Effects">
          Status
        </Button>
      </Tooltip>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Status Effect / Investiture</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5 }}>
            Quick Conditions
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            {DEFAULT_CONDITIONS.filter((c) => !statusEffects.some((fx) => fx.name === c)).map((c) => (
              <Chip key={c} label={c} onClick={() => setCond(c)} clickable color="default" />
            ))}
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <TextField
              size="small"
              label="Condition"
              placeholder="e.g., Stunned"
              value={cond}
              onChange={(e) => setCond(e.target.value)}
            />
            <Button onClick={addCondition} variant="contained" startIcon={<Add />}>Add Condition</Button>
          </Stack>
          <Divider sx={{ my: 1.5 }} />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Investiture (custom effect with optional duration in rounds)
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center">
            <TextField size="small" label="Name" placeholder="Stormlight / Lifelight / Warlight" value={invName} onChange={(e) => setInvName(e.target.value)} />
            <TextField size="small" label="Duration (rounds)" type="number" inputProps={{ min: 1 }} value={invDur} onChange={(e) => setInvDur(e.target.value)} sx={{ width: 180 }} />
            <Button onClick={addInvestiture} variant="outlined" startIcon={<Add />}>Add Investiture</Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function EntityDialog({ open, onClose, onSubmit, initial }) {
  const [name, setName] = useState(initial?.name || "");
  const [type, setType] = useState(initial?.type || "player");
  const [defaultSegment, setDefaultSegment] = useState(initial?.defaultSegment || "fast");
  const [currentSegment, setCurrentSegment] = useState(initial?.currentSegment || defaultSegment);
  const [isUnconscious, setIsUnconscious] = useState(initial?.isUnconscious || false);

  useEffect(() => {
    if (open) {
      setName(initial?.name || "");
      setType(initial?.type || "player");
      setDefaultSegment(initial?.defaultSegment || "fast");
      setCurrentSegment(initial?.currentSegment || initial?.defaultSegment || "fast");
      setIsUnconscious(initial?.isUnconscious || false);
    }
  }, [open, initial]);

  const submit = () => {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), type, defaultSegment, currentSegment, isUnconscious });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial ? "Edit Entity" : "Add Entity"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          <FormControl>
            <InputLabel>Type</InputLabel>
            <Select label="Type" value={type} onChange={(e) => setType(e.target.value)}>
              <MenuItem value="player">Player</MenuItem>
              <MenuItem value="enemy">Enemy</MenuItem>
            </Select>
          </FormControl>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <FormControl fullWidth>
              <InputLabel>Default Segment</InputLabel>
              <Select label="Default Segment" value={defaultSegment} onChange={(e) => { setDefaultSegment(e.target.value); if (!initial) setCurrentSegment(e.target.value); }}>
                <MenuItem value="fast">Fast</MenuItem>
                <MenuItem value="slow">Slow</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Current Segment</InputLabel>
              <Select label="Current Segment" value={currentSegment} onChange={(e) => setCurrentSegment(e.target.value)}>
                <MenuItem value="fast">Fast</MenuItem>
                <MenuItem value="slow">Slow</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <FormControlLabel control={<Checkbox checked={isUnconscious} onChange={() => setIsUnconscious(!isUnconscious)} />} label="Start Unconscious" />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={submit} variant="contained">{initial ? "Save" : "Add"}</Button>
      </DialogActions>
    </Dialog>
  );
}

// ---------------------- Admin Page ----------------------
function AdminPage({ state, setSettings, exportJSON, importJSON, clearAll }) {
  const fileRef = useRef();

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardHeader title="Storage & Persistence" subheader="Auto-saves your encounter so a refresh won't lose data." />
            <CardContent>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Storage Type</InputLabel>
                  <Select
                    label="Storage Type"
                    value={state.settings.storageType}
                    onChange={(e) => setSettings({ storageType: e.target.value })}
                  >
                    <MenuItem value="local">Local Storage</MenuItem>
                    <MenuItem value="none">No Persistence (volatile)</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Storage Key"
                  helperText="Change if you'd like multiple saved encounters."
                  value={state.settings.storageKey}
                  onChange={(e) => setSettings({ storageKey: e.target.value })}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={state.settings.resetSegmentsEachRound}
                      onChange={() => setSettings({ resetSegmentsEachRound: !state.settings.resetSegmentsEachRound })}
                    />
                  }
                  label="Reset each entity to its Default Segment at the start of a new round"
                />
                <Stack direction="row" spacing={1}>
                  <Button startIcon={<Download />} variant="outlined" onClick={exportJSON}>
                    Export JSON
                  </Button>
                  <Button startIcon={<UploadFile />} variant="outlined" onClick={() => fileRef.current?.click()}>
                    Import JSON
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/json"
                    style={{ display: "none" }}
                    onChange={(e) => e.target.files?.[0] && importJSON(e.target.files[0])}
                  />
                </Stack>
              </Stack>
            </CardContent>
            <CardActions>
              <Button color="error" startIcon={<Delete />} onClick={clearAll}>
                Reset to Sample Data
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card>
            <CardHeader title="Theme & Accessibility" subheader="Designed for clarity with color+text cues (no color-only indicators)." />
            <CardContent>
              <Typography variant="body2" sx={{ mb: 1.5 }}>
                • High-contrast stormy palette (blue with hints of green/purple) inspired by Roshar.
              </Typography>
              <Typography variant="body2" sx={{ mb: 1.5 }}>
                • Icons + text labels for reaction/segment/status to support color-vision deficiency.
              </Typography>
              <Typography variant="body2">
                • Increased letter-spacing and larger base font to aid readability.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
