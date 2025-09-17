// ============================================================================
// CONFIGURATION
// ============================================================================
const CONFIG = {
    DEFAULT_LANGUAGE: 'en',
    TRANSLATIONS_PATH: 'js/translations/',
    STORAGE_KEYS: {
        theme: 'cv-theme',
        language: 'cv-language'
    }
};


// ============================================================================
// INTERNATIONALIZATION MODULE
// ============================================================================
let timelineData = [];
let skillsData = [];
let projectsData = [];
let articlesData  = []

const I18nManager = {
    currentLanguage: CONFIG.DEFAULT_LANGUAGE,
    translations: {},
    isLoaded: false,

    async init() {
        try {
            const savedLanguage = localStorage.getItem(CONFIG.STORAGE_KEYS.language) || CONFIG.DEFAULT_LANGUAGE;
            this.currentLanguage = savedLanguage;

            await this.loadTranslations(this.currentLanguage);
            this.updateContent();
            this.updateLanguageSelector();
            
            document.documentElement.lang = this.currentLanguage;
            console.log(`I18n initialized with language: ${this.currentLanguage}`);
        } catch (error) {
            console.error('Error initializing i18n:', error);
        }
    },

    async loadTranslations(language) {
        try {
            const response = await fetch(`${CONFIG.TRANSLATIONS_PATH}${language}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load translations for ${language}`);
            }
            
            this.translations[language] = await response.json();
            this.isLoaded = true;
            console.log(`Translations loaded for: ${language}`);
        } catch (error) {
            console.error(`Error loading translations for ${language}:`, error);
            // Fallback: use existing content
            this.isLoaded = true;
        }
    },

    async changeLanguage(language) {
        if (language === this.currentLanguage) return;

        try {
            if (!this.translations[language]) {
                await this.loadTranslations(language);
            }

            this.currentLanguage = language;
            localStorage.setItem(CONFIG.STORAGE_KEYS.language, language);
            
            this.updateContent();
            this.updateLanguageSelector();
            document.documentElement.lang = language;
            
            console.log(`Language changed to: ${language}`);
        } catch (error) {
            console.error(`Error changing language to ${language}:`, error);
        }
    },

    updateContent() {
        if (!this.isLoaded || !this.translations[this.currentLanguage]) {
            console.warn('Translations not loaded yet');
            return;
        }

        const t = this.translations[this.currentLanguage];
        
        // Update all elements with data-i18n attributes
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const value = this.getNestedValue(t, key);
            
            if (value) {
                element.textContent = value;
            }
        });

        // Update skills lists specifically
        this.updateSkills(t);
        
        console.log(`Content updated for language: ${this.currentLanguage}`);
    },

    updateSkills(translations) {
        if (translations.skills) {
            Object.keys(translations.skills).forEach(categoryKey => {
                const listElement = document.querySelector(`[data-skill-category="${categoryKey}"]`);
                if (listElement && translations.skills[categoryKey]) {
                    listElement.innerHTML = '';
                    
                    translations.skills[categoryKey].forEach(skill => {
                        const li = document.createElement('li');
                        li.textContent = skill;
                        listElement.appendChild(li);
                    });
                }
            });
        }
    },

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    },

    updateLanguageSelector() {
        const languageButtons = document.querySelectorAll('.language-btn');
        languageButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === this.currentLanguage);
        });
    }
};

function getCurrentLang() {
  return I18nManager.currentLanguage || CONFIG.DEFAULT_LANGUAGE;
}

// ============================================================================
// THEME MANAGER MODULE
// ============================================================================
const ThemeManager = {
    init() {
        const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.theme);
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
        console.log('Theme manager initialized');
    },

    toggle() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem(CONFIG.STORAGE_KEYS.theme, isDark ? 'dark' : 'light');
        console.log(`Theme changed to: ${isDark ? 'dark' : 'light'}`);
    }
};

// ============================================================================
// ANIMATION MANAGER MODULE
// ============================================================================
const AnimationManager = {
    observer: null,

    init() {
        if (!('IntersectionObserver' in window)) {
            console.warn('IntersectionObserver not supported');
            return;
        }

        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        const elementsToAnimate = document.querySelectorAll('section, .project-card, .skill-category');
        elementsToAnimate.forEach(element => this.observer.observe(element));
        
        console.log(`Animation manager initialized, observing ${elementsToAnimate.length} elements`);
    },

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                this.observer.unobserve(entry.target);
            }
        });
    },

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
};

// ============================================================================
// TIMELINE FILTER MANAGER
// ============================================================================
const TimelineManager = {
    init() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', this.handleFilter.bind(this));
        });
        console.log('Timeline manager initialized');
    },

    handleFilter(e) {
        const filterValue = e.target.dataset.filter;

        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');

        // Filter timeline items
        const timelineItems = document.querySelectorAll('.timeline-item');
        let visibleIndex = 0;
        timelineItems.forEach(item => {
            const category = item.dataset.category;
            if (filterValue === 'all' || category === filterValue) {
                item.classList.remove('hidden');
                // Alternating classes for visible items
                item.classList.remove('left', 'right');
                item.classList.add(visibleIndex % 2 === 0 ? 'left' : 'right');
                visibleIndex++;
            } else {
                item.classList.add('hidden');
                item.classList.remove('left', 'right');
            }
        });

        console.log(`Timeline filtered by: ${filterValue}`);
    }
};

