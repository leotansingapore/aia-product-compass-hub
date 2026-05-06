// Definitions of the 73 Critical Illnesses covered by AIA Ultimate Critical Cover
// (UCC). Source: AIA UCC Product Summary v1.0 (012024), Appendix 1.
// Severity levels: Early Stage / Intermediate Stage / Major Stage.

export interface CriticalIllnessStage {
  /** Whether the policy covers this stage for this condition. */
  covered: boolean;
  /** Full definition text including the stage's medical heading. */
  definition: string;
}

export interface CriticalIllnessCondition {
  /** 1-73, matches Appendix 1 numbering in the AIA Product Summary. */
  number: number;
  /** Condition name as printed in the Product Summary. */
  name: string;
  earlyStage: CriticalIllnessStage;
  intermediateStage: CriticalIllnessStage;
  majorStage: CriticalIllnessStage;
}

export const ULTIMATE_CRITICAL_COVER_CONDITIONS: CriticalIllnessCondition[] = [
  {
    number: 1,
    name: `Acquired Brain Damage`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Acquired Brain Damage Acquired Brain Damage refers to a condition where all of the following conditions must be met:

• the Insured has attained the age of four (4) years old or above;

• brain imaging studies and neuro-psychological testing appropriate to the Insured’s age have confirmed the presence of moderate to severe brain damage; and

• the development of the Insured is delayed by the equivalent of at least two (2) years and there is a need for special childcare and special schooling as confirmed by a Specialist in the relevant field. Brain damage as a result of congenital causes is excluded. Coverage will end on the policy anniversary occurring on or immediately following the Insured’s 21st birthday.`,
    },
  },
  {
    number: 2,
    name: `Acute Severe Ulcerative Colitis`,
    earlyStage: {
      covered: true,
      definition: `Acute Ulcerative Colitis The Acute Severe Ulcerative Colitis is defined as emergency medical condition and requires hospitalization for prompt treatment.

The unequivocal Diagnosis of Acute Severe Ulcerative Colitis is finalised by gastroenterologist and being supported by all of following criteria:

• Frequency of bloody stools (⩾6 per day) and

• at least one marker of systemic toxicity: pulse rate >90 bpm, temperature >37.8°C, haemoglobin <10.5 g/dl and/or an ESR >30 mm/h.`,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Acute Severe Ulcerative Colitis The Acute Severe Ulcerative Colitis is defined as emergency medical condition and requires hospitalization for prompt treatment.

The unequivocal Diagnosis of Acute Severe Ulcerative Colitis is finalised by gastroenterologist and being supported by all of following criteria:

• Frequency of bloody stools (⩾6 per day) and

• at least one marker of systemic toxicity: pulse rate >90 bpm, temperature >37.8°C, haemoglobin <10.5 g/dl and/or an ESR >30 mm/h,

• Ulcerative Colitis is uncontrolled by medication and surgery of colectomy is done.

• The Crohn’s disease is excluded.`,
    },
  },
  {
    number: 3,
    name: `Addison disease or Autoimmune Adrenalitis`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Addison disease or Autoimmune Adrenalitis Addison disease (or Addison's disease, autoimmune adrenalitis) is adrenocortical insufficiency due to the destruction or dysfunction of the entire adrenal cortex. The unequivocal Diagnosis is confirmed by endocrinologist. The Diagnosis of Addison disease (or Addison's disease, autoimmune adrenalitis) must be supported by all of following:

• There is raised of blood ACTH greater than 50 pg/ml

• There is evidence of no response of raised aldosterone (serum cortisone) with ACTH test.

• There is a need for life long glucocorticoid and mineral corticoid replacement therapy. Only autoimmune cause of primary adrenal insufficiency is included. All other causes of adrenal insufficiency are excluded.`,
    },
  },
  {
    number: 4,
    name: `Adrenalectomy for Adrenal Adenoma`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Adrenalectomy for Adrenal Adenoma The actual undergoing of Adrenalectomy for treatment of poorly controlled systemic hypertension that was secondary to an aldosterone secreting adrenal adenoma and was uncontrolled by medical therapy. The adrenalectomy would have to be deemed necessary for the management of poorly controlled hypertension by a Specialist.`,
    },
  },
  {
    number: 5,
    name: `Alzheimer's Disease/ Severe Dementia`,
    earlyStage: {
      covered: true,
      definition: `Diagnosis of Dementia including Alzheimer’s Disease Diagnosis of dementia by neurological assessment by an appropriate Specialist confirming cognitive impairment characterised by a Mini Mental State Examination score of 24 or less out of 30 or assessed by two (2) neuropsychometric tests performed six (6) months apart with a battery of tests which clearly define the severity of the impairment. The Insured must have been placed on disease modifying treatment prescribed by a Specialist and must be under the continuous care of a Specialist.

Coverage on Early Stage Alzheimer’s Disease expires on the Policy Anniversary occurring on or immediately following the Insured’s 85th birthday.

The following are excluded:

• Drug or alcohol related brain damage`,
    },
    intermediateStage: {
      covered: true,
      definition: `Moderately Severe Alzheimer’s Disease A definite Diagnosis of Alzheimer’s disease or dementia due to irreversible organic brain disorders by a consultant neurologist. The Mini- mental exam score must be less than 20 out of 30 or an equivalent of this score using other Alzheimer’s tests. There must also be permanent clinical loss of the ability to do all the following:

• Remember;

• Reason; and

• Perceive, understand, express and give effect to ideas.

This Diagnosis must be supported by the clinical confirmation of an appropriate consultant and supported by our appointed doctor.

The following are excluded:

• Non-organic diseases such as neurosis and psychiatric illnesses; and

• Drug or alcohol related brain damage.`,
    },
    majorStage: {
      covered: true,
      definition: `Alzheimer’s Disease / Severe Dementia Deterioration or loss of cognitive function as confirmed by clinical evaluation and imaging tests, arising from Alzheimer's disease or irreversible organic disorders, resulting in significant reduction in mental and social functioning requiring the continuous supervision of the Insured. This Diagnosis must be supported by the clinical confirmation of an appropriate consultant and supported by our appointed Physician.

The following are excluded:

• Non-organic diseases such as neurosis and psychiatric illnesses; and

• Alcohol related brain damage.`,
    },
  },
  {
    number: 6,
    name: `Angioplasty & Other Invasive Treatment for Coronary Artery`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Angioplasty & Other Invasive Treatment for Coronary Artery The actual undergoing of balloon angioplasty or similar intra arterial catheter procedure to correct a narrowing of minimum 60% stenosis, of one (1) or more major coronary arteries as shown by angiographic evidence. The revascularisation must be considered medically necessary by a consultant cardiologist. Coronary arteries herein refer to left main stem, left anterior descending, circumflex and right coronary artery. Diagnostic angiography is excluded.`,
    },
  },
  {
    number: 7,
    name: `Benign Brain Tumour`,
    earlyStage: {
      covered: true,
      definition: `Surgical Removal of Pituitary Tumour The actual undergoing of surgical removal of pituitary tumour necessitated as a result of symptoms associated with increased intracranial pressure caused by the tumour. The presence of the underlying tumour must be confirmed by imaging studies such as CT scan or MRI. Partial removal of pituitary microadenoma is specifically excluded.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Surgical Removal of Pituitary Tumour (by Open Craniotomy) The actual undergoing of surgical removal of a pituitary tumour by open craniotomy necessitated as a result of symptoms associated with increased intracranial pressure caused by the tumour or where surgical removal is considered necessary upon the advice of a consultant endocrinologist. The presence of the underlying tumour must be confirmed by imaging studies such as CT scan or MRI. Surgical removal of the pituitary by transsphenoidal hypophysectomy is excluded.

Surgical Removal of Pituitary Tumour (by Transsphenoidal/Transn asal Hypophysectomy) The actual undergoing of surgical removal of a pituitary tumour by transsphenoidal /

transnasal

hypophysectomy

necessitated as a result of

symptoms associated with increased intracranial pressure caused by the tumour or where surgical removal is considered necessary upon the advice of a consultant endocrinologist. The presence of the underlying tumour must be confirmed by imaging studies such as CT scan or MRI.`,
    },
    majorStage: {
      covered: true,
      definition: `Benign Brain Tumour Benign brain tumour means a non-malignant tumour located in the cranial vault and limited to the brain, meninges or cranial nerves where all of the following conditions are met:

• It has undergone surgical removal or, if inoperable, has caused a Permanent Neurological Deficit; and

• Its presence must be confirmed by a consultant neurologist or neurosurgeon and supported by findings on Magnetic Resonance Imaging, Computerised Tomography, or other reliable imaging techniques.

The following are excluded:

• Cysts;

• Abscess;

• Angioma;

• Granulomas;

• Vascular Malformations;

• Haematomas; and

• Tumours of the pituitary

gland, spinal cord and

skull base.`,
    },
  },
  {
    number: 8,
    name: `Biliary Atresia`,
    earlyStage: {
      covered: true,
      definition: `Biliary Atresia (on Diagnosis) Biliary atresia (BA) is a progressive, idiopathic, fibro-obliterative disease of the extra-hepatic biliary tree that presents with biliary obstruction.

The Diagnosis should be confirmed by a gastroenterologist with supporting evidence including imaging, laboratory tests and liver biopsy.

Biliary atresia due to other disease is excluded.`,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Biliary Atresia having undergone Liver transplantation Biliary atresia (BA) is a progressive, idiopathic, fibro-obliterative disease of the extra-hepatic biliary tree that presents with biliary obstruction and has undergone liver transplantation or is on a registered liver transplantation waiting list.

The Diagnosis should be confirmed by a gastroenterologist with supporting evidence including imaging, laboratory tests and liver biopsy. Biliary atresia due to other disease is excluded.`,
    },
  },
  {
    number: 9,
    name: `Blindness (Irreversible Loss of Sight)`,
    earlyStage: {
      covered: true,
      definition: `Irreversible Loss of Sight in One Eye Permanent and irreversible loss of sight in one (1) eye as a result of illness or accident to the extent that even when tested with the use of visual aids, vision is measured at 6/60 or worse in one eye using a Snellen eye chart or equivalent test, or visual field of 20 degrees or less in one eye. The blindness must be confirmed by an ophthalmologist.

Blindness resulting from alcohol or drug misuse will be excluded.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Optic Nerve Atrophy with Low Vision The unequivocal Diagnosis of optic nerve atrophy affecting one (1) or both eyes. There must also be permanent and irreversible loss of sight to both eyes to the extent that even when tested with the use of visual aids, vision is measured at 6/60 or worse in the worse eye using a Snellen eye chart. The optic nerve atrophy and degree of visual loss of sight must be certified by an ophthalmologist.

Optic nerve atrophy resulting from alcohol or drug misuse will be excluded.`,
    },
    majorStage: {
      covered: true,
      definition: `Blindness (Irreversible Loss of Sight) Permanent and irreversible loss of sight in both eyes as a result of illness or accident to the extent that even when tested with the use of visual aids, vision is measured at 6/60 or worse in both eyes using a Snellen eye chart or equivalent test, or visual field of 20 degrees or less in both eyes. The blindness must be confirmed by an ophthalmologist.

The blindness must not be correctable by surgical procedures, implants or any other means.`,
    },
  },
  {
    number: 10,
    name: `Brain Surgery`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Brain Surgery Brain Surgery refers to the actual undergoing of a craniotomy and medically necessary surgery to the brain under general anaesthesia on the recommendation by a qualified Specialist in the relevant field. Brain Surgery as a result of an accident or burr hole surgery solely to remove a blood clot is excluded.`,
    },
  },
  {
    number: 11,
    name: `Chronic Auto-Immune Hepatitis`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Chronic Auto-Immune Hepatitis A chronic necro- inflammatory liver disorder of unknown cause associated with circulating auto-antibodies and a high serum globulin level. The Diagnosis must be based on all of the following criteria:

• hyper- gammaglobulinaemia

• the presence of at least one of the following auto- antibodies:

- Anti-Nuclear Antibody;

- Anti-smooth muscle antibodies;

- Anti-actin antibodies;

- Anti-LKM-1 antibodies;

- Anti- LC1 antibodies; or

- Anti-SLA/LP antibodies

• Liver Biopsy confirmation of the Diagnosis of auto- immune hepatitis This is only covered if the Insured is treated with Immunosuppressive therapy for six (6) months duration or is documented to be under the care of Specialist in gastroenterology or hepatology for six (6) months duration.`,
    },
  },
  {
    number: 12,
    name: `Chronic Relapsing Pancreatitis`,
    earlyStage: {
      covered: true,
      definition: `Acute Necrohemorrhagic Pancreatitis Acute inflammation and necrosis of pancreas parenchyma, focal enzyme necrosis of pancreatic fat and haemorrhage due to blood vessel necrosis, where all of the following criteria are met:

•   The necessary treatment is surgical clearance of necrotic tissue; and

•   The Diagnosis is based on histopathological features and confirmed by a Specialist in gastroenterology.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Acute Necrohemorrhagic Pancreatitis with Pancreatectomy Acute inflammation and necrosis of pancreas parenchyma, focal enzyme necrosis of pancreatic fat and haemorrhage due to blood vessel necrosis, where all of the following criteria are met:

•   The necessary treatment is partial or total pancreatectomy; and

•   The Diagnosis is based on histopathological features and confirmed by a Specialist in gastroenterology.`,
    },
    majorStage: {
      covered: true,
      definition: `Chronic Relapsing Pancreatitis Multiple attacks of pancreatitis resulting in pancreatic dysfunction causing malabsorption needing enzyme replacement therapy.

The Diagnosis must be made by a gastroenterologist and supported by appropriate investigation results.

Chronic Relapsing Pancreatitis caused by alcohol use is excluded.`,
    },
  },
  {
    number: 13,
    name: `Coma`,
    earlyStage: {
      covered: true,
      definition: `Coma for 48 hours Coma that persists for at least 48 hours. This Diagnosis must be supported by evidence of all of the following:

• No response to external stimuli for at least 48 hours;

• The use of life support measures to sustain life; and

• Brain damage resulting in Permanent Neurological Deficit which must be assessed at least 30 days after the onset of the coma.

Coma resulting directly from alcohol or drug abuse is excluded.

Medically induced coma also does not fulfil this definition.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Coma for 72 hours Coma that persists for at least 72 continuous hours. This Diagnosis must be supported by evidence of all of the following:

• No response to external stimuli for at least 72 hours;

• The use of life support measures to sustain life; and

• Brain damage resulting in Permanent Neurological Deficit which must be assessed at least 30 days after the onset of the coma.

Coma resulting directly from alcohol or drug abuse is excluded. Medically induced coma also does not fulfil this definition. Severe Epilepsy Severe epilepsy confirmed by all of the following:

• Diagnosis made by a Specialist in the relevant field by the use of electroencephalography (EEG), magnetic resonance imaging (MRI), positron emission tomography (PET) or any other appropriate diagnostic test that is available;

• There must be documentation of recurrent unprovoked tonic-clonic or grand mal seizures of more than five (5) attacks per week, and be known to be resistant to optimal therapy as confirmed by drug serum-level testing; and

• The Insured must have been taking at least two (2) prescribed antiepileptic (anticonvulsant) medications for at least six (6) months on the recommendation of a Specialist in the relevant field. Febrile or absence (petit mal) seizures alone will not satisfy the requirement of this definition.`,
    },
    majorStage: {
      covered: true,
      definition: `Coma A coma that persists for at least 96 hours. This Diagnosis must be supported by evidence of all of the following:

• No response to external stimuli for at least 96 hours;

• Life support measures are necessary to sustain life; and

• Brain damage resulting in Permanent Neurological Deficit which must be assessed at least 30 days after the onset of the coma.

For the above definition, medically induced coma and coma resulting directly from alcohol or drug abuse are excluded.`,
    },
  },
  {
    number: 14,
    name: `Coronary Artery By-pass Surgery`,
    earlyStage: {
      covered: true,
      definition: `Keyhole Coronary By- pass Surgery or Coronary Artery Atherectomy or Myocardial Laser Revascularisation or Enhanced External Counterpulsation

The actual undergoing for the first time for the correction of the narrowing or blockage of one (1) or more coronary arteries via "Keyhole" surgery, Atherectomy, Myocardial laser revascularisation or Enhanced external counterpulsation.

All other surgical procedures will be excluded from this benefit.`,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Coronary Artery By-pass Surgery The actual undergoing of open-chest surgery or Minimally Invasive Direct Coronary Artery Bypass surgery to correct the narrowing or blockage of one (1) or more coronary arteries with bypass grafts. This Diagnosis must be supported by angiographic evidence of significant coronary artery obstruction and the procedure must be considered medically necessary by a consultant cardiologist.

Angioplasty and all other intra arterial, catheter based techniques, ‘keyhole’ or laser procedures are excluded.`,
    },
  },
  {
    number: 15,
    name: `Creutzfeldt-Jakob Disease`,
    earlyStage: {
      covered: true,
      definition: `Less Severe Creutzfeldt-Jakob Disease An incurable brain infection that causes rapidly progressive deterioration of mental function and movement, which is unequivocally Diagnosed by a consultant who is a consultant neurologist as Creutzfeldt-Jakob disease based on clinical assessment, EEG, imaging or lumbar puncture.

Disease caused by human growth hormone treatment is excluded.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Moderately Severe Creutzfeldt-Jakob Disease The occurrence of Creutzfeldt-Jakob Disease or Variant Creutzfeldt-Jakob Disease where there is an associated neurological deficit, which is solely responsible for a permanent inability to perform, without assistance, at least two (2) of the six (6) "Activities of Daily Living".

Disease caused by human growth hormone treatment is excluded.`,
    },
    majorStage: {
      covered: true,
      definition: `Creutzfeldt-Jakob Disease The occurrence of Creutzfeldt-Jakob Disease or Variant Creutzfeldt- Jakob Disease where there is an associated neurological deficit, which is solely responsible for a permanent inability to perform at least three (3) of the six (6) “Activities of Daily Living”.

Disease caused by human growth hormone treatment is excluded.`,
    },
  },
  {
    number: 16,
    name: `Deafness (Irreversible Loss of Hearing)`,
    earlyStage: {
      covered: true,
      definition: `Partial Loss of Hearing Permanent binaural hearing loss with the loss of at least 60 decibels in all frequencies of hearing as a result of illness or accident. The hearing loss must be established by a Specialist in the relevant field and supported by an objective diagnostic test to indicate the quantum loss of hearing.

Cavernous Sinus Thrombosis Surgery The actual undergoing of a surgical drainage for cavernous sinus thrombosis. The presence of Cavernous Sinus Thrombosis as well as the requirement for surgical intervention must be certified to be absolutely necessary by a Specialist in the relevant field.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Cochlear Implant Surgery The actual undergoing of a surgical cochlea implant as a result of permanent damage to the cochlea or auditory nerve. The surgical procedure as well as the insertion of the implant must be certified to be absolutely necessary by a Specialist in the relevant field.`,
    },
    majorStage: {
      covered: true,
      definition: `Deafness (Irreversible Loss of Hearing) Total and irreversible loss of hearing in both ears as a result of illness or accident. This Diagnosis must be supported by audiometric and sound threshold tests provided and certified by an Ear, Nose, Throat (ENT) Specialist.

Total means “the loss of at least 80 decibels in all frequencies of hearing”.

Irreversible means “cannot be reasonably restored to at least 40 decibels by medical treatment, hearing aid and/or surgical procedures consistent with the current standard of the medical services available in Singapore after a period of six (6) months from the date of intervention.”`,
    },
  },
  {
    number: 17,
    name: `Ebola`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Ebola Infection with the Ebola virus where the following conditions are met:

• presence of the Ebola virus has been confirmed by laboratory testing; and

• there are ongoing complications of the infection persisting beyond 30 days from the onset of symptoms.`,
    },
  },
  {
    number: 18,
    name: `Elephantiasis`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Elephantiasis The end-stage lesion of filariasis, characterised by massive swelling in the tissues of the body as a result of obstructed circulation in the blood or lymphatic vessels. Unequivocal Diagnosis of elephantiasis must be:

• clinically confirmed by a Physician in the appropriate medical specialty; and

• supported by laboratory confirmation of microfilariae Lymphedema caused by infection with any other disease(s), trauma, post- operative scarring, congestive heart failure, or congenital lymphatic system abnormalities is excluded.`,
    },
  },
  {
    number: 19,
    name: `End Stage Kidney Failure`,
    earlyStage: {
      covered: true,
      definition: `Surgical Removal of One Kidney The complete surgical removal of one (1) kidney necessitated by any illness or accident. The need for the surgical removal of the kidney must be certified to be absolutely necessary by a Specialist in the relevant field.

Kidney donation is excluded.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Chronic Kidney Disease A nephrologist must make a Diagnosis of chronic kidney disease with permanently impaired renal function. There must be laboratory evidence that shows that renal function is severely decreased with an eGFR less than 15ml/min/1.73m2 body surface area, persisting for a period of six (6) months or more.`,
    },
    majorStage: {
      covered: true,
      definition: `End Stage Kidney Failure Chronic irreversible failure of both kidneys requiring either permanent renal dialysis or kidney transplantation.`,
    },
  },
  {
    number: 20,
    name: `End Stage Liver Failure`,
    earlyStage: {
      covered: true,
      definition: `Liver Surgery Partial hepatectomy of at least one (1) entire lobe of the liver that has been found necessary as a result of illness or accident of the Insured.

Liver disease secondary to alcohol or drug abuse is excluded. Liver surgery in the presence of HIV infection is also excluded.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Liver Cirrhosis Cirrhosis of the liver with a HAI-Knodell Scores of six (6) and above as evident by liver biopsy. The Diagnosis must be unequivocally confirmed by a Specialist in the relevant field and based on the histological findings of the liver biopsy.

Liver disease secondary to alcohol or drug abuse is excluded. Liver cirrhosis in the presence of HIV infection is also excluded.`,
    },
    majorStage: {
      covered: true,
      definition: `End Stage Liver Failure End stage liver failure as evidenced by all of the following:

• Permanent jaundice;

• Ascites; and

• Hepatic encephalopathy.

Liver disease secondary to alcohol or drug abuse is excluded.`,
    },
  },
  {
    number: 21,
    name: `End Stage Lung Disease`,
    earlyStage: {
      covered: true,
      definition: `Severe Asthma Evidence of an acute attack of Severe Asthma with persistent status asthmaticus that requires hospitalization and endotracheal intubation and mechanical ventilation for a continuous period of at least four (4) hours on the advice of a Specialist in the relevant field.

Insertion of a Vena Cava Filter The surgical insertion of a vena cava filter after there has been documented proof of recurrent pulmonary emboli. The need for the insertion of a vena cava filter must be certified to be absolutely necessary by a Specialist in the relevant field.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Surgical Removal of One Lung Complete surgical removal of a lung as a result of an illness or an accident of the Insured.

Partial removal of a lung is not included in this benefit.`,
    },
    majorStage: {
      covered: true,
      definition: `End Stage Lung Disease End stage lung disease, causing chronic respiratory failure. This Diagnosis must be supported by evidence of all of the following:

• FEV1 test results which are consistently less than one (1) litre;

• Permanent supplementary oxygen therapy for hypoxemia;

• Arterial blood gas analyses with partial oxygen pressures of 55mmHg or less (PaO2 <=55mmHg); and

• Dyspnea at rest.

The Diagnosis must be confirmed by a respiratory Physician.`,
    },
  },
  {
    number: 22,
    name: `Fulminant Hepatitis`,
    earlyStage: {
      covered: true,
      definition: `Biliary Tract Reconstruction Surgery Biliary tract reconstruction surgery involving choledochoenterostomy (choledochojejunostomy or choledochoduodenostom y) for the treatment of biliary tract disease, including biliary atresia, that is not amenable to other surgical or endoscopic measures. The procedure must be considered the most appropriate treatment by a Specialist in hepatobiliary disease. This benefit is not payable for the consequences of gall stone disease or cholangitis.

Hepatitis with Cirrhosis A submassive necrosis of the liver by the Hepatitis virus leading to cirrhosis. There must be a definite Diagnosis of liver cirrhosis by a Specialist in the relevant field that must be supported by liver biopsy showing histological stage F4 by Metavir grading or a Knodell fibrosis score of 4. Liver diseases secondary to alcohol and drug abuse are excluded.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Chronic Primary Sclerosing Cholangitis This benefit is payable for chronic primary sclerosing cholangitis confirmed on cholangiogram imaging confirming progressive obliteration of the bile ducts. The Diagnosis must be made by a gastroenterologist and the condition must have progressed to the point where there is permanent jaundice. The benefit is payable only where there is a need immunosuppressive treatment, drug therapy for intractable pruritis or if biliary tract obliteration has required balloon dilation or stenting of the bile ducts. Biliary tract sclerosis or obstruction as a consequence of biliary surgery, gall stone disease, infection, inflammatory bowel disease or other secondary precipitants is excluded.`,
    },
    majorStage: {
      covered: true,
      definition: `Fulminant Hepatitis A submassive to massive necrosis of the liver by the Hepatitis virus, leading precipitously to liver failure.

This Diagnosis must be supported by all of the following:

• Rapid decreasing of liver size as confirmed by abdominal ultrasound;

• Necrosis involving entire lobules, leaving only a collapsed reticular framework;

• Rapid deterioration of liver function tests;

• Deepening jaundice; and

• Hepatic encephalopathy.`,
    },
  },
  {
    number: 23,
    name: `Generalized Tetanus`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Generalized Tetanus Tetanus is an illness characterised by an acute onset of hypertonia, painful muscular contractions (including but not limited to the muscles of the jaw and neck) and generalised muscle spasms caused by tetanus toxin that is produced by Clostridium tetani bacterium infection. The Diagnosis of Generalised Tetanus due to tetanus toxin must be confirmed by a Physician. All the following criteria must be met to qualify for this benefit:

• Constant mechanical ventilation is instituted for at least three (3) days as a medically necessary treatment for Generalised Tetanus due to tetanus toxin; and

• Tetanus immune Globulin is administered.`,
    },
  },
  {
    number: 24,
    name: `Heart Attack of Specified Severity`,
    earlyStage: {
      covered: true,
      definition: `Cardiac Pacemaker Insertion Insertion of a permanent cardiac pacemaker that is required as a result of serious cardiac arrhythmia which cannot be treated via other means. The insertion of the cardiac pacemaker must be certified to be absolutely necessary by a Specialist in the relevant field.

Cardiac pacemaker insertion in the presence of HIV infection is excluded.

Pericardiectomy The undergoing of a pericardiectomy or undergoing of any surgical procedure requiring keyhole cardiac surgery as a result of pericardial disease. Both these surgical procedures must be certified to be absolutely necessary by a consultant cardiologist.

Pericardiectomy in the presence of HIV infection is excluded.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Cardiac Defibrillator Insertion Insertion of a permanent cardiac defibrillator as a result of cardiac arrhythmia which cannot be treated via any other method. The surgical procedure must be certified to be absolutely necessary by a Specialist in the relevant field.

Cardiac defibrillator insertion in the presence of HIV infection is excluded.

Early Cardiomyopathy The unequivocal Diagnosis of cardiomyopathy which has resulted in the presence of permanent physical impairments to at least Class III of the New York Heart Association (NYHA) classification of Cardiac Impairment.

The Diagnosis must be confirmed by a Specialist in the relevant field. Cardiomyopathy that is directly related to alcohol misuse is excluded.

The NYHA Classification of Cardiac Impairment:

Class I     No limitation of physical activity. Ordinary physical activity does not cause undue fatigue, dyspnea, or anginal pain.

Class II    Slight limitation of physical activity. Ordinary physical activity results in symptoms. Class III Marked limitation of physical activity. Comfortable at rest, but less than ordinary activity causes symptoms. Class IV Unable to engage in any physical activity without discomfort. Symptoms may be present even at rest. Early cardiomyopathy in the presence of HIV infection is excluded.`,
    },
    majorStage: {
      covered: true,
      definition: `Heart Attack of Specified Severity Death of heart muscle due to ischaemia, that is evident by at least three (3) of the following criteria proving the occurrence of a new heart attack:

• History of typical chest pain;

• New characteristic electrocardiographic changes; with the development of any of the following: ST elevation or depression, T wave inversion, pathological Q waves or left bundle branch block;

• Elevation of the cardiac biomarkers, inclusive of CKMB above the generally accepted normal laboratory levels or Cardiac Troponin T or I at 0.5ng/ml and above;

• Imaging evidence of new loss of viable myocardium or new regional wall motion abnormality. The imaging must be done by consultant cardiologist specified by us.

For the above definition, the following are excluded:

• Angina;

• Heart attack of indeterminate age; and

• A rise in cardiac biomarkers or Troponin T or I following an intra- arterial cardiac procedure including, but not limited to, coronary angiography and coronary angioplasty.

Explanatory note: 0.5ng/ml = 0.5ug/L = 500pg/ml`,
    },
  },
  {
    number: 25,
    name: `HIV due to Blood Transfusion and Occupationally Acquired HIV`,
    earlyStage: {
      covered: true,
      definition: `HIV due to Assault or Occupationally Acquired HIV A) Infection with the Human Immunodeficiency Virus (HIV) which resulted from a physical or sexual assault occurring after the Issue Date, date of endorsement or Reinstatement Date of your Policy/ Supplementary Agreement (where applicable), whichever is the later, provided that all the following conditions are met:

• The incident must be reported to the appropriate authority and that a criminal case must be opened; and

• Proof of the assault giving rise to the infection must be reported to us within 30 days of the assault taking place; and

• Proof that the assault involved a definite source of the HIV infected fluids; and

• Proof of sero- conversion from HIV negative to HIV positive occurring during the 180 days after the documented assault. This proof must include a negative HIV antibody test conducted within five (5) days of the assault.

B) Infection with the Human Immunodeficiency Virus (HIV) which resulted from an accidental incident occurring after the Issue Date, date of endorsement or Reinstatement Date of your Policy/ Supplementary Agreement (where applicable), whichever is the later, whilst the Insured was carrying out the normal professional duties of his or her occupation in Singapore with the requirement that appropriate care is being exercised, provided that all the following conditions are met:

• Proof that the incident has been reported to the appropriate authority;

• Proof of the accident giving rise to the infection must be reported to us within 30 days of the accident taking place;

• Proof that the accident involved a definite source of the HIV infected fluids; and

• Proof of sero- conversion from HIV negative to HIV positive occurring during the 180 days after the documented accident. This proof must include a negative HIV antibody test conducted within five (5) days of the accident. HIV infection resulting from any other means including consensual sexual activity or the use of intravenous drug is excluded. This benefit will not apply under either section A or B where a cure has become available prior to the infection. "Cure" means any treatment that renders the HIV inactive or non-infectious.`,
    },
    intermediateStage: {
      covered: true,
      definition: `HIV due to Organ Transplant Infection with the Human Immunodeficiency Virus (HIV) through an organ transplant, provided that all of the following conditions are met:

• The organ transplant was medically necessary or given as part of a medical treatment; and

• The organ transplant was received in Singapore after the Issue Date, date of endorsement or Reinstatement Date of your Policy/ Supplementary Agreement (where applicable), whichever is the later; and

• The source of the infection is established to be from the Institution that provided the transplant and the Institution is able to trace the origin of the HIV to the infected transplanted organ.

This benefit will not apply where a cure has become available prior to the infection. "Cure" means any treatment that renders the HIV inactive or non-infectious.`,
    },
    majorStage: {
      covered: true,
      definition: `HIV Due to Blood Transfusion and Occupationally Acquired HIV A) Infection with the Human Immunodeficiency Virus (HIV) through a blood transfusion, provided that all of the following conditions are met:

• The blood transfusion was medically necessary

or given as part of a medical treatment;

• The blood transfusion was received in Singapore after the Issue Date, date of endorsement or Reinstatement Date of your Policy/ Supplementary Agreement (where applicable), whichever is the later; and

• The source of the infection is established to be from the Institution that provided the blood transfusion and the Institution is able to trace the origin of the HIV tainted blood.

B) Infection with the Human Immunodeficiency Virus (HIV) which resulted from an accident occurring after the Issue Date, date of endorsement or Reinstatement Date of your Policy/ Supplementary Agreement (where applicable), whichever is the later whilst the Insured was carrying out the normal professional duties of his or her occupation in Singapore, provided that all of the following are proven to our satisfaction:

• Proof that the accident involved a definite source of the HIV infected fluids;

• Proof of sero-conversion from HIV negative to HIV positive occurring during the 180 days after the documented accident. This proof must include a negative HIV antibody test conducted within five (5) days of the accident; and

• HIV infection resulting from any other means including sexual activity and the use of intravenous drugs is excluded.

This benefit is only payable when the occupation of the Insured is a medical practitioner, housemen, medical student, state registered nurse, medical laboratory technician, dentist (surgeon and nurse) or paramedical worker, working in medical centre or clinic (in Singapore).

This benefit will not apply under either section A or B where a cure has become available prior to the infection. “Cure” means any treatment that renders the HIV inactive or non- infectious.`,
    },
  },
  {
    number: 26,
    name: `Idiopathic Parkinson’s Disease`,
    earlyStage: {
      covered: true,
      definition: `Early Parkinson’s Disease The unequivocal Diagnosis of idiopathic Parkinson’s disease by a Specialist in the relevant field.

This Diagnosis must be supported by all of the following conditions:

• The disease cannot be controlled with medication; and

• There are signs of progressive neurological impairment

Drug-induced or toxic causes of Parkinsonism or all other causes of Parkinson’s Disease are excluded.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Moderately Severe Parkinson's Disease The unequivocal Diagnosis of idiopathic Parkinson’s disease by a Specialist in the relevant field.

This Diagnosis must be supported by all of the following conditions:

• The disease cannot be controlled with medication; and

• Inability of the Insured to perform (whether aided or unaided) at least two (2) of the six (6) “Activities of Daily Living” for a continuous period of at least six (6) months.

Drug-induced or toxic causes of Parkinsonism or all other causes of Parkinson’s Disease are excluded. For the purpose of this definition, “aided” shall mean with the aid of special equipment, device and/or apparatus and not pertaining to human aid.`,
    },
    majorStage: {
      covered: true,
      definition: `Idiopathic Parkinson’s Disease The unequivocal Diagnosis of idiopathic Parkinson’s Disease by a consultant neurologist.

This Diagnosis must be supported by all of the following conditions:

• The disease cannot be controlled with medication; and

• Inability of the Insured to perform (whether aided or unaided) at least three (3) of the six (6) “Activities of Daily Living” for a continuous period of at least six (6) months.

For the purpose of this definition, “aided” shall mean with the aid of special equipment, device and/or apparatus and not pertaining to human aid.`,
    },
  },
  {
    number: 27,
    name: `Infective Endocarditis`,
    earlyStage: {
      covered: true,
      definition: `Less Severe Infective Endocarditis Inflammation of the inner lining of the heart caused by infectious organisms, where all of the following criteria are met:

• Positive result of the blood culture proving presence of the infectious organism(s);

• Presence of at least mild heart valve incompetence (heart valve regurgitant) or mild heart valve stenosis attributable to Infective Endocarditis; and

• The unequivocal Diagnosis and the severity of valvular impairment are confirmed by a consultant cardiologist and supported by echocardiogram or other reliable imaging technique`,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Infective Endocarditis Inflammation of the inner lining of the heart caused by infectious organisms, where all of the following criteria are met:

• Positive result of the blood culture proving presence of the infectious organism(s);

• Presence of at least moderate heart valve incompetence (heart valve regurgitant) or moderate heart valve stenosis attributable to Infective Endocarditis; and

• The unequivocal Diagnosis and the severity of valvular impairment are confirmed by a consultant cardiologist and supported by echocardiogram or other reliable imaging technique`,
    },
  },
  {
    number: 28,
    name: `Insulin Dependent Diabetes Mellitus`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Insulin Dependent Diabetes Mellitus refers to a condition where all of the following diagnostic conditions must be met:

• there is an on-going absence of insulin production by the pancreas due to auto- immune disease;

• exogenous insulin administration is medically necessary to maintain normal glucose metabolism as Diagnosed by a consultant endocrinologist; and

• the condition has been present for at least six (6) months. Coverage will end on the policy anniversary occurring on or immediately following the Insured’s 21st birthday.`,
    },
  },
  {
    number: 29,
    name: `Irreversible Aplastic Anaemia`,
    earlyStage: {
      covered: true,
      definition: `Reversible Aplastic Anaemia Acute reversible bone marrow failure, confirmed by biopsy, which results in anaemia, neutropenia and thrombocytopenia requiring treatment with any one (1) of the following:

• Blood product transfusion;

• Bone marrow stimulating agents;

• Immunosuppressive agents; or

• Bone marrow transplantation.

The Diagnosis must be confirmed by a haematologist.

Aplastic anaemia in the presence of HIV infection is excluded.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Myelodysplastic Syndrome or Myelofibrosis Myelodysplastic syndrome or myelofibrosis requiring regular and permanent transfusion of blood products for severe recurrent anaemia. Diagnosis of Myelodysplastic Syndrome (MDS) or Myelofibrosis must be confirmed by haematologist as a result of marrow biopsy.

The condition must be deemed incurable and blood transfusion support must be an indefinite requirement.

Myelodysplastic Syndrome or Myelofibrosis in the presence of HIV infection is excluded.`,
    },
    majorStage: {
      covered: true,
      definition: `Irreversible Aplastic Anaemia Chronic persistent and irreversible bone marrow failure, confirmed by biopsy, which results in anaemia, neutropenia and thrombocytopenia requiring treatment with at least one (1) of the following:

• Blood product transfusion;

• Bone marrow stimulating agents;

• Immunosuppressive agents; or

• Bone marrow or haematopoietic stem cell transplantation.

The Diagnosis must be confirmed by a haematologist.`,
    },
  },
  {
    number: 30,
    name: `Irreversible Loss of Speech`,
    earlyStage: {
      covered: true,
      definition: `Permanent (or Temporary) Tracheostomy The performance of tracheostomy for the treatment of lung disease or airway disease or as a ventilatory support measure following major trauma or burns.

The Insured must have been a patient in a designated intensive care unit under the care of a medical Specialist.

The benefit only payable if the tracheostomy is required to remain in place and functional for a period of three (3) months.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Loss of Speech (other than injury or illness to the vocal cords) Total and irrecoverable loss of the ability to speak due to disease or injury. The inability to speak must be established for a continuous period of 12 months. This Diagnosis must be supported by medical evidence furnished by an Ear, Nose, and Throat (ENT) Specialist.

All psychiatric related causes are excluded.`,
    },
    majorStage: {
      covered: true,
      definition: `Irreversible Loss of Speech Total and irreversible loss of the ability to speak as a result of injury or disease to the vocal cords. The inability to speak must be established for a continuous period of 12 months. This Diagnosis must be supported by medical evidence furnished by an Ear, Nose, Throat (ENT) Specialist.

All psychiatric related causes are excluded.`,
    },
  },
  {
    number: 31,
    name: `Juvenile Huntington Disease`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Juvenile Huntington Disease Diagnosis of Juvenile Huntington Disease with genetic test is confirmed by a Specialist who is a Pediatrician. There must be evidence of all the following:

• Movement disorder due to Juvenile Huntington Disease

• Cognitive disorder due to Juvenile Huntington Disease; and

• Behaviour disorder due to Juvenile Huntington Disease Coverage will end on the policy anniversary occurring on or immediately following the Insured’s 21st birthday.`,
    },
  },
  {
    number: 32,
    name: `Loss of Independent Existence`,
    earlyStage: {
      covered: true,
      definition: `Loss of Independent Existence (Early Stage) Total and irreversible physical loss of all fingers including thumb of at least one (1) hand due to same accident.

This condition must be confirmed by a Physician.

Loss of fingers due to self-inflicted injuries is excluded.`,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Loss of Independent Existence A condition as a result of a disease, illness or injury whereby the Insured is unable to perform (whether aided or unaided) at least three (3) of the six (6) "Activities of Daily Living", for a continuous period of six (6) months.

This condition must be confirmed by our appointed Physician. Non-organic diseases such as neurosis and psychiatric illnesses are excluded. For the purpose of this definition, “aided” shall mean with the aid of special equipment, device and/or apparatus and not pertaining to human aid.`,
    },
  },
  {
    number: 33,
    name: `Major Burns`,
    earlyStage: {
      covered: true,
      definition: `Mild Severe Burns Second degree (partial thickness of the skin) burns covering at least 20% of the surface of the Insured’s body.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Moderately Severe Burns Third degree (full thickness of the skin) burns covering at least 50% of the face of the Insured.`,
    },
    majorStage: {
      covered: true,
      definition: `Major Burns Third degree (full thickness of the skin) burns covering at least 20% of the surface of the Insured’s body.`,
    },
  },
  {
    number: 34,
    name: `Major Cancer`,
    earlyStage: {
      covered: true,
      definition: `Carcinoma in situ Carcinoma in situ (CIS) means the focal autonomous new growth of carcinomatous cells confined to the cells in which it originated and has not yet resulted in the invasion and/or destruction of surrounding tissues.

‘Invasion’ means an infiltration and/or active destruction of normal tissue beyond the basement membrane. The Diagnosis of the Carcinoma in situ must always be supported by a histopathological report.

Furthermore, the Diagnosis of Carcinoma in situ must always be positively Diagnosed upon the basis of a microscopic examination of the fixed tissue, supported by a biopsy result. Clinical Diagnosis does not meet this standard.

In the case of the cervix uteri, Pap smear alone is not acceptable and should be accompanied with cone biopsy or colposcopy with the cervical biopsy report clearly indicating presence of CIS. Clinical Diagnosis or Cervical Intraepithelial Neoplasia (CIN) classification which reports CIN I, CIN II, and CIN III (severe dysplasia without carcinoma in situ) does not meet the required definition and are specifically excluded. Carcinoma In-situ of the skin (both Melanoma & Non-melanoma) and Carcinoma in situ of the biliary system is also specifically excluded. This coverage is available to the first occurrence of CIS only.

Early Prostate Cancer Prostate Cancer that is histologically described using the TNM Classification as T1N0M0 or Prostate cancers described using another equivalent classification.

Early Thyroid Cancer Thyroid Cancer that is histologically described using the TNM Classification as T1N0M0 as well as Papillary microcarcinoma of thyroid that is less than 2cm in diameter.

Early Neuroendocrine Tumours All Neuroendocrine tumours histologically classified as T1N0M0 (TNM Classification).

Early Bladder Cancer Bladder cancer that is histologically described using the TNM Classification as T1N0M0 as well as papillary microcarcinoma of Bladder.

Early Chronic Lymphocytic Leukaemia Chronic Lymphoctic Leukaemia (CLL) RAI Stage 1 or 2. RAI stage CLL 0 or lower is excluded.

Early Melanoma Invasive melanomas of less than 1.5mm Breslow thickness, or less than Clark Level 3.

Gastro-Intestinal Stromal Tumours All Gastro-Intestinal Stromal Tumours histologically classified as Stage I or IA according to the latest edition of the AJCC Cancer Staging Manual. Bone Marrow Malignancies All bone marrow malignancies which do not require recurrent blood transfusions, chemotherapy, targeted cancer therapies, bone marrow transplant, haematopoietic stem cell transplant or other major interventionist treatment. The Diagnosis of the above early cancers must be established by histological evidence and be confirmed by a Specialist in the relevant field. Any Cancer resulting directly from alcohol or drug abuse is excluded.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Carcinoma in situ of specified organs treated with Radical Surgery The actual undergoing of a Radical Surgery to arrest the spread of malignancy in that specific organ, which must be considered as appropriate and necessary treatment.

“Radical Surgery” is defined in this policy as the total and complete removal or partial removal of one of the following organs as specified: breast (mastectomy), prostate (prostatectomy), corpus uteri (hysterectomy), ovary (oopherectomy), fallopian tube (salpingectomy), colon (partial colectomy with end to end anastomosis) or stomach (partial gastrectomy with end to end anastomosis). The Diagnosis of the Carcinoma in situ must always be positively Diagnosed upon the basis of a microscopic examination of fixed tissues additionally supported by a biopsy of the removed organ. Clinical Diagnosis does not meet this standard. Early prostate cancer that is histologically described using the TNM Classification as T1a , T1b, T1c or Prostate cancers described using another equivalent classification is also covered if it has been treated with a radical prostatectomy. All grades of cervical intraepithelial neoplasia (CIN) and prostatic intraepithelial neoplasia (PIN) are specifically excluded.

The actual undergoing of the surgeries listed above and the surgery must be certified to be absolutely necessary by a consultant oncologist Partial surgical removal such as lumpectomy and partial mastectomy and partial prostatectomy are specifically excluded.

Carcinoma in situ means the focal autonomous new growth of carcinomatous cells confined to the cells in which it originated and has not yet resulted in the invasion and/ or destruction of surrounding tissues. ‘Invasion’ means an infiltration and/or active destruction of normal tissue beyond the basement membrane. The Diagnosis of the Carcinoma in situ must always be supported by a histopathological report. Furthermore, the Diagnosis of Carcinoma in situ must always be positively Diagnosed upon the basis of a microscopic examination of the fixed tissue, supported by a biopsy result. Clinical Diagnosis does not meet this standard.

Any Cancer resulting directly from alcohol or drug abuse is excluded.`,
    },
    majorStage: {
      covered: true,
      definition: `Major Cancer A malignant tumour positively Diagnosed with histological confirmation and characterised by the uncontrolled growth of malignant cells with invasion and destruction of normal tissue.

The term Major Cancer includes, but is not limited to leukemia, lymphoma and sarcoma.

Major Cancer Diagnosed on the basis of finding tumour cells and/or tumour-associated molecules in blood, saliva, faeces, urine or any other bodily fluid in the absence of further definitive and clinically verifiable evidence does not meet the above definition. For the above definition, the following are excluded:

•   All tumours which are histologically classified as any of the following:

- Pre-malignant;

- Non-invasive;

- Carcinoma-in-situ (Tis) or Ta;

- Having borderline malignancy;

- Having any degree of malignant potential;

- Having suspicious malignancy;

- Neoplasm of uncertain or unknown behaviour; or

- All grades of dysplasia, squamous intraepithelial lesions (HSIL and LSIL) and intra epithelial neoplasia;

•   Any non-melanoma skin carcinoma, skin confined primary cutaneous lymphoma and dermatofibrosarcoma protuberans unless there is evidence of metastases to lymph nodes or beyond;

•   Malignant melanoma that has not caused invasion beyond the epidermis;

•   All Prostate cancers histologically described as T1N0M0 (TNM Classification) or below; or Prostate cancers of another equivalent or lesser classification;

•   All Thyroid cancers histologically classified as T1N0M0 (TNM Classification) or below;

•   All Neuroendocrine tumours histologically classified as T1N0M0 (TNM Classification) or below;

•   All tumours of the Urinary Bladder histologically classified as T1N0M0 (TNM Classification) or below;

•   All Gastro-Intestinal Stromal tumours histologically classified as Stage I or IA according to the latest edition of the AJCC Cancer Staging Manual, or below;

•   Chronic Lymphocytic Leukaemia less than RAI Stage 3;

•   All bone marrow malignancies which do not require recurrent blood transfusions, chemotherapy, targeted cancer therapies, bone marrow transplant, haematopoietic stem cell transplant or other major interventionist treatment; and

•   All tumours in the presence of HIV infection.`,
    },
  },
  {
    number: 35,
    name: `Major Head Trauma`,
    earlyStage: {
      covered: true,
      definition: `Surgery for Subdural Haematoma The actual undergoing of burr hole surgery to the head to drain a subdural haematoma as a result of an accident. The need for the burr hole surgery must be certified to be absolutely necessary by a Specialist in the relevant field. "Accident” means an event of violent, unexpected, external, involuntary and visible nature which is independent of any other cause and is the sole cause of the head Injury.

Self-inflicted injuries, alcohol or drug abuse are excluded.

Facial Reconstructive Surgery The actual undergoing of re-constructive surgery above the neck (restoration or re- construction of the shape of and appearance of facial structures which are defective, missing or damaged or misshapen) performed by a Specialist in the relevant field to correct disfigurement as a direct result of an accident that occurred after the Issue Date, date of endorsement or Reinstatement Date of your Policy/ Supplementary Agreement (where applicable), whichever is the later. The need for surgery must be certified to be absolutely necessary by a Specialist in the relevant field. "Accident” means an event of violent, unexpected, external, involuntary and visible nature which is independent of any other cause and is the sole cause of the head Injury. Treatment relating to teeth and/or any other dental restoration alone and/or cosmetic nose surgery are all excluded. Self-inflicted injuries, alcohol or drug abuse are excluded.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Intermediate Stage Major Head Trauma Undergoing of open craniotomy as a consequence of major head trauma for the treatment of depressed skull fractures or major intracranial injury.

Self-inflicted injuries, alcohol or drug abuse are excluded.`,
    },
    majorStage: {
      covered: true,
      definition: `Major Head Trauma Accidental head injury resulting in Permanent Neurological Deficit to be assessed no sooner than six (6) weeks from the date of the accident. This Diagnosis must be confirmed by a consultant neurologist and supported by relevant findings on Magnetic Resonance Imaging, Computerised Tomography, or other reliable imaging techniques.

"Accident” means an event of violent, unexpected, external, involuntary and visible nature which is independent of any other cause and is the sole cause of the head Injury.

The following are excluded:

• Spinal cord injury; and

• Head injury due to any other causes.`,
    },
  },
  {
    number: 36,
    name: `Major Organ / Bone Marrow Transplantation`,
    earlyStage: {
      covered: true,
      definition: `Small Bowel Transplant The receipt of a transplant of at least one meter of small bowel with its own blood supply via a laparotomy resulting from intestinal failure.

Corneal Transplant The receipt of a transplant of a whole cornea due to irreversible scarring with resulting reduced visual acuity which cannot be corrected with other methods.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Major Organ/Bone Marrow Transplant (on waitlist) This benefit covers those who are on an official organ transplant waiting list for the receipt of a transplant of:

• Human bone marrow using hematopoietic stem cells preceded by total bone marrow ablation; or

• One of the following human organs: heart, lung, liver, kidney or pancreas that resulted from irreversible end stage failure of the relevant organ. Other stem cell transplants are excluded. This benefit is limited to those on the official waitlist for organ transplant on Ministry of Health Singapore list of hospitals only.`,
    },
    majorStage: {
      covered: true,
      definition: `Major Organ / Bone Marrow Transplantation The receipt of a transplant of:

• Human bone marrow using haematopoietic stem cells preceded by total bone marrow ablation; or

• One (1) of the following human organs: heart, lung, liver, kidney, pancreas that resulted from irreversible end stage failure of the relevant organ.

Other stem cell transplants are excluded.`,
    },
  },
  {
    number: 37,
    name: `Medically Acquired HIV infection`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Medically Acquired HIV infection The Insured being infected by Human Immunodeficiency Virus (HIV) provided that:

• The infection is due to an operation or a medical or dental procedure after the Issue Date, date of endorsement or Reinstatement Date of your Policy/ Supplementary Agreement (where applicable); and

• The institution which provided the operation or the medical or dental procedure admits liability or there is a final court verdict that cannot be appealed indicating such liability; and

• The infected Insured is not a haemophiliac. The incident must have been reported to appropriate authorities and have been investigated in accordance with the established procedures. This benefit will not apply in the event that any medical cure is found for AIDS or the effects of the HIV virus or a medical treatment is developed that results in the prevention of the occurrence of AIDS. Infection in any other manner, including infection as a result of sexual activity or recreational intravenous drug use is excluded. The insurer must have open access to all blood samples of the Insured and reserves the right to obtain independent testing of such blood samples.`,
    },
  },
  {
    number: 38,
    name: `Medullary Cystic Disease`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Medullary Cystic Disease Medullary Cystic Disease where the following criteria are met:

• the presence in the kidney of multiple cysts in the renal medulla accompanied by the presence of tubular atrophy and interstitial fibrosis;

• clinical manifestations of anaemia, polyuria, and progressive deterioration in kidney function; and

• the Diagnosis of Medullary Cystic Disease is confirmed by renal biopsy. Isolated or benign kidney cysts are specifically excluded from this benefit.`,
    },
  },
  {
    number: 39,
    name: `Motor Neurone Disease`,
    earlyStage: {
      covered: true,
      definition: `Peripheral Neuropathy This refers to severe peripheral motor neuropathy resulting in significant motor weakness, fasciculation and muscle wasting. The Diagnosis must be confirmed by a consultant neurologist as a result of nerve conduction studies and result in a permanent need for the use walking aids or a wheelchair. Diabetic neuropathy and neuropathy due to alcohol is excluded.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Early Motor Neurone Disease Refers to the Diagnosis of motor neurone disease, a progressive degeneration of the corticospinal tracts and anterior horn cells or bulbar efferent neurons. These include spinal muscular atrophy, progressive bulbar palsy, amyotrophic lateral sclerosis and primary lateral sclerosis. A consultant neurologist must make the definite Diagnosis of a motor neurone disease and this Diagnosis must be supported by appropriate investigations.`,
    },
    majorStage: {
      covered: true,
      definition: `Motor Neurone Disease Motor neurone disease characterised by progressive degeneration of corticospinal tracts and anterior horn cells or bulbar efferent neurones which include spinal muscular atrophy, progressive bulbar palsy, amyotrophic lateral sclerosis and primary lateral sclerosis. This Diagnosis must be confirmed by a consultant neurologist as progressive and resulting in Permanent Neurological Deficit.`,
    },
  },
  {
    number: 40,
    name: `Multiple Root of Branchial Plexus Injury`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Multiple Root of Branchial Plexus Injury The complete and permanent loss of use and sensory functions of an upper extremity caused by Injury of 2 or more nerve roots of the brachial plexus through accident or disease. Complete injury of 2 or more nerve roots should be confirmed by electrodiagnostic study or imaging technique done by physiatrist or consultant neurologist`,
    },
  },
  {
    number: 41,
    name: `Multiple Sclerosis`,
    earlyStage: {
      covered: true,
      definition: `Early Multiple Sclerosis There must be a definite Diagnosis of Multiple Sclerosis confirmed by a consultant neurologist. The Diagnosis must be supported by all of the following:

• Investigations that unequivocally confirm the Diagnosis to be Multiple Sclerosis; and

• Well documented history of exacerbations and remissions of neurological signs.

Other causes of neurological damage such as SLE and HIV are excluded.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Mild Multiple Sclerosis There must be a definite Diagnosis of Multiple Sclerosis confirmed by a consultant neurologist.

The Diagnosis must be supported by all of the following:

• Investigations that unequivocally confirm the Diagnosis to be Multiple Sclerosis; and

• Any permanent residual neurological deficit confirmed by a consultant neurologist at 3 months.

Other causes of neurological damage such as SLE and HIV are excluded.`,
    },
    majorStage: {
      covered: true,
      definition: `Multiple Sclerosis The definite Diagnosis of Multiple Sclerosis, and must be supported by all of the following:

• Investigations which unequivocally confirm the Diagnosis to be Multiple Sclerosis; and

• Multiple neurological deficits which occurred over a continuous period of at least six (6) months.

Other causes of neurological damage such as SLE and HIV are excluded.`,
    },
  },
  {
    number: 42,
    name: `Muscular Dystrophy`,
    earlyStage: {
      covered: true,
      definition: `Spinal Cord Disease or Injury resulting in Bowel and Bladder Dysfunction Spinal cord disease or chorda equina injury resulting in permanent bowel dysfunction and bladder dysfunction requiring permanent regular self catheterisation or a permanent urinary conduit. The Diagnosis must be supported by a consultant neurologist and the permanency assessed at six (6) months.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Moderate Muscular Dystrophy The unequivocal Diagnosis of muscular dystrophy must be made by a consultant neurologist. The condition must result in the inability of the Insured to perform (whether aided or unaided) at least two (2) of the six (6) “Activities of Daily Living” for a continuous period of at least six (6) months.

For the purpose of this definition, “aided” shall mean with the aid of special equipment, device and/or apparatus and not pertaining to human aid.`,
    },
    majorStage: {
      covered: true,
      definition: `Muscular Dystrophy The unequivocal Diagnosis of muscular dystrophy must be made by a consultant neurologist. The condition must result in the inability of the Insured to perform (whether aided or unaided) at least three (3) of the six (6) “Activities of Daily Living” for a continuous period of at least six (6) months.

For the purpose of this definition, “aided” shall mean with the aid of special equipment, device and/or apparatus and not pertaining to human aid.`,
    },
  },
  {
    number: 43,
    name: `Necrotising Fasciitis`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Necrotising Fasciitis The occurrence of necrotising fasciitis where the following conditions are met:

• the usual clinical criteria of necrotising fasciitis are met;

• the bacteria identified is a known cause of necrotising fasciitis; and

• there is widespread destruction of muscle and other soft tissues that results in a total and permanent loss of function of the affected body part.`,
    },
  },
  {
    number: 44,
    name: `Occupationally Acquired Hepatitis B or C`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Occupationally Acquired Hepatitis B or C Infection with the Hepatitis B or C virus which resulted from an accident occurring after the Issue Date, date of endorsement or Reinstatement Date of your Policy/ Supplementary Agreement (where applicable), whichever is the later whilst the Insured was carrying out the normal professional duties of his or her occupation, provided that all of the following are proven to Our satisfaction:

• Proof of the accident giving rise to the infection must be reported to us within 30 days of the accident taking place;

• Proof that the accident involved a definite source of the hepatitis B or C infected fluids;

• There is a need for antiviral therapy as a consequence of proven seroconversion;

• Hepatitis B or C infection resulting from any other means including sexual activity and the use of intravenous drugs is excluded. This benefit is only payable when the occupation of the Insured is a Physician, housemen, medical student, state registered nurse, medical laboratory technician, dentist (surgeon and nurse) or paramedical worker, working in medical centre or clinic. We would not be liable if there had been failure to observe any proper defined procedural practice or occupation required vaccination practices.`,
    },
  },
  {
    number: 45,
    name: `Open Chest Heart Valve Surgery`,
    earlyStage: {
      covered: true,
      definition: `Percutaneous Valvuloplasty or Valvotomy This benefit is payable where a heart valve is repaired by percutaneous intravascular balloon valvuloplasty techniques not involving a thoracotomy. Percutaneous valve replacements are excluded.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Percutaneous Valve Replacement or Device Repair This benefit is payable where a heart valve is replaced or repaired by the deployment of a permanent device or prosthesis by percutaneous intravascular techniques not involving a thoracotomy.`,
    },
    majorStage: {
      covered: true,
      definition: `Open Chest Heart Valve Surgery The actual undergoing of open-heart surgery to replace or repair heart valve abnormalities. The Diagnosis of heart valve abnormality must be supported by cardiac catheterisation or echocardiogram and the procedure must be considered medically necessary by a consultant cardiologist.`,
    },
  },
  {
    number: 46,
    name: `Open Chest Surgery to Aorta`,
    earlyStage: {
      covered: true,
      definition: `Large Asymptomatic Aortic Aneurysm Large asymptomatic abdominal or thoracic aortic aneurysm or aortic dissection as evidenced by appropriate imaging technique. The aorta must be enlarged and greater than 55mm in diameter and the Diagnosis must be confirmed by a consultant cardiologist.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Minimally Invasive Surgery to Aorta The actual undergoing of percutaneous intravascular angioplasty and stenting techniques to repair or correct an aneurysm, narrowing, obstruction or dissection of the aorta, as evidenced by an echocardiogram or any other appropriate diagnostic imaging test that is available and confirmed by a consultant cardiologist or vascular surgeon.

For the purpose of this definition, aorta shall mean the thoracic and abdominal aorta but not its branches.`,
    },
    majorStage: {
      covered: true,
      definition: `Open Chest Surgery to Aorta The actual undergoing of major surgery to repair or correct an aneurysm, narrowing, obstruction or dissection of the aorta through surgical opening of the chest or abdomen. For the purpose of this definition aorta shall mean the thoracic and abdominal aorta but not its branches.

Surgery performed using only minimally invasive or intra arterial techniques are excluded.`,
    },
  },
  {
    number: 47,
    name: `Osteogenesis Imperfecta`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Osteogenesis Imperfecta This is a genetic disorder characterised by brittle, osteoporotic, easily fractured bones. The Insured must be Diagnosed as a type III Osteogenesis Imperfecta confirmed by the occurrence of all of the following conditions:

• the result of physical examination of the Insured by a Specialist in the relevant field that the Insured suffers from growth retardation and hearing impairment; and

• the result of X-ray studies reveals multiple fracture of bones and progressive kyphoscoliosis; and

• positive result of skin biopsy. The Diagnosis must be confirmed by a Specialist in the relevant field`,
    },
  },
  {
    number: 48,
    name: `Other Serious Coronary Artery Disease`,
    earlyStage: {
      covered: true,
      definition: `Early Stage Other Serious Coronary Artery Disease The narrowing of the lumen of two (2) coronary arteries by a minimum of 60%, as proven by invasive coronary angiography or any other appropriate diagnostic test that is available, regardless of whether any form of coronary artery surgery has been recommended or performed.

Diagnosis by Imaging or non-invasive diagnostic procedures such as CT scan or MRI does not meet the confirmatory status required by the definition.

Coronary arteries herein refer to right coronary artery, left main stem, left anterior descending and left circumflex, but not their branches.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Intermediate Stage Other Serious Coronary Artery Disease The narrowing of the lumen of three (3) coronary arteries by a minimum of 60%, as proven by invasive coronary angiography or any other appropriate diagnostic test that is available, regardless of whether any form of coronary artery surgery has been recommended or performed.

Diagnosis by Imaging or non-invasive diagnostic procedures such as CT scan or MRI does not meet the confirmatory status required by the definition.

Coronary arteries herein refer to right coronary artery, left main stem, left anterior descending and left circumflex, but not their branches.`,
    },
    majorStage: {
      covered: true,
      definition: `Other Serious Coronary Artery Disease The narrowing of the lumen of at least one (1) coronary artery by a minimum of 75% and of two (2) others by a minimum of 60%, as proven by invasive coronary angiography, regardless of whether or not any form of coronary artery surgery has been performed.

Diagnosis by Imaging or non-invasive diagnostic procedures such as CT scan or MRI does not meet the confirmatory status required by the definition.

Coronary arteries herein refer to left main stem, left anterior descending, circumflex and right coronary artery. The branches of the above coronary arteries are excluded.`,
    },
  },
  {
    number: 49,
    name: `Paralysis (Irreversible Loss of use of limbs)`,
    earlyStage: {
      covered: true,
      definition: `Loss of Use of One Limb Total and irreversible loss of use of one (1) entire limb (above elbow or above knee) due to illness or accident. This condition must be confirmed by a Specialist in the relevant field.

Self-inflicted injuries, alcohol or drug abuses are excluded.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Loss of use of One limb requiring Prosthesis Total and irreversible loss of use of one (1) entire limb (above elbow or above knee) which has required the fitting and use of prosthesis due to illness or accident. This condition must be confirmed by Specialist in the relevant fields.

Self-inflicted injuries, alcohol or drug abuses are excluded.`,
    },
    majorStage: {
      covered: true,
      definition: `Paralysis (Irreversible Loss of Use of Limbs) Total and irreversible loss of use of at least two (2) entire limbs due to injury or disease persisting for a period of at least six (6) weeks and with no foreseeable possibility of recovery. This condition must be confirmed by a consultant neurologist.

Self-inflicted injuries are excluded.`,
    },
  },
  {
    number: 50,
    name: `Persistent Severe Juvenile Rheumatoid Arthritis`,
    earlyStage: {
      covered: true,
      definition: `Severe Juvenile Rheumatoid Arthritis The unequivocal Diagnosis of Rheumatoid Arthritis by a consultant rheumatologist, with widespread joint destruction and major clinical deformity of at least one (1) of the following joints area:

(a) Hands; (b) Wrists; (c) Elbows; (d) Knees; (e) Hips; (f) Ankle; (g) Cervical spine; or (h) Metatarsophalangeal joints in the feet

The symptoms of arthritis must have persisted for at least one (1) year.

Coverage will end on the policy anniversary occurring on or immediately following the Insured’s 21st birthday.`,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Persistent Severe Juvenile Rheumatoid Arthritis The unequivocal Diagnosis of Rheumatoid Arthritis by a consultant rheumatologist, with widespread joint destruction and major clinical deformity of at least three (3) of the following joints area:

(a) Hands; (b) Wrists; (c) Elbows; (d) Knees; (e) Hips; (f) Ankle; (g) Cervical spine; or (h) Metatarsophalangeal joints in the feet

The symptoms of arthritis must have persisted for at least one (1) year.

Coverage will end on the policy anniversary occurring on or immediately following the Insured’s 21st birthday.`,
    },
  },
  {
    number: 51,
    name: `Persistent Vegetative State (Apallic Syndrome)`,
    earlyStage: {
      covered: true,
      definition: `Locked in Syndrome Condition in which a person is aware but cannot move or communicate verbally due to complete paralysis of all voluntary muscles in the body except for vertical eye movements and blinking.

There should be evidence of quadriplegia (total paralysis of four (4) limbs) and inability to speak. This Diagnosis must be supported by evidence of Infarction of the ventral pons and EEG indicating that the person is not unconscious. The Diagnosis must be definitely confirmed by a consultant neurologist holding such an appointment at an approved hospital. The condition has to be medically documented for a continuous period at least one (1) month.`,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Persistent Vegetative State (Apallic Syndrome) Universal necrosis of the brain cortex with the brainstem intact. This Diagnosis must be definitely confirmed by a consultant neurologist holding such an appointment at an approved hospital. This condition has to be medically documented for at least one (1) month.`,
    },
  },
  {
    number: 52,
    name: `Pheochromocytoma`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Pheochromocytoma Pheochromocytomas are tumors originating in the catecholamine-producing chromaffin cells of the adrenal medulla. The Diagnosis of Pheochromocytoma must be confirmed by an endocrinologist. There is actual undergoing of surgery to remove the tumour. Neuroendocrine tumour (NET) is specifically excluded.`,
    },
  },
  {
    number: 53,
    name: `Poliomyelitis`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: true,
      definition: `Moderately Severe Poliomyelitis The occurrence of Poliomyelitis where the following conditions are met:

• Poliovirus is identified as the cause

• Paralysis of the respiratory muscles supported by ventilator

for a continuous period of minimum 96 hours

The Diagnosis must be confirmed by a consultant neurologist or Specialist in the relevant medical field.`,
    },
    majorStage: {
      covered: true,
      definition: `Poliomyelitis The occurrence of Poliomyelitis where the following conditions are met:

• Poliovirus is identified as the cause,

• Paralysis of the limb muscles or respiratory muscles must be present and persist for at least three (3) months.

The Diagnosis must be confirmed by a consultant neurologist or Specialist in the relevant medical field.`,
    },
  },
  {
    number: 54,
    name: `Primary Pulmonary Hypertension`,
    earlyStage: {
      covered: true,
      definition: `Early Pulmonary Hypertension Primary or Secondary pulmonary hypertension with established right ventricular hypertrophy leading to the presence of permanent physical impairment of at least Class III of the New York Heart Association (NYHA) Classification of Cardiac Impairment.

The Diagnosis must be established by cardiac catheterisation by a Specialist in the relevant field.

The NYHA Classification of Cardiac Impairment:

Class I      No limitation of physical activity. Ordinary physical activity does not cause undue fatigue, dyspnea, or anginal pain.

Class II     Slight limitation of physical activity. Ordinary physical activity results in symptoms.

Class III    Marked limitation of physical activity. Comfortable at rest, but less than ordinary

activity causes symptoms.

Class IV Unable to engage in any physical activity without discomfort. Symptoms may be present even at rest.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Secondary Pulmonary Hypertension Secondary pulmonary hypertension with established right ventricular hypertrophy leading to the presence of permanent physical impairment of at least Class IV of the New York Heart Association (NYHA) Classification of Cardiac Impairment.

The Diagnosis must be established by cardiac catheterisation by a Specialist in the relevant field.

The NYHA Classification of Cardiac Impairment:

Class I     No limitation of physical activity. Ordinary physical activity does not cause undue fatigue, dyspnea, or anginal pain.

Class II    Slight limitation of physical activity. Ordinary physical activity results in symptoms.

Class III   Marked limitation of physical activity. Comfortable at rest, but less than ordinary activity causes symptoms.

Class IV Unable to engage in any physical activity without discomfort. Symptoms may be present even at rest.`,
    },
    majorStage: {
      covered: true,
      definition: `Primary Pulmonary Hypertension Primary Pulmonary Hypertension with substantial right ventricular enlargement confirmed by investigations including cardiac catheterisation, resulting in permanent physical impairment of at least Class IV of the New York Heart Association (NYHA) Classification of Cardiac Impairment.

The NYHA Classification of Cardiac Impairment:

Class I     No limitation of physical activity. Ordinary physical activity does not cause undue fatigue, dyspnea, or anginal pain.

Class II    Slight limitation of physical activity. Ordinary physical activity results in symptoms.

Class III Marked limitation of physical activity. Comfortable at rest, but less than ordinary activity causes symptoms.

Class IV Unable to engage in any physical activity without discomfort. Symptoms may

be present even at rest.`,
    },
  },
  {
    number: 55,
    name: `Progressive Scleroderma`,
    earlyStage: {
      covered: true,
      definition: `Early Progressive Scleroderma A consultant rheumatologist must make the definite Diagnosis of progressive systemic scleroderma, based on clinically accepted criteria. This Diagnosis must be unequivocally supported by biopsy or equivalent confirmatory test and serological evidence.

The following are excluded:

- Localised scleroderma (linear scleroderma or morphea);

- Eosinophilic fasciitis; and

- CREST syndrome`,
    },
    intermediateStage: {
      covered: true,
      definition: `Progressive Scleroderma with CREST syndrome A consultant rheumatologist must make the definite Diagnosis of systemic sclerosis with CREST syndrome, based on clinically accepted criteria. This Diagnosis must be unequivocally supported by biopsy or equivalent confirmatory test and serological evidence. The disease must involve the skin with deposits of calcium (calcinosis), skin thickening of the fingers or toes (sclerodactyly) and also involve the esophagus.

There must also be telangectasia (dilated capillaries) and Raynaud’s Phenomenon causing artery spasms in the extremities. The following are excluded:

- Localised scleroderma (linear scleroderma or morphea); and

- Eosinophilic fasciitis.`,
    },
    majorStage: {
      covered: true,
      definition: `Progressive Scleroderma A systemic collagen- vascular disease causing progressive diffuse fibrosis in the skin, blood vessels and visceral organs. This Diagnosis must be unequivocally confirmed by a consultant rheumatologist and supported by biopsy or equivalent confirmatory test and serological evidence and the disorder must have reached systemic proportions to involve the heart, lungs or kidneys.

The following are excluded:

- Localised scleroderma (linear scleroderma or morphea);

- Eosinophilic fascitis; and

- CREST syndrome.`,
    },
  },
  {
    number: 56,
    name: `Progressive Supranuclear Palsy`,
    earlyStage: {
      covered: true,
      definition: `Less Severe Progressive Supranuclear Palsy A degenerative neurological disease characterised by supranuclear gaze paresis, pseudobulbar

palsy, axial rigidity and dementia.

The unequivocal Diagnosis of Less Severe Progressive Supranuclear Palsy must be confirmed by a consultant neurologist.

The condition must result in the permanent inability to perform, without assistance, at least two (2) out of six (6) “Activities of Daily Living”. These conditions have to be medically documented for at least 30 consecutive calendar days.`,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Progressive Supranuclear Palsy Progressive Supranuclear Palsy occurring independently of all other causes and resulting in a Permanent Neurological Deficit, which is directly responsible for a permanent inability to perform at least three (3) of the six (6) “Activities of Daily Living”.

The Diagnosis of Progressive Supranuclear Palsy must be confirmed by a Physician who is a consultant neurologist.`,
    },
  },
  {
    number: 57,
    name: `Rabies`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Rabies An infection by Rabies virus associated with all of these following signs and symptoms of Rabies namely muscle fasciculations, delirium, psychosis, seizures and aphasia. We will not pay for this Infectious Disease Benefit if the Insured undergoes only the prophylactic post exposure vaccination, without having developed the aforementioned symptoms.`,
    },
  },
  {
    number: 58,
    name: `Resection of the whole small intestine (duodenum, jejunum and ileum)`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Resection of the whole small intestine (duodenum, jejunum and ileum) Complete surgical removal of the whole small intestine including the duodenum, jejunum and ileum as a result of illness or an accident of the Insured. Partial removal of the small intestine is excluded in this benefit.`,
    },
  },
  {
    number: 59,
    name: `Severe Bacterial Meningitis`,
    earlyStage: {
      covered: true,
      definition: `Bacterial Meningitis with full recovery Bacterial infection resulting in severe inflammation of the membranes of the brain or spinal cord which requires hospitalisation.

This Diagnosis must be confirmed by:

• The presence of bacterial infection in cerebrospinal fluid by lumbar puncture; and

• A consultant neurologist.

Bacterial Meningitis in the presence of HIV infection is excluded.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Mild Bacterial Meningitis Bacterial meningitis is an inflammation of the membranes covering the brain or spinal cord caused by bacteria resulting in transient neurological deficit.

This Diagnosis must be confirmed by:

• The presence of bacterial infection in cerebrospinal fluid by lumbar puncture; and

• A consultant neurologist.

Bacterial Meningitis in the presence of HIV infection is excluded.`,
    },
    majorStage: {
      covered: true,
      definition: `Severe Bacterial Meningitis Bacterial infection resulting in severe inflammation of the membranes of the brain or spinal cord resulting in significant, irreversible and Permanent Neurological Deficit. The neurological deficit must persist for at least six (6) weeks.

This Diagnosis must be confirmed by:

• The presence of bacterial infection in cerebrospinal fluid by lumbar puncture; and

• A consultant neurologist.

Bacterial Meningitis in the presence of HIV infection is excluded.`,
    },
  },
  {
    number: 60,
    name: `Severe Cardiomyopathy`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Severe Cardiomyopathy The unequivocal Diagnosis of Cardiomyopathy which have resulted in the presence of permanent physical impairments of at least Class IV of the New York Heart Association (NYHA) classification of Cardiac Impairment. The Diagnosis must be confirmed by a consultant cardiologist. Cardiomyopathy that is directly related to alcohol misuse is excluded. The NYHA Classification of Cardiac Impairment: Class I     No limitation of physical activity. Ordinary physical activity does not cause undue fatigue, dyspnea, or anginal pain. Class II Slight limitation of physical activity. Ordinary physical activity results in symptoms. Class III Marked limitation of physical activity. Comfortable at rest, but less than ordinary activity causes symptoms. Class IV Unable to engage in any physical activity without discomfort. Symptoms may be present even at rest.`,
    },
  },
  {
    number: 61,
    name: `Severe Crohn's Disease`,
    earlyStage: {
      covered: true,
      definition: `Less Severe Crohn's Disease Crohn disease is an idiopathic, chronic inflammatory process that can affect any part of the gastrointestinal tract from the mouth to the anus.

The unequivocal Diagnosis of Crohn’s disease is confirmed by gastroenterologist. To be considered as severe, there must be evidence all of the following criteria:

• There is evidence of Crohn’s disease in histopathology

• There is continuous treatment (for at least six (6) consecutive months) of steroid, immunosupressive or immunomodulating drugs continuously for Crohn’s disease.

The inflammation bowel disease other than Crohn’s disease is excluded.`,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Severe Crohn's Disease Crohn disease is an idiopathic, chronic inflammatory process that can affect any part of the gastrointestinal tract from the mouth to the anus.

The unequivocal Diagnosis of Crohn’s disease is confirmed by gastroenterologist. To be considered as severe, there must be evidence all of the following criteria:

• There is evidence of Crohn’s disease in histopathology

• The Crohn’s disease cannot be controlled with medication.

• There is at least one (1) bowel segment resection for treatment of complication of Crohn’s disease.

The inflammation bowel disease other than Crohn’s disease is excluded.`,
    },
  },
  {
    number: 62,
    name: `Severe Eisenmenger's Syndrome`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: true,
      definition: `Severe Eisenmenger's Syndrome (Intermediate) Eisenmenger's Syndrome shall mean the occurrence of a reversed shunt as a result of pulmonary hypertension, caused by a heart disorder.

All of the following criteria must be met:

• The unequivocal Diagnosis of Eisenmenger's Syndrome is confirmed by consultant cardiologist.

• There is history of left to right shunt heart disease before the date of Diagnosis of Eisenmenger's Syndrome. The Diagnosis of left to right shunt heart disease must be supported by echocardiogram or other reliable imaging studies.

• There is evidence of reversed shunt ( from left -right shunt to right -left shunt) newly occurred on the date of Diagnosis of Eisenmenger's Syndrome.

• Eisenmenger Syndrome has developed to the irreversible stage and there is no any operation available to correct the abnormality.

• Presence of permanent physical impairment classified as NYHA III.

The NYHA Classification of Cardiac Impairment:

Class I     No limitation of physical activity. Ordinary physical activity does not cause undue fatigue, dyspnea, or anginal pain.

Class II    Slight limitation of physical activity. Ordinary physical activity results in symptoms.

Class III   Marked limitation of physical activity. Comfortable at rest, but less than ordinary activity causes symptoms.

Class IV Unable to engage in any physical activity without discomfort. Symptoms may be present even at rest.`,
    },
    majorStage: {
      covered: true,
      definition: `Severe Eisenmenger's Syndrome Eisenmenger's Syndrome shall mean the occurrence of a reversed shunt as a result of pulmonary hypertension, caused by a heart disorder.

All of the following criteria must be met:

• The unequivocal Diagnosis of Eisenmenger's Syndrome is confirmed by consultant cardiologist.

• There is history of left to right shunt heart disease before the date of Diagnosis of Eisenmenger's Syndrome. The Diagnosis of left to right shunt heart disease must be supported by echocardiogram or other reliable imaging studies.

• There is evidence of reversed shunt (from left -right shunt to right -left shunt) newly occurred on the date of Diagnosis of Eisenmenger's Syndrome.

• Eisenmenger Syndrome has developed to the irreversible stage and there is no any operation available to correct the abnormality.

• Presence of permanent physical impairment classified as NYHA IV.

The NYHA Classification of Cardiac Impairment:

Class I     No limitation of physical activity. Ordinary physical activity does not cause undue fatigue, dyspnea, or anginal pain.

Class II    Slight limitation of physical activity. Ordinary physical activity results in symptoms.

Class III Marked limitation of physical activity. Comfortable at rest, but less than ordinary activity causes symptoms.

Class IV Unable to engage in any physical activity without discomfort. Symptoms may be present even at rest.`,
    },
  },
  {
    number: 63,
    name: `Severe Encephalitis`,
    earlyStage: {
      covered: true,
      definition: `Viral Encephalitis with full recovery Severe inflammation of brain substance (cerebral hemisphere, brainstem or cerebellum) caused by viral infection requiring hospitalisation.

The Diagnosis must be confirmed by a consultant neurologist and supported by any confirmatory diagnostic tests proving acute viral infection of the brain.

Encephalitis caused by HIV infection is excluded.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Mild Viral Encephalitis Severe inflammation of brain substance (cerebral hemisphere, brainstem or cerebellum) caused by viral infection resulting in significant but reversible neurological deficit and there must be evidence of hospitalization for at least two (2) weeks. The neurological deficit must persist for at least six (6) weeks.

The Diagnosis must be confirmed by a consultant neurologist and supported by any confirmatory diagnostic tests proving acute viral infection of the brain. Encephalitis caused by HIV infection is excluded.`,
    },
    majorStage: {
      covered: true,
      definition: `Severe Encephalitis Severe inflammation of brain substance (cerebral hemisphere, brainstem or cerebellum) and resulting in Permanent Neurological Deficit which must be documented for at least six (6) weeks.

This Diagnosis must be certified by a consultant neurologist, and supported by any confirmatory diagnostic tests.

Encephalitis caused by HIV infection is excluded.`,
    },
  },
  {
    number: 64,
    name: `Severe Haemophilia`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Severe Haemophilia The Insured must be suffering from severe haemophilia A (VIII deficiency) or haemophilia B (IX deficiency) with factor VIII or factor IX activity levels less than one percent (1%). Diagnosis must be confirmed by a qualified haematologist acceptable to the Us. The coagulation-disease other than haemophilia A (VIII deficiency) or haemophilia B (IX deficiency) are excluded.`,
    },
  },
  {
    number: 65,
    name: `Severe Myasthenia Gravis`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Severe Myasthenia Gravis An acquired autoimmune disorder of neuromuscular transmission leading to fluctuating muscle weakness and fatiguability, where all of the following criteria are met:

• Presence of permanent muscle weakness categorised as Class III, IV or V according to the Myasthenia Gravis Foundation of America Clinical Classification below; and

• The Diagnosis of Myasthenia Gravis and categorisation are confirmed by a Physician who is a consultant neurologist. Myasthenia Gravis Foundation of America Clinical Classification: Class I     Any eye muscle weakness, possible ptosis, no other evidence of muscle weakness elsewhere Class II    Eye muscle weakness of any severity, mild weakness of other muscles Class III Eye muscle weakness of any severity, moderate weakness of other muscles Class IV Eye muscle weakness of any severity, severe weakness of other muscles Class V     Intubation needed to maintain airway`,
    },
  },
  {
    number: 66,
    name: `Severe Pulmonary Fibrosis`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Severe Pulmonary Fibrosis Severe and diffuse type of pulmonary fibrosis requiring extensive and permanent oxygen therapy at least eight (8) hours per day. The unequivocal Diagnosis must be confirmed with lung biopsy and by a Specialist in respiratory medicine.`,
    },
  },
  {
    number: 67,
    name: `Stroke with Permanent Neurological Deficit`,
    earlyStage: {
      covered: true,
      definition: `Brain Aneurysm Surgery (via Endovascular procedures) The actual undergoing of surgical repair of an intracranial aneurysm or surgical removal of an arterio-venous malformation via endovascular procedures.

The surgical intervention must be certified to be absolutely necessary by a Specialist in the relevant field.

Brain aneurysm surgery (via craniotomy) The actual undergoing of surgical repair of an intracranial aneurysm or surgical removal of an arterio-venous malformation via craniotomy. The surgical intervention must be certified to be absolutely necessary by a Specialist in the relevant field.

Cerebral shunt insertion The actual undergoing of surgical implantation of a shunt from the ventricles of the brain to relieve raised pressure in the cerebrospinal fluid. The need of a shunt must be certified to be absolutely necessary by a Specialist in the relevant field.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Carotid Artery Surgery The actual undergoing of Endarterectomy of the carotid artery which has been necessitated as a result of at least 80% narrowing of the carotid artery as Diagnosed by an arteriography or any other appropriate diagnostic test that is available.

Endarterectomy of blood vessels other than the carotid artery are specifically excluded. Percutaneous carotid angioplasty is excluded.`,
    },
    majorStage: {
      covered: true,
      definition: `Stroke with Permanent Neurological Deficit A cerebrovascular incident including infarction of brain tissue, cerebral and subarachnoid haemorrhage, intracerebral embolism and cerebral thrombosis resulting in Permanent Neurological Deficit.

This Diagnosis must be supported by all of the following conditions:

•    Evidence of permanent clinical neurological deficit confirmed by a consultant neurologist at least six (6) weeks after the event; and

•    Findings on Magnetic Resonance Imaging, Computerised Tomography, or other reliable imaging techniques consistent with the Diagnosis of a new stroke.

The following are excluded:

• Transient Ischaemic Attacks;

• Brain damage due to an accident or injury, infection, vasculitis, and inflammatory disease;

• Vascular disease affecting the eye or optic nerve;

• Ischaemic disorders of the vestibular system; and

• Secondary haemorrhage within a pre-existing cerebral lesion.`,
    },
  },
  {
    number: 68,
    name: `Surgery for Idiopathic Scoliosis`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Surgery for Idiopathic Scoliosis The unequivocal Diagnosis of idiopathic scoliosis is confirmed by an orthopaedic surgeon. This scoliosis condition means that the spine curvature angle is equal or more than 40 Cobb angle degree. Surgery to correct abnormal spine curvature to its normal shape (as a straight line viewed from the back) is actually performed. The following conditions are excluded:

• scoliosis due to injury or other disease

• Kyphosis

• Lordosis.`,
    },
  },
  {
    number: 69,
    name: `Systemic Lupus Erythematosus with Lupus Nephritis`,
    earlyStage: {
      covered: true,
      definition: `Mild Systemic Lupus Erythematosus The unequivocal Diagnosis of Systemic Lupus Erythematosus (SLE) based on recognised diagnostic criteria and supported with clinical and laboratory evidence. In respect of your Policy/ Supplementary Agreement (where applicable), systemic lupus erythematosus will be restricted to those forms of systemic lupus erythematosus that require systemic immunosuppressive therapy for multiple organ involvement for at least six (6) months under the direction of a Specialist.

Evidence must be provided from the treating Specialist that proves to our satisfaction that there has been involvement of at least three specified internal organs. For the purposes of this benefit the listed specified organs are restricted to the kidneys, brain, heart (or pericardium), lungs (or pleura) and joints. Joint involvement is defined as the presence of polyarticular inflammatory arthritis. Skin involvement is not considered one of the specified organs for the purposes of this benefit. Other forms, discoid lupus and those forms with haematological involvement will be specifically excluded. The final Diagnosis may have to be supported by a certified doctor specialising in Rheumatology and Immunology.`,
    },
    intermediateStage: {
      covered: true,
      definition: `Moderate Severe Systemic Lupus Erythematosus with Lupus Nephritis The unequivocal Diagnosis of Systemic Lupus Erythematosus (SLE) based on recognised diagnostic criteria and supported with clinical and laboratory evidence. In respect of your policy/ Supplementary Agreement (where applicable), systemic lupus erythematosus will be restricted to those forms of systemic lupus erythematosus which involve the kidneys (Class I & Class II Lupus Nephritis, established by renal biopsy, and in accordance with the RPS/ISN classification system). The final Diagnosis must be confirmed by a Physician specialising in Rheumatology and Immunology.

The RPS/ISN classification of lupus nephritis:

Class I      Minimal mesangial lupus nephritis

Class II     Mesangial proliferative lupus nephritis

Class III    Focal lupus nephritis (active and chronic; proliferative and sclerosing)

Class IV Diffuse lupus nephritis (active and chronic; proliferative and sclerosing; segmental and global) Class V      Membranous lupus nephritis

Class VI Advanced sclerosis lupus nephritis`,
    },
    majorStage: {
      covered: true,
      definition: `Systemic Lupus Erythematosus with Lupus Nephritis The unequivocal Diagnosis of Systemic Lupus Erythematosus (SLE) based on recognised diagnostic criteria and supported with clinical and laboratory evidence. In respect of your Policy/ Supplementary Agreement (where applicable), systemic lupus erythematosus will be restricted to those forms of systemic lupus erythematosus which involve the kidneys (Class III to Class VI Lupus Nephritis, established by renal biopsy, and in accordance with the RPS/ISN classification system). The final Diagnosis must be confirmed by a Physician specialising in Rheumatology and Immunology.

The RPS/ISN classification of lupus nephritis:

Class I     Minimal mesangial lupus nephritis

Class II    Mesangial proliferative lupus nephritis

Class III Focal lupus nephritis (active and chronic; proliferative and sclerosing)

Class IV Diffuse lupus nephritis (active and chronic; proliferative and sclerosing; segmental and global)

Class V     Membranous lupus nephritis Class VI Advanced sclerosis lupus nephritis`,
    },
  },
  {
    number: 70,
    name: `Terminal Illness`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Terminal Illness The conclusive Diagnosis of an illness that is expected to result in the death of the Insured within 12 months. This Diagnosis must be supported by a Specialist and confirmed by our appointed Physician. Terminal illness in the presence of HIV infection is excluded.`,
    },
  },
  {
    number: 71,
    name: `Tuberculosis Meningitis`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Tuberculosis Meningitis Tuberculosis Meningitis refers to meningitis proven to be caused by mycobacterium tuberculosis that causes a Permanent Neurological Deficit that results in either:

• severe cognitive impairment documented by standard neuro- psychological that results in the need for continuous supervision; or

• physical impairment that results in a Permanent inability to perform at least one (1) of the six (6) “Activities of Daily Living”. Meningitis occurring in the presence of HIV infection is excluded.`,
    },
  },
  {
    number: 72,
    name: `Type 1 Juvenile Spinal Muscular Atrophy`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Type 1 Juvenile Spinal Muscular Atrophy Degenerative diseases of the anterior horn cells in the spinal cord and motor nuclei of the brainstem characterised by profound proximal muscular weakness and wasting, primarily in the legs, followed by distal muscle involvement. The unequivocal Diagnosis of Type 1 Juvenile Spinal Muscular Atrophy (SMA) is confirmed by Specialist. The damage must result independently of all other causes and directly in the Insured's permanent inability to perform (whether aided or unaided) at least three (3) of the “Activities of Daily Living” (ADLs) for a continuous period of six (6) months. The Diagnosis must be made by a consultant neurologist with appropriate neuromuscular testing such as Electromyogram (EMG). For the purpose of this definition, “aided” shall mean with the aid of special equipment, device and/or apparatus and not pertaining to human aid. Juvenile Spinal Muscular Atrophy (SMA) other than Type 1 is excluded from this benefit. Coverage will end on the policy anniversary occurring on or immediately following the Insured’s 21st birthday.`,
    },
  },
  {
    number: 73,
    name: `Wilson's Disease`,
    earlyStage: {
      covered: false,
      definition: ``,
    },
    intermediateStage: {
      covered: false,
      definition: ``,
    },
    majorStage: {
      covered: true,
      definition: `Wilson's Disease A potentially fatal disorder of copper toxicity characterised by progressive liver disease and/or neurologic deterioration due to copper deposit. The Diagnosis must be confirmed by a Specialist in the relevant field and the treatment with a chelating agent must be documented for at least six (6) months.`,
    },
  },
];

