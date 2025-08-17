import { createTheme } from '@mui/material';

// ---------------------- Theme (Stormy Roshar) ----------------------
// export const StormlightTheme = createTheme({
//   palette: {
//     mode: "dark",
//     background: {
//       default: "#0b1020",
//       paper: "#111735"
//     },
//     primary: {
//       main: "#3b82f6" // stormlight blue
//     },
//     secondary: {
//       main: "#8b5cf6" // warlight purple
//     },
//     success: { main: "#10b981" }, // lifelight green
//     info: { main: "#60a5fa" },
//     warning: { main: "#f59e0b" },
//     error: { main: "#f87171" },
//     text: {
//       primary: "#e6efff",
//       secondary: "#b7c6ff"
//     }
//   },
//   shape: { borderRadius: 16 },
//   typography: {
//     fontFamily:
//       "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
//     fontSize: 15,
//     button: { textTransform: "none", fontWeight: 700 },
//     h6: { letterSpacing: 0.2 },
//     body1: { letterSpacing: 0.15, lineHeight: 1.6 }
//   },
//   components: {
//     MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
//     MuiCard: {
//       styleOverrides: {
//         root: {
//           backgroundImage:
//             "linear-gradient(180deg, rgba(59,130,246,0.12), rgba(139,92,246,0.08))",
//           border: "1px solid rgba(99,102,241,0.25)",
//           backdropFilter: "blur(4px)"
//         }
//       }
//     }
//   }
// });

export const BadgeThemes = {
    stormlight: "#3b82f6",
    lifelight: "#10b981",
    warlight: "#8b5cf6",
};

// ---------------------- Stormlight Theme (MUI) ----------------------
export const StormlightTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0f172a", // slate-900
      paper: "#111735",   // deep blue
    },
    primary: {
      main: "#3b82f6", // stormlight blue
      contrastText: "#e6efff",
    },
    secondary: {
      main: "#8b5cf6", // warlight purple
      contrastText: "#e6efff",
    },
    success: { main: "#10b981" }, // lifelight green
    info: { main: "#60a5fa" },
    warning: { main: "#f59e0b" },
    error: { main: "#f87171" },
    text: {
      primary: "#f1f5f9", // slate-100
      secondary: "#cbd5e1", // slate-300
      disabled: "#64748b", // slate-400
    },
    divider: "rgba(51,65,85,0.6)", // border-slate-700/60
    action: {
      active: "#3b82f6",
      hover: "rgba(56,189,248,0.08)", // cyan-400/8
      selected: "rgba(56,189,248,0.16)",
      disabled: "#64748b",
      disabledBackground: "rgba(51,65,85,0.3)",
    },

  },
  shape: { borderRadius: 20 }, // rounded-2xl
  typography: {
    fontFamily: [
      "Inter",
      "Atkinson_Hyperlegible",
      "system-ui",
      "-apple-system",
      "Segoe UI",
      "Roboto",
      "Helvetica",
      "Arial",
      "'Apple Color Emoji'",
      "'Segoe UI Emoji'",
      "sans-serif"
    ].join(","),
    fontSize: 15,
    button: { textTransform: "none", fontWeight: 700, letterSpacing: 0.1 },
    h6: { letterSpacing: 0.2 },
    body1: { letterSpacing: 0.15, lineHeight: 1.6 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#111735",
          borderRadius: 20,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage:
            "linear-gradient(180deg, rgba(59,130,246,0.12), rgba(139,92,246,0.08))", // blue/purple gradient
          border: "1px solid rgba(51,65,85,0.6)", // border-slate-700/60
          boxShadow: "0 0 30px rgba(56,189,248,0.2)", // cyan glow
          backdropFilter: "blur(4px)",
          borderRadius: 20,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 700,
          boxShadow: "none",
          "&:focus": {
            boxShadow: "0 0 0 2px rgba(56,189,248,0.8)", // accentBlue
          },
        },
        containedPrimary: {
          backgroundColor: "#3b82f6",
          color: "#e6efff",
          "&:hover": {
            backgroundColor: "#2563eb",
          },
        },
        containedSecondary: {
          backgroundColor: "#8b5cf6",
          color: "#e6efff",
          "&:hover": {
            backgroundColor: "#7c3aed",
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: "#0a0e1a", // slate-950
          borderRadius: 12,
          color: "#f1f5f9",
          border: "1px solid rgba(51,65,85,0.6)",
        },
        input: {
          padding: "10px 14px",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: "#0a0e1a",
          borderRadius: 16,
          border: "1px solid rgba(51,65,85,0.6)",
        },
        indicator: {
          backgroundColor: "#3b82f6",
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: "0.85rem",
          padding: "0 8px",
        },
        colorPrimary: {
          backgroundColor: "#3b82f6",
        },
        colorSecondary: {
          backgroundColor: "#8b5cf6",
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          color: "#3b82f6",
        },
        track: {
          backgroundColor: "#64748b",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#0a0e1a",
          color: "#f1f5f9",
          fontSize: "0.95rem",
          borderRadius: 8,
          border: "1px solid rgba(51,65,85,0.6)",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "#111735",
          borderRadius: 20,
          border: "1px solid rgba(51,65,85,0.6)",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(51,65,85,0.6)",
        },
      },
    },
  },
});