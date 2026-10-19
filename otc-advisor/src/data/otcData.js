// Static reference dataset of common over-the-counter (OTC) medicines.
// FOR EDUCATIONAL USE ONLY. Dosing shown is a general adult reference based on
// publicly available OTC product labeling. Always confirm with the product
// label, a pharmacist, or a clinician before taking any medication.

export const symptoms = [
  { id: 'headache', label: 'Headache' },
  { id: 'fever', label: 'Fever' },
  { id: 'cough', label: 'Cough' },
  { id: 'sore-throat', label: 'Sore throat' },
  { id: 'runny-nose', label: 'Runny nose / sneezing (allergy)' },
  { id: 'nasal-congestion', label: 'Nasal congestion' },
  { id: 'heartburn', label: 'Heartburn / acid reflux' },
  { id: 'diarrhea', label: 'Diarrhea' },
  { id: 'constipation', label: 'Constipation' },
  { id: 'muscle-pain', label: 'Muscle / body aches' },
  { id: 'nausea', label: 'Nausea / motion sickness' },
  { id: 'itching', label: 'Itching / mild allergic skin reaction' },
];

// Each recommendation links a symptom to one or more OTC options.
// `drugs` entries include a reference (label source) for traceability.
export const recommendations = {
  headache: [
    {
      drug: 'Acetaminophen (Tylenol)',
      adultDose: '325–650 mg every 4–6 hours as needed. Max 3,000 mg/day.',
      notes: 'Gentle on the stomach. Avoid alcohol; watch total daily dose across combo products.',
      reference: 'OTC label – acetaminophen (APAP) 500 mg tablets',
    },
    {
      drug: 'Ibuprofen (Advil, Motrin)',
      adultDose: '200–400 mg every 4–6 hours as needed. Max 1,200 mg/day OTC.',
      notes: 'Take with food. Avoid if you have ulcers, kidney disease, or are on blood thinners.',
      reference: 'OTC label – ibuprofen 200 mg tablets',
    },
  ],
  fever: [
    {
      drug: 'Acetaminophen (Tylenol)',
      adultDose: '650 mg every 4–6 hours as needed. Max 3,000 mg/day.',
      notes: 'Preferred when NSAIDs are not suitable.',
      reference: 'OTC label – acetaminophen 500 mg tablets',
    },
    {
      drug: 'Ibuprofen (Advil)',
      adultDose: '200–400 mg every 4–6 hours as needed. Max 1,200 mg/day OTC.',
      notes: 'Take with food and water.',
      reference: 'OTC label – ibuprofen 200 mg tablets',
    },
  ],
  cough: [
    {
      drug: 'Dextromethorphan (Delsym, Robitussin DM)',
      adultDose: '10–20 mg every 4 hours, or 30 mg every 6–8 hours. Max 120 mg/day.',
      notes: 'For dry cough. Do not combine with MAOIs.',
      reference: 'OTC label – dextromethorphan HBr',
    },
    {
      drug: 'Guaifenesin (Mucinex)',
      adultDose: '200–400 mg every 4 hours. Max 2,400 mg/day.',
      notes: 'Expectorant for chesty/productive cough. Drink plenty of water.',
      reference: 'OTC label – guaifenesin 400 mg',
    },
  ],
  'sore-throat': [
    {
      drug: 'Benzocaine lozenges (Cepacol)',
      adultDose: '1 lozenge dissolved slowly every 2 hours as needed.',
      notes: 'Local numbing relief. Stop if irritation worsens.',
      reference: 'OTC label – benzocaine lozenge',
    },
    {
      drug: 'Ibuprofen (Advil)',
      adultDose: '200–400 mg every 4–6 hours as needed. Max 1,200 mg/day OTC.',
      notes: 'Reduces throat inflammation and pain. Take with food.',
      reference: 'OTC label – ibuprofen 200 mg tablets',
    },
  ],
  'runny-nose': [
    {
      drug: 'Loratadine (Claritin)',
      adultDose: '10 mg once daily.',
      notes: 'Non-drowsy antihistamine for allergy symptoms.',
      reference: 'OTC label – loratadine 10 mg',
    },
    {
      drug: 'Cetirizine (Zyrtec)',
      adultDose: '10 mg once daily.',
      notes: 'May cause mild drowsiness in some people.',
      reference: 'OTC label – cetirizine 10 mg',
    },
  ],
  'nasal-congestion': [
    {
      drug: 'Pseudoephedrine (Sudafed)',
      adultDose: '60 mg every 4–6 hours. Max 240 mg/day.',
      notes: 'Behind-the-counter in many regions. Avoid with high blood pressure.',
      reference: 'OTC label – pseudoephedrine 30/60 mg',
    },
    {
      drug: 'Oxymetazoline nasal spray (Afrin)',
      adultDose: '2–3 sprays per nostril every 10–12 hours. Do NOT use more than 3 days.',
      notes: 'Rebound congestion if used longer than 3 days.',
      reference: 'OTC label – oxymetazoline 0.05%',
    },
  ],
  heartburn: [
    {
      drug: 'Calcium carbonate (Tums)',
      adultDose: '500–1,000 mg as symptoms occur. Max 7,000 mg/day.',
      notes: 'Fast, short-acting relief.',
      reference: 'OTC label – calcium carbonate antacid',
    },
    {
      drug: 'Famotidine (Pepcid)',
      adultDose: '10–20 mg up to twice daily.',
      notes: 'H2 blocker for longer relief. Can take before trigger meals.',
      reference: 'OTC label – famotidine 10/20 mg',
    },
  ],
  diarrhea: [
    {
      drug: 'Loperamide (Imodium)',
      adultDose: '4 mg initially, then 2 mg after each loose stool. Max 8 mg/day OTC.',
      notes: 'Do not use if there is bloody stool or high fever. Stay hydrated.',
      reference: 'OTC label – loperamide 2 mg',
    },
  ],
  constipation: [
    {
      drug: 'Polyethylene glycol 3350 (MiraLAX)',
      adultDose: '17 g (1 capful) dissolved in liquid once daily.',
      notes: 'Osmotic laxative. Effect in 1–3 days. Use up to 7 days OTC.',
      reference: 'OTC label – PEG 3350',
    },
    {
      drug: 'Docusate sodium (Colace)',
      adultDose: '50–300 mg daily in divided doses.',
      notes: 'Stool softener. Drink plenty of fluids.',
      reference: 'OTC label – docusate 100 mg',
    },
  ],
  'muscle-pain': [
    {
      drug: 'Ibuprofen (Advil)',
      adultDose: '200–400 mg every 4–6 hours as needed. Max 1,200 mg/day OTC.',
      notes: 'Anti-inflammatory. Take with food.',
      reference: 'OTC label – ibuprofen 200 mg tablets',
    },
    {
      drug: 'Topical diclofenac gel (Voltaren)',
      adultDose: 'Apply to affected area up to 4 times daily per dosing card.',
      notes: 'Good for localized joint/muscle pain with fewer systemic effects.',
      reference: 'OTC label – diclofenac 1% gel',
    },
  ],
  nausea: [
    {
      drug: 'Dimenhydrinate (Dramamine)',
      adultDose: '50–100 mg every 4–6 hours. Max 400 mg/day.',
      notes: 'For motion sickness. Causes drowsiness; avoid driving.',
      reference: 'OTC label – dimenhydrinate 50 mg',
    },
    {
      drug: 'Meclizine (Bonine)',
      adultDose: '25–50 mg once daily, 1 hour before travel.',
      notes: 'Less sedating alternative for motion sickness.',
      reference: 'OTC label – meclizine 25 mg',
    },
  ],
  itching: [
    {
      drug: 'Diphenhydramine (Benadryl)',
      adultDose: '25–50 mg every 4–6 hours. Max 300 mg/day.',
      notes: 'Causes drowsiness. Good for itching but sedating.',
      reference: 'OTC label – diphenhydramine 25 mg',
    },
    {
      drug: 'Hydrocortisone 1% cream',
      adultDose: 'Apply a thin layer to affected skin 1–4 times daily.',
      notes: 'For localized itch/rash. Do not use on broken skin long term.',
      reference: 'OTC label – hydrocortisone 1% topical',
    },
  ],
};

export function getRecommendations(symptomIds) {
  const results = [];
  const seen = new Set();
  for (const id of symptomIds) {
    const list = recommendations[id] || [];
    for (const rec of list) {
      const key = `${id}::${rec.drug}`;
      if (!seen.has(key)) {
        seen.add(key);
        results.push({ symptomId: id, ...rec });
      }
    }
  }
  return results;
}

export function getSymptomLabel(id) {
  const match = symptoms.find((s) => s.id === id);
  return match ? match.label : id;
}
