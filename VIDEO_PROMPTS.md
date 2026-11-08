# برومبتات فيديوهات «سفينة الفضاء» لـ Claude / مولد فيديو

مطلوب **4 فيديوهات أساسية** + **1 اختياري نهائي**.  
المدة لكل فيديو أساسي: **حوالي دقيقتين**.  
الأسلوب: كرتون 2D مبهج للأطفال 10–11 سنة، سفينة فضاء لطيفة، بدون رعب.  
اللغة: تعليق صوتي **عربي فصيح بسيط** (نصوص الحوار أدناه حرفيًا من وثيقة التصميم).

بعد الإنتاج احفظ الملفات هنا:
- `assets/videos/intro.mp4`
- `assets/videos/prep.mp4`
- `assets/videos/level1.mp4`
- `assets/videos/level2.mp4`
- `assets/videos/finale.mp4` (اختياري)

ثم عدّل `src/data/videos.ts` لربط الملفات المحلية.

---

## فيديو 1 — `intro.mp4` (القصة العامة · ~120 ثانية)

### البرومبت الكامل
```
Create a 2D cartoon animated educational video (~2 minutes) for Arabic kids age 10-11 titled "سفينة الفضاء". Bright, friendly space adventure style. No horror. Soft alarm sounds only.

Scene 1 (0:00–0:30) — Sudden engine failure:
A cheerful colorful spaceship flies through a galaxy with stars. Suddenly soft red warning lights flash and gentle sparks come from FOUR engines. A cute cartoon robot/space captain appears and speaks to the child.

Arabic voiceover (exact):
"أهلاً بك يا بطل الفضاء! سفينتنا الرائعة تعرضت لعطل مفاجئ في محركاتها الأربعة أثناء رحلتنا في المجرة.. نحن بحاجة ماسة لمهاراتك العبقرية في الرياضيات لإصلاحها!"

Scene 2 (0:30–1:15) — Levels map:
Camera lowers to a control panel showing 3 level locks:
1) المستوى التمهيدي — نموذج مساحة المستطيل (OPEN/green)
2) المستوى الأول — القسمة المطولة على رقم واحد (LOCKED)
3) المستوى الثاني — القسمة المطولة على رقمين (LOCKED)

Arabic voiceover (exact):
"امامنا 3 مستويات من التحديات المشوقة؛ سنبدأ بمحطة نموذج مساحة المستطيل، ثم ننطلق للمحطات التالية.. كلما أتقنت حل المسائل، كلما أصلحنا محركاً جديداً وانتقلنا للمستوى الذي يليه!"

Scene 3 (1:15–1:45) — Help button 💡:
Show a large clear Help button 💡. A guiding hand presses it. Soft colored arrows appear as hints (NOT the final answer).

Arabic voiceover (exact — on-demand hints version):
"ولا تقلق أبداً يا بطل إذا واجهتك مسألة صعبة أو تعثرت في الحل مرتين؛ يمكنك الاستعانة دائماً بـ (زر المساعدة 💡) ليقدم لك التوجيه الذكي ويدلك على الخطوة التالية بأمان!"

Scene 4 (1:45–2:00) — Motivation:
Spaceship lights up brightly. Center text: "جاهز للمغامرة؟" then a glowing button "اضغط لنبدأ 🚀".

Arabic voiceover (exact):
"ارتدِ خوذتك، واستعد لتشغيل العقل والتركيز.. لننطلق إلى كابينة القيادة ونبدأ إصلاح المحرك الأول!"

Output: MP4 1080x1920 portrait, Arabic voiceover, soft music, child-safe.
```

---

## فيديو 2 — `prep.mp4` (المستوى التمهيدي · نموذج المستطيل · ~120 ثانية)

### البرومبت الكامل
```
Create a 2D cartoon educational video (~2 minutes) for Arabic grade-5 kids. Friendly spaceship cabin. Topic: Area Model of a rectangle for long division. Bright, clear UI graphics.

Scene 1 (0:00–0:15) — Drama intro:
Inside spaceship cabin, engine #1 sparks lightly with soft red lights. Cute captain character.

Arabic voiceover:
"أهلاً بك يا قائد الفضاء! المحرك الأول للسفينة تعرض لعطل، ولن نتمكن من الإبحار حتى نصلحه بإتقان مهارة (نموذج مساحة المستطيل)!"

Scene 2 (0:15–1:00) — Phase 1 cards placement (example 486÷3):
Show interactive rectangle in center. Cards at bottom: المقسوم/486, المقسوم عليه/3, ناتج القسمة/162, الباقي/0.
Cartoon hand drags:
- divisor 3 → LEFT outside rectangle
- dividend 486 → INSIDE rectangle
- quotient 162 → ABOVE rectangle
- remainder 0 → BELOW rectangle

Arabic voiceover:
"لاحظ جيداً يا بطل في هذا المثال (486÷3).. المقسوم عليه يقف دائماً خارج المستطيل على اليسار، والمقسوم يجلس بداخل المستطيل، أما ناتج القسمة فيكتب في الأعلى، والباقي نضعه في الأسفل!"

Scene 3 (1:00–1:45) — Phase 2 decomposition:
Split rectangle top into Hundreds / Tens / Ones. Show breaking 486 into 300 + 180 + 6.
Demonstrate: partial quotient on top (100 for hundreds), multiply 3×100=300, subtract 486−300=186, continue place by place.

Arabic voiceover:
"نقسم المستطيل إلى مئات وعشرات وآحاد.. نقسم، نضرب، ثم نطرح المتبقي لننتقل للخانة التالية حتى نصل لناتج القسمة النهائي بكل سهولة!"

Scene 4 (1:45–2:00) — Finish:
Rectangle glows green. Big button "ابدأ المغامرة 🚀". Brief tip that Help 💡 exists.

Arabic voiceover:
"الآن دورك يا بطل لتطبيق ما تعلمته على مسألتك الخاصة لإصلاح المحرك والانتقال للمستوى التالي!"

Output: MP4 1080x1920 portrait, Arabic voiceover, educational clarity first.
```

