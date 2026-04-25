import { cookies } from "next/headers";

export const LOCALE_COOKIE_NAME = "azeroth_nexus_locale";
export const SUPPORTED_LOCALES = ["pt-BR", "en"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

type Dictionary = {
  shell: {
    eyebrow: string;
    summary: string;
    status: string;
    charterTitle: string;
    charterDescription: string;
    nav: {
      rankings: string;
      search: string;
      compare: string;
      guilds: string;
      characters: string;
      admin: string;
    };
  };
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    readings: Array<{ label: string; detail: string }>;
    observatoryEyebrow: string;
    observatoryTitle: string;
    warboardLabel: string;
    warboardDetail: string;
    archiveLabel: string;
    archiveDetail: string;
    signatureLabel: string;
    signatureTitle: string;
    signatureDescription: string;
    commandLabel: string;
    commandDescription: string;
    warboardValue: string;
    archiveValue: string;
  };
  admin: {
    loginEyebrow: string;
    loginTitle: string;
    loginDescription: string;
    loginButton: string;
    loginUsername: string;
    loginPassword: string;
    logout: string;
  };
};

const dictionaries: Record<SupportedLocale, Dictionary> = {
  "pt-BR": {
    shell: {
      eyebrow: "Interface Arcane Observatory",
      summary: "Uma war-room para momentum de guilds, sinais de raid, scouting de roster e poder de personagem com identidade forte de Azeroth.",
      status: "Malha astral online",
      charterTitle: "Observatorio arcano para inteligencia publica de Warcraft.",
      charterDescription:
        "Rankings, scouting, progresso, operacoes e controle administrativo organizados como uma unica cidadela ritual.",
      nav: {
        rankings: "Rankings",
        search: "Busca",
        compare: "Comparar",
        guilds: "Guildas",
        characters: "Personagens",
        admin: "Admin",
      },
    },
    hero: {
      eyebrow: "Arcane Observatory",
      title: "Azeroth Nexus le as correntes de Azeroth antes que o reino consiga nomea-las.",
      description:
        "Um observatorio epico para momentum de guilds, progresso de raid, viradas de Mythic+ e poder de personagens. A interface agora tem lugares, artefatos e presenca propria.",
      readings: [
        { label: "Salas de guerra", detail: "Entidades rastreadas prontas para scouting" },
        { label: "Pulso da constelacao", detail: "Raid, Mythic+ e roster sob leitura continua" },
        { label: "Runas em movimento", detail: "Busca, rankings e progresso em vigilancia permanente" },
      ],
      observatoryEyebrow: "Azeroth Nexus",
      observatoryTitle: "Um observatorio assinatura com lugar, arte e iconografia proprios.",
      warboardLabel: "Foco do warboard",
      warboardDetail: "Trilhas runicas e fortalezas fazem o ranking parecer uma camara viva de comando.",
      archiveLabel: "Foco do arquivo",
      archiveDetail: "A busca agora parece uma biblioteca ritual, nao um formulario generico.",
      signatureLabel: "Assinatura do nexus",
      signatureTitle: "Inteligencia de World of Warcraft conjurada como uma fortaleza celestial.",
      signatureDescription: "Menos dashboard. Mais camara ritual, conselho de guerra e arquivo vivo.",
      commandLabel: "Comando de videncia",
      commandDescription:
        "A busca continua sendo a forma mais rapida de entrar no Nexus, agora apoiada em um verdadeiro dais runico em vez de se dissolver no layout.",
      warboardValue: "Radar de guildas",
      archiveValue: "Mesa de videncia",
    },
    admin: {
      loginEyebrow: "Acesso admin protegido",
      loginTitle: "Entrar no sanctum do Azeroth Nexus.",
      loginDescription:
        "A area admin agora usa credenciais dedicadas geradas na instalacao, protegendo backups, segredos de providers e controles operacionais.",
      loginButton: "Entrar no sanctum admin",
      loginUsername: "Usuario admin",
      loginPassword: "Senha admin",
      logout: "Sair",
    },
  },
  en: {
    shell: {
      eyebrow: "Arcane Observatory Interface",
      summary: "A war-room for guild momentum, raid omens, roster scouting, and character power with a stronger Azerothian identity.",
      status: "Astral lattice online",
      charterTitle: "Arcane observatory for public Warcraft intelligence.",
      charterDescription:
        "Rankings, scouting, progression, operations, and admin control arranged as one ritual command citadel.",
      nav: {
        rankings: "Rankings",
        search: "Search",
        compare: "Compare",
        guilds: "Guilds",
        characters: "Characters",
        admin: "Admin",
      },
    },
    hero: {
      eyebrow: "Arcane Observatory",
      title: "Azeroth Nexus charts the currents of Azeroth before the realm can name them.",
      description:
        "An epic observatory for guild momentum, raid progression, Mythic+ shifts, and character power. The interface now has places, artifacts, and signatures that feel like Azeroth Nexus.",
      readings: [
        { label: "Guild war rooms", detail: "Tracked entities primed for scouting" },
        { label: "Constellation pulse", detail: "Raid, Mythic+, and roster signals updated" },
        { label: "Runes in motion", detail: "Search, rankings, and progression under watch" },
      ],
      observatoryEyebrow: "Azeroth Nexus",
      observatoryTitle: "A signature observatory with real places, art, and iconography.",
      warboardLabel: "Warboard focus",
      warboardDetail: "Runic trails and strongholds make the ranking layer feel like a live command chamber.",
      archiveLabel: "Archive focus",
      archiveDetail: "Search now reads like a ritual library, not a plain utility form dropped into the page.",
      signatureLabel: "Nexus signature",
      signatureTitle: "World of Warcraft intelligence cast as a celestial stronghold.",
      signatureDescription: "Less dashboard. More ritual chamber, war council, and living archive.",
      commandLabel: "Scrying command",
      commandDescription:
        "Search remains the fastest way inside the Nexus, now seated on a proper runic dais instead of dissolving into the page chrome.",
      warboardValue: "Guild Radar",
      archiveValue: "Scrying Desk",
    },
    admin: {
      loginEyebrow: "Protected admin access",
      loginTitle: "Enter the Azeroth Nexus sanctum.",
      loginDescription:
        "The admin chamber now uses dedicated login credentials generated during installation, keeping backups, provider secrets, and operational controls behind a real gate.",
      loginButton: "Enter admin sanctum",
      loginUsername: "Admin username",
      loginPassword: "Admin password",
      logout: "Logout",
    },
  },
};

export async function getLocale(): Promise<SupportedLocale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE_NAME)?.value as SupportedLocale | undefined;
  if (value && SUPPORTED_LOCALES.includes(value)) {
    return value;
  }
  return "pt-BR";
}

export async function getDictionary() {
  const locale = await getLocale();
  return {
    locale,
    copy: dictionaries[locale],
  };
}
