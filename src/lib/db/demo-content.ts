export type DemoStep = {
  heading: string;
  explanation: string;
  simpler: string;
  example: string;
  caution: string | null;
};

export type DemoGlossary = { term: string; definition: string };

export type DemoVersion = {
  locale: "en" | "es";
  title: string;
  summary: string;
  simplerSummary: string;
  translationNote: string | null;
  steps: DemoStep[];
  glossary: DemoGlossary[];
};

export type DemoGuide = {
  slug: string;
  topic: "accounts" | "safety" | "devices";
  sourceUrl: string;
  sourceTitle: string;
  status: "verified" | "draft" | "unverified";
  reviewedAt: string | null;
  reviewDueAt: string | null;
  versions: DemoVersion[];
};

const passwordGlossaryEn: DemoGlossary[] = [
  {
    term: "passphrase",
    definition: "A password made of several unrelated words. Length matters more than a single clever symbol.",
  },
  {
    term: "password manager",
    definition:
      "A program that creates and stores passwords. You remember one long passphrase for the manager itself. Lumen is not a password manager.",
  },
  {
    term: "multifactor authentication",
    definition:
      "A second check after the password, such as a code or a fingerprint. CISA recommends turning it on where a site offers it. Lumen cannot turn it on for you.",
  },
];

const passwordGlossaryEs: DemoGlossary[] = [
  {
    term: "frase de contraseña",
    definition: "Una contraseña hecha de varias palabras que no van juntas. La longitud importa más que un símbolo.",
  },
  {
    term: "administrador de contraseñas",
    definition:
      "Un programa que crea y guarda contraseñas. Usted recuerda una frase larga para ese programa. Lumen no es un administrador de contraseñas.",
  },
  {
    term: "autenticación multifactor",
    definition:
      "Una segunda comprobación después de la contraseña, como un código o una huella. Lumen no puede activarla por usted.",
  },
];

