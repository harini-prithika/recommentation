export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  coverColor: string;
  coverImage?: string;
  ratingCount: number;
  averageRating: number;
  publishYear: number;
  pages: number;
  tags: string[];
}

export interface Rating {
  userId: string;
  bookId: string;
  rating: number; // 1-5
  timestamp: string;
  review?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  favoriteBooks: string[];
  wishlist: string[];
  readingHistory: { bookId: string; dateRead: string; progress: number; notes?: string }[];
  challengeGoal: number; // number of books per year
  challengeProgress: number;
  preferredLanguage: string; // 'en' | 'ta' | 'hi'
}

export interface ActiveUser {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  avatar?: string;
  preferredLanguage: string;
}

export interface BookSuggestion {
  book: Book;
  matchScore: number; // 0-100%
  reason: string;
}

export type LanguageCode = 'en' | 'ta' | 'hi' | 'te';

export interface TranslationDictionary {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  categories: string;
  recommendations: string;
  virtualBookshelf: string;
  favorites: string;
  wishlist: string;
  readingHistory: string;
  readingChallenge: string;
  javaExporter: string;
  adminPanel: string;
  profile: string;
  darkMode: string;
  lightMode: string;
  similaritySimulator: string;
  confidence: string;
  ratingsCount: string;
  average: string;
  rateThisBook: string;
  writeReview: string;
  submit: string;
  login: string;
  register: string;
  logout: string;
  username: string;
  password: string;
  email: string;
  forgotPassword: string;
  enterOtp: string;
  vivaQuestions: string;
  downloadProject: string;
  match: string;
  moodRecommendation: string;
  moodPlaceholder: string;
  askAi: string;
}