// ============================================================================
// TIMELINE CONTENT
// ============================================================================

/**
 * Renders items in the timeline.
 * @param {Array} items - Array of objects (work experience or education)
 * @param {string} type - 'work' or 'education'
 */
function renderTimeline(items, filterType = 'all') {
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;

  timeline.innerHTML = '';
  let visibleIndex = 0;
  const lang = getCurrentLang();

  items.forEach(item => {
    const type = item._type || 'work';
    if (filterType !== 'all' && filterType !== type) return;

    const companyOrInstitution = type === 'work'
      ? item[`company_${lang}`] || item.company_en
      : item[`institution_${lang}`] || item.institution_en;

    const positionOrDegree = type === 'work'
      ? item[`position_${lang}`] || item.position_en
      : item[`degree_${lang}`] || item.degree_en;

    const shortDescription = item[`short_description_${lang}`] || item.short_description_en || '';
    const description = formatDescription(item[`description_${lang}`] || item.description_en || '');
    const keyWords = item.key_words ? item.key_words.split(';').map(k => k.trim()) : [];

    const startDate = item.start_date || '';
    const endDate = type === 'education'
      ? (item.end_date || '')
      : (item.end_date || 'Present');

    const timelineItem = document.createElement('div');
    timelineItem.className = `timeline-item ${type}`;
    timelineItem.dataset.category = type;
    timelineItem.classList.add(visibleIndex % 2 === 0 ? 'left' : 'right');
    visibleIndex++;

    let dateHtml = startDate;
    if (endDate) { dateHtml += ` - ${endDate}`; }

    timelineItem.innerHTML = `
      <div class="timeline-marker"></div>
      <div class="timeline-content">
        <span class="timeline-date">${dateHtml}</span>
        <h4 class="timeline-title">${positionOrDegree}</h4>
        <h5 class="timeline-subtitle">${companyOrInstitution}</h5>
        <p class="timeline-description">${shortDescription}</p>
        ${description ? `<span class="details-link" tabindex="0">More details +</span>` : ''}
        ${keyWords.length ? `<div class="timeline-skills">${keyWords.map(k => `<span class="tag">${k}</span>`).join('')}</div>` : ''}
      </div>
    `;

    timeline.appendChild(timelineItem);

    if (description) {
      timelineItem.querySelector('.details-link').addEventListener('click', () => {
        showDescriptionPopup(positionOrDegree, description);
      });
    }
  });
}

function showDescriptionPopup(title, description) {
  // Remove existing popup if any
  const existing = document.querySelector('.timeline-popup');
  if (existing) existing.remove();

  const popup = document.createElement('div');
  popup.className = 'timeline-popup';
  popup.innerHTML = `
    <div class="popup-content">
      <span class="close-popup" tabindex="0" aria-label="Close popup">&times;</span>
      <h4>${title}</h4>
      <p>${description}</p>
    </div>
  `;
  document.body.appendChild(popup);

  popup.querySelector('.close-popup').addEventListener('click', () => {
    popup.remove();
  });
}

function formatDescription(description) {
  if (!description) return '';
  const lines = description.split('\n').map(line => line.trim()).filter(Boolean);
  let html = '';
  let inList = false;
  let inSubList = false;

  lines.forEach(line => {
    if (line.startsWith('·')) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      if (inSubList) {
        html += '</ul>';
        inSubList = false;
      }
      html += `<li>${line.slice(1).trim()}`;
    } else if (line.startsWith('>')) {
      if (!inSubList) {
        html += '<ul class="indented">';
        inSubList = true;
      }
      html += `<li>${line.slice(1).trim()}</li>`;
    } else {
      if (inSubList) {
        html += '</ul>';
        inSubList = false;
      }
      if (inList) {
        html += '</li>';
        inList = false;
      }
      html += `<p>${line}</p>`;
    }
  });

  if (inSubList) html += '</ul>';
  if (inList) html += '</li></ul>';

  return html;
}

// ============================================================================
// SKILLS RENDERER
// ============================================================================

function renderSkills(skills) {
  const skillsGrid = document.querySelector('.skills-grid');
  if (!skillsGrid) return;

  skillsGrid.innerHTML = '';
  const lang = getCurrentLang();

  skills.forEach(skill => {
    const category = skill[`category_${lang}`] || skill.category_en;
    const items = (skill[`description_${lang}`] || skill.description_en || '')
      .split('·')
      .map(s => s.trim())
      .filter(Boolean);

    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'skill-category';
    categoryDiv.innerHTML = `
      <h4>${category}</h4>
      <ul>
        ${items.map(item => `<li>${item}</li>`).join('')}
      </ul>
    `;
    skillsGrid.appendChild(categoryDiv);
  });
}

// ============================================================================
// PROJECT RENDERER
// ============================================================================

