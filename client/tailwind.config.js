export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        olive: { DEFAULT: "#1e2f26", light: "#3e5745" },
        sage: "#93a88f",
        amber: "#c17f3e",
        parchment: "#f4f2e8",
        stone: "#e8e5d8",
        ink: "#20241f",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        displayAr: ['"Markazi Text"', "serif"],
        body: ["Inter", "sans-serif"],
        bodyAr: ["Cairo", "sans-serif"],
      },
    },
  },
  plugins: [],
};