export const COVERED_CONDITION_COUNT = ULTIMATE_CRITICAL_COVER_CONDITIONS.length;
export const EARLY_STAGE_COUNT = ULTIMATE_CRITICAL_COVER_CONDITIONS.filter(c => c.earlyStage.covered).length;
export const INTERMEDIATE_STAGE_COUNT = ULTIMATE_CRITICAL_COVER_CONDITIONS.filter(c => c.intermediateStage.covered).length;
export const MAJOR_STAGE_COUNT = ULTIMATE_CRITICAL_COVER_CONDITIONS.filter(c => c.majorStage.covered).length;

// ─────────────────────────────────────────────────────────────────────────────
// Appendix 2 — Glossary terms referenced by many of the 73 CI definitions.
// Source: AIA UCC Product Summary v1.0 (012024), Appendix 2.
// ─────────────────────────────────────────────────────────────────────────────

export interface AdlItem {
  /** Roman numeral label as printed in the Product Summary (i, ii, iii…). */
  label: string;
  /** Activity name (e.g. "Washing"). */
  name: string;
  /** The full definition of this activity. */
  definition: string;
}

export const ACTIVITIES_OF_DAILY_LIVING: AdlItem[] = [
  {
    label: "i",
    name: "Washing",
    definition:
      "the ability to wash in the bath or shower (including getting into and out of the bath or shower) or wash satisfactorily by other means;",
  },
  {
    label: "ii",
    name: "Dressing",
    definition:
      "the ability to put on, take off, secure and unfasten all garments and, as appropriate, any braces, artificial limbs or other surgical appliances;",
  },
  {
    label: "iii",
    name: "Transferring",
    definition:
      "the ability to move from a bed to an upright chair or wheelchair and vice versa;",
  },
  {
    label: "iv",
    name: "Mobility",
    definition: "the ability to move indoors from room to room on level surfaces;",
  },
  {
    label: "v",
    name: "Toileting",
    definition:
      "the ability to use the lavatory or otherwise manage bowel and bladder functions so as to maintain a satisfactory level of personal hygiene;",
  },
  {
    label: "vi",
    name: "Feeding",
    definition:
      "the ability to feed oneself once food has been prepared and made available.",
  },
];

export const PERMANENT_NEUROLOGICAL_DEFICIT_DEFINITION =
  "Permanent Neurological Deficit refers to symptoms of dysfunction in the nervous system that are present on clinical examination and expected to last throughout the lifetime of the Insured. Symptoms that are covered include numbness, paralysis, localized weakness, dysarthria (difficulty with speech), aphasia (inability to speak), dysphagia (difficulty swallowing), visual impairment, difficulty in walking, lack of coordination, tremor, seizures, dementia, delirium and coma.";

export const PERMANENT_DEFINITION =
  "Permanent means expected to last throughout the lifetime of the Insured.";