export const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  en: {
    title: "Java Book Recommendation Engine",
    subtitle: "Collaborative Filtering Simulator & Java Source Project Exporter",
    searchPlaceholder: "Search by title, author, category, or keywords...",
    categories: "Categories",
    recommendations: "Personalized For You",
    virtualBookshelf: "Virtual Bookshelf",
    favorites: "My Favorites",
    wishlist: "My Wishlist",
    readingHistory: "Reading History",
    readingChallenge: "Reading Challenge",
    javaExporter: "Java Code Exporter",
    adminPanel: "Admin Dashboard",
    profile: "User Profile",
    darkMode: "Dark Theme",
    lightMode: "Light Theme",
    similaritySimulator: "Collaborative Filtering Simulator",
    confidence: "Match Confidence",
    ratingsCount: "ratings",
    average: "Avg Rating",
    rateThisBook: "Rate this book",
    writeReview: "Write a short review...",
    submit: "Submit",
    login: "Log In",
    register: "Register",
    logout: "Log Out",
    username: "Username",
    password: "Password",
    email: "Email Address",
    forgotPassword: "Forgot Password?",
    enterOtp: "Verify OTP (Sent to Email)",
    vivaQuestions: "viva & Concept Guide",
    downloadProject: "Download Java Project ZIP",
    match: "match",
    moodRecommendation: "Mood-Based AI Recommendation",
    moodPlaceholder: "How are you feeling today? (e.g., 'excited to learn coding', 'sad and wanting comfort', 'curious about history')",
    askAi: "Discover via AI"
  },
  ta: {
    title: "ஜாவா புத்தக பரிந்துரை இயந்திரம்",
    subtitle: "கூட்டு வடிகட்டுதல் சிமுலேட்டர் & ஜாவா மூல திட்ட ஏற்றுமதி",
    searchPlaceholder: "தலைப்பு, ஆசிரியர், வகை அல்லது முக்கிய வார்த்தைகள் மூலம் தேடுங்கள்...",
    categories: "புத்தகப் பிரிவுகள்",
    recommendations: "உங்களுக்கான பரிந்துரைகள்",
    virtualBookshelf: "மெய்நிகர் புத்தக அலமாரி",
    favorites: "எனக்கு பிடித்தவை",
    wishlist: "விருப்பப்பட்டியல்",
    readingHistory: "வாசிப்பு வரலாறு",
    readingChallenge: "வாசிப்பு சவால்",
    javaExporter: "ஜாவா குறியீடு ஏற்றுமதி",
    adminPanel: "நிர்வாகி டாஷ்போர்டு",
    profile: "பயனர் சுயவிவரம்",
    darkMode: "இருண்ட பயன்முறை",
    lightMode: "ஒளி பயன்முறை",
    similaritySimulator: "வடிகட்டுதல் சிமுலேட்டர்",
    confidence: "பொருந்தும் நம்பிக்கை",
    ratingsCount: "மதிப்பீடுகள்",
    average: "சராசரி மதிப்பீடு",
    rateThisBook: "மதிப்பீடு கொடுங்கள்",
    writeReview: "ஒரு சிறிய விமர்சனம் எழுதுங்கள்...",
    submit: "சமர்ப்பி",
    login: "உள்நுழை",
    register: "பதிவு செய்",
    logout: "வெளியேறு",
    username: "பயனர் பெயர்",
    password: "கடவுச்சொல்",
    email: "மின்னஞ்சல் முகவரி",
    forgotPassword: "கடவுச்சொல் மறந்துவிட்டதா?",
    enterOtp: "OTP ஐ சரிபார்க்கவும் (மின்னஞ்சலுக்கு அனுப்பப்பட்டது)",
    vivaQuestions: "விவா கேள்விகள்",
    downloadProject: "ஜாவா திட்டத்தை பதிவிறக்கு",
    match: "பொருத்தம்",
    moodRecommendation: "மனநிலை சார்ந்த AI பரிந்துரை",
    moodPlaceholder: "இன்று உங்கள் மனநிலை எப்படி இருக்கிறது? (எ.கா., 'புரோகிராமிங் கற்க ஆசை', 'வரலாறு பற்றி அறிய ஆர்வம்')",
    askAi: "AI மூலம் கண்டறியவும்"
  },
  hi: {
    title: "जावा पुस्तक अनुशंसा प्रणाली",
    subtitle: "सहयोगात्मक फ़िल्टरिंग सिम्युलेटर और जावा प्रोजेक्ट निर्यातक",
    searchPlaceholder: "शीर्षक, लेखक, श्रेणी या कीवर्ड खोजें...",
    categories: "पुस्तकों की श्रेणियां",
    recommendations: "आपके लिए अनुशंसित",
    virtualBookshelf: "वर्चुअल बुकशेल्फ़",
    favorites: "मेरी पसंदीदा पुस्तकें",
    wishlist: "मेरी इच्छा सूची",
    readingHistory: "पठन इतिहास",
    readingChallenge: "रीडिंग चैलेंज",
    javaExporter: "जावा कोड निर्यातक",
    adminPanel: "एडमिन पैनल",
    profile: "यूज़र प्रोफाइल",
    darkMode: "डार्क मोड",
    lightMode: "लाइट मोड",
    similaritySimulator: "फ़िल्टरिंग सिम्युलेटर",
    confidence: "अनुशंसा मिलान",
    ratingsCount: "रेटिंग्स",
    average: "औसत रेटिंग",
    rateThisBook: "रेटिंग दें",
    writeReview: "समीक्षा लिखें...",
    submit: "जमा करें",
    login: "लॉग इन करें",
    register: "रजिस्टर करें",
    logout: "लॉग आउट",
    username: "यूज़रनेम",
    password: "पासवर्ड",
    email: "ईमेल आईडी",
    forgotPassword: "पासवर्ड भूल गए?",
    enterOtp: "ओटीपी सत्यापित करें",
    vivaQuestions: "मौखिक परीक्षा प्रश्न",
    downloadProject: "जावा प्रोजेक्ट डाउनलोड करें",
    match: "मैच",
    moodRecommendation: "मनोदशा आधारित AI अनुशंसा",
    moodPlaceholder: "आज आप कैसा महसूस कर रहे हैं? (जैसे, 'कोडिंग सीखने के लिए उत्सुक', 'इतिहास जानने की इच्छा')",
    askAi: "AI से पूछें"
  },
  te: {
    title: "జావా పుస్తక సిఫార్సు వ్యవస్థ",
    subtitle: "కొలాబొరేటివ్ ఫిల్టరింగ్ సిమ్యులేటర్ & జావా ప్రాజెక్ట్ ఎగుమతిదారు",
    searchPlaceholder: "శీర్షిక, రచయిత, వర్గం లేదా కీవర్డ్ ద్వారా వెతకండి...",
    categories: "పుస్తక వర్గాలు",
    recommendations: "మీ కొరకు సిఫార్సులు",
    virtualBookshelf: "వర్చువల్ బుక్‌షెల్ఫ్",
    favorites: "నాకు నచ్చిన పుస్తకాలు",
    wishlist: "నా కోరికల జాబితా",
    readingHistory: "పఠన చరిత్ర",
    readingChallenge: "రీడింగ్ ఛాలెంజ్",
    javaExporter: "జావా కోడ్ ఎగుమతి",
    adminPanel: "అడ్మిన్ ప్యానెల్",
    profile: "యూజర్ ప్రొఫైల్",
    darkMode: "డార్క్ మోడ్",
    lightMode: "లైట్ మోడ్",
    similaritySimulator: "కొలాబొరేటివ్ సిమ్యులేటర్",
    confidence: "సిఫార్సు మ్యాచ్",
    ratingsCount: "రేటింగ్స్",
    average: "సగటు రేటింగ్",
    rateThisBook: "రేటింగ్ ఇవ్వండి",
    writeReview: "సమీక్ష రాయండి...",
    submit: "సమర్పించు",
    login: "లాగిన్",
    register: "రిజిస్టర్",
    logout: "లాగౌట్",
    username: "యూజర్ నేమ్",
    password: "పాస్‌వర్డ్",
    email: "ఈమెయిల్ చిరునామా",
    forgotPassword: "పాస్‌వర్డ్ మరిచిపోయారా?",
    enterOtp: "OTP ధృవీకరించు",
    vivaQuestions: "వివా ప్రశ్నలు",
    downloadProject: "జావా ప్రాజెక్ట్ డౌన్‌లోడ్",
    match: "మ్యాచ్",
    moodRecommendation: "మూడ్ ఆధారిత AI సిఫార్సు",
    moodPlaceholder: "ఈరోజు మీ మానసిక స్థితి ఎలా ఉంది? (ఉదా., 'కోడింగ్ నేర్చుకోవాలనే ఆసక్తి')",
    askAi: "AI ద్వారా తెలుసుకోండి"
  }
};
