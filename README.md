# Interactive CV – Cristina Diéguez Llaràs

A modern, interactive, and multi-language online CV for BI & Backend Developers.  
Built with vanilla JavaScript, Django REST API, and responsive CSS.

---

## 📁 Project Structure

interactive-cv/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js              # Main application logic
│   ├── translations/        # Translation files
│   │   ├── en.json         
│   │   ├── es.json         
│   └── └── ca.json         
├── img/
│   └── profile.jpg
└── projects/
    ├── web-boda/
    ├── node-azure/
    └── powerbi/


---

## 🚀 Features

- **Dynamic Timeline:** Work experience and education loaded automatically from a Django REST API.
- **Technical Skills:** Skills categories and details fetched from the backend.
- **Multi-language:** Instant language switching (English, Spanish, Catalan) with JSON translations.
- **Theme Switcher:** Toggle between light and dark mode with a single click.
- **Responsive Design:** Optimized for desktop and mobile devices.
- **Accessible:** Keyboard navigation, skip links, and semantic HTML.
- **Project Portfolio:** Showcases personal and professional projects with tech tags and links.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript
- **Backend:** Django REST Framework (hosted on Render)
- **Other:** Google Fonts, Responsive Design, Accessibility best practices

---

## 📦 Getting Started

### 1. Clone the repository
git clone https://github.com/tu-usuario/interactive-cv.git
cd interactive-cv

### 2. Run the frontend locally python 
    If you have Python installed:
    -m http.server 8000
    Then open http://localhost:8000 in your browser.

### 3. Backend API
The project fetches data from a Django REST API hosted on Render.
If you want to run your own backend, see this project:https://github.com/crisdll/cv-backend

---

## 🌐 API Endpoints
/api/experiences/ – Work experience data
/api/educations/ – Education data
/api/skills/ – Technical skills data
/api/skills/ – My Projects data

---

## 📝 Customization
Translations: Edit or add language files in translations.
Skills & Timeline: Update data in your Django backend.
Theme Colors: Change CSS variables in style.css.