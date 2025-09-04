// js/script.js

// Fonction pour détecter la langue du navigateur
function detectBrowserLanguage() {
    let lang = navigator.language || navigator.userLanguage; // Pour IE
    lang = lang.substring(0, 2).toLowerCase(); // Récupérer les 2 premières lettres
    return lang;
}

// Fonction pour charger les traductions
function loadTranslations(lang) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `lang/${lang}.js`;
        script.onload = () => {
            let translations;
            if (lang === 'fr') {
                translations = translations_fr;
            } else if (lang === 'nl') {
                translations = translations_nl;
            } else {
                translations = translations_fr; // Langue par défaut
            }
            resolve(translations);
        };
        script.onerror = () => {
            reject(new Error(`Impossible de charger le fichier de langue ${lang}.js`));
        };
        document.head.appendChild(script);
    });
}

// Fonction pour appliquer les traductions
function applyTranslations(translations) {
    const translatableElements = document.querySelectorAll('[data-translate]');
    translatableElements.forEach(element => {
        const key = element.dataset.translate;
        if (translations[key]) {
            element.textContent = translations[key];
        }
    });
}

// Mise à jour de l’URL de redirection du formulaire
function updateFormRedirectUrl(lang) {
    const redirectInput = document.getElementById('redirect-url');
    if (redirectInput) {
        const baseUrl = 'https://tami-soft.github.io/merci.html';
        redirectInput.value = `${baseUrl}?lang=${lang}`;
    }
}

// Initialisation de la langue
async function initializeLanguage() {
    let browserLanguage = detectBrowserLanguage();
    let storedLanguage = localStorage.getItem('language');
    let languageToUse = storedLanguage || ((browserLanguage === 'nl') ? 'nl' : 'fr');

    try {
        const translations = await loadTranslations(languageToUse);
        applyTranslations(translations);
        updateFormRedirectUrl(languageToUse);
    } catch (error) {
        console.error("Erreur lors du chargement des traductions :", error);
    }
}

// Gestion du changement de langue via les drapeaux
document.querySelectorAll('.language-flags img').forEach(flag => {
    flag.addEventListener('click', async function () {
        const selectedLanguage = this.getAttribute('data-lang');

        try {
            const translations = await loadTranslations(selectedLanguage);
            applyTranslations(translations);
            updateFormRedirectUrl(selectedLanguage);
        } catch (error) {
            console.error("Erreur lors du chargement des traductions :", error);
        }

        localStorage.setItem('language', selectedLanguage);

        document.querySelectorAll('.language-flags img').forEach(img => {
            img.classList.remove('active');
        });
        this.classList.add('active');
    });
});

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', initializeLanguage);

// Mobile menu toggle
document.querySelector('.mobile-menu').addEventListener('click', function () {
    document.querySelector('nav ul').classList.toggle('active');
});

// Défilement fluide amélioré (scroll sur le <h2> de chaque section)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href').substring(1);
        const section = document.getElementById(targetId);

        if (section) {
            const h2 = section.querySelector('h2');
            const headerHeight = document.querySelector('header').offsetHeight;
            const offsetTop = (h2 || section).getBoundingClientRect().top + window.scrollY - headerHeight - 20;

            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }

        document.querySelector('nav ul').classList.remove('active');
    });
});
