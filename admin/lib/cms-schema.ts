// Shared CMS block schema — used by admin editor to render typed fields
// and by backend seeder to populate the home page with current landing copy.
//
// Each block is grouped into a "category" that matches the LANDING navigation
// (Главное / Модель / Кейсы / NDA / Продукты / Экспертиза / Процесс / Команда /
//  Вакансии / Анкета). The admin editor renders these as tabs.
//
// Field types:
//   - text     → single-line <input>
//   - textarea → multi-line <textarea>
//   - list     → array of strings (repeatable)
//   - cards    → array of objects with sub-fields

export type FieldType = "text" | "textarea" | "list" | "cards";

export interface BaseField {
  key: string;
  label: { en: string; ru: string };
  type: FieldType;
}

export interface CardField extends BaseField {
  type: "cards";
  itemFields: {
    key: string;
    label: { en: string; ru: string };
    type: "text" | "textarea";
  }[];
}

export type Field = BaseField | CardField;

export type Category =
  | "home"
  | "model"
  | "cases"
  | "safety"
  | "products"
  | "expertise"
  | "process"
  | "team"
  | "vacancies"
  | "application"
  | "contact"
  | "research"
  | "livevalue";

export interface BlockSchema {
  type: string;
  category: Category;
  label: { en: string; ru: string };
  fields: Field[];
  defaults: Record<string, unknown>;
}

export const CATEGORIES: { key: Category; label: { en: string; ru: string } }[] = [
  { key: "home", label: { en: "Home", ru: "Главное" } },
  { key: "model", label: { en: "Model", ru: "Модель" } },
  { key: "livevalue", label: { en: "Live value", ru: "Live value" } },
  { key: "cases", label: { en: "Cases", ru: "Кейсы" } },
  { key: "safety", label: { en: "NDA", ru: "NDA" } },
  { key: "products", label: { en: "Products", ru: "Продукты" } },
  { key: "expertise", label: { en: "Expertise", ru: "Экспертиза" } },
  { key: "research", label: { en: "Research", ru: "Исследования" } },
  { key: "process", label: { en: "Process", ru: "Процесс" } },
  { key: "team", label: { en: "Team", ru: "Команда" } },
  { key: "vacancies", label: { en: "Vacancies", ru: "Вакансии" } },
  { key: "application", label: { en: "Form", ru: "Анкета" } },
  { key: "contact", label: { en: "Contact", ru: "Контакт" } },
];

// ─────────────────────────────────────────────────────────────────────────────
// Field factories — keep code below readable
// ─────────────────────────────────────────────────────────────────────────────
const text = (key: string, en: string, ru: string): Field => ({
  key,
  label: { en, ru },
  type: "text",
});
const area = (key: string, en: string, ru: string): Field => ({
  key,
  label: { en, ru },
  type: "textarea",
});
const list = (key: string, en: string, ru: string): Field => ({
  key,
  label: { en, ru },
  type: "list",
});
const cards = (
  key: string,
  en: string,
  ru: string,
  itemFields: CardField["itemFields"],
): CardField => ({
  key,
  label: { en, ru },
  type: "cards",
  itemFields,
});

