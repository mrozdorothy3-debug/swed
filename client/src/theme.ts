import { createTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    customColors: {
      sidebarBg: string;
      mainBg: string;
    };
  }
  interface PaletteOptions {
    customColors: {
      sidebarBg: string;
      mainBg: string;
    };
  }
}

const PRIMARY_COLOR = '#2563eb';
const BACKGROUND_COLOR = '#f8fafc';
const TEXT_COLOR = '#334155';

export const theme = createTheme({
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.02em',
      color: TEXT_COLOR,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: TEXT_COLOR,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: TEXT_COLOR,
    },
    subtitle1: {
      fontSize: '1rem',
      color: alpha(TEXT_COLOR, 0.87),
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      color: alpha(TEXT_COLOR, 0.87),
    },
    body2: {
      fontSize: '0.875rem',
      color: alpha(TEXT_COLOR, 0.6),
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  palette: {
    primary: {
      main: PRIMARY_COLOR,
      light: alpha(PRIMARY_COLOR, 0.1),
      dark: '#1e40af',
    },
    secondary: {
      main: '#38A169',
      light: '#48BB78',
      dark: '#2F855A',
    },
    error: {
      main: '#E53E3E',
    },
    text: {
      primary: TEXT_COLOR,
      secondary: alpha(TEXT_COLOR, 0.6),
    },
    background: {
      default: BACKGROUND_COLOR,
      paper: '#ffffff',
    },
    customColors: {
      sidebarBg: '#ffffff',
      mainBg: BACKGROUND_COLOR,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontSize: '0.9375rem',
          fontWeight: 500,
          padding: '10px 24px',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(PRIMARY_COLOR, 0.5),
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: PRIMARY_COLOR,
            borderWidth: '1px',
          },
        },
        input: {
          padding: '16px 14px',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: PRIMARY_COLOR,
          },
        },
        outlined: {
          transform: 'translate(14px, 16px) scale(1)',
          '&.MuiInputLabel-shrink': {
            transform: 'translate(14px, -9px) scale(0.75)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});
