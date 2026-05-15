import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "nav": {
        "home": "Home",
        "search": "Find Work",
        "login": "Login",
        "signup": "Sign Up",
        "dashboard": "Dashboard"
      },
      "hero": {
        "title": "Your Trusted Partner for Every Task",
        "subtitle": "Hire verified local professionals for plumbing, electrical, construction, and more.",
        "search_placeholder": "What service do you need today?"
      },
      "categories": {
        "labour": "Labour",
        "mason": "Mason",
        "plumber": "Plumber",
        "electrician": "Electrician",
        "carpenter": "Carpenter"
      },
      "booking": {
        "title": "Complete Your Booking",
        "bulk_hiring": "BULK HIRING",
        "workers": "Number of Workers",
        "emergency": "Emergency Priority",
        "confirm": "Confirm Booking"
      }
    }
  },
  hi: {
    translation: {
      "nav": {
        "home": "होम",
        "search": "काम खोजें",
        "login": "लॉगिन",
        "signup": "साइन अप",
        "dashboard": "डैशबोर्ड"
      },
      "hero": {
        "title": "हर काम के लिए आपका भरोसेमंद साथी",
        "subtitle": "प्लंबिंग, इलेक्ट्रिकल, निर्माण और बहुत कुछ के लिए सत्यापित स्थानीय पेशेवरों को नियुक्त करें।",
        "search_placeholder": "आज आपको किस सेवा की आवश्यकता है?"
      },
      "categories": {
        "labour": "मजदूर",
        "mason": "मिस्त्री",
        "plumber": "प्लंबर",
        "electrician": "इलेक्ट्रीशियन",
        "carpenter": "बढ़ई"
      },
      "booking": {
        "title": "अपनी बुकिंग पूरी करें",
        "bulk_hiring": "थोक भर्ती",
        "workers": "मजदूरों की संख्या",
        "emergency": "आपातकालीन प्राथमिकता",
        "confirm": "बुकिंग की पुष्टि करें"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
