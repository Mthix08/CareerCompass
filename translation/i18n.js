import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  // English
  en: {
    translation: {
      home: "Home",
      funding: "Funding",
      universities: "Universities",
      courses: "Courses",
      profile: "Profile",
      language: "Language",
      chooseLanguage: "Choose Language",
    },
  },

  // Afrikaans
  af: {
    translation: {
      home: "Tuis",
      funding: "Befondsing",
      universities: "Universiteite",
      courses: "Kursusse",
      profile: "Profiel",
      language: "Taal",
      chooseLanguage: "Kies taal",
    },
  },

  // isiNdebele
  nr: {
    translation: {
      home: "Ikhaya",
      funding: "Isibonelelo",
      universities: "Amayunivesithi",
      courses: "Iimfundo",
      profile: "Iphrofayili",
      language: "Ilimi",
      chooseLanguage: "Khetha ilimi",
    },
  },

  // isiXhosa
  xh: {
    translation: {
      home: "Ikhaya",
      funding: "Inkxaso-mali",
      universities: "Iiyunivesithi",
      courses: "Izifundo",
      profile: "Iprofayile",
      language: "Ulwimi",
      chooseLanguage: "Khetha ulwimi",
    },
  },

  // isiZulu
  zu: {
    translation: {
      home: "Ikhaya",
      funding: "Uxhaso lwezimali",
      universities: "Amanyuvesi",
      courses: "Izifundo",
      profile: "Iphrofayela",
      language: "Ulimi",
      chooseLanguage: "Khetha ulimi",
    },
  },

  // Sepedi
  nso: {
    translation: {
      home: "Gae",
      funding: "Thekgo ya ditšhelete",
      universities: "Diyunibesithi",
      courses: "Dithuto",
      profile: "Profaele",
      language: "Leleme",
      chooseLanguage: "Kgetha leleme",
    },
  },

  // Sesotho
  st: {
    translation: {
      home: "Lehae",
      funding: "Tshehetso ya ditjhelete",
      universities: "Diyunivesithi",
      courses: "Dithuto",
      profile: "Profaele",
      language: "Puo",
      chooseLanguage: "Kgetha puo",
    },
  },

  // Setswana
  tn: {
    translation: {
      home: "Gae",
      funding: "Tshegetso ya madi",
      universities: "Diyunibesiti",
      courses: "Dithuto",
      profile: "Porofaele",
      language: "Puo",
      chooseLanguage: "Tlhopha puo",
    },
  },

  // siSwati
  ss: {
    translation: {
      home: "Ekhaya",
      funding: "Kwesekwa ngetimali",
      universities: "Emanyuvesi",
      courses: "Tifundvo",
      profile: "Iphrofayili",
      language: "Lulwimi",
      chooseLanguage: "Khetsa lulwimi",
    },
  },

  // Tshivenda
  ve: {
    translation: {
      home: "Hayani",
      funding: "Thikhedzo ya masheleni",
      universities: "Yunivesithi",
      courses: "Ngudo",
      profile: "Phurofaili",
      language: "Luambo",
      chooseLanguage: "Nangani luambo",
    },
  },

  // Xitsonga
  ts: {
    translation: {
      home: "Ekaya",
      funding: "Nseketelo wa timali",
      universities: "Tiyunivhesiti",
      courses: "Tidyondzo",
      profile: "Phurofayili",
      language: "Ririmi",
      chooseLanguage: "Hlawula ririmi",
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;