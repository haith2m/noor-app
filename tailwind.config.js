module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}", "./public/index.html"],
  safelist: [
    {
      pattern: /^bottom-([1-9][0-9]{0,2})$/i,
    },
    {
      pattern:
        /^bg-(green|blue|red|yellow|purple)-(100|200|300|400|500|600|700|800|900)(\/(10|15|20|25|30|35|40|45|50|55|60|65|70|75|80|85|90))?/,
    },
    {
      pattern:
        /^fill-(green|blue|red|yellow|purple)-(100|200|300|400|500|600|700|800|900)(\/(10|15|20|25|30|35|40|45|50|55|60|65|70|75|80|85|90))?/,
    },
    {
      pattern:
        /^to-(green|blue|red|yellow|purple)-(100|200|300|400|500|600|700|800|900)(\/(10|15|20|25|30|35|40|45|50|55|60|65|70|75|80|85|90))?/,
    },
    {
      pattern:
        /^from-(green|blue|red|yellow|purple)-(100|200|300|400|500|600|700|800|900)(\/(10|15|20|25|30|35|40|45|50|55|60|65|70|75|80|85|90))?/,
    },
    {
      pattern:
        /^range-(green|blue|red|yellow|purple)-(100|200|300|400|500|600|700|800|900)(\/(10|15|20|25|30|35|40|45|50|55|60|65|70|75|80|85|90))?/,
    },
    {
      pattern: /^text-(green|blue|red|yellow|purple)-[1-9][0-9]{2}$/,
    },
    {
      pattern: /^to-(green|blue|red|yellow|purple)-[1-9][0-9]{2}$/,
    },
    {
      pattern:
        /^border(-[yxbt]-|-)(green|blue|red|yellow|purple)-[1-9][0-9]{2}$/,
    },
    {
      pattern: /^accent-(green|blue|red|yellow|purple)-[1-9][0-9]{2}$/,
    },
  ],
  theme: {
    extend: {
      colors: {
        "bg-color": "var(--bg-color)",
        "bg-color-2": "var(--bg-color-2)",
        "bg-color-3": "var(--bg-color-3)",
        text: "var(--text)",
        "text-2": "var(--text-2)",
        primary: {
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
          600: "var(--primary-500)",
          700: "var(--primary-700)",
          800: "var(--primary-800)",
          900: "var(--primary-900)",
        },
      },
    },
  },
  plugins: [],
};