// ─────────────────────────────────────────────────────────────────────────────
// All blocks
// ─────────────────────────────────────────────────────────────────────────────
export const HOME_BLOCKS: BlockSchema[] = [
  // ── Home / Hero ────────────────────────────────────────────────────────────
  {
    type: "hero",
    category: "home",
    label: { en: "Hero", ru: "Главный экран" },
    fields: [
      text("eyebrow", "Eyebrow", "Надзаголовок"),
      area("title", "Title", "Заголовок"),
      area("subtitle", "Subtitle", "Описание"),
      text("primaryCta", "Primary CTA", "Главная кнопка"),
      text("secondaryCta", "Secondary CTA", "Вторая кнопка"),
      list("badges", "Hero badges (pill labels)", "Бейджи под кнопками"),
    ],
    defaults: {
      eyebrow: "Закрытая команда роста для крупных компаний",
      title:
        "Мы усиливаем цифровые продукты крупных компаний и развиваем их как отдельные цифровые активы",
      subtitle:
        "LumaLab входит в действующий продукт как growth-партнёр: исследует систему, находит точки роста, подключает AI, данные, продуктовую стратегию и разработку. Работаем за долевое участие там, где видим измеримый потенциал.",
      primaryCta: "Передать продукт на закрытое исследование",
      secondaryCta: "Обсудить партнёрство под NDA",
      badges: [
        "AI и автоматизация",
        "Data intelligence",
        "Product growth",
        "NDA-first процесс",
        "Equity-модель",
      ],
    },
  },
  {
    type: "value",
    category: "home",
    label: { en: "Value cards", ru: "Ценность" },
    fields: [
      text("eyebrow", "Eyebrow", "Надзаголовок"),
      area("title", "Title", "Заголовок"),
      area("subtitle", "Subtitle", "Описание"),
      cards("cards", "Cards", "Карточки", [
        { key: "title", label: { en: "Title", ru: "Заголовок" }, type: "text" },
        { key: "text", label: { en: "Text", ru: "Текст" }, type: "textarea" },
      ]),
    ],
    defaults: {
      eyebrow: "Ваша ценность",
      title: "Мы не продаём разработку. Мы входим в продукт как партнёр роста",
      subtitle:
        "Сначала понимаем, где уже есть сила. Затем превращаем эту силу в измеримый рост: выручку, конверсию, удержание, скорость процессов или стоимость цифрового актива.",
      cards: [
        {
          title: "Сначала изучаем систему",
          text: "Клиентская база, приложение, CRM, маркетплейс, SaaS, данные, команда, ограничения и текущая экономика продукта.",
        },
        {
          title: "Затем находим точку роста",
          text: "Не меняем всё сразу. Выбираем узкие места и быстрые возможности, где AI, данные и продуктовая логика дают эффект.",
        },
        {
          title: "После этого заходим в партнёрство",
          text: "Если потенциал подтверждается, согласуем вклад сторон, KPI, пилот, долевое участие и дальнейшее развитие продукта.",
        },
      ],
    },
  },
  // ── Model ──────────────────────────────────────────────────────────────────
  {
    type: "model",
    category: "model",
    label: { en: "Partnership model", ru: "Модель партнёрства" },
    fields: [
      text("eyebrow", "Eyebrow", "Надзаголовок"),
      area("title", "Title", "Заголовок"),
      area("text", "Text", "Текст"),
      cards("formula", "Formula steps (4 numbered cards)", "Формула роста (4 этапа)", [
        { key: "num", label: { en: "Number", ru: "Номер" }, type: "text" },
        { key: "title", label: { en: "Title", ru: "Заголовок" }, type: "text" },
        { key: "text", label: { en: "Text", ru: "Текст" }, type: "textarea" },
      ]),
    ],
    defaults: {
      eyebrow: "Модель партнёрства",
      title: "Заходим как growth-партнёр, когда видим реальный потенциал роста",
      text: "LumaLab не работает как обычный подрядчик на часы. Мы подключаем экспертизу, технологии, исследования и команду только там, где можем создать измеримую ценность для продукта и компании.",
      formula: [
        {
          num: "01",
          title: "Диагностика",
          text: "Изучаем продукт, рынок, пользователей, данные, команду и ограничения.",
        },
        {
          num: "02",
          title: "Карта роста",
          text: "Определяем зоны, где можно усилить выручку, конверсию, удержание или скорость.",
        },
        {
          num: "03",
          title: "Пилот",
          text: "Запускаем ограниченный этап с понятными KPI и безопасным контуром доступа.",
        },
        {
          num: "04",
          title: "Партнёрство",
          text: "Если результат подтверждается, согласуем долю, вклад сторон и дальнейшее развитие.",
        },
      ],
    },
  },
  // ── Live value ─────────────────────────────────────────────────────────────
  {
    type: "livevalue",
    category: "livevalue",
    label: { en: "Live value counter", ru: "Live-счётчик" },
    fields: [
      area("title", "Title", "Заголовок"),
      text("liveSub", "Live label", "Подпись Live"),
      text("since", "Since", "С начала года"),
      area("note", "Note", "Сноска"),
      area("brandText", "Brand text", "Подпись бренда"),
    ],
    defaults: {
      title: "Мир создаёт ценность прямо сейчас",
      liveSub: "Обновляется каждую секунду",
      since: "Создано с начала 2026 года",
      note: "Оценочная модель на основе прогноза IMF по мировому ВВП. Обновляется каждую секунду.",
      brandText:
        "LumaLab помогает цифровым продуктам находить свою долю в этом росте.",
    },
  },
  // ── Fit (часть NDA-флоу — кому подходит) ───────────────────────────────────
  {
    type: "fit",
    category: "safety",
    label: { en: "Who it fits", ru: "Кому подходит" },
    fields: [
      text("eyebrow", "Eyebrow", "Надзаголовок"),
      area("title", "Title", "Заголовок"),
      area("subtitle", "Subtitle", "Описание"),
      text("goodTitle", "Fit — title", "Подходит — заголовок"),
      list("goodItems", "Fit — items", "Подходит — пункты"),
      text("badTitle", "Not fit — title", "Не подходит — заголовок"),
      list("badItems", "Not fit — items", "Не подходит — пункты"),
    ],
    defaults: {
      eyebrow: "Кому подходит",
      title: "Сильный эффект появляется там, где уже есть фундамент",
      subtitle:
        "Мы выбираем продукты, где совпадают масштаб, доступ к контексту, желание развивать актив и готовность к прозрачной партнёрской модели.",
      goodTitle: "Подходит",
      goodItems: [
        "Есть действующий цифровой продукт: SaaS, приложение, CRM, маркетплейс, платформа или внутренняя система.",
        "Есть пользователи, клиентская база, данные, выручка или стратегическая роль продукта в бизнесе.",
        "Внутри компании есть владелец продукта или лицо, принимающее решение.",
        "Компания готова обсуждать NDA, диагностику, пилот, KPI и партнёрскую модель.",
        "Продукт можно развивать как цифровой актив, а не только как статью расходов.",
      ],
      badTitle: "Не подходит",
      badItems: [
        "Продукт существует только как идея без пользователей и данных.",
        "Компания ищет только дешёвую разовую разработку или исполнителей на часы.",
        "Нет доступа к метрикам, команде, владельцу продукта или ключевому контексту.",
        "Долевое участие не рассматривается даже на уровне обсуждения.",
        "Нет готовности двигаться через NDA, прозрачные этапы и измеримый результат.",
      ],
    },
  },
  // ── Safety / NDA ───────────────────────────────────────────────────────────
  {
    type: "safety",
    category: "safety",
    label: { en: "Safety / NDA", ru: "Безопасный вход (NDA)" },
    fields: [
      text("eyebrow", "Eyebrow", "Надзаголовок"),
      area("title", "Title", "Заголовок"),
      area("text", "Text", "Текст"),
      area("notice", "NDA notice", "NDA-плашка"),
      cards("steps", "Process steps cards", "Этапы (карточки)", [
        { key: "title", label: { en: "Title", ru: "Заголовок" }, type: "text" },
        { key: "text", label: { en: "Text", ru: "Текст" }, type: "textarea" },
      ]),
    ],
    defaults: {
      eyebrow: "Безопасный вход",
      title: "Не просим раскрывать чувствительные данные на первом шаге",
      text: "Сначала смотрим общую картину: продукт, рынок, пользовательский путь, команду, ограничения и ожидаемый результат. Детали архитектуры, метрик, договоров и собственных разработок раскрываются только после NDA.",
      notice:
        "Конфиденциальность защищает партнёров, действующие проекты и собственные цифровые продукты LumaLab.",
      steps: [
        { title: "Первичный отбор", text: "Компания заполняет анкету. Мы оцениваем, есть ли фундамент и потенциал роста." },
        { title: "NDA", text: "После совпадения по базовым критериям подписываем NDA и раскрываем чувствительные детали." },
        { title: "Диагностика", text: "Изучаем продукт, данные, UX, CRM, аналитику, AI-возможности и техническую основу." },
        { title: "Карта роста", text: "Показываем, где можно увеличить выручку, конверсию, удержание, скорость или стоимость актива." },
        { title: "Пилот", text: "Запускаем ограниченный этап с понятными KPI, ответственными и безопасным доступом." },
        { title: "Партнёрская модель", text: "Согласуем долю, вклад сторон, зоны ответственности и дальнейшее развитие." },
      ],
    },
  },
  // ── Products ───────────────────────────────────────────────────────────────
  {
    type: "products",
    category: "products",
    label: { en: "Own products", ru: "Свои продукты" },
    fields: [
      text("eyebrow", "Eyebrow", "Надзаголовок"),
      area("title", "Title", "Заголовок"),
      area("text", "Text", "Текст"),
      cards("cards", "Product cards", "Карточки продуктов", [
        { key: "title", label: { en: "Title", ru: "Заголовок" }, type: "text" },
        { key: "text", label: { en: "Text", ru: "Текст" }, type: "textarea" },
      ]),
    ],
    defaults: {
      eyebrow: "Собственные цифровые продукты",
      title:
        "Мы не только консультируем. Мы сами развиваем цифровые продукты и AI-инструменты",
      text: "Часть решений создаётся совместно с партнёрами и участниками проектов. Поэтому названия, архитектура, метрики, договорные условия и состав участников раскрываются только после подписания NDA.",
      cards: [
        { title: "AI-инструменты роста", text: "Гипотезы, анализ воронок, автоматизация продуктовых решений и внутренних процессов." },
        { title: "Data & product intelligence", text: "Системы анализа продукта, клиентов, сегментов, метрик и сигналов роста." },
        { title: "Операционные платформы", text: "Внутренние решения для команд, CRM, задач, интеграций и управления ростом." },
        { title: "Цифровые активы под партнёрство", text: "Продукты, которые могут развиваться через долю, лицензирование или совместный запуск." },
      ],
    },
  },
  // ── Expertise ──────────────────────────────────────────────────────────────
  {
    type: "expertise",
    category: "expertise",
    label: { en: "Expertise", ru: "Экспертиза" },
    fields: [
      text("eyebrow", "Eyebrow", "Надзаголовок"),
      area("title", "Title", "Заголовок"),
      area("text", "Text", "Текст"),
      cards("services", "Expertise areas", "Направления экспертизы", [
        { key: "title", label: { en: "Title", ru: "Заголовок" }, type: "text" },
        { key: "text", label: { en: "Text", ru: "Текст" }, type: "textarea" },
      ]),
    ],
    defaults: {
      eyebrow: "Экспертиза",
      title: "Стратегия, AI, данные, дизайн и engineering в одной команде роста",
      text: "Мы собираем вокруг продукта не набор разрозненных услуг, а прикладную систему роста: от диагностики до внедрения и масштабирования.",
      services: [
        { title: "AI & Automation", text: "AI-модули, агенты, автоматизация и внутренние инструменты." },
        { title: "Data & Analytics", text: "Метрики, BI, сегментация, воронки, прогнозы и точки роста." },
        { title: "Engineering", text: "Разработка, архитектура, интеграции, PWA, API и внутренние системы." },
        { title: "Growth & Partnerships", text: "Гипотезы, рынок, переговоры, партнёрские модели и equity-структура." },
      ],
    },
  },
  // ── Cases ──────────────────────────────────────────────────────────────────
  {
    type: "cases",
    category: "cases",
    label: { en: "Cases — header & stats", ru: "Кейсы — заголовок и метрики" },
    fields: [
      text("eyebrow", "Eyebrow", "Надзаголовок"),
      area("title", "Title", "Заголовок"),
      area("subtitle", "Subtitle", "Описание"),
      cards("stats", "Stat cards (4)", "Метрики над кейсами (4)", [
        { key: "value", label: { en: "Value", ru: "Значение" }, type: "text" },
        { key: "title", label: { en: "Title", ru: "Заголовок" }, type: "text" },
        { key: "text", label: { en: "Text", ru: "Текст" }, type: "text" },
      ]),
      area("proofTitle", "Proof title", "Заголовок «Почему доверие»"),
      area("proofText", "Proof text", "Текст блока доверия"),
      cards("proofCards", "Proof cards (3)", "Карточки доверия (3)", [
        { key: "title", label: { en: "Title", ru: "Заголовок" }, type: "text" },
        { key: "text", label: { en: "Text", ru: "Текст" }, type: "textarea" },
      ]),
      text("methodEyebrow", "Method eyebrow", "Метод — надзаголовок"),
      area("methodTitle", "Method title", "Метод — заголовок"),
      cards("methodSteps", "Method steps (6)", "Шаги метода (6)", [
        { key: "num", label: { en: "Number", ru: "Номер" }, type: "text" },
        { key: "title", label: { en: "Title", ru: "Заголовок" }, type: "text" },
        { key: "text", label: { en: "Text", ru: "Текст" }, type: "textarea" },
      ]),
    ],
    defaults: {
      eyebrow: "Успешные кейсы",
      title: "Доказанная экспертиза: рост цифровых продуктов в разных отраслях",
      subtitle:
        "Мы добавили кейсы так, чтобы они работали как сильный блок доверия для инвесторов и крупных компаний: цифры, контекст, польза и понятный следующий шаг после NDA.",
      stats: [
        { value: "350%", title: "CRM для страхования", text: "рост продуктивности продаж" },
        { value: "1 000 000+", title: "Мобильный продукт", text: "скачиваний за 7 месяцев" },
        { value: "8,6%", title: "Билетный оператор", text: "конверсия после 15 дней" },
        { value: "45 дней", title: "Промышленный B2B", text: "AI CRM контур роста" },
      ],
      proofTitle: "Почему этот блок усиливает доверие",
      proofText:
        "Крупной компании важно видеть не обещание, а зрелость команды: опыт в продажах, CRM, AI, интерфейсах, аналитике, B2B и быстрых циклах роста. Поэтому кейсы собраны вокруг измеримых результатов и безопасно раскрываются без нарушения NDA.",
      proofCards: [
        { title: "Цифры вместо обещаний", text: "Каждый кейс показывает конкретный сдвиг: скорость, конверсия, качество лида, продуктивность или рост аудитории." },
        { title: "Рост внутри воронки", text: "Мы ищем место, где теряется клиент, доверие, сделка или скорость, и превращаем его в систему роста." },
        { title: "NDA дисциплина", text: "Закрытые детали, договоры, названия и дополнительные материалы раскрываются только в разрешённом объёме после NDA." },
      ],
      methodEyebrow: "Метод LumaLab",
      methodTitle:
        "Мы видим продукт как живую систему: клиент, данные, скорость, доверие и рост стоимости",
      methodSteps: [
        { num: "01", title: "Видим коммерческую цель", text: "Сначала определяем, что должно вырасти: продажи, конверсия, скорость сделки, качество лида, трафик или повторные покупки." },
        { num: "02", title: "Находим точку трения", text: "Изучаем путь клиента, CRM, сайт, аналитику, звонки, трафик, документы и работу команды." },
        { num: "03", title: "Проверяем гипотезы", text: "Собираем быстрый MVP или цифровой контур и проверяем его на реальных сценариях." },
        { num: "04", title: "Усиливаем AI", text: "Подключаем AI помощников, scoring, генераторы КП, dashboards, Digital Sales Room и автоматизацию." },
        { num: "05", title: "Доводим до метрик", text: "Каждое решение связываем с результатом: скорость, выручка, конверсия, продуктивность и прозрачность." },
        { num: "06", title: "Входим как партнёр", text: "Работаем за долевое участие там, где видим сильный продукт и возможность увеличить стоимость компании." },
      ],
    },
  },
  // ── Research ───────────────────────────────────────────────────────────────
  {
    type: "research",
    category: "research",
    label: { en: "Research", ru: "Исследования" },
    fields: [
      text("eyebrow", "Eyebrow", "Надзаголовок"),
      area("title", "Title", "Заголовок"),
      area("text", "Text", "Текст"),
      list("items", "Research bullets", "Что изучаем (список)"),
    ],
    defaults: {
      eyebrow: "Исследования и тренды",
      title: "Ежедневно изучаем рынки, технологии и компании быстрого роста",
      text: "База знаний LumaLab обновляется через исследования и практику. Это помогает приносить в продукты не вчерашние идеи, а живые точки роста.",
      items: [
        "Новые AI-инструменты и реальные бизнес-сценарии.",
        "Цифровые продукты с быстрым ростом стоимости.",
        "Кейсы технологических компаний и логика их роста.",
        "Автоматизация продаж, поддержки и внутренних процессов.",
        "Продуктовые паттерны в разных отраслях.",
        "Рыночные сигналы, которые можно быстро применить в пилоте.",
      ],
    },
  },
  // ── Process ────────────────────────────────────────────────────────────────
  {
    type: "process",
    category: "process",
    label: { en: "Process", ru: "Процесс" },
    fields: [
      text("eyebrow", "Eyebrow", "Надзаголовок"),
      area("title", "Title", "Заголовок"),
      area("subtitle", "Subtitle", "Описание"),
      cards("steps", "Timeline steps", "Шаги процесса", [
        { key: "title", label: { en: "Title", ru: "Заголовок" }, type: "text" },
        { key: "text", label: { en: "Text", ru: "Текст" }, type: "textarea" },
      ]),
    ],
    defaults: {
      eyebrow: "Процесс",
      title: "Двигаемся поэтапно: от анкеты и NDA до пилота и партнёрства",
      subtitle:
        "Так крупная компания сохраняет контроль, а LumaLab получает достаточно контекста, чтобы предложить точную карту роста.",
      steps: [
        { title: "Анкета", text: "Компания или специалист передаёт базовый контекст." },
        { title: "Первичный отбор", text: "Проверяем соответствие модели LumaLab и потенциальную ценность." },
        { title: "NDA", text: "Фиксируем конфиденциальность до раскрытия чувствительных данных." },
        { title: "Диагностика", text: "Изучаем продукт, метрики, пользователей, рынок, UX, CRM и техническую основу." },
        { title: "Карта роста", text: "Определяем точки усиления и приоритет гипотез." },
        { title: "Пилот", text: "Проверяем выбранные гипотезы в ограниченном контуре." },
        { title: "Партнёрская модель", text: "Согласуем формат долевого участия, роли и вклад сторон." },
        { title: "Масштабирование", text: "Укрепляем работающие решения и развиваем продукт дальше." },
      ],
    },
  },
  // ── Team ───────────────────────────────────────────────────────────────────
  {
    type: "team",
    category: "team",
    label: { en: "Team", ru: "Команда" },
    fields: [
      text("eyebrow", "Eyebrow", "Надзаголовок"),
      area("title", "Title", "Заголовок"),
      area("text", "Text", "Текст"),
      area("nda", "NDA note", "NDA-плашка"),
      cards("members", "Team competencies", "Компетенции команды", [
        { key: "title", label: { en: "Title", ru: "Заголовок" }, type: "text" },
        { key: "text", label: { en: "Text", ru: "Текст" }, type: "textarea" },
      ]),
    ],
    defaults: {
      eyebrow: "Команда",
      title:
        "Закрытая команда роста: продукт, AI, данные, engineering и партнёрства",
      text: "Мы соединяем предпринимательское мышление, исследовательскую глубину и инженерную точность. Имена, роли и опыт по закрытым проектам раскрываются после NDA, если это не нарушает обязательства перед партнёрами.",
      nda: "Кейсы, цифры, архитектуры решений и детали собственных продуктов раскрываются только в защищённом контуре.",
      members: [
        { title: "Product Strategy", text: "Продуктовая логика, позиционирование, roadmap и приоритеты роста." },
        { title: "AI & Automation", text: "AI-модули, агенты, автоматизация и внутренние инструменты." },
        { title: "Data & Analytics", text: "Метрики, BI, сегментация, воронки, прогнозы и точки роста." },
        { title: "Engineering", text: "Разработка, архитектура, интеграции, PWA, API и внутренние системы." },
        { title: "Growth & Partnerships", text: "Гипотезы, рынок, переговоры, партнёрские модели и equity-структура." },
      ],
    },
  },
  // ── Vacancies ──────────────────────────────────────────────────────────────
  {
    type: "vacancies",
    category: "vacancies",
    label: { en: "Vacancies", ru: "Вакансии — заголовок и критерии" },
    fields: [
      text("eyebrow", "Eyebrow", "Надзаголовок"),
      area("title", "Title", "Заголовок"),
      area("subtitle", "Subtitle", "Описание"),
      text("goodTitle", "Fit — title", "Подходит — заголовок"),
      list("goodItems", "Fit — items", "Подходит — пункты"),
      text("badTitle", "Not fit — title", "Не подходит — заголовок"),
      list("badItems", "Not fit — items", "Не подходит — пункты"),
      text("applyCta", "CTA — apply", "Кнопка анкеты"),
      list("filters", "Filter tags", "Теги-фильтры"),
    ],
    defaults: {
      eyebrow: "Вакансии",
      title:
        "Ищем людей, которые умеют усиливать цифровые продукты, а не просто выполнять задачи",
      subtitle:
        "LumaLab собирает сеть специалистов для проектов с AI, данными, крупными компаниями и цифровыми активами, где результат измеряется ростом ценности.",
      goodTitle: "Мы смотрим на",
      goodItems: [
        "Портфолио, GitHub, Behance, кейсы или реальные примеры работы.",
        "Способность работать под NDA и уважать конфиденциальность крупных компаний.",
        "Ясное мышление, умение писать структурно и доводить задачи до конца.",
        "Интерес к AI, данным, цифровым продуктам и измеримому росту.",
        "Готовность работать проектно, с неопределённостью и в партнёрских моделях.",
      ],
      badTitle: "Не подойдёт, если",
      badItems: [
        "Человек ждёт только готовое ТЗ и не хочет думать шире.",
        "Нет готовности показывать реальные результаты или примеры работы.",
        "Есть риск нарушения конфиденциальности.",
        "Не подходит работа с неопределённостью и быстрыми гипотезами.",
        "Нет интереса к продуктовой ценности, метрикам и ответственности за результат.",
      ],
      applyCta: "Заполнить анкету специалиста",
      filters: [
        "Все",
        "AI",
        "Data",
        "Engineering",
        "Product",
        "Growth",
        "Research",
        "Partnership",
      ],
    },
  },
  // ── Application ────────────────────────────────────────────────────────────
  {
    type: "application",
    category: "application",
    label: { en: "Application form", ru: "Анкета" },
    fields: [
      text("eyebrow", "Eyebrow", "Надзаголовок"),
      area("title", "Title", "Заголовок"),
      area("subtitle", "Subtitle", "Описание"),
      text("companyTab", "Company tab", "Вкладка «Компания»"),
      text("talentTab", "Talent tab", "Вкладка «Специалист»"),
      text("companySubmit", "Company submit", "Кнопка отправки (компания)"),
      text("talentSubmit", "Talent submit", "Кнопка отправки (специалист)"),
    ],
    defaults: {
      eyebrow: "Анкета",
      title:
        "Передайте продукт на закрытое исследование или подайте анкету специалиста",
      subtitle:
        "Мы используем анкету как первый спокойный фильтр. Детали, которые требуют защиты, обсуждаются только после NDA.",
      companyTab: "Компания",
      talentTab: "Специалист",
      companySubmit: "Отправить продукт на исследование",
      talentSubmit: "Отправить анкету специалиста",
    },
  },
  // ── Contact ────────────────────────────────────────────────────────────────
  {
    type: "contact",
    category: "contact",
    label: { en: "Contact", ru: "Контакт (нижний CTA)" },
    fields: [
      text("eyebrow", "Eyebrow", "Надзаголовок"),
      area("title", "Title", "Заголовок"),
      area("text", "Text", "Текст"),
      text("button", "Button", "Кнопка"),
    ],
    defaults: {
      eyebrow: "Один следующий шаг",
      title: "Покажите ценность продукта, мы покажем возможный путь роста",
      text: "Заполните анкету. Если совпадение сильное, следующий шаг — короткий созвон, NDA и закрытая диагностика.",
      button: "Начать с анкеты",
    },
  },
];

export function findSchema(type: string): BlockSchema | undefined {
  return HOME_BLOCKS.find((b) => b.type === type);
}

export function schemasByCategory(cat: Category): BlockSchema[] {
  return HOME_BLOCKS.filter((s) => s.category === cat);
}