function renderProjects(projects) {
  const projectsGrid = document.querySelector('.projects-grid');
  if (!projectsGrid) return;

  projectsGrid.innerHTML = '';
  const lang = getCurrentLang();

  projects.forEach(project => {
    const title = project[`title_${lang}`] || project.title_en;
    const description = project[`description_${lang}`] || project.description_en || '';
    const formattedDescription = description.replace(/\*([^*]+)\*/g, '<p class="project-em">$1</p>');
    const techs = project.technologies
      .split(';')
      .map(t => t.trim())
      .filter(Boolean);

    const card = document.createElement('article');
    card.className = 'project-card';
    card.innerHTML = `
      <div class="project-image">
        <h4>${title}</h4>
      </div>
      <div class="project-content">
        <p>${formattedDescription}</p>
        <div class="project-links">
            ${project.url_live ? `<a href="${project.url_live}" target="_blank" rel="noopener" class="btn-primary">Live Demo</a>` : ''}
            ${project.url_git ? `<a href="${project.url_git}" target="_blank" rel="noopener" class="btn-secondary">GitHub - FrontEnd</a>` : ''}
            ${project.url_git_backend ? `<a href="${project.url_git_backend}" target="_blank" rel="noopener" class="btn-secondary">GitHub - Backend</a>` : ''}
        </div>
        <div class="project-tech">
          ${techs.map(tech => `<span class="tag">${tech}</span>`).join('')}
        </div>
      </div>
    `;
    projectsGrid.appendChild(card);
  });
}

// ============================================================================
// ARTICLES RENDER
// ============================================================================
function renderBlogArticles(articles) {
  const lang = getCurrentLang();
  const container = document.querySelector('.blog-articles');

  if (!container) return;
  container.innerHTML = `
    <ul>
      ${articles.map(article => `
        <li>
          <a href="${article.url}" target="_blank" rel="noopener">
            ${article[`title_${lang}`] || article.title_en}
          </a>
        </li>
      `).join('')}
    </ul>
  `;
}

// ============================================================================
// NAVIGATION MANAGER
// ============================================================================
const NavigationManager = {
    init() {
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', this.handleSmoothScroll.bind(this));
        });
        console.log(`Navigation manager initialized, ${links.length} links processed`);
    },

    handleSmoothScroll(e) {
        e.preventDefault();
        const href = e.currentTarget.getAttribute('href');
        const target = document.querySelector(href);
        
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }
};

function toggleBurgerMenu() {
  document.querySelector('.nav-menu').classList.toggle('open');
  document.querySelector('.nav-controls').classList.toggle('open');
}

// ============================================================================
// GLOBAL FUNCTIONS
// ============================================================================
function toggleTheme() {
    ThemeManager.toggle();
    document.getElementById('theme-icon').textContent = document.body.classList.contains('dark-theme') ? '⏾' : '☀︎';
}

async function changeLanguage(language) {
    await I18nManager.changeLanguage(language);
    renderTimeline(timelineData, 'all');
    renderSkills(skillsData);
    renderProjects(projectsData);
    renderBlogArticles(articlesData)
}
// Helper function to hide the overlay
function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'none';
}



// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('🚀 Initializing Interactive CV...');
        
        await I18nManager.init();
        ThemeManager.init();
        AnimationManager.init();
        NavigationManager.init();
        TimelineManager.init();

        // Fetch both experiences and educations in parallel
        Promise.all([
            fetch("https://cv-backend-ttra.onrender.com/api/experiences/").then(res => res.json()),
            fetch("https://cv-backend-ttra.onrender.com/api/educations/").then(res => res.json())
        ])
        .then(([experiences, educations]) => {
            // Combine both arrays and render all items
            timelineData = [
                ...experiences.map(item => ({ ...item, _type: 'work' })),
                ...educations.map(item => ({ ...item, _type: 'education' }))
            ];
            // Sort by start_date descending (most recent first)
            timelineData.sort((a, b) => {
                // If start_date is missing, treat as oldest
                if (!a.start_date) return 1;
                if (!b.start_date) return -1;
                // Compare as numbers if possible, else as strings
                return b.start_date.localeCompare(a.start_date);
            });
            renderTimeline(timelineData, 'all');
            hideLoadingOverlay();
        })
        .catch(err => {
            console.error('Error fetching timeline data:', err);
        });

        // Fetch skills from API and render
        fetch("https://cv-backend-ttra.onrender.com/api/skills/")
            .then(res => res.json())
            .then(data => {skillsData = data; renderSkills(data)})
            .catch(err => console.error('Error fetching skills:', err));

        fetch("https://cv-backend-ttra.onrender.com/api/projects/")
            .then(res => res.json())
            .then(data => {projectsData = data; renderProjects(data)})
            .catch(err => console.error('Error fetching projects:', err));

        fetch("https://cv-backend-ttra.onrender.com/api/articles/")
            .then(res => res.json())
            .then(data => {articlesData = data; renderBlogArticles(data)})
            .catch(err => console.error('Error fetching articles:', err));

        console.log('✅ Interactive CV initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing CV:', error);
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    AnimationManager.destroy();
});