/* Cycle tracker prototype v1. Sample data only. "AI" fill-in is simulated with keyword matching. */
(function () {
  'use strict';

  // ---------- Constants & sample data ----------
  var TODAY = 49; // serial day: Oct 1 = 1, Nov 1 = 32, Dec 1 = 62
  var MONTHS = [
    { name: 'October 2026', short: 'Oct', start: 1, len: 31 },
    { name: 'November 2026', short: 'Nov', start: 32, len: 30 },
    { name: 'December 2026', short: 'Dec', start: 62, len: 31 }
  ];
  var DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MISSING = [4, 12, 19, 40, 45];
  var PAINFUL = ['Cramps', 'Headache', 'Back pain', 'Breast tenderness'];
  var SYMPTOMS = ['Cramps', 'Headache', 'Bloating', 'Cravings', 'Breast tenderness', 'Back pain', 'Acne', 'Nausea', 'Fatigue'];
  var FEELINGS = ['Calm', 'Happy', 'Motivated', 'Sensitive', 'Irritable', 'Anxious', 'Sad'];
  var BASE_DIAG = ['Endometriosis', 'Adenomyosis', 'PCOS', 'PMDD', 'Fibroids'];
  var PURPOSES = ['Track my period', 'Understand my symptoms', 'Plan around my cycle', 'Manage a condition', 'Trying to conceive'];
  var BC = ['None', 'Pill', 'Hormonal IUD', 'Copper IUD', 'Implant', 'Shot', 'Patch or ring', 'Other'];
  var HORMONAL = ['Pill', 'Hormonal IUD', 'Implant', 'Shot', 'Patch or ring'];
  var EVENTS = {
    50: { time: '8:00 AM', title: 'Biology lab', tip: 'Early class, and sleep is often lighter late in your cycle. Try heading to bed by 10:30 tonight so you get 8+ hours.' },
    54: { time: '10:00 AM', title: 'Stats midterm', tip: 'This is predicted to be day 2 of your period, often the heaviest. Try to finish reviewing by Saturday, and pack pain relief, period products and a snack.' },
    65: { time: '6:00 PM', title: 'Intramural soccer', tip: 'Energy is often highest around ovulation, so this could be a great day for a harder workout.' }
  };
  var STORE = 'cycle-proto-v1';

  function ML(name, slug) { return { name: 'MedlinePlus: ' + name, url: 'https://medlineplus.gov/' + slug + '.html', domain: 'medlineplus.gov' }; }
  function AC(name, slug) { return { name: 'ACOG: ' + name, url: 'https://www.acog.org/womens-health/faqs/' + slug, domain: 'acog.org' }; }

  var TOPICS = {
    phase: { title: 'Your cycle phases', intro: 'A cycle has four phases: your period, the follicular phase (estrogen rises), ovulation (an egg is released about 14 days before your next period), and the luteal phase (progesterone rises, then both hormones fall if there is no pregnancy).', points: ['Most adult cycles last 21 to 35 days.', 'The luteal phase is usually the steadiest part, about 12 to 14 days.', 'Your predictions use your own logged cycles, currently averaging 27 days.'], doctor: 'Cycles shorter than 21 or longer than 35 days, or cycles that change a lot from month to month, are worth checking with a doctor.', src: ML('Menstruation', 'menstruation') },
    cramps: { title: 'Cramps', intro: 'Cramps come from prostaglandins, chemicals that make the uterus contract to shed its lining. They usually start just before or as your period begins and ease within 2 to 3 days.', points: ['Heat on your lower belly or back can help.', 'Pain relievers like ibuprofen tend to work best when taken early. Follow the label.', 'Regular exercise may reduce cramps over time.'], doctor: 'Pain that keeps you from school or work, gets worse over time, or does not improve with pain relievers can be a sign of a condition like endometriosis or adenomyosis.', src: ML('Period Pain', 'periodpain') },
    cravings: { title: 'Cravings', intro: 'Many people crave sweet, salty or carb-heavy foods in the days before their period. Hormone shifts that affect appetite and mood are a likely reason.', points: ['Regular meals with complex carbs like oats, whole grains and beans can keep energy steadier.', 'Pair a treat with protein or fiber instead of skipping it.', 'Less salt may help with bloating.'], doctor: 'Big appetite changes, or eating that feels out of control, are worth bringing up with a doctor.', src: ML('Premenstrual Syndrome', 'premenstrualsyndrome') },
    energy: { title: 'Energy levels', intro: 'Energy often rises in the follicular phase, peaks around ovulation, and dips before and during your period.', points: ['Plan demanding tasks for higher-energy days when you can.', 'Light movement like a walk can lift energy on low days.', 'Iron-rich foods help replace iron lost during your period.'], doctor: 'Constant exhaustion, especially with heavy periods, can be a sign of anemia. A doctor can check with a simple blood test.', src: ML('Menstruation', 'menstruation') },
    sleep: { title: 'Sleep', intro: 'Adults need about 7 to 9 hours of sleep. Many people sleep more lightly in the days before their period, when body temperature runs slightly higher.', points: ['Keep a steady bedtime, especially before early mornings.', 'A cool, dark room helps when your body runs warm.', 'Limit caffeine after midday.'], doctor: 'Ongoing trouble sleeping, or sleep problems that come with severe mood changes before your period, are worth discussing with a doctor.', src: ML('Healthy Sleep', 'healthysleep') },
    mood: { title: 'Mood and feelings', intro: 'Hormone changes can affect mood, especially in the week or two before your period. Feeling more sensitive, irritable or anxious then is common.', points: ['Tracking moods helps you spot your pattern.', 'Exercise, sleep and time outdoors can help.', 'Let people close to you know what tends to help.'], doctor: 'If mood changes are severe or disrupt your life, talk to a doctor. Severe premenstrual mood symptoms can be PMDD, which is treatable. If you ever have thoughts of harming yourself, get help right away.', src: ML('Premenstrual Syndrome', 'premenstrualsyndrome') },
    flow: { title: 'Period flow', intro: 'A typical period lasts 2 to 7 days. Flow is usually heaviest in the first day or two.', points: ['Spotting is a few drops. Heavy flow means changing products every couple of hours.', 'Small clots can be normal on heavy days.', 'Logging flow helps you notice changes over time.'], doctor: 'Soaking through a pad or tampon every hour for several hours, passing clots larger than a quarter, or bleeding longer than 7 days should be checked by a doctor.', src: AC('Heavy Menstrual Bleeding', 'heavy-menstrual-bleeding') },
    symptoms: { title: 'Cycle symptoms', intro: 'Many symptoms follow a pattern across your cycle. The more days you log, the better the app can spot yours.', points: ['Common ones include cramps, bloating, headaches, acne and breast tenderness.', 'Symptoms often cluster just before and during your period.', 'Missing a day is fine. Predictions just get less certain.'], doctor: 'New, severe or unusual symptoms should be checked by a doctor.', src: ML('Menstruation', 'menstruation') },
    pms: { title: 'PMS', intro: 'Premenstrual syndrome is a mix of physical and emotional symptoms in the 1 to 2 weeks before a period. They usually ease within a few days after it starts.', points: ['Exercise, regular sleep, and less salt, caffeine and alcohol may help.', 'Some research supports calcium for easing PMS symptoms.', 'Tracking helps you and your doctor see the pattern.'], doctor: 'If symptoms disrupt your daily life, a doctor can help and can check for PMDD.', src: ML('Premenstrual Syndrome', 'premenstrualsyndrome') },
    stress: { title: 'Stress', intro: 'Stress can make cycle symptoms feel worse, and high stress can even delay a period.', points: ['Short breaks, movement and sleep all help.', 'Check whether stress lines up with symptom flares in your history.', 'Plan ahead for busy weeks that land on low-energy days.'], doctor: 'If stress feels unmanageable, or your periods stop, talk to a doctor.', src: ML('Stress', 'stress') },
    headache: { title: 'Headaches', intro: 'Some people get headaches just before or during their period, likely linked to the drop in estrogen.', points: ['Stay hydrated and keep regular meals and sleep.', 'Pain relievers can help when taken early. Follow the label.', 'Logging headaches helps the app predict them.'], doctor: 'Severe headaches, migraines with vision changes, or a sudden worst-ever headache need medical care right away.', src: ML('Headache', 'headache') },
    meds: { title: 'Medications and your cycle', intro: 'Some medicines can change your cycle or symptoms. Hormonal birth control changes bleeding patterns, blood thinners can make periods heavier, and pain relievers like ibuprofen can ease cramps.', points: ['Take medicines as prescribed or as the label directs.', 'Logging when you take them helps you and your doctor see what is working.', 'A pharmacist can check for interactions between your medicines.'], doctor: 'Talk to your doctor before starting or stopping a medicine, or if your periods change after starting a new one.', src: { name: 'MedlinePlus: Drugs, Herbs and Supplements', url: 'https://medlineplus.gov/druginformation.html', domain: 'medlineplus.gov' } }
  };

  var LIBRARY = [
    { id: 'phases', name: 'Cycle phases & hormones', desc: 'How your cycle works', subs: [
      { id: 'menstrual', title: 'Menstrual phase (your period)', summary: 'Day 1 to about day 5', overview: 'Your cycle starts on the first day of bleeding. Estrogen and progesterone are at their lowest, so the lining of the uterus sheds. A period usually lasts 2 to 7 days.', points: ['Cramps come from prostaglandins, which make the uterus contract.', 'Energy often dips, especially on the heaviest days.', 'Rest, heat, gentle movement and iron-rich foods can help.'], sources: [ML('Menstruation', 'menstruation'), ML('Period Pain', 'periodpain')] },
      { id: 'follicular', title: 'Follicular phase', summary: 'From day 1 until ovulation', overview: 'The follicular phase starts on day 1 and overlaps with your period. Follicle-stimulating hormone (FSH) helps follicles in the ovaries grow, and rising estrogen rebuilds the lining of the uterus.', points: ['This phase varies the most in length, which is why cycle lengths differ.', 'Rising estrogen is often linked with more energy and a better mood.', 'Some people notice clearer skin.'], sources: [ML('Menstruation', 'menstruation')] },
      { id: 'ovulation', title: 'Ovulation', summary: 'When an egg is released', overview: 'A surge of luteinizing hormone (LH) causes a mature egg to be released. This usually happens about 14 days before the next period, not on day 14 for everyone. The egg lives about 12 to 24 hours.', points: ['Signs can include clear, stretchy discharge and mild pain on one side.', 'Pregnancy is possible on about 6 days around ovulation.', 'Fertile days in this app are estimates and are not birth control.'], sources: [ML('Menstruation', 'menstruation')] },
      { id: 'luteal', title: 'Luteal phase', summary: 'After ovulation until your period', overview: 'After ovulation, the empty follicle (called the corpus luteum) makes progesterone, which thickens the lining of the uterus. This phase usually lasts 12 to 14 days. If there is no pregnancy, progesterone and estrogen fall and your period starts.', points: ['In the last week, many people notice PMS: bloating, breast tenderness, cravings or mood changes.', 'Body temperature runs slightly higher, and sleep can be lighter.', 'Exercise, steady sleep and calcium-rich foods may ease PMS. Severe mood changes are worth a doctor visit.'], sources: [ML('Premenstrual Syndrome', 'premenstrualsyndrome'), ML('Menstruation', 'menstruation')] },
      { id: 'hormones', title: 'Estrogen & progesterone', summary: 'The hormones behind the changes', overview: 'Estrogen rises during the follicular phase and peaks before ovulation, when a surge of luteinizing hormone (LH) releases the egg. Progesterone rises after ovulation to prepare the uterine lining. If there is no pregnancy, both fall and the lining sheds as your period.', points: ['Rising estrogen is often linked with higher energy.', 'The drop in both hormones before a period is linked to PMS.', 'Hormonal birth control changes this pattern.'], sources: [ML('Menstruation', 'menstruation')] },
      { id: 'length', title: 'Cycle length & tracking', summary: 'What is normal and why it varies', overview: 'It is normal for cycle length to vary a little. Stress, illness, travel, big changes in exercise or weight, and some medicines can shift it. Cycles are often irregular for the first few years after periods start and again closer to menopause.', points: ['Track the first day of each period to find your average.', 'A change of a few days is common.', 'Several months of irregular cycles is worth discussing with a doctor.'], sources: [AC('Abnormal Uterine Bleeding', 'abnormal-uterine-bleeding'), ML('Menstruation', 'menstruation')] }
    ] },
    { id: 'symptoms', name: 'Common symptoms', desc: 'Cramps, cravings, mood and more', subs: [
      { id: 'cramps', title: 'Cramps', summary: 'Why they happen and what helps', overview: 'Cramps come from prostaglandins, chemicals that make the uterus contract to shed its lining. They usually start just before or as your period begins and ease within 2 to 3 days.', points: ['Heat, gentle movement and pain relievers like ibuprofen can help.', 'Pain relievers tend to work best when taken early. Follow the label.', 'Pain that disrupts school or work is worth a doctor visit.'], sources: [ML('Period Pain', 'periodpain'), AC('Dysmenorrhea: Painful Periods', 'dysmenorrhea-painful-periods')] },
      { id: 'pms', title: 'PMS & mood', summary: 'Changes in the week or two before a period', overview: 'Premenstrual syndrome is a mix of physical and emotional symptoms in the 1 to 2 weeks before a period, like bloating, breast tenderness, irritability or sadness. Symptoms usually ease within a few days after the period starts.', points: ['PMS is very common, and severity varies a lot between people.', 'Exercise, regular sleep, and less salt, caffeine and alcohol may help.', 'Some research supports calcium for easing PMS symptoms.'], sources: [ML('Premenstrual Syndrome', 'premenstrualsyndrome'), AC('Premenstrual Syndrome (PMS)', 'premenstrual-syndrome')] },
      { id: 'cravings', title: 'Cravings & bloating', summary: 'Appetite changes before your period', overview: 'Many people crave sweet, salty or carb-heavy foods before their period and feel bloated. Hormone shifts that affect appetite, mood and water balance are likely reasons.', points: ['Regular meals with complex carbs can keep energy steadier.', 'Less salt may reduce bloating.', 'Pair a treat with protein or fiber rather than skipping it.'], sources: [ML('Premenstrual Syndrome', 'premenstrualsyndrome')] },
      { id: 'energysleep', title: 'Energy & sleep', summary: 'Why tiredness comes and goes', overview: 'Energy often rises in the follicular phase and dips before and during your period. Many people also sleep more lightly before their period. Adults generally need 7 to 9 hours of sleep.', points: ['Keep a steady bedtime, especially on low-energy days.', 'Iron-rich foods help replace what is lost during your period.', 'Constant exhaustion with heavy periods can be a sign of anemia.'], sources: [ML('Healthy Sleep', 'healthysleep'), ML('Menstruation', 'menstruation')] },
      { id: 'headaches', title: 'Headaches', summary: 'Period-related headaches and migraines', overview: 'Some people get headaches or migraines just before or during their period, likely linked to the drop in estrogen.', points: ['Hydration, regular meals and sleep can help prevent them.', 'Logging headaches helps you and the app spot the pattern.', 'A sudden, severe headache needs medical care right away.'], sources: [ML('Headache', 'headache')] }
    ] },
    { id: 'conditions', name: 'Conditions', desc: 'When symptoms may point to something more', subs: [
      { id: 'endo', title: 'Endometriosis', summary: 'Painful periods and pelvic pain', overview: 'Endometriosis is when tissue similar to the lining of the uterus grows outside the uterus. It can cause painful periods, pelvic pain, pain during sex, heavy bleeding and trouble getting pregnant. It affects roughly 1 in 10 women of reproductive age, and diagnosis often takes years.', points: ['Period pain that disrupts daily life is not something you just have to live with.', 'Diagnosis may involve an exam, imaging, or a minor surgery called laparoscopy.', 'Treatments include pain relief, hormonal medicines and surgery.'], sources: [ML('Endometriosis', 'endometriosis'), AC('Endometriosis', 'endometriosis')] },
      { id: 'adeno', title: 'Adenomyosis', summary: 'Heavy, painful periods from the uterine wall', overview: 'Adenomyosis is when tissue like the lining of the uterus grows into the muscle wall of the uterus. It can cause heavy or long periods, severe cramps, pelvic pain and an enlarged, tender uterus. It is often found in people in their 30s and 40s, and it can happen alongside endometriosis.', points: ['It is usually diagnosed with an ultrasound or MRI.', 'Treatments include pain relief, hormonal medicines such as a hormonal IUD, and surgery in some cases.', 'Heavy bleeding from adenomyosis can lead to anemia, so tell your doctor if you feel very tired.'], sources: [{ name: 'MedlinePlus: Adenomyosis', url: 'https://medlineplus.gov/ency/article/001513.htm', domain: 'medlineplus.gov' }] },
      { id: 'pcos', title: 'PCOS', summary: 'Polycystic ovary syndrome', overview: 'PCOS is a common hormone condition. It can cause irregular or missed periods, acne, extra facial or body hair, and small fluid-filled sacs on the ovaries.', points: ['It is one of the most common causes of irregular periods.', 'It is linked with insulin resistance, so doctors may check blood sugar.', 'Treatment depends on symptoms and goals.'], sources: [ML('Polycystic Ovary Syndrome', 'polycysticovarysyndrome'), AC('Polycystic Ovary Syndrome (PCOS)', 'polycystic-ovary-syndrome-pcos')] },
      { id: 'pmdd', title: 'PMDD', summary: 'A severe form of PMS', overview: 'Premenstrual dysphoric disorder causes intense mood symptoms like depression, anxiety or irritability in the week or two before a period, strong enough to disrupt work, school or relationships.', points: ['Symptoms ease within a few days after the period starts.', 'Tracking symptoms over at least two cycles helps with diagnosis.', 'Treatments include certain antidepressants, birth control and therapy.'], sources: [ML('Premenstrual Syndrome', 'premenstrualsyndrome'), AC('Premenstrual Syndrome (PMS)', 'premenstrual-syndrome')] },
      { id: 'fibroids', title: 'Uterine fibroids', summary: 'Noncancerous growths in the uterus', overview: 'Fibroids are noncancerous growths in the uterus. Many cause no symptoms, but some cause heavy or long periods, pelvic pressure, or needing to pee often.', points: ['They are very common, especially with age.', 'An ultrasound can usually find them.', 'Treatment ranges from monitoring to medicine or procedures.'], sources: [ML('Uterine Fibroids', 'uterinefibroids')] },
      { id: 'irregular', title: 'Irregular or missed periods', summary: 'When your cycle is unpredictable', overview: 'Periods less than 21 or more than 35 days apart, cycles that vary a lot, or periods that stop for 3 months or more can have many causes, including pregnancy, stress, thyroid problems, PCOS and some medicines.', points: ['Take a pregnancy test if a period is late and pregnancy is possible.', 'Your calendar history can help a doctor find the cause.', 'Most causes are treatable.'], sources: [AC('Abnormal Uterine Bleeding', 'abnormal-uterine-bleeding')] }
    ] },
    { id: 'bc', name: 'Birth control & meds', desc: 'How they affect your cycle and this app', subs: [
      { id: 'hormonal', title: 'Hormonal birth control', summary: 'Pill, patch, ring, shot and implant', overview: 'Hormonal methods prevent pregnancy, and many of them stop ovulation. That means the bleeding during the placebo week of the pill is a withdrawal bleed, not a true period.', points: ['Periods often become lighter or less painful, and some people stop bleeding.', 'Spotting is common in the first few months.', 'Predictions in this app become estimates of bleeding days, not ovulation.'], sources: [ML('Birth Control', 'birthcontrol')] },
      { id: 'iud', title: 'IUDs', summary: 'Hormonal vs. copper', overview: 'Hormonal IUDs often make periods lighter, and some people stop having them. Copper IUDs have no hormones, so ovulation continues, but periods may be heavier or crampier, especially at first.', points: ['Tell the app which type you have in your Profile.', 'Irregular bleeding is common in the first months.', 'Severe pain or fever after insertion needs a doctor.'], sources: [ML('Birth Control', 'birthcontrol')] },
      { id: 'pain', title: 'Pain relievers', summary: 'Using NSAIDs safely for cramps', overview: 'NSAIDs like ibuprofen and naproxen lower prostaglandins, the chemicals behind cramps. They tend to work best when started early in your period.', points: ['Always follow the label dose.', 'Ask a doctor or pharmacist first if you have stomach, kidney or bleeding problems.', 'Heat and gentle movement can help too.'], sources: [ML('Pain Relievers', 'painrelievers')] },
      { id: 'notbc', title: 'Cycle tracking is not birth control', summary: 'Why fertile-day estimates are not protection', overview: 'Fertile days in this app are estimates. An app alone is not a reliable way to prevent pregnancy. Fertility awareness methods need training and daily body signs like temperature and discharge.', points: ['Use a proven method if you want to avoid pregnancy.', 'A doctor can help you choose one that fits you.', 'Emergency contraception is available if a method fails.'], sources: [ML('Birth Control', 'birthcontrol')] }
    ] },
    { id: 'basics', name: 'Period basics & products', desc: 'What is normal and what to use', subs: [
      { id: 'normal', title: 'What is a normal period?', summary: 'Length, flow and timing', overview: 'A typical period lasts 2 to 7 days and comes every 21 to 35 days in adults. Flow is usually heaviest in the first day or two, and small clots can be normal on heavy days.', points: ['Every body is a little different.', 'Changes from your usual pattern are worth noting.', 'Your calendar shows your own normal over time.'], sources: [ML('Menstruation', 'menstruation')] },
      { id: 'products', title: 'Pads, tampons, cups & more', summary: 'Choosing what works for you', overview: 'Options include pads, tampons, menstrual cups and discs, and period underwear. The best choice is whatever is comfortable and fits your life.', points: ['Change tampons every 4 to 8 hours and use the lowest absorbency you need.', 'Clean cups and discs as the package directs.', 'Toxic shock syndrome is rare but serious. Get care right away for sudden fever, rash or vomiting with a tampon or cup in.'], sources: [ML('Menstruation', 'menstruation')] },
      { id: 'heavy', title: 'Heavy bleeding', summary: 'When flow is more than normal', overview: 'Heavy menstrual bleeding is common and treatable. Signs include soaking through a pad or tampon every hour for several hours, needing to double up on products, or passing clots larger than a quarter.', points: ['Heavy periods can lead to anemia and tiredness.', 'Causes include fibroids, adenomyosis, hormone changes and bleeding disorders.', 'A doctor can help find the cause and treatment.'], sources: [AC('Heavy Menstrual Bleeding', 'heavy-menstrual-bleeding')] }
    ] },
    { id: 'fertility', name: 'Fertility & ovulation', desc: 'Your fertile window, explained', subs: [
      { id: 'window', title: 'The fertile window', summary: 'When pregnancy is possible', overview: 'Pregnancy is possible on about six days each cycle: the five days before ovulation and the day of ovulation, because sperm can live in the body for up to five days.', points: ['Ovulation timing shifts from cycle to cycle.', 'The fertile days in this app are estimates.', 'They should not be used as birth control on their own.'], sources: [ML('Menstruation', 'menstruation')] },
      { id: 'signs', title: 'Signs of ovulation', summary: 'What your body may tell you', overview: 'Some people notice clear, stretchy discharge, mild pain on one side of the pelvis, or a small rise in basal body temperature after ovulation.', points: ['Not everyone notices signs.', 'Ovulation tests detect the LH surge in urine.', 'Logging signs can make estimates more personal.'], sources: [ML('Menstruation', 'menstruation')] }
    ] },
    { id: 'stages', name: 'Life stages', desc: 'First periods to menopause', subs: [
      { id: 'first', title: 'First periods', summary: 'What to expect early on', overview: 'Periods usually start between ages 10 and 15. Cycles are often irregular for the first couple of years while the body settles into a pattern.', points: ['Early cycles can vary a lot in length.', 'Severe pain or very heavy bleeding is still worth a doctor visit.', 'No period by age 15 is worth checking.'], sources: [ML('Menstruation', 'menstruation')] },
      { id: 'postpartum', title: 'After pregnancy', summary: 'When periods come back', overview: 'Periods can return within weeks after giving birth if you are not breastfeeding, and later if you are. Ovulation can happen before the first period returns.', points: ['Early cycles after birth may be irregular.', 'Pregnancy is possible before your period returns.', 'Very heavy bleeding after birth needs medical care.'], sources: [ML('Menstruation', 'menstruation')] },
      { id: 'peri', title: 'Perimenopause & menopause', summary: 'The transition years', overview: 'Perimenopause is the transition before menopause, often starting in your 40s, with irregular periods, hot flashes and sleep changes. Menopause is 12 months in a row without a period, at an average age of about 51 in the US.', points: ['Cycle predictions get less certain during this time.', 'Bleeding after menopause should always be checked.', 'Many treatments can ease symptoms.'], sources: [ML('Menopause', 'menopause'), AC('The Menopause Years', 'the-menopause-years')] }
    ] },
    { id: 'doctor', name: 'When to see a doctor', desc: 'Signs worth getting checked', subs: [
      { id: 'redflags', title: 'Signs to get checked', summary: 'Symptoms you should not ignore', overview: 'See a doctor for pain that disrupts daily life, soaking through a pad or tampon every hour for several hours, bleeding between periods or after sex, periods that stop for 3 months or more, or cycles shorter than 21 or longer than 35 days.', points: ['Sudden high fever, rash or dizziness while using a tampon is an emergency.', 'Severe mood changes before periods are treatable.', 'Trust yourself. If something feels wrong, get it checked.'], sources: [AC('Abnormal Uterine Bleeding', 'abnormal-uterine-bleeding'), AC('Heavy Menstrual Bleeding', 'heavy-menstrual-bleeding')] },
      { id: 'prepare', title: 'Preparing for an appointment', summary: 'What to bring and ask', overview: 'Doctors often ask when your last few periods started, how long they lasted, how heavy they were, what symptoms you had, and what medicines you take. Your calendar history in this app can help you answer.', points: ['Write down your questions ahead of time.', 'Note how symptoms affect school, work or sleep.', 'Bring a list of medicines and birth control.'], sources: [ML('Menstruation', 'menstruation')] }
    ] }
  ];
  var BANDS = ['#EFBE93', '#C9806A', '#A44849', '#7F2D41', '#5A1838', '#350929', '#C9806A', '#A44849'];
  var DARK_BANDS = ['#A44849', '#7F2D41', '#5A1838', '#350929'];

  var LATE_LUTEAL_WHY = 'Late luteal phase: progesterone and estrogen are falling, which is linked to PMS. You also logged these symptoms around this point in your last 3 cycles.';
  var PERIOD_WHY = 'Prostaglandins cause cramps early in a period, and blood loss can lower energy. Your last periods were heaviest on day 2.';
  var FORECAST = [
    { day: 'Today', date: 'Wed, Nov 18', headline: 'Lower energy, bloating likely', e: 3, phase: 'Luteal', period: false, sleep: '8 or more hours', move: '30 minute walk or yoga', eat: 'Leafy greens, nuts, oats', why: LATE_LUTEAL_WHY },
    { day: 'Thursday', date: 'Nov 19', headline: 'Possible headache', e: 2, phase: 'Luteal', period: false, event: '8:00 AM Biology lab.', eventTip: 'Try to be in bed by 10:30 tonight.', sleep: '8 or more hours, early bedtime', move: 'Light stretching', eat: 'Regular meals, water, yogurt', why: 'You logged a headache on day 25 last cycle, and the drop in estrogen before a period can trigger headaches.' },
    { day: 'Friday', date: 'Nov 20', headline: 'Cravings, breast tenderness', e: 2, phase: 'Luteal', period: false, sleep: '8 or more hours', move: 'Gentle walk', eat: 'Beans, whole grains, a little dark chocolate', why: LATE_LUTEAL_WHY },
    { day: 'Saturday', date: 'Nov 21', headline: 'Mood dips, lighter sleep', e: 2, phase: 'Luteal', period: false, sleep: '8 to 9 hours', move: 'Yoga or an easy bike ride', eat: 'Complex carbs; less salt and caffeine', why: LATE_LUTEAL_WHY },
    { day: 'Sunday', date: 'Nov 22', headline: 'Period likely starts, with cramps', e: 1, phase: 'Period', period: true, sleep: '8 or more hours', move: 'Rest or a light walk; heat helps', eat: 'Iron-rich foods with vitamin C', why: PERIOD_WHY },
    { day: 'Monday', date: 'Nov 23', headline: 'Heavier flow, cramps', e: 1, phase: 'Period', period: true, event: '10:00 AM Stats midterm.', eventTip: 'Pack pain relief, period products and a snack.', sleep: '8 or more hours', move: 'Light stretching', eat: 'Iron-rich foods, plenty of water', why: PERIOD_WHY },
    { day: 'Tuesday', date: 'Nov 24', headline: 'Cramps easing', e: 2, phase: 'Period', period: true, sleep: '7 to 9 hours', move: 'Walk or gentle yoga', eat: 'Spinach, beans, citrus', why: 'Cramps usually ease after the first 2 to 3 days as prostaglandin levels fall.' }
  ];
  var ENERGY_WORDS = ['', 'Very low', 'Low', 'Moderate', 'Good', 'High'];

  // ---------- Icons ----------
  function svg(inner, size, color, width) {
    return '<svg aria-hidden="true" width="' + (size || 22) + '" height="' + (size || 22) + '" viewBox="0 0 24 24" fill="none" stroke="' + (color || 'currentColor') + '" stroke-width="' + (width || 1.8) + '" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
  }
  var I = {
    sun: '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M3 10h18"></path>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"></path><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"></path>',
    cloud: '<path d="M17.5 19a4.5 4.5 0 1 0-1.4-8.8A6 6 0 1 0 6 19z"></path>',
    user: '<circle cx="12" cy="8" r="4"></circle><path d="M4 21c0-4 4-6 8-6s8 2 8 6"></path>',
    right: '<path d="M9 6l6 6-6 6"></path>',
    left: '<path d="M15 6l-6 6 6 6"></path>',
    down: '<path d="M6 9l6 6 6-6"></path>',
    plus: '<path d="M12 5v14M5 12h14"></path>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"></path>',
    close: '<path d="M6 6l12 12M18 6L6 18"></path>',
    info: '<circle cx="12" cy="12" r="9"></circle><path d="M12 8v5M12 16.5v.5"></path>',
    spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"></path>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"></path>',
    pencil: '<path d="M4 20h4L19 9l-4-4L4 16z"></path>',
    clip: '<rect x="4" y="4" width="16" height="17" rx="2"></rect><path d="M9 2.5v3M15 2.5v3M9 12h6M9 16h4"></path>',
    food: '<path d="M12 7c-3-3-8-1-8 4 0 5 4 10 8 10s8-5 8-10c0-5-5-7-8-4z"></path><path d="M12 7c0-2 1-4 3-4"></path>',
    run: '<circle cx="13" cy="4" r="2"></circle><path d="M7 21l3-6 3 2v5M10 15l1-6 4 3 3 1M11 9l-4 2-1 3"></path>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"></path>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path>'
  };

  // ---------- Helpers ----------
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function defaults() {
    return {
      profile: { name: 'Jordan Lee', purposes: ['Understand my symptoms', 'Plan around my cycle'], bc: 'None', meds: ['Ibuprofen (as needed)', 'Iron supplement'], diagnoses: [], customDiag: [], cal: true },
      logs: {},
      reminders: {}
    };
  }
  function load() {
    try {
      var raw = localStorage.getItem(STORE);
      if (raw) { var d = JSON.parse(raw); var base = defaults(); return { profile: Object.assign(base.profile, d.profile || {}), logs: d.logs || {}, reminders: d.reminders || {} }; }
    } catch (e) { /* storage unavailable */ }
    return defaults();
  }
  function persist() { try { localStorage.setItem(STORE, JSON.stringify(db)); } catch (e) { /* ignore */ } }

  var db = load();
  var ui = { cal: { month: 1, sel: TODAY, topic: null }, fcOpen: -1, survey: null, draft: null, dirty: false, savedFlash: false, dialog: null, signedOut: false };

  function cyc(sv) {
    var start = 26 + 27 * Math.floor((sv - 26) / 27);
    var day = sv - start + 1;
    var phase = day <= 5 ? 'Period' : day <= 10 ? 'Follicular' : day <= 14 ? 'Ovulation window' : 'Luteal';
    return { day: day, phase: phase };
  }
  function monthOf(sv) { var m = MONTHS[0]; MONTHS.forEach(function (x) { if (sv >= x.start && sv < x.start + x.len) m = x; }); return m; }
  function label(sv, long) { var m = monthOf(sv); return (long ? DAYS_LONG : DAYS_SHORT)[(sv + 3) % 7] + ', ' + m.short + ' ' + (sv - m.start + 1); }

  function generated(sv) {
    var d = cyc(sv).day;
    var meds = db.profile.meds;
    var daily = meds.filter(function (m) { return !/as needed/i.test(m); });
    var all = meds.slice();
    if (d <= 5) return { period: 'Yes', flow: ['Medium', 'Heavy', 'Medium', 'Light', 'Spotting'][d - 1], symptoms: d <= 2 ? ['Cramps', 'Back pain', 'Fatigue'] : d === 3 ? ['Cramps'] : [], painLevels: d === 1 ? { 'Cramps': 'Moderate', 'Back pain': 'Mild' } : d === 2 ? { 'Cramps': 'Severe', 'Back pain': 'Moderate' } : d === 3 ? { 'Cramps': 'Mild' } : {}, energy: d <= 2 ? 'Low' : 'Okay', feelings: d <= 2 ? ['Sensitive'] : ['Calm'], sleep: 'Okay', stress: 'Medium', medsTaken: d <= 2 ? all : daily };
    if (d <= 10) return { period: 'No', flow: null, symptoms: d === 7 ? ['Acne'] : [], painLevels: {}, energy: 'Good', feelings: ['Motivated', 'Happy'], sleep: 'Good', stress: 'Low', medsTaken: daily };
    if (d <= 14) return { period: 'No', flow: null, symptoms: d === 13 ? ['Bloating'] : [], painLevels: {}, energy: 'High', feelings: ['Happy'], sleep: 'Great', stress: 'Low', medsTaken: daily };
    if (d <= 20) return { period: 'No', flow: null, symptoms: ['Cravings'], painLevels: {}, energy: 'Okay', feelings: ['Calm'], sleep: 'Good', stress: 'Medium', medsTaken: daily };
    return { period: 'No', flow: null, symptoms: d === 25 ? ['Headache', 'Bloating', 'Cravings'] : ['Bloating', 'Breast tenderness'], painLevels: d === 25 ? { 'Headache': 'Moderate' } : { 'Breast tenderness': 'Mild' }, energy: 'Low', feelings: ['Irritable', 'Anxious'], sleep: 'Poor', stress: 'High', medsTaken: d === 25 ? all : daily };
  }
  function getLog(sv) {
    if (db.logs[sv]) return db.logs[sv];
    if (sv >= TODAY || MISSING.indexOf(sv) > -1) return null;
    return generated(sv);
  }

  function predict(sv) {
    var c = cyc(sv), d = c.day, p;
    if (d <= 5) p = { sym: d <= 2 ? 'Cramps, lower back ache, tiredness' : 'Cramps easing, lighter flow', symTopic: 'cramps', crave: 'Salty or sweet snacks', energy: d <= 2 ? 'Lower, especially days 1 and 2' : 'Slowly returning', sleep: '8+ hours; rest helps with cramps' };
    else if (d <= 10) p = { sym: 'Usually few; skin may clear up', symTopic: 'symptoms', crave: 'Fewer cravings', energy: 'Rising', sleep: '7 to 9 hours' };
    else if (d <= 14) p = { sym: 'Possible mild one-sided twinge, more discharge, some bloating', symTopic: 'symptoms', crave: 'Appetite may dip', energy: 'Often at its highest', sleep: '7 to 9 hours' };
    else if (d <= 20) p = { sym: 'Mild bloating possible', symTopic: 'pms', crave: 'Carbs may sound good', energy: 'Steady, starting to dip', sleep: '7 to 9 hours' };
    else p = { sym: 'Bloating, breast tenderness, mood changes', symTopic: 'pms', crave: 'Sweet and carb-heavy foods', energy: 'Lower', sleep: '8+ hours; sleep is often lighter' };
    if (d === 25) { p.sym = 'Headache possible (you logged one on day 25 last cycle), plus bloating and breast tenderness'; p.symTopic = 'headache'; }
    return [
      { label: 'Phase', value: c.phase + ', day ' + d, topic: 'phase' },
      { label: 'Expected symptoms', value: p.sym, topic: p.symTopic },
      { label: 'Cravings', value: p.crave, topic: 'cravings' },
      { label: 'Energy', value: p.energy, topic: 'energy' },
      { label: 'Sleep need', value: p.sleep, topic: 'sleep' }
    ];
  }
  function symText(f) {
    var sym = f.symptoms || [], pl = f.painLevels || {};
    return sym.length ? sym.map(function (x) { return pl[x] ? x + ' (' + pl[x].toLowerCase() + ')' : x; }).join(', ') : 'None';
  }
  function logRows(f) {
    var sym = f.symptoms || [], feel = f.feelings || [];
    var rows = [
      { label: 'Period', value: f.period === 'Yes' ? 'Yes' + (f.flow ? ', ' + f.flow.toLowerCase() + ' flow' : '') : (f.period || 'Skipped'), topic: 'flow' },
      { label: 'Symptoms', value: symText(f), topic: sym.indexOf('Cramps') > -1 ? 'cramps' : sym.indexOf('Headache') > -1 ? 'headache' : sym.indexOf('Cravings') > -1 ? 'cravings' : 'symptoms' },
      { label: 'Energy', value: f.energy || 'Skipped', topic: 'energy' },
      { label: 'Feelings', value: feel.length ? feel.join(', ') : 'None', topic: 'mood' },
      { label: 'Sleep quality', value: f.sleep || 'Skipped', topic: 'sleep' },
      { label: 'Stress', value: f.stress || 'Skipped', topic: 'stress' }
    ];
    if (f.medsTaken) rows.push({ label: 'Medications taken', value: f.medsTaken.length ? f.medsTaken.join(', ') : 'Skipped', topic: 'meds' });
    return rows;
  }

  // ---------- Shared pieces ----------
  function note(html) { return '<div class="note" role="note">' + svg(I.info, 18, '#7F2D41', 2) + '<p>' + html + '</p></div>'; }
  var AI_NOTE = '<strong>AI can make mistakes.</strong> These are estimates from cycle research and your own logs, not medical advice. Talk to a doctor about any health concerns.';

  function nav(active) {
    var items = [['today', 'Today', I.sun], ['calendar', 'Calendar', I.cal], ['library', 'Library', I.book], ['forecast', 'Forecast', I.cloud], ['profile', 'Profile', I.user]];
    return '<nav class="nav" aria-label="Main">' + items.map(function (it) {
      var on = it[0] === active;
      return '<a href="#/' + it[0] + '"' + (on ? ' aria-current="page"' : '') + '>' + svg(it[2], 22, 'currentColor', on ? 2 : 1.8) + it[1] + '</a>';
    }).join('') + '</nav>';
  }
  function seeRow(r) {
    return '<div class="row"><div class="row-text"><span class="row-label">' + esc(r.label) + '</span><span class="row-value">' + esc(r.value) + '</span></div>' +
      '<button class="see-more" data-act="topic" data-topic="' + esc(r.topic) + '" aria-label="See more about ' + esc(r.label) + '">See more' + svg(I.right, 16, '#7F2D41', 2) + '</button></div>';
  }
  function chip(on, act, attrs, text, cls) {
    return '<button class="' + (cls || 'chip') + (on ? ' on' : '') + '" aria-pressed="' + (on ? 'true' : 'false') + '" data-act="' + act + '" ' + attrs + '>' + text + '</button>';
  }
  function dv(v) { return 'data-v="' + esc(v) + '"'; }

  // ---------- Today ----------
  function renderToday() {
    var logged = db.logs[TODAY];
    var btn = logged
      ? '<button class="checkin-btn done" data-act="openSurvey" data-day="' + TODAY + '"><span class="checkin-icon">' + svg(I.check, 20, '#FFFFFF', 2.5) + '</span><span class="checkin-text"><span class="checkin-title">Checked in today</span><span class="checkin-sub">Tap to review or edit</span></span></button>'
      : '<button class="checkin-btn" data-act="openSurvey" data-day="' + TODAY + '"><span class="checkin-icon">' + svg(I.plus, 20, '#FFFFFF', 2.2) + '</span><span class="checkin-text"><span class="checkin-title">Start today\'s check-in</span><span class="checkin-sub">About 1 minute · makes your predictions smarter</span></span>' + svg(I.right, 20, '#FFFFFF', 2) + '</button>';
    function sugg(icon, kicker, title, text) {
      return '<section class="card sugg"><span class="sugg-icon">' + svg(icon, 22, '#7F2D41') + '</span><div class="sugg-body"><p class="sugg-kicker">' + kicker + '</p><p class="sugg-title">' + title + '</p><p class="sugg-text">' + text + '</p></div></section>';
    }
    return '<main class="screen" data-scroll="main">' +
      '<div class="pagehead"><p class="sub">Wednesday, November 18</p><h1 class="h1">Today</h1></div>' + btn +
      '<section class="card"><div class="dayhead"><div style="display:flex;flex-direction:column;gap:4px"><p class="small muted" style="font-weight:600">Cycle day 24 of about 27</p><h2 style="font-size:22px;font-weight:700;color:var(--plum2)">Luteal phase</h2></div><span class="tag tag-rose">Period in ~4 days</span></div>' +
      '<div role="img" aria-label="Cycle progress: day 24, late luteal phase" style="display:flex;flex-direction:column;gap:6px"><div class="progress-track"><div style="width:18.5%;background:var(--brick)"></div><div style="width:18.5%;background:var(--peachlight)"></div><div style="width:14.8%;background:var(--peach)"></div><div style="flex:1;background:var(--terra)"></div><span class="marker" style="left:86%"></span></div>' +
      '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted)"><span>Period</span><span>Follicular</span><span>Ovulation</span><span>Luteal</span></div></div>' +
      '<p style="font-size:14px;line-height:1.5;color:var(--body)">Progesterone is high, and both it and estrogen start to fall in the days before your period. For many people this shift brings PMS symptoms.</p>' +
      '<a href="#/library/phases/luteal" style="font-size:14px;font-weight:600;min-height:32px;display:flex;align-items:center">Learn about the luteal phase</a></section>' +
      '<section class="card"><div class="dayhead" style="align-items:center"><h2 style="font-size:18px;font-weight:700">What to expect today</h2><span class="tag tag-sand">AI ESTIMATE</span></div>' +
      '<p class="eyebrow" style="color:var(--muted)">LIKELY</p><div class="chips" style="gap:6px"><span class="pill pill-likely">Lower energy</span><span class="pill pill-likely">Bloating</span><span class="pill pill-likely">Sweet cravings</span></div>' +
      '<p class="eyebrow" style="color:var(--muted);padding-top:4px">POSSIBLE</p><div class="chips" style="gap:6px"><span class="pill pill-possible">Breast tenderness</span><span class="pill pill-possible">Irritability</span></div>' +
      '<p class="small muted">Based on typical late-luteal symptoms and your last 3 cycles. You logged bloating on days 22 to 26 each time.</p></section>' +
      '<h2 style="margin:6px 4px 0;font-size:18px;font-weight:700">Today\'s suggestions</h2>' +
      sugg(I.food, 'Food &amp; nutrients', 'Magnesium, calcium and complex carbs', 'Try leafy greens, nuts, yogurt, oats or beans. Research links calcium to milder PMS, and steady carbs can help with cravings.') +
      sugg(I.run, 'Exercise', 'About 30 minutes, gentle to moderate', 'A walk, yoga or an easy bike ride. Regular movement may ease PMS. Go lighter if you feel drained.') +
      sugg(I.moon, 'Sleep', 'Aim for 8 or more hours tonight', 'Adults need 7 to 9 hours. Sleep is often lighter before a period, and you logged poor sleep on days 25 and 26 last cycle.') +
      note(AI_NOTE) +
      '</main>' + nav('today');
  }

  // ---------- Calendar ----------
  function renderCalendar() {
    var c = ui.cal;
    if (c.topic && TOPICS[c.topic]) return renderTopic(TOPICS[c.topic], label(c.sel, false)) + nav('calendar');
    var M = MONTHS[c.month];
    var lead = (M.start + 3) % 7;
    var cells = '';
    for (var i = 0; i < lead; i++) cells += '<div class="cell"></div>';
    for (var d = 1; d <= M.len; d++) {
      var sv = M.start + d - 1, cy = cyc(sv);
      var past = sv < TODAY, isToday = sv === TODAY, sel = sv === c.sel;
      var logged = past ? !!getLog(sv) : !!db.logs[sv];
      var cls = 'day', kind = '';
      if (cy.day <= 5 && past) { cls += ' period'; kind = ', period'; }
      else if (cy.day <= 5) { cls += ' pred'; kind = ', predicted period'; }
      else if (cy.phase === 'Ovulation window') { cls += ' fertile'; kind = ', estimated fertile window'; }
      if (isToday) cls += ' today';
      if (sel) cls += ' sel';
      if (logged) cls += ' logged';
      cells += '<div class="cell"><button class="' + cls + '" data-act="calSel" data-day="' + sv + '" aria-pressed="' + sel + '" aria-label="' + esc(label(sv, true) + (isToday ? ', today' : '') + kind + (logged ? ', checked in' : '')) + '"><span>' + d + '</span><span class="dot"></span></button></div>';
    }
    var sel = c.sel, sc = cyc(sel), isPast = sel < TODAY, isToday = sel === TODAY;
    var log = isPast ? getLog(sel) : (db.logs[sel] || null);
    var ev = EVENTS[sel];
    var badge = isToday ? '<span class="tag tag-ink">Today</span>' : isPast ? (log ? '<span class="tag tag-wine">Logged</span>' : '<span class="tag tag-dashed">Not logged</span>') : '<span class="tag tag-tint">Prediction</span>';
    var body = '<div class="dayhead"><div style="display:flex;flex-direction:column;gap:2px"><h2 style="font-size:20px;font-weight:700">' + esc(label(sel, true)) + (isToday ? ' (today)' : '') + '</h2><span class="sub" style="font-size:14px">Cycle day ' + sc.day + ' · ' + sc.phase + '</span></div>' + badge + '</div>';
    if (ev) {
      var rem = !!db.reminders[sel];
      body += '<section class="event"><div class="event-kicker">' + svg(I.spark, 16, '#EFBE93', 2) + 'AI suggestion from your calendar</div><p style="font-size:15px;font-weight:700">' + esc(ev.time + ' · ' + ev.title) + '</p><p class="event-tip">' + esc(ev.tip) + '</p>' +
        '<button class="event-btn' + (rem ? ' on' : '') + '" data-act="reminder" aria-pressed="' + rem + '">' + (rem ? 'Reminder added' : 'Add a reminder') + '</button><p style="font-size:12px;color:#E3C6D1">AI can make mistakes. Not medical advice.</p></section>';
    }
    if (!log && (isPast || isToday)) {
      body += '<section class="card missing"><span>' + svg(I.clip, 28, '#A44849') + '</span><div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px"><p style="font-size:15px;font-weight:700">' + (isToday ? 'You have not checked in today' : 'No check-in this day') + '</p><p class="small muted">' + (isToday ? 'A quick check-in helps your predictions learn your patterns.' : 'You can still add one. It helps the app learn your patterns.') + '</p></div>' +
        '<button class="btn btn-primary btn-sm" data-act="openSurvey" data-day="' + sel + '">' + (isToday ? 'Check in now' : 'Add check-in') + '</button></section>';
    }
    if (log) {
      body += '<section class="card card-tight"><div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:8px"><p class="eyebrow">WHAT YOU LOGGED</p><button class="btn btn-outline btn-sm" data-act="openSurvey" data-day="' + sel + '">' + svg(I.pencil, 15, '#7F2D41', 2) + 'Edit check-in</button></div>' + logRows(log).map(seeRow).join('') + '</section>';
    }
    if (!isPast) {
      body += '<section class="card card-tight"><p class="eyebrow" style="padding-top:10px">PREDICTION</p>' + predict(sel).map(seeRow).join('') + '</section>';
    }
    body += note('<strong>AI can make mistakes.</strong> Predictions and fertile days are estimates, not medical advice or birth control. Ask a doctor about health concerns.');
    return '<div class="split"><div class="cal-top"><div class="cal-head"><h1>' + M.name + '</h1>' +
      (c.month !== 1 || c.sel !== TODAY ? '<button class="btn btn-outline btn-sm" style="min-height:36px" data-act="calToday">Today</button>' : '') +
      '<button class="icon-btn" data-act="calPrev" aria-label="Previous month"' + (c.month === 0 ? ' disabled' : '') + '>' + svg(I.left, 20, '#100110', 2) + '</button>' +
      '<button class="icon-btn" data-act="calNext" aria-label="Next month"' + (c.month === MONTHS.length - 1 ? ' disabled' : '') + '>' + svg(I.right, 20, '#100110', 2) + '</button></div>' +
      '<div class="grid7">' + ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(function (w) { return '<span class="wd">' + w + '</span>'; }).join('') + cells + '</div>' +
      '<div class="legend"><span><i class="sw" style="background:var(--brick)"></i>Period</span><span><i class="sw" style="background:var(--rose);border:1.5px dashed var(--brick)"></i>Predicted period</span><span><i class="sw" style="background:var(--peach)"></i>Fertile window (est.)</span><span><i class="sw" style="width:6px;height:6px;background:var(--wine)"></i>Checked in</span></div></div>' +
      '<div class="scroll" data-scroll="calday">' + body + '</div></div>' + nav('calendar');
  }

  function renderTopic(t, backLabel) {
    return '<main class="screen" data-scroll="topic"><button class="btn-text back" data-act="topicClose">' + svg(I.left, 20, '#7F2D41', 2) + 'Back to ' + esc(backLabel) + '</button>' +
      '<h1 class="h1-sm" style="color:var(--plum)">' + esc(t.title) + '</h1><p class="topic-intro">' + esc(t.intro) + '</p>' +
      '<section class="card"><h2 style="font-size:16px;font-weight:700">What can help</h2>' + t.points.map(function (p) { return '<div class="bullet"><p>' + esc(p) + '</p></div>'; }).join('') + '</section>' +
      '<section class="doctor"><h2>When to see a doctor</h2><p>' + esc(t.doctor) + '</p></section>' +
      sourceLink(t.src) +
      '<a href="#/library" style="font-size:15px;font-weight:600;min-height:40px;display:flex;align-items:center">Browse more in the Library</a>' +
      '<p class="small muted" style="font-size:12px">General information, not medical advice. Your doctor knows your health best.</p></main>';
  }
  function sourceLink(s) {
    return '<a class="source" href="' + esc(s.url) + '" target="_blank" rel="noopener"><span class="source-text"><span class="source-name">' + esc(s.name) + '</span><span style="font-size:12px;color:var(--muted)">' + esc(s.domain) + ' · opens in a new tab</span></span>' + svg(I.ext, 18, '#7F2D41', 2) + '</a>';
  }

  // ---------- Library ----------
  function renderLibrary(catId, subId) {
    var cat = null, sub = null, idx = 0;
    LIBRARY.forEach(function (c, i) { if (c.id === catId) { cat = c; idx = i; } });
    if (cat) cat.subs.forEach(function (s) { if (s.id === subId) sub = s; });
    var html;
    if (!cat) {
      html = '<div class="pagehead"><h1 class="h1">Library</h1><p class="sub">Trusted info about your cycle. Pick a topic to explore.</p></div><div class="libgrid">' +
        LIBRARY.map(function (c, i) {
          return '<a class="libcard" href="#/library/' + c.id + '"><span class="libband" style="background:' + BANDS[i] + '"></span><span class="libbody"><span class="libname">' + esc(c.name) + '</span><span class="libdesc">' + esc(c.desc) + '</span><span class="libcount">' + c.subs.length + ' topics</span></span></a>';
        }).join('') + '</div>';
    } else if (!sub) {
      var bg = BANDS[idx], dark = DARK_BANDS.indexOf(bg) > -1;
      html = '<a class="btn-text back" href="#/library">' + svg(I.left, 20, '#7F2D41', 2) + 'Library</a>' +
        '<div class="cathead" style="background:' + bg + ';color:' + (dark ? '#FFFFFF' : '#100110') + '"><h1 class="h1-sm">' + esc(cat.name) + '</h1><p style="font-size:15px;line-height:1.45">' + esc(cat.desc) + '</p></div>' +
        cat.subs.map(function (s) {
          return '<a class="subcard" href="#/library/' + cat.id + '/' + s.id + '"><span style="flex:1;display:flex;flex-direction:column;gap:3px"><span style="font-size:16px;font-weight:700">' + esc(s.title) + '</span><span style="font-size:14px;line-height:1.35;color:var(--muted)">' + esc(s.summary) + '</span></span>' + svg(I.right, 20, '#7F2D41', 2) + '</a>';
        }).join('');
    } else {
      html = '<nav class="crumbs" aria-label="Breadcrumb"><a href="#/library">Library</a><span aria-hidden="true" class="muted">/</span><a href="#/library/' + cat.id + '">' + esc(cat.name) + '</a></nav>' +
        '<h1 class="h1-sm" style="color:var(--plum)">' + esc(sub.title) + '</h1><p class="topic-intro" style="line-height:1.6">' + esc(sub.overview) + '</p>' +
        '<section class="card"><h2 style="font-size:16px;font-weight:700">Key points</h2>' + sub.points.map(function (p) { return '<div class="bullet"><p>' + esc(p) + '</p></div>'; }).join('') + '</section>' +
        '<h2 style="font-size:16px;font-weight:700;margin-top:4px">Learn more from trusted sources</h2>' + sub.sources.map(sourceLink).join('') +
        note('<strong>General information, not medical advice.</strong> Summaries may contain mistakes. Ask a doctor about your own health.');
    }
    return '<main class="screen" data-scroll="lib">' + html + '</main>' + nav('library');
  }

  // ---------- Forecast ----------
  function renderForecast() {
    var rows = FORECAST.map(function (d, i) {
      var open = ui.fcOpen === i;
      var detail = open ? '<div class="fc-detail">' + (d.event ? '<div class="fc-event"><strong>' + esc(d.event) + '</strong> ' + esc(d.eventTip) + '</div>' : '') +
        '<div class="kv"><span class="kv-k">SLEEP</span><span class="kv-v">' + esc(d.sleep) + '</span></div>' +
        '<div class="kv"><span class="kv-k">MOVE</span><span class="kv-v">' + esc(d.move) + '</span></div>' +
        '<div class="kv"><span class="kv-k">EAT</span><span class="kv-v">' + esc(d.eat) + '</span></div>' +
        '<p class="why"><strong>Why:</strong> ' + esc(d.why) + '</p></div>' : '';
      return '<div class="fc' + (d.period ? ' period' : '') + (open ? ' open' : '') + '"><button class="fc-btn" data-act="fcToggle" data-i="' + i + '" aria-expanded="' + open + '">' +
        '<span class="fc-top"><span class="fc-day">' + esc(d.day) + ' <span>· ' + esc(d.date) + '</span></span><span class="tag ' + (d.period ? 'tag-brick' : 'tag-sand') + '">' + d.phase + '</span>' + '<span class="chev">' + svg(I.down, 20, '#6A4B57', 2) + '</span></span>' +
        '<span class="fc-head">' + esc(d.headline) + '</span>' +
        '<span class="energy"><span class="energy-label">Energy</span><span class="energy-track"><span class="energy-fill" style="display:block;width:' + (d.e * 20) + '%;background:' + (d.e <= 1 ? 'var(--brick)' : 'var(--terra)') + '"></span></span><span class="energy-word">' + ENERGY_WORDS[d.e] + '</span></span>' +
        '</button>' + detail + '</div>';
    }).join('');
    return '<main class="screen" data-scroll="fc" style="gap:12px"><div class="pagehead" style="gap:6px;padding-bottom:8px"><h1 class="h1">Your 7-day forecast</h1><p class="sub">Built from cycle research and your own logs. Tap a day for details.</p><span class="tag tag-sand" style="align-self:flex-start;margin-top:4px">Medium confidence · 3 cycles logged</span></div>' +
      rows + note('<strong>AI can make mistakes.</strong> This forecast is an estimate that gets sharper as you log. It is not medical advice, so check with a doctor about health concerns.') + '</main>' + nav('forecast');
  }

  // ---------- Profile ----------
  function renderProfile() {
    if (ui.signedOut) {
      return '<main class="screen" style="align-items:center;justify-content:center;text-align:center;padding:32px"><div style="width:72px;height:72px;border-radius:36px;background:var(--peach)"></div><h1 class="h1-sm">You are signed out</h1><p class="sub">Your data stays saved. Sign in to pick up where you left off.</p><button class="btn btn-primary" data-act="signIn" style="margin-top:8px;padding:0 36px">Sign in</button></main>' + nav('profile');
    }
    if (!ui.draft) ui.draft = clone(db.profile);
    var p = ui.draft;
    var parts = p.name.trim().split(/\s+/);
    var initials = (((parts[0] || '').charAt(0)) + (parts.length > 1 ? parts[parts.length - 1].charAt(0) : '')).toUpperCase() || '?';
    var diagAll = BASE_DIAG.concat(p.customDiag, ['None of these']);
    var html = '<main class="screen" data-scroll="profile">' +
      '<div style="display:flex;align-items:center;gap:14px;padding:0 4px"><div class="avatar" aria-hidden="true">' + esc(initials) + '</div><div style="display:flex;flex-direction:column;gap:2px;min-width:0"><h1 style="font-size:24px;font-weight:700">' + esc(p.name || 'Your name') + '</h1><span class="sub" style="font-size:14px">jordan@example.com</span></div></div>' +
      '<section class="card"><label for="pf-name" style="font-size:14px;font-weight:700">Name</label><input id="pf-name" class="field" type="text" value="' + esc(p.name) + '" data-input="name"></section>' +
      '<section class="card"><h2 style="font-size:16px;font-weight:700">Why are you tracking?</h2><p class="small muted">Choose any. This shapes which tips you see.</p><div class="chips">' +
      PURPOSES.map(function (o) { return chip(p.purposes.indexOf(o) > -1, 'pfPurpose', dv(o), esc(o)); }).join('') + '</div></section>' +
      '<section class="card"><label for="pf-bc" style="font-size:16px;font-weight:700">Birth control</label><select id="pf-bc" class="field" data-change="bc">' +
      BC.map(function (o) { return '<option' + (p.bc === o ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select>' +
      (HORMONAL.indexOf(p.bc) > -1 ? '<p class="hint-box">Hormonal birth control changes how your cycle works, so predictions will show expected bleeding days instead of ovulation.</p>' : '') + '</section>' +
      '<section class="card"><h2 style="font-size:16px;font-weight:700">Medications</h2><p class="small muted">Any medicine or supplement you take. Your check-in will ask which ones you took that day.</p>' +
      p.meds.map(function (m, i) { return '<div class="medrow"><span>' + esc(m) + '</span><button class="icon-btn" style="border:none;background:none" data-act="pfMedRemove" data-i="' + i + '" aria-label="Remove ' + esc(m) + '">' + svg(I.close, 18, '#7F2D41', 2) + '</button></div>'; }).join('') +
      '<div class="addrow"><label for="pf-med" class="sr">Add a medication</label><input id="pf-med" class="field" type="text" placeholder="e.g. allergy medicine, vitamin D" data-enter="pfMedAdd"><button class="btn btn-outline btn-sm" style="border-radius:12px;min-height:44px" data-act="pfMedAdd">Add</button></div></section>' +
      '<section class="card"><h2 style="font-size:16px;font-weight:700">Diagnoses</h2><p class="small muted">Only add conditions a doctor has diagnosed. They help tailor your Library and predictions.</p><div class="chips">' +
      diagAll.map(function (o) { return chip(p.diagnoses.indexOf(o) > -1, 'pfDiag', dv(o), esc(o)); }).join('') + '</div>' +
      '<div class="addrow"><label for="pf-diag" class="sr">Add a diagnosis not listed</label><input id="pf-diag" class="field" type="text" placeholder="Add one not listed" data-enter="pfDiagAdd"><button class="btn btn-outline btn-sm" style="border-radius:12px;min-height:44px" data-act="pfDiagAdd">Add</button></div></section>' +
      '<section class="card" style="gap:12px"><h2 style="font-size:16px;font-weight:700">Cycle &amp; connections</h2><div class="stat"><span>Average cycle length</span><b>27 days</b></div><div class="stat"><span>Average period length</span><b>5 days</b></div><p class="muted" style="font-size:12px;margin-top:-4px">Learned from your logs. Updates automatically.</p>' +
      '<div style="display:flex;align-items:center;gap:12px;padding-top:8px;border-top:1px solid var(--sand)"><div style="flex:1;display:flex;flex-direction:column;gap:2px"><span style="font-size:15px;font-weight:600" id="cal-lbl">Connect my calendar</span><span class="small muted">Lets AI suggest plans around classes and events. Only event times and titles are read.</span></div>' +
      '<button class="switch" role="switch" aria-checked="' + (p.cal ? 'true' : 'false') + '" aria-labelledby="cal-lbl" data-act="pfCal"><span></span></button></div></section>' +
      '<div class="note" role="note">' + svg(I.lock, 18, '#7F2D41', 2) + '<p>Your health data stays on this device in this prototype and is never sold. This app does not replace a doctor, so always check with one about your health.</p></div>' +
      '<button class="btn btn-outline" data-act="askSignOut">Sign out</button>' +
      '<button class="btn-text" style="align-self:center;color:var(--muted);font-size:13px" data-act="askReset">For testers: reset demo data</button>' +
      '</main>';
    if (ui.dirty || ui.savedFlash) {
      html += '<div class="savebar"><span>' + (ui.savedFlash ? 'All changes saved' : 'You have unsaved changes') + '</span>' +
        (ui.savedFlash ? '<span class="tag tag-sand" style="flex:0">Saved</span>' : '<button class="btn btn-primary btn-sm" data-act="pfSave">Save changes</button>') + '</div>';
    }
    return html + nav('profile');
  }
  function changeDraft(fn) { fn(ui.draft); ui.dirty = true; ui.savedFlash = false; render(); }

  // ---------- Survey (check-in) ----------
  function surveyMeds() { return db.profile.meds; }
  function steps() { var s = ['period', 'physical', 'energy', 'feelings', 'rest']; if (surveyMeds().length) s.push('meds'); s.push('review'); return s; }
  function openSurvey(day) {
    var existing = day < TODAY ? getLog(day) : db.logs[day];
    var f = existing ? clone(existing) : { period: null, flow: null, symptoms: [], painLevels: {}, energy: null, feelings: [], sleep: null, stress: null, medsTaken: null };
    if (!f.painLevels) f.painLevels = {};
    if (!f.symptoms) f.symptoms = [];
    if (!f.feelings) f.feelings = [];
    ui.survey = { day: day, step: existing ? steps().length - 1 : 0, saved: false, text: '', aiMsg: '', aiNote: existing ? 'This is what you logged that day. Tap Edit on anything to change it.' : '', f: f };
    render();
    var c = document.getElementById('sv-close'); if (c) c.focus();
  }
  function renderSurvey() {
    var s = ui.survey, f = s.f, st = steps(), cur = s.saved ? 'done' : st[s.step], qn = st.length - 1, isQ = cur !== 'review' && cur !== 'done';
    var b = '';
    function tile(on, act, attrs, text, extra) { return chip(on, act, attrs, text, 'tile' + (extra || '')); }
    if (cur === 'period') {
      b += '<h3 class="q">Are you on your period today?</h3><div class="tiles cols-2">' + ['Yes', 'No'].map(function (o) { return tile(f.period === o, 'svPick', 'data-f="period" ' + dv(o), o); }).join('') + '</div>';
      if (f.period === 'Yes') {
        b += '<h3 class="q" style="padding-top:6px">How heavy is your flow?</h3><div class="tiles cols-4">' + ['Spotting', 'Light', 'Medium', 'Heavy'].map(function (o, i) {
          var drops = ''; for (var j = 0; j <= i; j++) drops += '<svg aria-hidden="true" width="10" height="13" viewBox="0 0 10 13"><path d="M5 0C5 0 0 6 0 8.5A5 4.5 0 0 0 10 8.5C10 6 5 0 5 0Z"></path></svg>';
          return tile(f.flow === o, 'svPick', 'data-f="flow" ' + dv(o), '<span class="drops">' + drops + '</span><span>' + o + '</span>');
        }).join('') + '</div><p class="small muted">Spotting is a few drops. Heavy means changing a pad or tampon every couple of hours.</p>';
      }
    } else if (cur === 'physical') {
      b += '<h3 class="q">Any physical symptoms?</h3><p class="small muted">Select all that apply.</p><div class="chips">' + SYMPTOMS.map(function (o) { return chip(f.symptoms.indexOf(o) > -1, 'svToggle', 'data-f="symptoms" ' + dv(o), o); }).join('') + '</div>';
      var painful = f.symptoms.filter(function (x) { return PAINFUL.indexOf(x) > -1; });
      if (painful.length) {
        b += '<div class="painbox"><h3 style="font-size:17px;font-weight:600">How bad is the pain?</h3><p class="small muted">Mild: noticeable. Moderate: distracting. Severe: hard to do normal things.</p>' +
          painful.map(function (name) {
            return '<div style="display:flex;flex-direction:column;gap:6px"><span style="font-size:14px;font-weight:600">' + name + '</span><div class="tiles cols-3" style="gap:6px">' +
              ['Mild', 'Moderate', 'Severe'].map(function (lv) { return chip(f.painLevels[name] === lv, 'svPain', 'data-n="' + name + '" ' + dv(lv) + ' aria-label="' + name + ': ' + lv + '"', lv, 'tile small' + (lv === 'Severe' ? ' severe' : '')); }).join('') + '</div></div>';
          }).join('') +
          (Object.keys(f.painLevels).some(function (k) { return f.painLevels[k] === 'Severe'; }) ? '<p class="warn" role="note">Severe pain that keeps you from normal activities is worth talking to a doctor about.</p>' : '') + '</div>';
      }
    } else if (cur === 'energy') {
      b += '<h3 class="q">How is your energy?</h3><div class="tiles cols-5">' + ['Very low', 'Low', 'Okay', 'Good', 'High'].map(function (o) { return tile(f.energy === o, 'svPick', 'data-f="energy" ' + dv(o), o); }).join('') + '</div>';
    } else if (cur === 'feelings') {
      b += '<h3 class="q">How are you feeling?</h3><p class="small muted">Select all that apply.</p><div class="chips">' + FEELINGS.map(function (o) { return chip(f.feelings.indexOf(o) > -1, 'svToggle', 'data-f="feelings" ' + dv(o), o); }).join('') + '</div>';
    } else if (cur === 'rest') {
      b += '<h3 class="q">How did you sleep last night?</h3><div class="tiles cols-4">' + ['Poor', 'Okay', 'Good', 'Great'].map(function (o) { return tile(f.sleep === o, 'svPick', 'data-f="sleep" ' + dv(o), o); }).join('') + '</div>' +
        '<h3 class="q" style="margin-top:8px">What is your stress level?</h3><div class="tiles cols-3">' + ['Low', 'Medium', 'High'].map(function (o) { return tile(f.stress === o, 'svPick', 'data-f="stress" ' + dv(o), o); }).join('') + '</div>';
    } else if (cur === 'meds') {
      var taken = f.medsTaken || [];
      b += '<h3 class="q">Which medications did you take today?</h3><p class="small muted">From the medications in your profile. Select all that apply.</p><div class="chips">' +
        surveyMeds().concat(['None today']).map(function (m) { return chip(taken.indexOf(m) > -1, 'svMed', dv(m), esc(m)); }).join('') + '</div>';
    } else if (cur === 'review') {
      var rows = [
        ['Period', f.period === 'Yes' ? 'Yes' + (f.flow ? ', ' + f.flow.toLowerCase() + ' flow' : '') : (f.period || 'Skipped'), 0],
        ['Physical symptoms', symText(f), 1],
        ['Energy', f.energy || 'Skipped', 2],
        ['Feelings', f.feelings.length ? f.feelings.join(', ') : 'None', 3],
        ['Sleep quality', f.sleep || 'Skipped', 4],
        ['Stress', f.stress || 'Skipped', 4]
      ];
      var mi = st.indexOf('meds');
      if (mi > -1) rows.push(['Medications taken', f.medsTaken && f.medsTaken.length ? f.medsTaken.join(', ') : 'Skipped', mi]);
      b += '<h3 class="q">Look good?</h3>' + (s.aiNote ? '<div class="note" role="note">' + svg(I.spark, 18, '#7F2D41', 2) + '<p>' + esc(s.aiNote) + '</p></div>' : '') +
        '<div>' + rows.map(function (r) {
          return '<div class="review-row"><div class="row-text"><span class="row-label">' + r[0] + '</span><span style="font-size:15px;font-weight:500;line-height:1.35">' + esc(r[1]) + '</span></div><button class="btn-text" data-act="svGo" data-i="' + r[2] + '" aria-label="Edit ' + r[0] + '">Edit</button></div>';
        }).join('') + '</div>';
    } else {
      b += '<div class="done"><div class="done-check">' + svg(I.check, 34, '#FFFFFF', 2.5) + '</div><h3 style="font-size:22px;font-weight:700">Check-in saved</h3><p class="sub" style="max-width:280px">Thanks! Your predictions will update using what you logged.</p><button class="btn btn-primary" data-act="svClose" style="margin-top:12px;padding:0 32px">Done</button></div>';
    }
    var pct = isQ ? Math.round(((s.step + 1) / qn) * 100) : 100;
    var head = '<div class="sheet-head"><div class="grabber"></div><div class="sheet-title"><div style="display:flex;flex-direction:column;gap:2px"><h2 id="sv-title" style="font-size:21px;font-weight:700">Daily check-in</h2><span class="small muted">' + esc(label(s.day, true)) + (s.day === TODAY ? ' (today)' : '') + '</span></div>' +
      '<button class="icon-btn" id="sv-close" data-act="svClose" aria-label="Close check-in">' + svg(I.close, 18, '#100110', 2) + '</button></div>' +
      (cur !== 'done' ? '<div style="display:flex;flex-direction:column;gap:6px"><span style="font-size:12px;font-weight:600;color:var(--muted)">' + (isQ ? 'Question ' + (s.step + 1) + ' of ' + qn : 'Review before saving') + '</span><div class="bar"><div style="width:' + pct + '%"></div></div></div>' : '') + '</div>';
    var foot = '';
    if (cur !== 'done') {
      foot = '<div class="ai"><label for="ai-text">Rather just type it? AI can fill this in for you.</label><div class="addrow"><input id="ai-text" class="field" type="text" placeholder="e.g. bad cramps, heavy flow, took advil" value="' + esc(s.text) + '" data-input="aiText" data-enter="svFill"><button class="ai-btn" data-act="svFill">' + svg(I.spark, 16, '#FFFFFF', 2) + 'Fill in</button></div>' +
        (s.aiMsg ? '<p class="ai-msg" role="status">' + esc(s.aiMsg) + '</p>' : '') + '<p class="muted" style="font-size:12px">AI can make mistakes. You will review everything before it saves.</p></div>' +
        '<div class="sheet-foot">' + (s.step > 0 ? '<button class="btn btn-ghost" data-act="svBack">Back</button>' : '') + '<div style="flex:1"></div>' +
        (isQ ? '<button class="btn-text" style="color:var(--muted)" data-act="svSkip">Skip</button>' : '') +
        '<button class="btn btn-primary" data-act="svNext">' + (cur === 'review' ? 'Save check-in' : (s.step === qn - 1 ? 'Review' : 'Next')) + '</button></div>';
    }
    return '<div class="overlay" data-act="svBackdrop"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sv-title">' + head + '<div class="sheet-body" data-scroll="sv' + s.step + cur + '">' + b + '</div>' + foot + '</div></div>';
  }
  function aiFill() {
    var s = ui.survey, f = s.f;
    var t = (s.text || '').toLowerCase();
    if (!t.trim()) { s.aiMsg = 'Type a few words first, like "cramps and tired".'; return render(); }
    function has() { for (var i = 0; i < arguments.length; i++) { if (t.indexOf(arguments[i]) > -1) return true; } return false; }
    var n = 0;
    if (has('period', 'bleed', 'flow', 'spotting')) {
      f.period = 'Yes'; n++;
      if (has('heavy')) f.flow = 'Heavy'; else if (has('spotting')) f.flow = 'Spotting'; else if (has('medium', 'moderate flow')) f.flow = 'Medium'; else if (has('light')) f.flow = 'Light';
    }
    var symMap = [['cramp', 'Cramps'], ['headache', 'Headache'], ['migraine', 'Headache'], ['bloat', 'Bloating'], ['crav', 'Cravings'], ['breast', 'Breast tenderness'], ['back', 'Back pain'], ['acne', 'Acne'], ['breakout', 'Acne'], ['pimple', 'Acne'], ['nause', 'Nausea'], ['tired', 'Fatigue'], ['exhaust', 'Fatigue'], ['fatigue', 'Fatigue']];
    var before = f.symptoms.length;
    symMap.forEach(function (m) { if (t.indexOf(m[0]) > -1 && f.symptoms.indexOf(m[1]) < 0) f.symptoms.push(m[1]); });
    if (f.symptoms.length > before) n++;
    var level = has('severe', 'really bad', 'terrible', 'awful', 'killing', 'unbearable', 'worst') ? 'Severe' : (has('bad ', 'bad,', 'moderate', 'pretty bad') || /bad$/.test(t.trim())) ? 'Moderate' : has('mild', 'slight', 'a little') ? 'Mild' : null;
    if (level) {
      var added = false;
      f.symptoms.forEach(function (x) { if (PAINFUL.indexOf(x) > -1) { f.painLevels[x] = level; added = true; } });
      if (added) n++;
    }
    if (has('exhaust', 'drained', 'no energy', 'very tired')) { f.energy = 'Very low'; n++; }
    else if (has('tired', 'low energy', 'sluggish')) { f.energy = 'Low'; n++; }
    else if (has('energized', 'energetic', 'lots of energy', 'great energy')) { f.energy = 'High'; n++; }
    var feelMap = [['happy', 'Happy'], ['good mood', 'Happy'], ['calm', 'Calm'], ['motivat', 'Motivated'], ['sensitive', 'Sensitive'], ['emotional', 'Sensitive'], ['irritab', 'Irritable'], ['annoyed', 'Irritable'], ['cranky', 'Irritable'], ['anxious', 'Anxious'], ['anxiety', 'Anxious'], ['nervous', 'Anxious'], ['sad', 'Sad'], ['down', 'Sad'], ['cry', 'Sad']];
    before = f.feelings.length;
    feelMap.forEach(function (m) { if (t.indexOf(m[0]) > -1 && f.feelings.indexOf(m[1]) < 0) f.feelings.push(m[1]); });
    if (f.feelings.length > before) n++;
    if (has("didn't sleep", 'didnt sleep', 'slept badly', 'slept bad', 'poor sleep', 'bad sleep', "couldn't sleep", 'insomnia', 'no sleep')) { f.sleep = 'Poor'; n++; }
    else if (has('slept well', 'good sleep', 'great sleep', 'slept great')) { f.sleep = 'Good'; n++; }
    if (has('stress', 'overwhelm', 'exam', 'midterm', 'deadline')) { f.stress = 'High'; n++; }
    else if (has('relaxed')) { f.stress = 'Low'; n++; }
    var taken = (f.medsTaken || []).filter(function (x) { return x !== 'None today'; });
    before = taken.length;
    surveyMeds().forEach(function (m) {
      var key = m.toLowerCase().split(/[\s(]/)[0];
      var pain = /ibuprofen|naproxen|acetaminophen|aspirin/.test(m.toLowerCase());
      if ((key.length > 2 && t.indexOf(key) > -1) || (pain && has('advil', 'motrin', 'aleve', 'tylenol', 'midol', 'painkiller', 'pain relief', 'pain med'))) { if (taken.indexOf(m) < 0) taken.push(m); }
    });
    if (taken.length > before) { f.medsTaken = taken; n++; }
    if (!n) { s.aiMsg = 'I could not match that to any answers. Try words like "bad cramps", "tired" or "heavy flow".'; return render(); }
    s.step = steps().length - 1; s.aiMsg = '';
    s.aiNote = 'AI filled in ' + n + (n === 1 ? ' answer' : ' answers') + ' from your note. Please check them, since AI can make mistakes.';
    render();
  }

  // ---------- Dialogs ----------
  function renderDialog() {
    var d = ui.dialog;
    var title = d === 'signout' ? 'Sign out?' : 'Reset demo data?';
    var text = d === 'signout' ? 'Your logs stay saved. You will need to sign in again to see them.' : 'This clears every check-in and profile change made on this device and restores the sample data. Use it between test sessions.';
    var ok = d === 'signout' ? 'Sign out' : 'Reset';
    return '<div class="overlay center"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-title"><h2 id="dlg-title" style="font-size:20px;font-weight:700">' + title + '</h2><p class="sub">' + text + '</p>' +
      '<div style="display:flex;gap:10px;padding-top:6px"><button class="btn btn-ghost" style="flex:1" data-act="dlgCancel" id="dlg-cancel">Cancel</button><button class="btn btn-primary" style="flex:1" data-act="dlgOk">' + ok + '</button></div></div></div>';
  }

  // ---------- Router & render ----------
  function route() {
    var parts = (location.hash || '#/today').replace(/^#\/?/, '').split('/');
    var page = ['today', 'calendar', 'library', 'forecast', 'profile'].indexOf(parts[0]) > -1 ? parts[0] : 'today';
    return { page: page, a: parts[1], b: parts[2] };
  }
  var app = document.getElementById('app');
  var lastKey = '';
  function render() {
    var r = route();
    var key = location.hash + '|' + ui.cal.topic;
    var scrolls = {};
    Array.prototype.forEach.call(app.querySelectorAll('[data-scroll]'), function (el) { scrolls[el.getAttribute('data-scroll')] = el.scrollTop; });
    var html;
    if (r.page === 'calendar') html = renderCalendar();
    else if (r.page === 'library') html = renderLibrary(r.a, r.b);
    else if (r.page === 'forecast') html = renderForecast();
    else if (r.page === 'profile') html = renderProfile();
    else html = renderToday();
    if (ui.survey) html += renderSurvey();
    if (ui.dialog) html += renderDialog();
    app.innerHTML = html;
    var same = key === lastKey;
    Array.prototype.forEach.call(app.querySelectorAll('[data-scroll]'), function (el) {
      var k = el.getAttribute('data-scroll');
      if (same && scrolls[k] != null) el.scrollTop = scrolls[k];
    });
    lastKey = key;
    var titles = { today: 'Today', calendar: 'Calendar', library: 'Library', forecast: 'Forecast', profile: 'Profile' };
    document.title = titles[r.page] + ' · Cycle Tracker Prototype';
  }

  // ---------- Events ----------
  var actions = {
    openSurvey: function (el) { openSurvey(+el.getAttribute('data-day')); },
    svClose: function () { var day = ui.survey && ui.survey.day; ui.survey = null; render(); var b = day != null && app.querySelector('[data-act="openSurvey"]'); if (b) b.focus(); },
    svBackdrop: function (el, e) { if (e.target === el) actions.svClose(); },
    svPick: function (el) { var f = ui.survey.f, k = el.getAttribute('data-f'), v = el.getAttribute('data-v'); f[k] = f[k] === v ? null : v; if (k === 'period' && f.period !== 'Yes') f.flow = null; render(); },
    svToggle: function (el) {
      var f = ui.survey.f, k = el.getAttribute('data-f'), v = el.getAttribute('data-v'), i = f[k].indexOf(v);
      if (i > -1) { f[k].splice(i, 1); if (k === 'symptoms') delete f.painLevels[v]; } else f[k].push(v);
      render();
    },
    svPain: function (el) { var pl = ui.survey.f.painLevels, n = el.getAttribute('data-n'), v = el.getAttribute('data-v'); if (pl[n] === v) delete pl[n]; else pl[n] = v; render(); },
    svMed: function (el) {
      var f = ui.survey.f, v = el.getAttribute('data-v'), list = (f.medsTaken || []).slice(), i = list.indexOf(v);
      if (i > -1) list.splice(i, 1); else if (v === 'None today') list = ['None today']; else { list = list.filter(function (x) { return x !== 'None today'; }); list.push(v); }
      f.medsTaken = list; render();
    },
    svGo: function (el) { ui.survey.step = +el.getAttribute('data-i'); ui.survey.aiMsg = ''; render(); },
    svBack: function () { ui.survey.step = Math.max(0, ui.survey.step - 1); ui.survey.aiMsg = ''; render(); },
    svSkip: function () { ui.survey.step++; ui.survey.aiMsg = ''; render(); },
    svNext: function () {
      var s = ui.survey, st = steps();
      if (st[s.step] === 'review') { db.logs[s.day] = clone(s.f); persist(); s.saved = true; }
      else { s.step++; s.aiMsg = ''; }
      render();
    },
    svFill: function () { var i = document.getElementById('ai-text'); if (i) ui.survey.text = i.value; aiFill(); },
    calSel: function (el) { ui.cal.sel = +el.getAttribute('data-day'); ui.cal.topic = null; render(); },
    calPrev: function () { if (ui.cal.month > 0) { ui.cal.month--; render(); } },
    calNext: function () { if (ui.cal.month < MONTHS.length - 1) { ui.cal.month++; render(); } },
    calToday: function () { ui.cal.month = 1; ui.cal.sel = TODAY; ui.cal.topic = null; render(); },
    topic: function (el) { ui.cal.topic = el.getAttribute('data-topic'); render(); var m = app.querySelector('main'); if (m) m.scrollTop = 0; },
    topicClose: function () { ui.cal.topic = null; render(); },
    reminder: function () { db.reminders[ui.cal.sel] = !db.reminders[ui.cal.sel]; persist(); render(); },
    fcToggle: function (el) { var i = +el.getAttribute('data-i'); ui.fcOpen = ui.fcOpen === i ? -1 : i; render(); },
    pfPurpose: function (el) { var v = el.getAttribute('data-v'); changeDraft(function (p) { var i = p.purposes.indexOf(v); if (i > -1) p.purposes.splice(i, 1); else p.purposes.push(v); }); },
    pfMedRemove: function (el) { var i = +el.getAttribute('data-i'); changeDraft(function (p) { p.meds.splice(i, 1); }); },
    pfMedAdd: function () { var inp = document.getElementById('pf-med'), v = inp ? inp.value.trim() : ''; if (!v) return; changeDraft(function (p) { if (p.meds.indexOf(v) < 0) p.meds.push(v); }); var n = document.getElementById('pf-med'); if (n) n.focus(); },
    pfDiag: function (el) {
      var v = el.getAttribute('data-v');
      changeDraft(function (p) {
        var i = p.diagnoses.indexOf(v);
        if (i > -1) p.diagnoses.splice(i, 1);
        else if (v === 'None of these') p.diagnoses = ['None of these'];
        else { p.diagnoses = p.diagnoses.filter(function (x) { return x !== 'None of these'; }); p.diagnoses.push(v); }
      });
    },
    pfDiagAdd: function () {
      var inp = document.getElementById('pf-diag'), v = inp ? inp.value.trim() : ''; if (!v) return;
      changeDraft(function (p) {
        var all = BASE_DIAG.concat(p.customDiag);
        var match = all.filter(function (x) { return x.toLowerCase() === v.toLowerCase(); })[0];
        if (!match) p.customDiag.push(v);
        var name = match || v;
        p.diagnoses = p.diagnoses.filter(function (x) { return x !== 'None of these' && x !== name; }).concat([name]);
      });
      var n = document.getElementById('pf-diag'); if (n) n.focus();
    },
    pfCal: function () { changeDraft(function (p) { p.cal = !p.cal; }); },
    pfSave: function () { db.profile = clone(ui.draft); persist(); ui.dirty = false; ui.savedFlash = true; render(); },
    askSignOut: function () { ui.dialog = 'signout'; render(); var c = document.getElementById('dlg-cancel'); if (c) c.focus(); },
    askReset: function () { ui.dialog = 'reset'; render(); var c = document.getElementById('dlg-cancel'); if (c) c.focus(); },
    dlgCancel: function () { ui.dialog = null; render(); },
    dlgOk: function () {
      if (ui.dialog === 'signout') { ui.signedOut = true; }
      else { db = defaults(); persist(); ui.draft = null; ui.dirty = false; ui.savedFlash = false; ui.cal = { month: 1, sel: TODAY, topic: null }; ui.fcOpen = -1; }
      ui.dialog = null; render();
    },
    signIn: function () { ui.signedOut = false; render(); }
  };

  app.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el || !app.contains(el)) return;
    var fn = actions[el.getAttribute('data-act')];
    if (fn) fn(el, e);
  });
  app.addEventListener('input', function (e) {
    var k = e.target.getAttribute('data-input');
    if (k === 'aiText' && ui.survey) ui.survey.text = e.target.value;
    if (k === 'name' && ui.draft) { ui.draft.name = e.target.value; ui.dirty = true; ui.savedFlash = false; }
  });
  app.addEventListener('change', function (e) {
    if (e.target.getAttribute('data-input') === 'name') render();
    if (e.target.getAttribute('data-change') === 'bc') { var v = e.target.value; changeDraft(function (p) { p.bc = v; }); }
  });
  app.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var a = e.target.getAttribute && e.target.getAttribute('data-enter');
      if (a && actions[a]) { e.preventDefault(); if (a === 'svFill') ui.survey.text = e.target.value; actions[a](e.target, e); }
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (ui.dialog) { ui.dialog = null; render(); }
    else if (ui.survey) actions.svClose();
  });
  window.addEventListener('hashchange', function () {
    var r = route();
    if (r.page !== 'calendar') ui.cal.topic = null;
    if (r.page !== 'profile' && ui.savedFlash) ui.savedFlash = false;
    render();
    var m = app.querySelector('main'); if (m) m.scrollTop = 0;
  });

  render();
})();
