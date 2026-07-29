// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx,html}",
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }


// // tailwind.config.js
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,jsx,ts,tsx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         'blue-deep': '#1e3a8a',
//         'indigo-glow': '#4f46e5',
//         'purple-flare': '#7e22ce',
//       },
//     },
//   },
//   plugins: [],
// };


/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    'bg-gradient-to-b',
    'from-blue-900',
    'via-indigo-900',
    'to-purple-900',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
