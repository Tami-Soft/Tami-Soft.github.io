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

// <<< AJOUT : Nouvelle fonction dédiée à la mise à jour de l'URL du formulaire
function updateFormRedirectUrl(lang) {
    const redirectInput = document.getElementById('redirect-url');
    // On vérifie si l'élément existe pour éviter les erreurs sur les autres pages
    if (redirectInput) {
        // Remplacez par l'URL de base de votre site si nécessaire
        const baseUrl = 'https://www.tamisoft.be/merci.html';
        redirectInput.value = `${baseUrl}?lang=${lang}`;
        console.log(`URL de redirection mise à jour : ${redirectInput.value}`);
    }
}

// Fonction principale
async function initializeLanguage() {
    let browserLanguage = detectBrowserLanguage();
    console.log("Langue détectée du navigateur:", browserLanguage);

    // Vérifie si une langue a été précédemment enregistrée dans localStorage
    let storedLanguage = localStorage.getItem('language');
    let languageToUse = storedLanguage || ((browserLanguage === 'nl') ? 'nl' : 'fr');

    // On retire la ligne concernant le selecteur de langue si vous ne l'utilisez pas
    // document.getElementById('language-selector').value = languageToUse;

    try {
        const translations = await loadTranslations(languageToUse);
        applyTranslations(translations);
        // <<< AJOUT : Mettre à jour l'URL du formulaire au chargement de la page
        updateFormRedirectUrl(languageToUse);
    } catch (error) {
        console.error("Erreur lors du chargement des traductions :", error);
    }
}

// Gestion du changement de langue via les drapeaux
document.querySelectorAll('.language-flags img').forEach(flag => {
    flag.addEventListener('click', async function () {
        const selectedLanguage = this.getAttribute('data-lang'); // Récupère la langue sélectionnée

        try {
            const translations = await loadTranslations(selectedLanguage); // Charge les traductions
            applyTranslations(translations); // Applique les traductions
            // <<< AJOUT : Mettre à jour l'URL du formulaire à chaque changement de langue
            updateFormRedirectUrl(selectedLanguage);
        } catch (error) {
            console.error("Erreur lors du chargement des traductions :", error);
        }

        // Enregistrer la langue sélectionnée dans le localStorage
        localStorage.setItem('language', selectedLanguage);

        // Mettre à jour le drapeau actif (si vous avez un style CSS pour .active)
        document.querySelectorAll('.language-flags img').forEach(img => {
            img.classList.remove('active');
        });
        this.classList.add('active');
    });
});

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', initializeLanguage);

 // Mobile menu toggle
 document.querySelector('.mobile-menu').addEventListener('click', function() {
    document.querySelector('nav ul').classList.toggle('active');
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
        
        // Close mobile menu if open
        document.querySelector('nav ul').classList.remove('active');
    });
});