---

## فيديو 3 — `level1.mp4` (قسمة على رقم واحد · كابينة 4 شاشات · ~120 ثانية)

### البرومبت الكامل
```
Create a 2D cartoon educational video (~2 minutes) for Arabic kids. Inside spaceship cockpit with FOUR computer screens labeled in Arabic:
1) اقسم ➗
2) اضرب ✖️
3) اطرح ➖
4) نزل ⬇️
Screens start dim/off, light up as steps succeed. Child-safe, clear math visuals.

Scene 1 (0:00–0:15):
Doors open to cockpit. Four dim screens with soft warning flicker. Cute captain points to them.

Arabic voiceover:
"مرحباً بك في كابينة القيادة يا بطل! المحرك الثاني معطل وشاشات التحكم مطفأة.. ولكي نصلحه وتضيء الشاشات، علينا تنفيذ خطوات القسمة المطولة الأربع: (اقسم، اضرب، اطرح، ثم نزل الرقم)!"

Scene 2 (0:15–1:05) — First cycle example 748÷4:
Show 748÷4. Hand guides:
اقسم: start left 7÷4 → write 1 on top
اضرب: 1×4=4 under 7
اطرح: 7−4=3 remainder
نزل: bring down 4 → make 34

Arabic voiceover:
"نبدأ دائماً من اليسار.. نقسم 7 على 4 فيها الـ 1، ثم نضرب 1×4=4، ونطرح لنحصل على الباقي 3، وأخيراً نُنزّل الرقم التالي 4 ليصبح لدينا 34!"

Scene 3 (1:05–1:45) — Repeat until zero:
Continue cycles (34÷4 then 28÷4) until bottom is zeros. All four screens light bright green. Soft celebration sparks (not scary fireworks).

Arabic voiceover:
"نكرر الخطوات الأربع نفسها: نقسم، نضرب، نطرح، وننزل الرقم.. حتى تنتهي الأرقام وتصبح النتيجة في الأسفل أصفاراً! شاهد كيف أصلحنا المحرك وإضاءة جميع الشاشات باللون الأخضر!"

Scene 4 (1:45–2:00):
Cabin brightens. Button "ابدأ إصلاح المحرك 🚀".

Arabic voiceover:
"الان جاء دورك يا قائد! ادخل الكابينة وابدأ بخطوة (اقسم) في مسألتك الخاصة لإصلاح المحرك وانتقال للمستوى التالي!"

Output: MP4 1080x1920 portrait, Arabic labels on screens, clear step animation.
```

---

## فيديو 4 — `level2.mp4` (قسمة على رقمين · ~120 ثانية)

### البرومبت الكامل
```
Create a 2D cartoon educational video (~2 minutes) for Arabic kids. Same four cockpit screens: اقسم / اضرب / اطرح / نزل.
Focus: divisor has TWO digits. Example walkthrough 782÷23 (or 78÷23 then continue).

Scene 1: Enter advanced cabin panel for two-digit division. Soft engine warning.

Explain: often start with TWO leftmost digits of dividend because divisor is two digits.

Scene visuals:
اقسم: choose starting digits 78 for divisor 23
اضرب: 3×23=69
اطرح: 78−69=9
نزل: bring down next digit → 92
Then next cycle 92÷23 → 4, product 92, subtract to 0. Screens turn green.

Arabic voiceover (write natural clear Arabic matching the document meaning):
"في هذا المستوى نتعامل مع المقسوم عليه المكون من رقمين. نبدأ غالبًا برقمين من اليسار، ثم نكرر: اقسم، اضرب، اطرح، نزل حتى التصفير وإصلاح المحركات."

End with motivational launch cue and button to start.

Output: MP4 1080x1920 portrait, Arabic UI labels, child-friendly.
```

---

## فيديو 5 اختياري — `finale.mp4` (~10–15 ثانية)

### البرومبت
```
Short 10-15 second celebration animation: spaceship engines all green, cabin lights bright, soft fireworks in space, Arabic text:
"تهانينا يا قائد الفضاء العظيم! لقد أصلحت المحركات الأربعة بمهارتك في القسمة المطولة!"
Show 3 gold stars and full progress bar. Ship launches into galaxy.
Portrait MP4 1080x1920.
```

---

## ملاحظات برمجية (من الوثيقة — لا تخالفها)
- أول مشاهدة لأي فيديو مستوى: زر **تخطي معطل**
- من المرة الثانية: تخطي مفعّل
- تحكم: تشغيل/إيقاف + كتم صوت
- بعد انتهاء الفيديو العام → خريطة المستويات (3 أقفال، الأول مفتوح)
```
