// Shared CMS block schema — used by admin editor to render typed fields
// and by backend seeder to populate the home page with current landing copy.
//
// Each block type has an ordered list of fields. Field types:
//   - text     → single-line <input>
//   - textarea → multi-line <textarea>
//   - list     → array of strings (repeatable)
//   - cards    → array of objects with sub-fields
//
// Default values are pulled verbatim from the current frontend/index.html
// so that an admin opens the editor on day 1 and sees real text everywhere.

export type FieldType = "text" | "textarea" | "list" | "cards";

export interface BaseField {
  key: string;
  label: { en: string; ru: string };
  type: FieldType;
}

export interface CardField extends BaseField {
  type: "cards";
  itemFields: { key: string; label: { en: string; ru: string }; type: "text" | "textarea" }[];
}

export type Field = BaseField | CardField;

export interface BlockSchema {
  type: string;
  label: { en: string; ru: string };
  fields: Field[];
  defaults: Record<string, unknown>;
}

export const HOME_BLOCKS: BlockSchema[] = [
  {
    type: "hero",
    label: { en: "Hero", ru: "Главный экран" },
    fields: [
      { key: "eyebrow", label: { en: "Eyebrow", ru: "Надзаголовок" }, type: "text" },
      { key: "title", label: { en: "Title", ru: "Заголовок" }, type: "textarea" },
      { key: "subtitle", label: { en: "Subtitle", ru: "Описание" }, type: "textarea" },
      { key: "primaryCta", label: { en: "Primary CTA", ru: "Главная кнопка" }, type: "text" },
      { key: "secondaryCta", label: { en: "Secondary CTA", ru: "Вторая кнопка" }, type: "text" },
    ],
    defaults: {
      eyebrow: "Закрытая команда роста для крупных компаний",
      title:
        "Мы усиливаем цифровые продукты крупных компаний и развиваем их как отдельные цифровые активы",
      subtitle:
        "LumaLab входит в действующий продукт как growth-партнёр: исследует систему, находит точки роста, подключает AI, данные, продуктовую стратегию и разработку. Работаем за долевое участие там, где видим измеримый потенциал.",
      primaryCta: "Передать продукт на закрытое исследование",
      secondaryCta: "Обсудить партнёрство под NDA",
    },
  },
  {
    type: "value",
    label: { en: "Value proposition", ru: "Ценность" },
    fields: [
      { key: "eyebrow", label: { en: "Eyebrow", ru: "Надзаголовок" }, type: "text" },
      { key: "title", label: { en: "Title", ru: "Заголовок" }, type: "textarea" },
      { key: "subtitle", label: { en: "Subtitle", ru: "Описание" }, type: "textarea" },
      {
        key: "cards",
        label: { en: "Cards", ru: "Карточки" },
        type: "cards",
        itemFields: [
          { key: "title", label: { en: "Title", ru: "Заголовок" }, type: "text" },
          { key: "text", label: { en: "Text", ru: "Текст" }, type: "textarea" },
        ],
      } as CardField,
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
  {
    type: "model",
    label: { en: "Partnership model", ru: "Модель партнёрства" },
    fields: [
      { key: "eyebrow", label: { en: "Eyebrow", ru: "Надзаголовок" }, type: "text" },
      { key: "title", label: { en: "Title", ru: "Заголовок" }, type: "textarea" },
      { key: "text", label: { en: "Text", ru: "Текст" }, type: "textarea" },
    ],
    defaults: {
      eyebrow: "Модель партнёрства",
      title: "Заходим как growth-партнёр, когда видим реальный потенциал роста",
      text: "LumaLab не работает как обычный подрядчик на часы. Мы подключаем экспертизу, технологии, исследования и команду только там, где можем создать измеримую ценность для продукта и компании.",
    },
  },
  {
    type: "livevalue",
    label: { en: "Live value", ru: "Live value" },
    fields: [
      { key: "title", label: { en: "Title", ru: "Заголовок" }, type: "textarea" },
      { key: "liveSub", label: { en: "Live label", ru: "Подпись Live" }, type: "text" },
      { key: "since", label: { en: "Since", ru: "С начала года" }, type: "text" },
      { key: "note", label: { en: "Note", ru: "Сноска" }, type: "textarea" },
      { key: "brandText", label: { en: "Brand text", ru: "Подпись бренда" }, type: "textarea" },
    ],
    defaults: {
      title: "Мир создаёт ценность прямо сейчас",
      liveSub: "Обновляется каждую секунду",
      since: "Создано с начала 2026 года",
      note: "Оценочная модель на основе прогноза IMF по мировому ВВП. Обновляется каждую секунду.",
      brandText: "LumaLab помогает цифровым продуктам находить свою долю в этом росте.",
    },
  },
  {
    type: "fit",
    label: { en: "Who it fits", ru: "Кому подходит" },
    fields: [
      { key: "eyebrow", label: { en: "Eyebrow", ru: "Надзаголовок" }, type: "text" },
      { key: "title", label: { en: "Title", ru: "Заголовок" }, type: "textarea" },
      { key: "subtitle", label: { en: "Subtitle", ru: "Описание" }, type: "textarea" },
      { key: "goodTitle", label: { en: "Fit — title", ru: "Подходит — заголовок" }, type: "text" },
      { key: "goodItems", label: { en: "Fit — items", ru: "Подходит — пункты" }, type: "list" },
      { key: "badTitle", label: { en: "Not fit — title", ru: "Не подходит — заголовок" }, type: "text" },
      { key: "badItems", label: { en: "Not fit — items", ru: "Не подходит — пункты" }, type: "list" },
    ],
    defaults: {
      eyebrow: "Кому подходит",
      title: "Сильный эффект появляется там, где уже есть фундамент",
      subtitle:
        "Мы выбираем продукты, где совпадают масштаб, доступ к контексту, желание развивать актив и готовность к прозрачной партнёрской модели.",
      goodTitle: "Подходит",
      goodItems: [
        "Действующий продукт с пользователями или выручкой",
        "Понятный рынок и масштаб операций",
        "Готовность к NDA и прозрачному партнёрству",
        "Желание развивать актив, а не просто закрыть задачу",
      ],
      badTitle: "Не подходит",
      badItems: [
        "Идея без продукта и проверок",
        "Закрытый процесс без доступа к данным",
        "Подрядчик «на часы», а не партнёр",
        "Нет готовности обсуждать модель ценности",
      ],
    },
  },
  {
    type: "safety",
    label: { en: "Safety / NDA", ru: "NDA" },
    fields: [
      { key: "eyebrow", label: { en: "Eyebrow", ru: "Надзаголовок" }, type: "text" },
      { key: "title", label: { en: "Title", ru: "Заголовок" }, type: "textarea" },
      { key: "text", label: { en: "Text", ru: "Текст" }, type: "textarea" },
      { key: "notice", label: { en: "NDA notice", ru: "NDA-плашка" }, type: "textarea" },
    ],
    defaults: {
      eyebrow: "Безопасный вход",
      title: "Не просим раскрывать чувствительные данные на первом шаге",
      text: "Сначала смотрим общую картину: продукт, рынок, пользовательский путь, команду, ограничения и ожидаемый результат. Детали архитектуры, метрик, договоров и собственных разработок раскрываются только после NDA.",
      notice: "Конфиденциальность защищает партнёров, действующие проекты и собственные цифровые продукты LumaLab.",
    },
  },
  {
    type: "products",
    label: { en: "Own products", ru: "Свои продукты" },
    fields: [
      { key: "eyebrow", label: { en: "Eyebrow", ru: "Надзаголовок" }, type: "text" },
      { key: "title", label: { en: "Title", ru: "Заголовок" }, type: "textarea" },
      { key: "text", label: { en: "Text", ru: "Текст" }, type: "textarea" },
    ],
    defaults: {
      eyebrow: "Собственные цифровые продукты",
      title: "Мы не только консультируем. Мы сами развиваем цифровые продукты и AI-инструменты",
      text: "Часть решений создаётся совместно с партнёрами и участниками проектов. Поэтому названия, архитектура, метрики, договорные условия и состав участников раскрываются только после подписания NDA.",
    },
  },
  {
    type: "expertise",
    label: { en: "Expertise", ru: "Экспертиза" },
    fields: [
      { key: "eyebrow", label: { en: "Eyebrow", ru: "Надзаголовок" }, type: "text" },
      { key: "title", label: { en: "Title", ru: "Заголовок" }, type: "textarea" },
      { key: "text", label: { en: "Text", ru: "Текст" }, type: "textarea" },
    ],
    defaults: {
      eyebrow: "Экспертиза",
      title: "Стратегия, AI, данные, дизайн и engineering в одной команде роста",
      text: "Мы собираем вокруг продукта не набор разрозненных услуг, а прикладную систему роста: от диагностики до внедрения и масштабирования.",
    },
  },
  {
    type: "cases",
    label: { en: "Cases", ru: "Кейсы" },
    fields: [
      { key: "eyebrow", label: { en: "Eyebrow", ru: "Надзаголовок" }, type: "text" },
      { key: "title", label: { en: "Title", ru: "Заголовок" }, type: "textarea" },
      { key: "subtitle", label: { en: "Subtitle", ru: "Описание" }, type: "textarea" },
      { key: "proofTitle", label: { en: "Proof title", ru: "Заголовок «Почему доверие»" }, type: "textarea" },
      { key: "proofText", label: { en: "Proof text", ru: "Текст блока доверия" }, type: "textarea" },
      { key: "methodEyebrow", label: { en: "Method eyebrow", ru: "Метод — надзаголовок" }, type: "text" },
      { key: "methodTitle", label: { en: "Method title", ru: "Метод — заголовок" }, type: "textarea" },
    ],
    defaults: {
      eyebrow: "Успешные кейсы",
      title: "Доказанная экспертиза: рост цифровых продуктов в разных отраслях",
      subtitle:
        "Мы добавили кейсы так, чтобы они работали как сильный блок доверия для инвесторов и крупных компаний: цифры, контекст, польза и понятный следующий шаг после NDA.",
      proofTitle: "Почему этот блок усиливает доверие",
      proofText:
        "Крупной компании важно видеть не обещание, а зрелость команды: опыт в продажах, CRM, AI, интерфейсах, аналитике, B2B и быстрых циклах роста. Поэтому кейсы собраны вокруг измеримых результатов и безопасно раскрываются без нарушения NDA.",
      methodEyebrow: "Метод LumaLab",
      methodTitle:
        "Мы видим продукт как живую систему: клиент, данные, скорость, доверие и рост стоимости",
    },
  },
  {
    type: "research",
    label: { en: "Research", ru: "Исследования" },
    fields: [
      { key: "eyebrow", label: { en: "Eyebrow", ru: "Надзаголовок" }, type: "text" },
      { key: "title", label: { en: "Title", ru: "Заголовок" }, type: "textarea" },
      { key: "text", label: { en: "Text", ru: "Текст" }, type: "textarea" },
    ],
    defaults: {
      eyebrow: "Исследования и тренды",
      title: "Ежедневно изучаем рынки, технологии и компании быстрого роста",
      text: "База знаний LumaLab обновляется через исследования и практику. Это помогает приносить в продукты не вчерашние идеи, а живые точки роста.",
    },
  },
  {
    type: "process",
    label: { en: "Process", ru: "Процесс" },
    fields: [
      { key: "eyebrow", label: { en: "Eyebrow", ru: "Надзаголовок" }, type: "text" },
      { key: "title", label: { en: "Title", ru: "Заголовок" }, type: "textarea" },
      { key: "subtitle", label: { en: "Subtitle", ru: "Описание" }, type: "textarea" },
    ],
    defaults: {
      eyebrow: "Процесс",
      title: "Двигаемся поэтапно: от анкеты и NDA до пилота и партнёрства",
      subtitle:
        "Так крупная компания сохраняет контроль, а LumaLab получает достаточно контекста, чтобы предложить точную карту роста.",
    },
  },
  {
    type: "team",
    label: { en: "Team", ru: "Команда" },
    fields: [
      { key: "eyebrow", label: { en: "Eyebrow", ru: "Надзаголовок" }, type: "text" },
      { key: "title", label: { en: "Title", ru: "Заголовок" }, type: "textarea" },
      { key: "text", label: { en: "Text", ru: "Текст" }, type: "textarea" },
      { key: "nda", label: { en: "NDA note", ru: "NDA-плашка" }, type: "textarea" },
    ],
    defaults: {
      eyebrow: "Команда",
      title: "Закрытая команда роста: продукт, AI, данные, engineering и партнёрства",
      text: "Мы соединяем предпринимательское мышление, исследовательскую глубину и инженерную точность. Имена, роли и опыт по закрытым проектам раскрываются после NDA, если это не нарушает обязательства перед партнёрами.",
      nda: "Кейсы, цифры, архитектуры решений и детали собственных продуктов раскрываются только в защищённом контуре.",
    },
  },
  {
    type: "vacancies",
    label: { en: "Vacancies", ru: "Вакансии" },
    fields: [
      { key: "eyebrow", label: { en: "Eyebrow", ru: "Надзаголовок" }, type: "text" },
      { key: "title", label: { en: "Title", ru: "Заголовок" }, type: "textarea" },
      { key: "subtitle", label: { en: "Subtitle", ru: "Описание" }, type: "textarea" },
      { key: "goodTitle", label: { en: "Fit — title", ru: "Подходит — заголовок" }, type: "text" },
      { key: "goodItems", label: { en: "Fit — items", ru: "Подходит — пункты" }, type: "list" },
      { key: "badTitle", label: { en: "Not fit — title", ru: "Не подходит — заголовок" }, type: "text" },
      { key: "badItems", label: { en: "Not fit — items", ru: "Не подходит — пункты" }, type: "list" },
      { key: "applyCta", label: { en: "CTA — apply", ru: "Кнопка анкеты" }, type: "text" },
    ],
    defaults: {
      eyebrow: "Вакансии",
      title:
        "Ищем людей, которые умеют усиливать цифровые продукты, а не просто выполнять задачи",
      subtitle:
        "LumaLab собирает сеть специалистов для проектов с AI, данными, крупными компаниями и цифровыми активами, где результат измеряется ростом ценности.",
      goodTitle: "Мы смотрим на",
      goodItems: [
        "Способность видеть продукт как систему",
        "Опыт с AI и данными в реальных проектах",
        "Готовность к equity-модели и долгой игре",
        "Прозрачное отношение к результатам",
      ],
      badTitle: "Не подойдёт, если",
      badItems: [
        "Нужны строгие ТЗ и регламент по часам",
        "Опыт только в учебных проектах",
        "Не готовы работать в NDA-режиме",
      ],
      applyCta: "Заполнить анкету специалиста",
    },
  },
  {
    type: "application",
    label: { en: "Application form", ru: "Анкета" },
    fields: [
      { key: "eyebrow", label: { en: "Eyebrow", ru: "Надзаголовок" }, type: "text" },
      { key: "title", label: { en: "Title", ru: "Заголовок" }, type: "textarea" },
      { key: "subtitle", label: { en: "Subtitle", ru: "Описание" }, type: "textarea" },
      { key: "companyTab", label: { en: "Company tab", ru: "Вкладка «Компания»" }, type: "text" },
      { key: "talentTab", label: { en: "Talent tab", ru: "Вкладка «Специалист»" }, type: "text" },
      { key: "companySubmit", label: { en: "Company submit", ru: "Кнопка отправки (компания)" }, type: "text" },
      { key: "talentSubmit", label: { en: "Talent submit", ru: "Кнопка отправки (специалист)" }, type: "text" },
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
  {
    type: "contact",
    label: { en: "Contact", ru: "Контакт" },
    fields: [
      { key: "eyebrow", label: { en: "Eyebrow", ru: "Надзаголовок" }, type: "text" },
      { key: "title", label: { en: "Title", ru: "Заголовок" }, type: "textarea" },
      { key: "text", label: { en: "Text", ru: "Текст" }, type: "textarea" },
      { key: "button", label: { en: "Button", ru: "Кнопка" }, type: "text" },
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
