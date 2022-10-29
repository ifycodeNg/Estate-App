module.exports = {
  purge: {
    mode:'layers',
    content:['./views/**/*.html/']
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily:{
        body:["Poppins"]
      },
      screens: {
    'sm': '360px',
    // => @media (min-width: 640px) { ... } 

    'md': '768px',
    // => @media (min-width: 768px) { ... }

    'lg': '1024px',
    // => @media (min-width: 1024px) { ... }

    'xl': '1280px',
    // => @media (min-width: 1280px) { ... }
  }
    },
  },
  variants: {
    extend: {
      borderColor:['active'],
      backgroundColor: ['active']
    },
  },
  plugins: [],
}