export const demoGuides: DemoGuide[] = [
  {
    slug: "stronger-password",
    topic: "accounts",
    sourceUrl: "https://www.cisa.gov/secure-our-world/use-strong-passwords",
    sourceTitle: "CISA — Use strong passwords",
    status: "verified",
    reviewedAt: "2026-09-15T15:00:00.000Z",
    reviewDueAt: "2027-03-15T15:00:00.000Z",
    versions: [
      {
        locale: "en",
        title: "Make a password that is hard to guess",
        summary:
          "CISA says a strong password is long, random, and different for each account. A password manager stores them. Lumen does not ask for a password and does not save one.",
        simplerSummary: "Use a long secret that is different for each account. Do not type it into Lumen.",
        translationNote: null,
        glossary: passwordGlossaryEn,
        steps: [
          {
            heading: "Know what a strong password is",
            explanation:
              "A password is the secret that opens an account. On the CISA page, a strong password has three traits at once: it is long (at least 16 characters), it is random, and it is not reused. Lumen will not ask you to type a password here.",
            simpler: "A strong password is long, random, and used on only one account. Do not type it here.",
            example: "A short word with your birthday in it fails the length and random tests on the source page.",
            caution: "Do not type a real password into Lumen, an email, or a text message.",
          },
          {
            heading: "Make a long passphrase",
            explanation:
              "One way to be random is a passphrase of four or more unrelated words. CISA's page shows sample phrases. Those samples are public, so make your own and do not copy them. Spaces are allowed if the site accepts them.",
            simpler: "Pick several words that do not belong together. Do not copy an example.",
            example: "The shape is a row of unrelated words. The examples on the CISA page are only examples.",
            caution: "Do not use your name, a birthday, the word password, or a phrase you already use somewhere else.",
          },
          {
            heading: "Use a different secret for each important account",
            explanation:
              "If one site is copied, a reused password lets someone try that same secret on your email and other accounts. CISA's third tip is to keep each account's password unique.",
            simpler: "Email gets one secret. Shopping gets a different secret.",
            example: "The source page shows a bank, an email account, and a social account each with a different secret.",
            caution: "Lumen does not store these secrets and cannot check whether you reused one.",
          },
          {
            heading: "Let a password manager remember them",
            explanation:
              "CISA says not to keep the list in a file on the computer. A password manager is a program that creates, stores, and can fill in passwords. You then remember one long passphrase for the manager itself. Some browsers include one. Lumen is not a password manager and will not hold the list.",
            simpler: "Use a password program you install yourself. Remember one long phrase for that program.",
            example: "Search a source you already trust for the words password manager, then compare options. Lumen does not rank products.",
            caution: "Do not send the manager's passphrase in email or a group chat.",
          },
          {
            heading: "Turn on a second check when the site offers it",
            explanation:
              "The same CISA page says to turn on multifactor authentication, especially for email. That is a second check after the password, such as a code or a fingerprint. You turn it on in that site's own settings. Lumen cannot open the site or flip the switch.",
            simpler: "If the site offers a second check, turn it on there. Lumen cannot do it.",
            example: "The site may text a code or ask for a fingerprint. The exact screen depends on the site.",
            caution: "If a stranger asks for that code, do not give it to them. Lumen will never ask for it.",
          },
        ],
      },
      {
        locale: "es",
        title: "Cree una contraseña difícil de adivinar",
        summary:
          "CISA dice que una contraseña fuerte es larga, aleatoria y distinta en cada cuenta. Un administrador de contraseñas las guarda. Lumen no pide ni guarda contraseñas.",
        simplerSummary: "Use un secreto largo y distinto en cada cuenta. No lo escriba en Lumen.",
        translationNote:
          "Sample Spanish for this demo. It is not a CISA translation and a professional translator has not certified it.",
        glossary: passwordGlossaryEs,
        steps: [
          {
            heading: "Sepa qué es una contraseña fuerte",
            explanation:
              "Una contraseña es el secreto que abre una cuenta. En la página de CISA, una contraseña fuerte es las tres cosas a la vez: larga (al menos 16 caracteres), aleatoria y no repetida. Lumen no le pedirá escribirla aquí.",
            simpler: "Una contraseña fuerte es larga, aleatoria y de una sola cuenta. No la escriba aquí.",
            example: "Una palabra corta con su fecha de nacimiento no cumple lo que pide la página de origen.",
            caution: "No escriba una contraseña real en Lumen, en un correo ni en un mensaje.",
          },
          {
            heading: "Invente una frase larga",
            explanation:
              "Una forma de hacerla aleatoria es una frase de cuatro o más palabras que no van juntas. La página de CISA muestra ejemplos. Esos ejemplos son públicos: invente la suya y no los copie.",
            simpler: "Elija varias palabras que no van juntas. No copie un ejemplo.",
            example: "La forma es una fila de palabras sueltas. Los ejemplos de CISA son solo ejemplos.",
            caution: "No use su nombre, una fecha de nacimiento, la palabra password ni una frase que ya use en otro sitio.",
          },
          {
            heading: "Use un secreto distinto en cada cuenta importante",
            explanation:
              "Si copian una página, una contraseña repetida sirve también para su correo. El tercer consejo de CISA es usar una contraseña distinta en cada cuenta.",
            simpler: "El correo tiene un secreto. Las compras tienen otro.",
            example: "La página de origen muestra un banco, un correo y una red social, cada uno con un secreto distinto.",
            caution: "Lumen no guarda estos secretos ni puede comprobar si usted repitió uno.",
          },
          {
            heading: "Deje que un programa las recuerde",
            explanation:
              "CISA recomienda un administrador de contraseñas en lugar de una lista en un archivo. Ese programa crea y guarda las contraseñas. Usted recuerda una frase larga solo para ese programa. Lumen no es ese programa.",
            simpler: "Use un programa de contraseñas que usted instale. Recuerde una frase larga para ese programa.",
            example: "Busque en una fuente que ya confíe las palabras administrador de contraseñas. Lumen no recomienda marcas.",
            caution: "No envíe la frase del programa por correo ni por un chat de grupo.",
          },
          {
            heading: "Active una segunda comprobación si la página la ofrece",
            explanation:
              "La misma página de CISA pide activar la autenticación multifactor, sobre todo en el correo. Es una segunda comprobación, como un código o una huella. Se activa en la configuración de esa página. Lumen no puede abrirla ni activarla.",
            simpler: "Si la página ofrece una segunda comprobación, actívela allí. Lumen no puede hacerlo.",
            example: "La página puede enviar un código o pedir una huella. La pantalla cambia según el sitio.",
            caution: "Si un desconocido pide ese código, no lo dé. Lumen nunca lo pedirá.",
          },
        ],
      },
    ],
  },
  {
    slug: "check-email",
    topic: "safety",
    sourceUrl: "https://www.cisa.gov/secure-our-world/recognize-and-report-phishing",
    sourceTitle: "CISA — Recognize and report phishing",
    status: "verified",
    reviewedAt: "2026-09-15T15:00:00.000Z",
    reviewDueAt: "2027-03-15T15:00:00.000Z",
    versions: [
      {
        locale: "en",
        title: "Check an email before you click",
        summary:
          "Phishing is a message that tries to make you open a bad link or hand over a secret. CISA's advice is to recognize it, resist clicking, and delete it. Lumen does not open your mail.",
        simplerSummary: "Do not click a surprising message. Delete it. Lumen cannot see your inbox.",
        translationNote: null,
        glossary: [
          {
            term: "phishing",
            definition:
              "A trick message, email, or call that wants you to click a harmful link or share personal information.",
          },
          {
            term: "link",
            definition: "Underlined or colored text that opens another page. A link inside a suspicious message is not a safe way to reach a company.",
          },
        ],
        steps: [
          {
            heading: "Pause before you click",
            explanation:
              "Phishing is when someone tries to get you to open a harmful link or attachment, or to share personal information. It can arrive as email, a text, a social message, or a call. Lumen cannot see the message. You decide.",
            simpler: "A surprise message that wants a click or a secret may be a trick. Stop first.",
            example: "A message about a package, a bill, or a locked account is a common shape. The topic alone does not prove it is real.",
            caution: "Do not forward the message to Lumen. This guide does not inspect mail.",
          },
          {
            heading: "Look for the usual signs",
            explanation:
              "CISA lists urgent or emotional threats, requests for personal or financial information, shortened web addresses, and sender addresses that are slightly wrong. Perfect spelling is not proof. The source page says automated writing can now look polished.",
            simpler: "Watch for pressure, a request for private facts, or an address that looks a little off.",
            example: "A company name with one extra letter in the address is one sign the source page names.",
            caution: "A familiar logo does not mean the sender is that company.",
          },
          {
            heading: "Do not use the link in the message",
            explanation:
              "If you are unsure, resist the click and the attachment. If it might be real, CISA says not to use the phone number or link inside the message. Look up the company or the person in a way you already trust, such as a number on a card you hold or a site you type yourself.",
            simpler: "Do not tap the link. If you need to check, find the company yourself.",
            example: "A strange note from a friend: call or text them on the number you already have.",
            caution: "Lumen will not click, call, or sign in for you.",
          },
          {
            heading: "Delete it and report it in your mail app",
            explanation:
              "CISA says to delete the message and not to reply. Do not use an unsubscribe link inside a message you do not trust. Many mail apps have a report-spam or report-phishing control near the sender. That control belongs to the mail app. Lumen does not send a report.",
            simpler: "Delete the message. Use your mail app's report button if it has one.",
            example: "The report control is usually next to the sender's address or in the message menu.",
            caution: "Do not send a password, a code, or an identification number back to the sender.",
          },
        ],
      },
      {
        locale: "es",
        title: "Revise un correo antes de hacer clic",
        summary:
          "El phishing es un mensaje que intenta que usted abra un enlace malo o entregue un secreto. CISA aconseja reconocerlo, no hacer clic y borrarlo. Lumen no abre su correo.",
        simplerSummary: "No haga clic en un mensaje sorpresa. Bórrelo. Lumen no ve su bandeja.",
        translationNote:
          "Sample Spanish for this demo. It is not a CISA translation and a professional translator has not certified it.",
        glossary: [
          {
            term: "phishing",
            definition:
              "Un mensaje, correo o llamada que busca que usted abra un enlace dañino o comparta datos personales.",
          },
          {
            term: "enlace",
            definition:
              "Un texto que abre otra página. Un enlace dentro de un mensaje sospechoso no es una forma segura de llegar a una empresa.",
          },
        ],
        steps: [
          {
            heading: "Pare antes de hacer clic",
            explanation:
              "El phishing intenta que usted abra un enlace o un archivo dañino, o que comparta datos. Puede llegar por correo, texto, red social o llamada. Lumen no ve el mensaje. Usted decide.",
            simpler: "Un mensaje sorpresa que pide un clic o un secreto puede ser un truco. Pare primero.",
            example: "Un mensaje sobre un paquete, una factura o una cuenta bloqueada es una forma común. El tema no prueba que sea real.",
            caution: "No reenvíe el mensaje a Lumen. Esta guía no revisa el correo.",
          },
          {
            heading: "Busque las señales habituales",
            explanation:
              "CISA señala amenazas urgentes, pedidos de datos personales o de dinero, direcciones web acortadas y remitentes que se parecen un poco a los reales. Una ortografía perfecta no prueba nada. La página dice que un texto automático puede verse pulido.",
            simpler: "Fíjese en la prisa, en un pedido de datos privados o en una dirección un poco rara.",
            example: "Un nombre de empresa con una letra de más en la dirección es una señal que nombra la página de origen.",
            caution: "Un logo conocido no prueba que el remitente sea esa empresa.",
          },
          {
            heading: "No use el enlace del mensaje",
            explanation:
              "Si duda, no haga clic ni abra el archivo. Si pudiera ser real, CISA dice que no use el teléfono ni el enlace del mensaje. Busque a la empresa o a la persona por un medio que ya confíe.",
            simpler: "No toque el enlace. Si necesita comprobar, busque a la empresa usted mismo.",
            example: "Una nota rara de un amigo: llámelo al número que usted ya tiene.",
            caution: "Lumen no hará clic, no llamará y no iniciará sesión por usted.",
          },
          {
            heading: "Bórrelo y repórtelo en su correo",
            explanation:
              "CISA dice que borre el mensaje y que no responda. No use el enlace de darse de baja si no confía en el mensaje. Muchas aplicaciones tienen un botón de reportar spam. Ese botón es de la aplicación. Lumen no envía el reporte.",
            simpler: "Borre el mensaje. Use el botón de reportar de su correo si lo tiene.",
            example: "El control suele estar junto a la dirección del remitente o en el menú del mensaje.",
            caution: "No envíe una contraseña, un código ni un número de identidad al remitente.",
          },
        ],
      },
    ],
  },
  {
    slug: "update-software",
    topic: "devices",
    sourceUrl: "https://www.cisa.gov/secure-our-world/update-software",
    sourceTitle: "CISA — Update software",
    status: "verified",
    reviewedAt: "2025-02-01T15:00:00.000Z",
    reviewDueAt: "2025-08-01T15:00:00.000Z",
    versions: [
      {
        locale: "en",
        title: "Install an update from the device itself",
        summary:
          "CISA says software updates close safety holes, and that automatic updates are the easy path. Menu names change by phone and computer. The review date on this copy of Lumen has passed, so check the source page before you rely on a step.",
        simplerSummary: "Install updates from the device's own settings. This review is out of date. Check the source.",
        translationNote: null,
        glossary: [
          {
            term: "automatic updates",
            definition:
              "A setting that lets the device install updates by itself. CISA says to look in Settings, sometimes under Software or Security, and to search settings for automatic updates.",
          },
          {
            term: "patch",
            definition: "A fix from the company that made the software. It does nothing until the device installs it.",
          },
        ],
        steps: [
          {
            heading: "Treat this guide as possibly out of date",
            explanation:
              "Updates close holes that let someone into a device. The source page still describes that idea, but button names change. This copy of Lumen was reviewed on 1 Feb 2025 and the review was due again on 1 Aug 2025. That date has passed. Read the source page if a step does not match your screen.",
            simpler: "This review is old. If the screen looks different, use the source link.",
            example: "A phone and a laptop can use different words for the same update.",
            caution: "Lumen cannot see your screen and cannot install an update.",
          },
          {
            heading: "Start from the device's own settings",
            explanation:
              "CISA says devices usually notify you, and that you should install updates, especially for the web browser. Open the Settings app yourself. Do not follow a window that appeared on a website you were not trying to update.",
            simpler: "Open Settings yourself. Ignore a surprise window on a website.",
            example: "On many phones the app is called Settings. The exact icon is not the same on every device, and this guide will not pretend it is.",
            caution: "A pop-up that demands a download is not the same as the Settings app. That caution is Lumen's, from the phishing guide. The update page itself tells you to use the device's settings.",
          },
          {
            heading: "Search settings for automatic updates",
            explanation:
              "The source page says automatic updates may live under Software or Security, and that you can search settings for the words automatic updates. Turn the setting on if you find it and you want the device to install fixes on its own.",
            simpler: "In Settings, search for automatic updates and turn them on if you choose.",
            example: "The search box inside Settings is the part CISA suggests if you cannot find the menu.",
            caution: "If the words are not there, stop. Check the source page rather than installing a program from an ad.",
          },
          {
            heading: "Install a waiting update when you can",
            explanation:
              "CISA says not to keep tapping remind me later, because a hole stays open until the update is installed. Plug the device in if it asks for power. Let it finish. Lumen does not know whether your device is updated.",
            simpler: "If Settings shows an update, install it when you can stay with the device.",
            example: "A progress spinner means the device is working. You do not need to tap again and again.",
            caution: "Lumen cannot tell you that a particular brand's update is safe. Use the device maker's own settings.",
          },
        ],
      },
    ],
  },
  {
    slug: "paper-form",
    topic: "safety",
    sourceUrl: "https://www.cisa.gov/secure-our-world",
    sourceTitle: "CISA — Secure Our World (general safety, not a form)",
    status: "draft",
    reviewedAt: null,
    reviewDueAt: null,
    versions: [
      {
        locale: "en",
        title: "Read a paper form without sending it",
        summary:
          "This draft explains a paper form in plain language. It is not reviewed. Lumen will not fill it in, sign it, or send it to any office.",
        simplerSummary: "This draft is not published. Lumen does not send forms.",
        translationNote: null,
        glossary: [
          {
            term: "draft",
            definition: "A guide that is still being written. Drafts stay off the public list until someone marks them reviewed.",
          },
        ],
        steps: [
          {
            heading: "Read the form, then stop",
            explanation:
              "A form asks for facts about you. This unfinished guide can only remind you to read each box slowly. Lumen does not store those facts, does not check them, and does not submit the form to a government office, a clinic, a court, or a bank.",
            simpler: "You can read a form. Lumen will not send it.",
            example: "A benefits form, a clinic form, or a bank form is out of scope even after this draft is reviewed.",
            caution: "Do not type form answers into Lumen. There is nowhere for them to go, and they should not be saved here.",
          },
        ],
      },
    ],
  },
];
