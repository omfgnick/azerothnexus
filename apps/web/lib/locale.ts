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
      eyebrow: "World of Warcraft Intelligence",
      summary: "Consulta publica de guildas, personagens, progresso de raid e sinais de Mythic+ com linguagem visual de warboard premium.",
      status: "Feed publico online",
      charterTitle: "Warcraft intelligence for public consultation.",
      charterDescription:
        "Rankings, scouting, progresso, operacoes e controle administrativo organizados como um command center elegante e objetivo.",
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
      eyebrow: "World of Warcraft Intelligence",
      title: "Dados de ranking, progresso e scouting para Azeroth em um front realmente operacional.",
      description:
        "Guild progression, Mythic+ form, character power e leitura publica de atividade em uma interface mais limpa, mais afiada e muito mais confiavel.",
      readings: [
        { label: "Guilds visiveis", detail: "Entradas que chegaram no warboard atual" },
        { label: "Eventos vivos", detail: "Ocorrencias publicas expostas pelo feed" },
        { label: "Bosses de raid", detail: "Encontros retornados pela leitura atual" },
        { label: "Estado do feed", detail: "Sinal do conjunto de endpoints desta abertura" },
      ],
      observatoryEyebrow: "Season overview",
      observatoryTitle: "Leitura consolidada da temporada, do warboard e do feed.",
      warboardLabel: "Guild apex score",
      warboardDetail: "O melhor score composto recebido na leitura atual.",
      archiveLabel: "Timed ratio",
      archiveDetail: "Pressao de Mythic+ retornada pelo dashboard atual.",
      signatureLabel: "Assinatura do nexus",
      signatureTitle: "Inteligencia publica de Warcraft em um command center de verdade.",
      signatureDescription: "Menos fantasia generica e mais leitura de produto, densidade e controle.",
      commandLabel: "Comando de videncia",
      commandDescription:
        "A busca continua sendo a forma mais rapida de entrar no Nexus, agora com barra compacta e direta no topo da experiencia.",
      warboardValue: "Warboard",
      archiveValue: "Search",
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
      eyebrow: "World of Warcraft Intelligence",
      summary: "Public consultation for guilds, characters, raid progress, and Mythic+ signals in a sharper premium warboard interface.",
      status: "Public feed online",
      charterTitle: "Warcraft intelligence for public consultation.",
      charterDescription:
        "Rankings, scouting, progression, operations, and admin control arranged as an elegant, data-first command center.",
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
      eyebrow: "World of Warcraft Intelligence",
      title: "Ranking, progression, and scouting data for Azeroth in a front that finally feels operational.",
      description:
        "Guild progression, Mythic+ form, character power, and public activity signals gathered in a cleaner, sharper, and far more reliable interface.",
      readings: [
        { label: "Visible guilds", detail: "Entries currently returned by the warboard" },
        { label: "Live events", detail: "Public feed events available right now" },
        { label: "Raid bosses", detail: "Encounters returned in the latest readout" },
        { label: "Feed state", detail: "Signal quality for the opening dashboard" },
      ],
      observatoryEyebrow: "Season overview",
      observatoryTitle: "A consolidated readout of the season, the warboard, and the public feed.",
      warboardLabel: "Guild apex score",
      warboardDetail: "Best composite score returned in the current readout.",
      archiveLabel: "Timed ratio",
      archiveDetail: "Mythic+ pressure returned by the current dashboard.",
      signatureLabel: "Nexus signature",
      signatureTitle: "Public Warcraft intelligence shaped like a real command center.",
      signatureDescription: "Less generic fantasy and more product clarity, density, and control.",
      commandLabel: "Scrying command",
      commandDescription:
        "Search remains the fastest path into the Nexus, now framed as a compact and direct command bar.",
      warboardValue: "Warboard",
      archiveValue: "Search",
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
