// js/script.js

// ===================================================
// --- GESTION DE LA LANGUE ET DES TRADUCTIONS ---
// ===================================================

/**
 * Détecte la langue du navigateur.
 * @returns {string} Le code de la langue sur 2 caractères (ex: 'fr', 'nl').
 */
function detectBrowserLanguage() {
    // Utilise la première langue préférée de l'utilisateur
    const lang = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage;
    return lang.substring(0, 2).toLowerCase();
}

/**
 * Charge dynamiquement le fichier de traduction pour une langue donnée.
 * @param {string} lang - Le code de la langue (ex: 'fr', 'nl').
 * @returns {Promise<object>} Une promesse qui se résout avec l'objet de traductions.
 */
function loadTranslations(lang) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `lang/${lang}.js`;
        script.onload = () => {
            // AMÉLIORATION : Au lieu d'un if/else, on accède dynamiquement à la variable
            // Cela fonctionne pour n'importe quelle langue (translations_fr, translations_nl, translations_es, etc.)
            const translations = window[`translations_${lang}`];
            if (translations) {
                resolve(translations);
            } else {
                // Si le fichier est chargé mais que la variable n'existe pas
                reject(new Error(`La variable de traduction pour '${lang}' n'a pas été trouvée.`));
            }
        };
        script.onerror = () => {
            reject(new Error(`Impossible de charger le fichier de langue ${lang}.js`));
        };
        document.head.appendChild(script);
    });
}

/**
 * Applique les traductions aux éléments de la page.
 * @param {object} translations - L'objet contenant les clés et les valeurs de traduction.
 */
function applyTranslations(translations) {
    const translatableElements = document.querySelectorAll('[data-translate]');
    translatableElements.forEach(element => {
        const key = element.dataset.translate;
        if (translations[key]) {
            element.textContent = translations[key];
        } else {
            console.warn(`Clé de traduction manquante : '${key}'`);
        }
    });
}

/**
 * Met à jour l'URL de redirection cachée dans le formulaire de contact.
 * @param {string} lang - Le code de la langue à ajouter en paramètre.
 */
function updateFormRedirectUrl(lang) {
    const redirectInput = document.getElementById('redirect-url');
    // On vérifie si l'élément existe pour éviter les erreurs sur les autres pages
    if (redirectInput) {
        // Remplacez par l'URL de base de votre site si nécessaire
        const baseUrl = 'https://tami-soft.github.io/merci.html';
        redirectInput.value = `${baseUrl}?lang=${lang}`;
    }
}

/**
 * Fonction principale pour initialiser la langue et les traductions de la page.
 */
async function initializeLanguage() {
    const defaultLanguage = 'fr';
    const supportedLanguages = ['fr', 'nl'];

    const browserLanguage = detectBrowserLanguage();
    const storedLanguage = localStorage.getItem('language');

    let languageToUse = defaultLanguage;

    if (storedLanguage && supportedLanguages.includes(storedLanguage)) {
        languageToUse = storedLanguage;
    } else if (supportedLanguages.includes(browserLanguage)) {
        languageToUse = browserLanguage;
    }
    
    console.log(`Langue à utiliser : ${languageToUse}`);

    try {
        const translations = await loadTranslations(languageToUse);
        applyTranslations(translations);
        updateFormRedirectUrl(languageToUse);
        updateActiveFlag(languageToUse);
    } catch (error) {
        console.error("Erreur lors du chargement des traductions :", error);
        console.log(`Tentative de chargement avec la langue par défaut : ${defaultLanguage}`);
        // AMÉLIORATION : En cas d'erreur, on charge la langue par défaut (français)
        try {
            const defaultTranslations = await loadTranslations(defaultLanguage);
            applyTranslations(defaultTranslations);
            updateFormRedirectUrl(defaultLanguage);
            updateActiveFlag(defaultLanguage);
        } catch (fallbackError) {
            console.error("Erreur critique : Impossible de charger même la langue par défaut.", fallbackError);
        }
    }
}

/**
 * Met à jour l'indicateur visuel (classe 'active') sur le drapeau de la langue sélectionnée.
 * @param {string} lang - La langue active.
 */
function updateActiveFlag(lang) {
    document.querySelectorAll('.language-flags img').forEach(img => {
        if (img.getAttribute('data-lang') === lang) {
            img.classList.add('active');
        } else {
            img.classList.remove('active');
        }
    });
}


// ===================================================
// --- ÉCOUTEURS D'ÉVÉNEMENTS ---
// ===================================================

document.addEventListener('DOMContentLoaded', function() {

    // --- 1. Initialisation de la langue au chargement ---
    // CORRECTION : Le code d'initialisation était commenté et doit être appelé ici.
    initializeLanguage();

    // --- 2. Sélection des éléments du DOM pour les autres fonctionnalités ---
    const header = document.querySelector('header');
    const navList = document.querySelector('nav ul');
    const mobileMenuButton = document.querySelector('.mobile-menu');

    // --- 3. Gestion du changement de langue via les drapeaux ---
    document.querySelectorAll('.language-flags img').forEach(flag => {
        flag.addEventListener('click', async function () {
            const selectedLanguage = this.getAttribute('data-lang');

            try {
                const translations = await loadTranslations(selectedLanguage);
                applyTranslations(translations);
                updateFormRedirectUrl(selectedLanguage);
                localStorage.setItem('language', selectedLanguage);
                updateActiveFlag(selectedLanguage);
            } catch (error) {
                console.error("Erreur lors du changement de langue :", error);
            }
        });
    });

    // --- 4. Gestion du menu de navigation mobile ---
    if (mobileMenuButton && navList) {
        mobileMenuButton.addEventListener('click', () => {
            navList.classList.toggle('active');
        });

        // Fermer le menu en cliquant sur un lien
        navList.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navList.classList.remove('active');
            });
        });
    }

    // --- 5. Gestion du header auto-rétractable ---
    if (header) {
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY <= 100) { // Si on est en haut de la page
                header.classList.remove('header-hidden');
            } else if (currentScrollY > lastScrollY) { // Si on descend
                header.classList.add('header-hidden');
                if(navList) navList.classList.remove('active'); // Ferme le menu en scrollant
            } else { // Si on remonte
                header.classList.remove('header-hidden');
            }
            lastScrollY = currentScrollY;
        });
    }

    // --- 6. Gestion du défilement doux (Smooth Scroll) ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetElement = document.querySelector(this.getAttribute('href'));
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // CORRECTION : Suppression du code redondant qui était commenté
    // L'ancien bloc "Mobile menu toggle" a été retiré car il est déjà géré proprement ci-dessus.
});
