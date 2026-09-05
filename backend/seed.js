const dotenv = require('dotenv');
dotenv.config();

const { initDb } = require('./config/database');
const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');
const CaseSheet = require('./models/CaseSheet');

const seed = async () => {
  console.log('🌱 Starting AYUSH OPD CMS Seed Script...');
  await initDb();

  // Create Doctors
  console.log('Creating Doctors...');
  let doc1 = await Doctor.findByEmail('doctor1@ayush.gov.in');
  if (!doc1) {
    doc1 = await Doctor.create({
      name: 'Dr. Asha Sharma',
      email: 'doctor1@ayush.gov.in',
      password: 'doctor1234',
      ayush_system: 'Ayurveda'
    });
    console.log('  + Registered Dr. Asha Sharma (Ayurveda)');
  }

  let doc2 = await Doctor.findByEmail('doctor2@ayush.gov.in');
  if (!doc2) {
    doc2 = await Doctor.create({
      name: 'Dr. Raj Patel',
      email: 'doctor2@ayush.gov.in',
      password: 'doctor1234',
      ayush_system: 'Yoga & Naturopathy'
    });
    console.log('  + Registered Dr. Raj Patel (Yoga & Naturopathy)');
  }

  // Demo Patients Data
  const patientsData = [
    {
      aadhar_number: '123456789012',
      full_name: 'Rajesh Kumar',
      date_of_birth: '1981-05-15',
      gender: 'Male',
      phone: '9876543210',
      address: 'House No 45, Near Temple',
      village: 'Rampur',
      district: 'Varanasi',
      state: 'Uttar Pradesh',
      created_by: doc1.id
    },
    {
      aadhar_number: '234567890123',
      full_name: 'Priya Singh',
      date_of_birth: '1994-08-20',
      gender: 'Female',
      phone: '9876543211',
      address: 'Flat 302, Green Avenue',
      village: 'Kalyanpur',
      district: 'Kanpur',
      state: 'Uttar Pradesh',
      created_by: doc2.id
    },
    {
      aadhar_number: '345678901234',
      full_name: 'Amit Verma',
      date_of_birth: '1974-03-10',
      gender: 'Male',
      phone: '9876543212',
      address: '12-B Railway Colony',
      village: 'Gandhi Nagar',
      district: 'Jaipur',
      state: 'Rajasthan',
      created_by: doc1.id
    },
    {
      aadhar_number: '456789012345',
      full_name: 'Sunita Das',
      date_of_birth: '1998-11-05',
      gender: 'Female',
      phone: '9876543213',
      address: 'Block C, Lake View',
      village: 'Salt Lake',
      district: 'Kolkata',
      state: 'West Bengal',
      created_by: doc2.id
    },
    {
      aadhar_number: '567890123456',
      full_name: 'Vikram Gupta',
      date_of_birth: '1988-01-25',
      gender: 'Male',
      phone: '9876543214',
      address: 'Plot 89, Sector 4',
      village: 'Shivaji Nagar',
      district: 'Pune',
      state: 'Maharashtra',
      created_by: doc1.id
    }
  ];

  console.log('Creating Patients...');
  for (const pData of patientsData) {
    let p = await Patient.findByAadhar(pData.aadhar_number);
    if (!p) {
      p = await Patient.create(pData);
      console.log(`  + Registered Patient: ${p.full_name} (Aadhar: ${p.aadhar_number})`);
    }
  }

  // Demo Cases (3 per patient = 15 total)
  console.log('Creating Case Sheets...');
  const casesData = [
    // Patient 1: Rajesh Kumar
    {
      patient_aadhar: '123456789012',
      doctor_id: doc1.id,
      ayush_system: 'Ayurveda',
      chief_complaint: 'Chronic lower back stiffness and digestive sluggishness for 3 months',
      symptoms: 'Aggravated Vata, constipation, joint crackling on movement',
      examination_findings: 'Pulse (Nadi): Vata-Kaphaja, Tongue: Slightly coated (Ama present), Abdomen: Tympanitic',
      diagnosis: 'Kativata (Lumbago) associated with Agnimandya',
      treatment_plan: 'Deepana-Pachana therapy followed by Snehan-Svedan and Basti Karma',
      medicines_prescribed: '1. Yograj Guggulu - 2 tabs twice daily\n2. Dashmoolarishta - 20ml after meals\n3. Triphala Churna - 5g at bedtime with warm water',
      dosage_instructions: 'Take medicines after food with lukewarm water. Avoid cold & raw foods.',
      follow_up_date: '2026-09-20',
      notes: 'Advised Kati Basti local oil therapy in Panchakarma clinic next week.'
    },
    {
      patient_aadhar: '123456789012',
      doctor_id: doc2.id,
      ayush_system: 'Yoga & Naturopathy',
      chief_complaint: 'Follow-up for lumbar stiffness and stress management',
      symptoms: 'Mild stiffness remaining in morning; sleep quality improved',
      examination_findings: 'Lumbar flexibility improved by 20%. Stress scale 4/10.',
      diagnosis: 'Postural Strain and Functional Vata Imbalance',
      treatment_plan: 'Yogic posture therapy and hydrotherapy abdominal packs',
      medicines_prescribed: '1. Bhujangasana & Marjariasana daily (15 mins)\n2. Anulom Vilom Pranayama (10 mins morning)\n3. Cold abdominal pack (20 mins daily)',
      dosage_instructions: 'Perform asanas on empty stomach in morning.',
      follow_up_date: '2026-10-05',
      notes: 'Patient showed great enthusiasm for daily Pranayama practice.'
    },
    {
      patient_aadhar: '123456789012',
      doctor_id: doc1.id,
      ayush_system: 'Ayurveda',
      chief_complaint: 'Seasonal allergic rhinitis and sneezing',
      symptoms: 'Nasal congestion, watery eyes, heaviness in forehead',
      examination_findings: 'Kapha congestion in sinuses, pale nasal mucosa',
      diagnosis: 'Kaphaja Pratishyaya (Allergic Rhinitis)',
      treatment_plan: 'Nasya therapy with Anu Taila and Kapha-pacifying diet',
      medicines_prescribed: '1. Sitopaladi Churna - 3g with honey twice daily\n2. Anu Taila - 2 drops per nostril every morning\n3. Laxmivilas Ras - 1 tab twice daily',
      dosage_instructions: 'Perform steam inhalation before applying Nasya drops.',
      follow_up_date: '2026-09-18',
      notes: 'Avoid curd, ice water, and night exposure to fan/AC.'
    },

    // Patient 2: Priya Singh
    {
      patient_aadhar: '234567890123',
      doctor_id: doc2.id,
      ayush_system: 'Yoga & Naturopathy',
      chief_complaint: 'Insomnia, anxiety, and tension headaches',
      symptoms: 'Difficulty falling asleep, mental restlessness, cervical muscle tightness',
      examination_findings: 'High muscle tone in trapezius, shallow thoracic breathing',
      diagnosis: 'Psychophysiological Insomnia and Stress-induced Cephalea',
      treatment_plan: 'Naturopathic Hydro-deluge, Shirodhara relaxation, and Yoga Nidra',
      medicines_prescribed: '1. Yoga Nidra audio practice (30 mins before sleep)\n2. Warm foot bath with Epsom salt (15 mins at night)\n3. Chamomile herbal infusion',
      dosage_instructions: 'No screen time 1 hour before bedtime.',
      follow_up_date: '2026-09-25',
      notes: 'Advised keeping a gratitude journal.'
    },
    {
      patient_aadhar: '234567890123',
      doctor_id: doc1.id,
      ayush_system: 'Ayurveda',
      chief_complaint: 'Hyperacidity and burning sensation in epigastrium',
      symptoms: 'Sour eructations, burning sensation in chest after spicy food',
      examination_findings: 'Pitta-predominant pulse, tenderness in epigastric region',
      diagnosis: 'Amlapitta (Dyspepsia/GERD)',
      treatment_plan: 'Pitta shamana therapy and dietary regulation',
      medicines_prescribed: '1. Avipattikar Churna - 3g with warm water before meals\n2. Kamdhudha Ras - 1 tab twice daily\n3. Shatavari Ghrita - 1 tsp morning empty stomach',
      dosage_instructions: 'Avoid sour, fermented, oily, and excessively salty meals.',
      follow_up_date: '2026-10-01',
      notes: 'Patient advised to eat small frequent meals.'
    },
    {
      patient_aadhar: '234567890123',
      doctor_id: doc1.id,
      ayush_system: 'Homeopathy',
      chief_complaint: 'Migraine headaches triggered by sun exposure',
      symptoms: 'Right-sided throbbing headache starting in morning, peaking at noon',
      examination_findings: 'Pupils reactive, BP 118/76 mmHg, right temporal tenderness',
      diagnosis: 'Sun Migraine (Natrum Muriaticum profile)',
      treatment_plan: 'Constitutional Homeopathic Remedy',
      medicines_prescribed: '1. Natrum Muriaticum 200C - 4 globules once weekly\n2. Belladonna 30C - 4 globules SOS during acute pain',
      dosage_instructions: 'Dissolve globules under tongue. Avoid strong aromas (camphor, coffee) 30 mins before/after.',
      follow_up_date: '2026-10-12',
      notes: 'Wear sunglasses during outdoor activity.'
    },

    // Patient 3: Amit Verma
    {
      patient_aadhar: '345678901234',
      doctor_id: doc1.id,
      ayush_system: 'Ayurveda',
      chief_complaint: 'Type 2 Diabetes adjunctive care and peripheral numbness',
      symptoms: 'Tingling sensation in toes, fatigue, excessive thirst',
      examination_findings: 'Fasting blood sugar: 154 mg/dL, HbA1c: 7.4%. Reduced vibration sense in feet.',
      diagnosis: 'Madhumeha (Diabetes Mellitus) with Upadrava of Suptata',
      treatment_plan: 'Prameha Hara Yogas and Lifestyle Modification',
      medicines_prescribed: '1. Chandraprabha Vati - 2 tabs twice daily\n2. Vasant Kusumakar Ras - 1 tab morning with milk\n3. Gudmar Churna - 3g before lunch and dinner',
      dosage_instructions: 'Monitor blood sugar weekly. Continue baseline modern medications as advised.',
      follow_up_date: '2026-09-30',
      notes: 'Walking 45 mins every morning mandatory.'
    },
    {
      patient_aadhar: '345678901234',
      doctor_id: doc2.id,
      ayush_system: 'Unani',
      chief_complaint: 'General weakness and sluggish hepatic digestion',
      symptoms: 'Anorexia, lethargy, heaviness after meals',
      examination_findings: 'Nabz (Pulse): Mautadil, Jigar (Liver) non-tender, slight yellow coating on tongue',
      diagnosis: 'Zuf-e-Jigar (Hepatic Debility) & Zuf-e-Hazm',
      treatment_plan: 'Muqawwi-e-Jigar (Liver tonic) regimen and dietary restriction',
      medicines_prescribed: '1. Majun Dabidul Ward - 5g morning with water\n2. Arq Kasni - 50ml twice daily\n3. Sharbat Dinar - 20ml after lunch',
      dosage_instructions: 'Drink warm boiled water. Avoid heavy meat dishes.',
      follow_up_date: '2026-10-08',
      notes: 'Patient reports feeling more energetic after 5 days.'
    },
    {
      patient_aadhar: '345678901234',
      doctor_id: doc2.id,
      ayush_system: 'Siddha',
      chief_complaint: 'Joint pain in knees (Osteoarthritis)',
      symptoms: 'Knee joint crepitus, stiffness after sitting',
      examination_findings: 'Naadi: Vatha-Pitha, mild effusion in right knee joint',
      diagnosis: 'Azhi Vayu (Knee Osteoarthritis)',
      treatment_plan: 'External Thokkanam (massage) and herbal decoctions',
      medicines_prescribed: '1. Vatha Sura Kudineer - 30ml twice daily before meals\n2. Vathamadakki Thailam - external application warm on knees twice daily\n3. Amukkara Chooranam - 1g with warm milk at night',
      dosage_instructions: 'Apply thailam gently without vigorous rubbing.',
      follow_up_date: '2026-10-15',
      notes: 'Advised knee support bandage while walking.'
    },

    // Patient 4: Sunita Das
    {
      patient_aadhar: '456789012345',
      doctor_id: doc2.id,
      ayush_system: 'Yoga & Naturopathy',
      chief_complaint: 'Irregular menstrual cycle and weight gain (PCOS management)',
      symptoms: 'Delayed periods by 45-60 days, facial acne, lethargy',
      examination_findings: 'BMI 27.4, abdominal fat deposition, mild hirsutism',
      diagnosis: 'Metabolic Dysregulation & PCOS (Artava Kshaya correlate)',
      treatment_plan: 'Dynamic Yoga Kriya, Surya Namaskar series, and fasting therapy',
      medicines_prescribed: '1. 12 rounds of Surya Namaskar daily\n2. Butterfly pose (Bhadrasana) 10 mins daily\n3. Lemon-Honey warm water morning detox drink\n4. Spearmint herbal tea twice daily',
      dosage_instructions: 'Follow low-GI plant-focused diet. No sugar/processed flour.',
      follow_up_date: '2026-09-28',
      notes: 'Encouraged tracking cycle dates on mobile app.'
    },
    {
      patient_aadhar: '456789012345',
      doctor_id: doc1.id,
      ayush_system: 'Ayurveda',
      chief_complaint: 'Amenorrhea follow-up and pelvic congestion',
      symptoms: 'Dull pain in lower abdomen, feeling of heaviness',
      examination_findings: 'Kapha-Vata Nadi, abdominal palpation shows no acute mass',
      diagnosis: 'Artava Kshaya (Oligomenorrhea)',
      treatment_plan: 'Raktabhisarana and Artavajanana therapy',
      medicines_prescribed: '1. Ashokarishta - 20ml with equal warm water after meals\n2. Kanchanar Guggulu - 2 tabs twice daily\n3. Shatavari Churna - 3g with warm milk',
      dosage_instructions: 'Take medicines regularly for 3 menstrual cycles.',
      follow_up_date: '2026-10-20',
      notes: 'Pelvic ultrasound advised if periods delayed beyond 60 days.'
    },
    {
      patient_aadhar: '456789012345',
      doctor_id: doc1.id,
      ayush_system: 'Homeopathy',
      chief_complaint: 'Acne vulgaris on forehead and chin',
      symptoms: 'Pustular acne outbreaks before menstrual cycles',
      examination_findings: 'Multiple inflammatory papules and comedones on face',
      diagnosis: 'Acne Hormonal (Pulsatilla profile)',
      treatment_plan: 'Constitutional Homeopathic Therapy',
      medicines_prescribed: '1. Pulsatilla 30C - 4 globules morning empty stomach\n2. Berberis Aquifolium Q - 10 drops in 1/4th glass water twice daily',
      dosage_instructions: 'Apply dilute Berberis Aquifolium externally with cotton clean skin.',
      follow_up_date: '2026-10-18',
      notes: 'Skin redness reduced significantly.'
    },

    // Patient 5: Vikram Gupta
    {
      patient_aadhar: '567890123456',
      doctor_id: doc1.id,
      ayush_system: 'Ayurveda',
      chief_complaint: 'Cervical spondylosis and neck stiffness with radiation to arm',
      symptoms: 'Pain radiating to right shoulder and forearm, tingling in index finger',
      examination_findings: 'Cervical range of motion restricted by 30%. Spurling test positive right.',
      diagnosis: 'Greeva Stambha / Cervical Radiculopathy',
      treatment_plan: 'Greeva Basti, Abhyanga, and Vata Shamana Yogas',
      medicines_prescribed: '1. Maha Rasnadi Kwath - 20ml twice daily\n2. Sameer Pannag Ras - 1 tab morning\n3. Ksheerabala 101 Aavarti drops - 5 drops with warm milk at night',
      dosage_instructions: 'Avoid bending neck forward for prolonged computer hours. Use cervical collar during travel.',
      follow_up_date: '2026-09-22',
      notes: 'Scheduled for 5 sessions of Greeva Basti with Sahacharadi Tailam.'
    },
    {
      patient_aadhar: '567890123456',
      doctor_id: doc2.id,
      ayush_system: 'Yoga & Naturopathy',
      chief_complaint: 'Postural correction for neck pain and ergonomics counseling',
      symptoms: 'Forward head posture, tight chest muscles, weak upper back',
      examination_findings: 'Upper Cross Syndrome signs present. Thoracic extension limited.',
      diagnosis: 'Upper Cross Postural Syndrome',
      treatment_plan: 'Ergonomic rehabilitation and isometric neck exercises',
      medicines_prescribed: '1. Isometric neck strengthening (10 reps 3x daily)\n2. Bhujangasana & Gomukhasana (15 mins)\n3. Hot compress on neck (15 mins bedtime)',
      dosage_instructions: 'Adjust monitor height to eye level at workplace.',
      follow_up_date: '2026-10-10',
      notes: 'Patient adjusted workstation chair and monitor height.'
    },
    {
      patient_aadhar: '567890123456',
      doctor_id: doc2.id,
      ayush_system: 'Unani',
      chief_complaint: 'Chronic tension headache associated with neck pain',
      symptoms: 'Band-like tightness around forehead, worse in evening',
      examination_findings: 'Nabz: Sareea, occipital muscle tenderness',
      diagnosis: 'Suda-e-Yabis (Dry Tension Headache)',
      treatment_plan: 'Tarteeb (Hydration/Moistening) & Nutooh (Fomentation)',
      medicines_prescribed: '1. Khamira Gaozaban Ambari - 5g at bedtime\n2. Roghan-e-Badaam Shirin - 5ml in warm milk at night & 2 drops per nostril',
      dosage_instructions: 'Massage Roghan-e-Badaam gently on temples.',
      follow_up_date: '2026-10-25',
      notes: 'Headache frequency dropped from daily to once a week.'
    }
  ];

  for (const cData of casesData) {
    await CaseSheet.create(cData);
  }
  console.log(`  + Created ${casesData.length} comprehensive case sheets across AYUSH systems!`);

  console.log('✅ Seed completed successfully!');
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
