/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'learnify-yellow': '#FFD60A',
                'learnify-black': '#000000',
                'learnify-white': '#FFFFFF',
            },
            borderRadius: {
                'learnify': '0.75rem',
            },
            boxShadow: {
                'learnify': '0 2px 8px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04)',
                'learnify-lg': '0 4px 16px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(0, 0, 0, 0.06)',
            },
        },
    },
}
