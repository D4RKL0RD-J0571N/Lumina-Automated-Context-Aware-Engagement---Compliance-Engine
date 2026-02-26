/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                lumina: {
                    primary: "#6366f1",
                    secondary: "#4f46e5",
                    accent: "#06b6d4",
                    success: "#10b981",
                    warning: "#f59e0b",
                    danger: "#ef4444",
                    dark: "#0f172a",
                    darker: "#020617",
                    light: "#f8fafc",
                }
            },
            backgroundImage: {
                'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}
