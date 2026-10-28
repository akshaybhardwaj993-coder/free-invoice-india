   import type { Config } from "tailwindcss";

   const config: Config = {
     content: [
       "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
       "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
       "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
     ],
     darkMode: 'class', // <--- ADD THIS LINE RIGHT HERE!
     theme: {
       extend: {
         // ... your existing colors/fonts
       },
     },
     plugins: [],
   };
   export default config;