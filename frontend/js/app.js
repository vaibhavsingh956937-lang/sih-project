const App = (() => {
  // --- BILINGUAL TRANSLATION DICTIONARY ---
  const i18n = {
    en: {
      brandTitle: 'AYUSH OPD CMS',
      brandSubtitle: 'Digital Patient Case Management',
      dashboardTitle: 'Doctor OPD Dashboard',
      patientSearch: 'Patient Search Directory',
      analyticsTitle: 'OPD Statistics & Analytics',
      registerPatient: '+ Register New Patient',
      exportCSV: '📥 Export Directory (CSV)',
      followupSchedule: '📅 Follow-up Schedule',
      searchPlaceholder: 'Search by 12-Digit Aadhar Number, Patient Name, or Phone...',
      aadharLabel: 'Aadhar Number',
      nameLabel: 'Full Name',
      ageGenderLabel: 'Age / Gender',
      phoneLabel: 'Phone',
      lastVisitLabel: 'Last Visit',
      actionLabel: 'Action',
      totalPatients: 'Total Patients',
      totalVisits: 'Total Case Visits',
      casesToday: 'Cases Today',
      systemDistribution: 'AYUSH System-Wise Case Distribution',
      chiefComplaint: 'Chief Complaint',
      diagnosis: 'Diagnosis',
      treatmentPlan: 'Treatment Plan',
      medicines: 'Medicines Prescribed',
      dosages: 'Dosage Instructions',
      vitals: 'Vitals (BP, Pulse, Weight, Temp, SpO2)',
      prakriti: 'Prakriti / Dosha Balance'
    },
    hi: {
      brandTitle: 'आयुष ओपीडी सिस्टम',
      brandSubtitle: 'डिजिटल रोगी केस प्रबंधन पोर्टल',
      dashboardTitle: 'चिकित्सक ओपीडी डैशबोर्ड',
      patientSearch: 'रोगी खोज निर्देशिका',
      analyticsTitle: 'ओपीडी आंकड़े और विश्लेषण',
      registerPatient: '+ नया रोगी पंजीकृत करें',
      exportCSV: '📥 निर्देशिका डाउनलोड करें (CSV)',
      followupSchedule: '📅 फॉलो-अप समय-सारणी',
      searchPlaceholder: '12-अंकों के आधार नंबर, रोगी के नाम या फोन से खोजें...',
      aadharLabel: 'आधार संख्या',
      nameLabel: 'पूरा नाम',
      ageGenderLabel: 'आयु / लिंग',
      phoneLabel: 'फोन',
      lastVisitLabel: 'अंतिम दौरा',
      actionLabel: 'कार्यवाई',
      totalPatients: 'कुल रोगी',
      totalVisits: 'कुल केस दौरे',
      casesToday: 'आज के केस',
      systemDistribution: 'आयुष प्रणाली-वार केस वितरण',
      chiefComplaint: 'मुख्य शिकायत',
      diagnosis: 'निदान / रोग',
      treatmentPlan: 'चिकित्सा सूत्र / उपचार योजना',
      medicines: 'निर्धारित औषधियाँ',
      dosages: 'मात्रा और पथ्य-अपथ्य निर्देश',
      vitals: 'वाइटल्स (रक्तचाप, नाड़ी, वजन, तापमान)',
      prakriti: 'प्रकृति (वात-पित्त-कफ संतुलन)'
    }
  };

  let currentLang = localStorage.getItem('ayush_lang') || 'en';

  const t = (key) => {
    return (i18n[currentLang] && i18n[currentLang][key]) || i18n['en'][key] || key;
  };

  const toggleLanguage = () => {
    currentLang = currentLang === 'en' ? 'hi' : 'en';
    localStorage.setItem('ayush_lang', currentLang);
    showToast(currentLang === 'hi' ? 'भाषा: हिंदी चुनी गई' : 'Language set to English', 'success');
    setTimeout(() => location.reload(), 300);
  };

  // --- THEME TOGGLE (LIGHT / DARK EMERALD) ---
  const initTheme = () => {
    const savedTheme = localStorage.getItem('ayush_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  };

  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('ayush_theme', newTheme);
    showToast(newTheme === 'dark' ? 'Dark Emerald Mode Enabled 🌙' : 'Light Mode Enabled ☀️', 'success');
  };

  // Mask Aadhar number
  const maskAadhar = (aadhar) => {
    if (!aadhar) return 'N/A';
    const str = String(aadhar).trim();
    if (str.length !== 12) return str;
    return `XXXX-XXXX-${str.substring(8)}`;
  };

  // AYUSH System Badge
  const getSystemBadgeHTML = (system) => {
    const sys = system || 'Ayurveda';
    let badgeClass = 'badge-ayurveda';
    let icon = '🌿';
    if (sys.includes('Yoga')) { badgeClass = 'badge-yoga'; icon = '🧘'; }
    else if (sys.includes('Unani')) { badgeClass = 'badge-unani'; icon = '🌱'; }
    else if (sys.includes('Siddha')) { badgeClass = 'badge-siddha'; icon = '⚕️'; }
    else if (sys.includes('Homeopathy')) { badgeClass = 'badge-homeopathy'; icon = '💧'; }

    return `<span class="badge-system ${badgeClass}"><span>${icon}</span> ${sys}</span>`;
  };

  // Toast notification UI
  const showToast = (message, type = 'success') => {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerText = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  };

  // Check Auth status
  const checkAuth = () => {
    initTheme();
    const token = localStorage.getItem('ayush_token');
    const doctorJson = localStorage.getItem('ayush_doctor');
    const currentPath = window.location.pathname;

    const isAuthPage = currentPath.endsWith('index.html') || currentPath.endsWith('register.html') || currentPath === '/';

    if (!token && !isAuthPage) {
      window.location.href = 'index.html';
      return null;
    }

    if (token && isAuthPage) {
      window.location.href = 'dashboard.html';
      return null;
    }

    if (doctorJson) {
      try {
        const doctor = JSON.parse(doctorJson);
        const userNameEl = document.getElementById('nav-user-name');
        const userSysEl = document.getElementById('nav-user-system');
        if (userNameEl) userNameEl.innerText = doctor.name;
        if (userSysEl) userSysEl.innerText = doctor.ayush_system;
        return doctor;
      } catch (e) {
        console.error('Error parsing stored doctor profile');
      }
    }
    return null;
  };

  const logout = () => {
    localStorage.removeItem('ayush_token');
    localStorage.removeItem('ayush_doctor');
    showToast('Logged out successfully', 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 500);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(currentLang === 'hi' ? 'hi-IN' : 'en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString(currentLang === 'hi' ? 'hi-IN' : 'en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // --- VOICE DICTATION HELPER (Web Speech API) ---
  const startVoiceDictation = (targetInputId, btnEl) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showToast('Voice dictation is not supported in this browser. Please use Chrome or Edge.', 'error');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = currentLang === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    if (btnEl) btnEl.classList.add('recording');
    showToast('🎤 Listening... Speak now', 'success');

    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const targetEl = document.getElementById(targetInputId);
      if (targetEl) {
        targetEl.value = targetEl.value ? `${targetEl.value} ${transcript}` : transcript;
        showToast('Text transcribed!', 'success');
      }
      if (btnEl) btnEl.classList.remove('recording');
    };

    recognition.onerror = (event) => {
      showToast(`Speech recognition error: ${event.error}`, 'error');
      if (btnEl) btnEl.classList.remove('recording');
    };

    recognition.onend = () => {
      if (btnEl) btnEl.classList.remove('recording');
    };
  };

  // --- PRINTABLE OFFICIAL PRESCRIPTION ENGINE ---
  const printPrescription = (caseData, patientData) => {
    const printWin = window.open('', '_blank');
    if (!printWin) {
      showToast('Pop-up blocked. Please allow pop-ups to print Rx prescription.', 'error');
      return;
    }

    const docName = caseData.doctor_name || 'Dr. Asha Sharma';
    const docSys = caseData.ayush_system || 'Ayurveda';
    const patientName = caseData.patient_name || (patientData ? patientData.full_name : 'Patient');
    const aadharMasked = maskAadhar(caseData.patient_aadhar || (patientData ? patientData.aadhar_number : ''));
    const visitDate = formatDateTime(caseData.visit_date);
    const token = caseData.patient_opd_token || (patientData ? patientData.opd_token : 'OPD-2026-001');

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription Rx - ${patientName}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #16302e; }
          .header { border-bottom: 3px double #0f6e6a; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; }
          .title { font-size: 24px; font-weight: 800; color: #0f6e6a; }
          .sub { font-size: 13px; color: #5a7572; }
          .box { border: 1px solid #dbe8e5; padding: 14px; border-radius: 8px; margin-bottom: 16px; background: #f6faf9; }
          .rx-symbol { font-size: 32px; font-weight: 900; color: #0f6e6a; margin-bottom: 10px; }
          .sec-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #5a7572; margin-top: 12px; }
          .sec-content { font-size: 14px; font-weight: 600; margin-top: 2px; white-space: pre-line; }
          .med-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          .med-table th, .med-table td { border: 1px solid #dbe8e5; padding: 10px; text-align: left; font-size: 13px; }
          .med-table th { background: #e6f4f2; color: #0f6e6a; }
          .footer { margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; }
          .sig-line { border-top: 1px solid #16302e; width: 200px; text-align: center; font-size: 12px; padding-top: 4px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">🌿 AYUSH INTEGRATED CLINIC</div>
            <div class="sub">National OPD Case Management Network</div>
            <div class="sub">Specialty: <strong>${docSys}</strong></div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 18px; font-weight: 800; color: #0f6e6a;">${docName}</div>
            <div class="sub">Reg. No: AYUSH/2026/0942</div>
            <div class="sub">Date: ${visitDate}</div>
          </div>
        </div>

        <div class="box" style="display: flex; justify-content: space-between;">
          <div>
            <div>Patient: <strong>${patientName}</strong> (${caseData.patient_gender || 'N/A'})</div>
            <div>Aadhar ID: <strong style="font-family: monospace;">${aadharMasked}</strong></div>
          </div>
          <div style="text-align: right;">
            <div>Token: <strong style="color: #0f6e6a;">${token}</strong></div>
            <div>BP: ${caseData.bp || '120/80'} | Pulse: ${caseData.pulse || '72 bpm'} | SpO2: ${caseData.spo2 || '98%'}</div>
          </div>
        </div>

        <div class="rx-symbol">℞</div>

        <div class="sec-title">Chief Complaint</div>
        <div class="sec-content">${caseData.chief_complaint}</div>

        ${caseData.diagnosis ? `
          <div class="sec-title">Diagnosis</div>
          <div class="sec-content">${caseData.diagnosis}</div>
        ` : ''}

        ${caseData.treatment_plan ? `
          <div class="sec-title">Treatment Plan & Chikitsa Sutra</div>
          <div class="sec-content">${caseData.treatment_plan}</div>
        ` : ''}

        <div class="sec-title" style="margin-top: 18px;">Prescribed Formulations</div>
        <table class="med-table">
          <thead>
            <tr>
              <th>Medicine / Formulation</th>
              <th>Dosage & Instructions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="font-weight: 700; white-space: pre-line;">${caseData.medicines_prescribed || 'As advised'}</td>
              <td style="white-space: pre-line;">${caseData.dosage_instructions || 'Take after meals with lukewarm water.'}</td>
            </tr>
          </tbody>
        </table>

        ${caseData.follow_up_date ? `
          <div class="sec-title" style="margin-top: 16px;">Follow-up Scheduled</div>
          <div class="sec-content" style="color: #0f6e6a;">${formatDate(caseData.follow_up_date)}</div>
        ` : ''}

        <div class="footer">
          <div style="font-size: 11px; color: #7b9996;">
            Generated via AYUSH OPD CMS • Digital Healthcare System
          </div>
          <div class="sig-line">
            Doctor's Signature / Seal
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  // --- PRE-BUILT AYUSH CLINICAL FORMULA TEMPLATES ---
  const templates = {
    kativata: {
      complaint: 'Chronic lower back stiffness and leg pain aggravated in morning',
      symptoms: 'Aggravated Vata, stiffness on bending, joint cracking',
      findings: 'Pulse: Vata-Kaphaja, Kati lumbar region tender',
      diagnosis: 'Kativata (Lumbago) & Functional Vata Imbalance',
      treatment: 'Deepana-Pachana followed by Kati Basti with Sahacharadi Tailam',
      medicines: '1. Yograj Guggulu - 2 tabs twice daily\n2. Dashmoolarishta - 20ml after meals\n3. Triphala Churna - 5g warm water bedtime',
      dosage: 'Take after meals with warm water. Avoid cold & fermented food.'
    },
    amlapitta: {
      complaint: ' epigastric burning sensation, sour eructations, nausea',
      symptoms: 'Aggravated Pitta, burning after spicy/oily food',
      findings: 'Pulse: Pitta predominant, Epigastric tenderness',
      diagnosis: 'Amlapitta (Dyspepsia / Hyperacidity)',
      treatment: 'Pitta Shamana & Virechana Karma',
      medicines: '1. Avipattikar Churna - 3g before meals\n2. Kamdhudha Ras - 1 tab twice daily\n3. Shatavari Ghrita - 1 tsp empty stomach',
      dosage: 'Avoid sour, excessively spicy, and fried items.'
    },
    pratishyaya: {
      complaint: 'Nasal congestion, watery eyes, sneezing in morning',
      symptoms: 'Kapha congestion in sinuses, frontal heaviness',
      findings: 'Nadi: Kapha-Vata, Pale nasal mucosa',
      diagnosis: 'Kaphaja Pratishyaya (Allergic Rhinitis)',
      treatment: 'Nasya therapy with Anu Taila & Steam Inhalation',
      medicines: '1. Sitopaladi Churna - 3g with honey twice daily\n2. Anu Taila - 2 drops per nostril morning\n3. Laxmivilas Ras - 1 tab twice daily',
      dosage: 'Perform steam before Nasya. Avoid curd & ice water.'
    },
    prameha: {
      complaint: 'Fatigue, excessive thirst, tingling in soles of feet',
      symptoms: 'Madhumeha correlate, lethargy, Suptata in feet',
      findings: 'Pulse: Kapha-Pitta, HbA1c elevated',
      diagnosis: 'Madhumeha (Diabetes Mellitus) with Suptata',
      treatment: 'Prameha Hara Yogas & 45-min daily walking',
      medicines: '1. Chandraprabha Vati - 2 tabs twice daily\n2. Gudmar Churna - 3g before meals\n3. Vasant Kusumakar Ras - 1 tab morning',
      dosage: 'Strict low-GI diet. Avoid refined sugar & white rice.'
    }
  };

  const applyTemplate = (name) => {
    const tpl = templates[name];
    if (!tpl) return;

    if (document.getElementById('chief_complaint')) document.getElementById('chief_complaint').value = tpl.complaint;
    if (document.getElementById('symptoms')) document.getElementById('symptoms').value = tpl.symptoms;
    if (document.getElementById('examination_findings')) document.getElementById('examination_findings').value = tpl.findings;
    if (document.getElementById('diagnosis')) document.getElementById('diagnosis').value = tpl.diagnosis;
    if (document.getElementById('treatment_plan')) document.getElementById('treatment_plan').value = tpl.treatment;
    if (document.getElementById('medicines_prescribed')) document.getElementById('medicines_prescribed').value = tpl.medicines;
    if (document.getElementById('dosage_instructions')) document.getElementById('dosage_instructions').value = tpl.dosage;

    showToast(`Template "${name}" applied!`, 'success');
  };

  return {
    maskAadhar,
    getSystemBadgeHTML,
    showToast,
    checkAuth,
    logout,
    formatDate,
    formatDateTime,
    t,
    toggleLanguage,
    toggleTheme,
    initTheme,
    startVoiceDictation,
    printPrescription,
    applyTemplate
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  App.checkAuth();

  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      App.logout();
    });
  }

  const langBtn = document.getElementById('btn-toggle-lang');
  if (langBtn) {
    langBtn.addEventListener('click', () => App.toggleLanguage());
  }

  const themeBtn = document.getElementById('btn-toggle-theme');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => App.toggleTheme());
  }
});
