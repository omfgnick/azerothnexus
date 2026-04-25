import { cookies } from "next/headers";

export const LOCALE_COOKIE_NAME = "azeroth_nexus_locale";
export const SUPPORTED_LOCALES = ["pt-BR", "en"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export type Dictionary = {
  shell: {
    eyebrow: string;
    summary: string;
    status: string;
    home: string;
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
    footerNote: string;
  };
  shared: {
    yes: string;
    no: string;
    none: string;
    noneYet: string;
    unknown: string;
    unavailable: string;
    estimated: string;
    scaffold: string;
    live: string;
    fallback: string;
    stable: string;
    partial: string;
    technicalDetail: string;
    publicDataUnavailable: string;
    awaitingQuery: string;
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
  home: {
    dataBannerTitle: string;
    dataBannerDescription: string;
    rankingBannerTitle: string;
    rankingBannerDescription: string;
    intelligenceBannerTitle: string;
    intelligenceBannerDescription: string;
    rankingsEyebrow: string;
    rankingsTitle: string;
    openWarboard: string;
    intelligenceEyebrow: string;
    intelligenceTitle: string;
    activityFeed: string;
    eventsLabel: string;
    noActivity: string;
    mythicMeta: string;
    timedSuffix: string;
    noMythicRoutes: string;
    seasonWatch: string;
    currentRaid: string;
    season: string;
    bossesVisible: string;
    mythicBossesTracked: string;
    worldTracker: string;
    heatmapReady: string;
    mostPlayedRoute: string;
    topGuildTier: string;
    signalState: string;
    searchArchive: string;
    compareEntities: string;
    ctaTitle: string;
    ctaDescription: string;
    openCompare: string;
    adminPanel: string;
  };
  searchPalette: {
    compactPlaceholder: string;
    openResults: string;
    scanning: string;
    all: string;
    guild: string;
    character: string;
    realm: string;
    searchAndDiscovery: string;
    searchTitle: string;
    publicLookupActive: string;
    scanningRunes: string;
    searchLabel: string;
    regionLabel: string;
    typeLabel: string;
    allRegions: string;
    allEntities: string;
    guilds: string;
    characters: string;
    realms: string;
    regions: string;
    raids: string;
    realmFilterLabel: string;
    guildFilterLabel: string;
    realmPlaceholder: string;
    guildPlaceholder: string;
    searchNow: string;
    liveSuggestions: string;
    suggestionsDescription: string;
    echoesFound: string;
    noMatches: string;
    searchPagePlaceholder: string;
  };
  rankingTable: {
    eyebrow: string;
    visibleEntries: string;
    allRegions: string;
    guildWarboard: string;
    liveScore: string;
    rankingReadout: string;
    columns: {
      rank: string;
      guild: string;
      regionRealm: string;
      score: string;
      progress: string;
      tier: string;
      trend: string;
    };
    confidence: string;
    calibrating: string;
    empty: string;
  };
  searchPage: {
    typeDescriptions: Record<string, string>;
    bannerDescription: string;
    heroEyebrow: string;
    heroTitle: string;
    heroDescription: string;
    sceneEyebrow: string;
    sceneTitle: string;
    sceneDescription: string;
    sceneBadgeActive: string;
    sceneBadgeIdle: string;
    sceneAction: string;
    filterEyebrow: string;
    filterTitle: string;
    queryLabel: string;
    regionLabel: string;
    realmLabel: string;
    guildLabel: string;
    typeLabel: string;
    all: string;
    any: string;
    groupPrompt: string;
    publicReturnsEyebrow: string;
    publicReturnsTitle: string;
    matchingResults: string;
    matchingResult: string;
    liveLookup: string;
    matchLabel: string;
    regionInfo: string;
    realmInfo: string;
    guildInfo: string;
    genericResult: string;
    noResults: string;
    noQuery: string;
    aligned: string;
    awaiting: string;
  };
  rankingsPage: {
    bannerDescription: string;
    heroEyebrow: string;
    heroTitle: string;
    heroDescription: string;
    tierSystem: string;
    tierSystemValue: string;
    tierSystemDescription: string;
    currentEliteCount: string;
    currentEliteDescription: string;
    scoreDimensions: string;
    scoreDimensionsValue: string;
    scoreDimensionsDescription: string;
    compareAction: string;
    searchAction: string;
    sceneEyebrow: string;
    sceneTitle: string;
    sceneDescription: string;
    sceneBadge: string;
    sceneAction: string;
    tableTitle: string;
  };
  comparePage: {
    bannerDescription: string;
    heroEyebrow: string;
    heroTitle: string;
    heroDescription: string;
    sceneEyebrow: string;
    sceneTitle: string;
    sceneDescription: string;
    sceneBadge: string;
    sceneAction: string;
    guildTitle: string;
    characterTitle: string;
  };
  comparePanel: {
    eyebrow: string;
    verdict: string;
    comparisonTarget: string;
    delta: string;
    momentum: string;
    sideBySideVerdict: string;
    evenFooting: string;
    sideEdge: string;
    dimensionsUnavailable: string;
  };
  guildPage: {
    bannerDescription: string;
    heroEyebrow: string;
    autoRefresh: string;
    composite: string;
    tier: string;
    trend: string;
    worldRank: string;
    sceneEyebrow: string;
    sceneTitle: string;
    sceneDescription: string;
    historyTitle: string;
    breakdownEyebrow: string;
    breakdownTitle: string;
    progressEyebrow: string;
    progressTitle: string;
    defeated: string;
    progressing: string;
    pulls: string;
    rosterEyebrow: string;
    rosterTitle: string;
    unknownSpec: string;
    unknownRole: string;
    itemLevel: string;
  };
  characterPage: {
    bannerDescription: string;
    heroEyebrow: string;
    autoRefresh: string;
    composite: string;
    classAndSpec: string;
    mythicPlus: string;
    itemLevel: string;
    sceneEyebrow: string;
    sceneTitle: string;
    sceneDescription: string;
    historyTitle: string;
    breakdownEyebrow: string;
    breakdownTitle: string;
    snapshotEyebrow: string;
    snapshotTitle: string;
    guild: string;
    unaffiliated: string;
    raidEstimate: string;
    tierAndTrend: string;
    raidLogsEyebrow: string;
    raidLogsTitle: string;
    liveParseSource: string;
    awaitingLiveLogs: string;
    bestAverage: string;
    medianAverage: string;
    bossesLogged: string;
    source: string;
    honorsEyebrow: string;
    honorsTitle: string;
  };
  armory: {
    loadoutEyebrow: string;
    loadoutTitle: string;
    loadoutDescription: string;
    armorySync: string;
    awaitingArmorySync: string;
    race: string;
    faction: string;
    level: string;
    achievementPoints: string;
    itemLevel: string;
    enchant: string;
    sockets: string;
    effects: string;
    loadoutSync: string;
    loadoutSyncDescription: string;
    talentEyebrow: string;
    talentTitle: string;
    talentDescription: string;
    talentSync: string;
    awaitingTalentSync: string;
    activeSpec: string;
    currentLoadout: string;
    heroTree: string;
    classTalents: string;
    specTalents: string;
    heroTalents: string;
    pvpTalents: string;
    choice: string;
    unknown: string;
    talentSyncTitle: string;
    talentSyncDescription: string;
  };
  scoreHistory: {
    eyebrow: string;
    description: string;
    latestReading: string;
    snapshot: string;
    empty: string;
  };
  dataState: {
    technicalDetail: string;
  };
  adminLayout: {
    eyebrow: string;
    title: string;
    description: string;
    sceneEyebrow: string;
    sceneTitle: string;
    sceneDescription: string;
    sceneBadge: string;
    nav: {
      overview: string;
      integrations: string;
      backups: string;
      logs: string;
      controls: string;
      logout: string;
    };
  };
  adminOverview: {
    bannerTitle: string;
    bannerDescription: string;
    trackedGuilds: string;
    trackedCharacters: string;
    configuredProviders: string;
    backups: string;
    providerHealthEyebrow: string;
    providerHealthTitle: string;
    providersCount: string;
    configuredAndReady: string;
    blockedOrMissing: string;
    ready: string;
    blocked: string;
    autoRefreshEyebrow: string;
    autoRefreshTitle: string;
    latestCycle: string;
    lastError: string;
    latestJobsEyebrow: string;
    latestJobsTitle: string;
    recentJobs: string;
    quickActionsEyebrow: string;
    quickActionsTitle: string;
    cadence: string;
    generateBackup: string;
    integrations: string;
    integrationsCopy: string;
    backupsCopy: string;
    logs: string;
    logsCopy: string;
    snapshotsEyebrow: string;
    snapshotsTitle: string;
    recentSnapshots: string;
    backupAuditEyebrow: string;
    backupAuditTitle: string;
    recentLogEntries: string;
    latestBackup: string;
    requestLogs: string;
    adminActions: string;
    backupEvents: string;
    accessWardEyebrow: string;
    accessWardTitle: string;
    protectedHeader: string;
    notAvailable: string;
  };
  adminBackups: {
    backupFiles: string;
    directory: string;
    latestFile: string;
    snapshotControlEyebrow: string;
    snapshotControlTitle: string;
    snapshotControlDescription: string;
    archiveListEyebrow: string;
    archiveListTitle: string;
    files: string;
    noBackups: string;
    noBackupsDescription: string;
  };
  adminIntegrations: {
    providerLabels: Record<string, { label: string; auth: string; requirements: string }>;
    bannerTitle: string;
    bannerDescription: string;
    visibleProviders: string;
    readyProviders: string;
    requestLogging: string;
    active: string;
    disabled: string;
    autoRefresh: string;
    operationalEyebrow: string;
    operationalTitle: string;
    visitorExperience: string;
    visitorExperienceDescription: string;
    credentialModel: string;
    credentialModelDescription: string;
    syncControl: string;
    syncControlDescription: string;
    runtimeEyebrow: string;
    runtimeTitle: string;
    readyForSync: string;
    enabledMissingSetup: string;
    disabledProvider: string;
    disabledState: string;
    readyState: string;
    needsSetupState: string;
    region: string;
    unavailableProviderHealth: string;
    postureEyebrow: string;
    postureTitle: string;
    autoRefreshCadence: string;
    everyMinutes: string;
    latestCycleStatus: string;
    latestCycleAt: string;
    latestAutoRefreshError: string;
    currentPosture: string;
    currentPostureDescription: string;
  };
  adminLogs: {
    recentEntries: string;
    requestLogs: string;
    adminActions: string;
    backupActions: string;
    timelineEyebrow: string;
    timelineTitle: string;
    timelineDescription: string;
    noEntries: string;
    noEntriesDescription: string;
    systemActor: string;
  };
  adminComponents: {
    logoutWorking: string;
    refreshAllButton: string;
    refreshAllWorking: string;
    refreshAllError: string;
    refreshAllSuccess: string;
    guildCountLabel: string;
    characterCountLabel: string;
    backupNow: string;
    backupWorking: string;
    backupError: string;
    backupCreated: string;
    restoreWorking: string;
    restoreButton: string;
    restoreError: string;
    restoreComplete: string;
    restoreConfirm: string;
    replaceCurrentData: string;
    createSafetyBackup: string;
    downloadBackup: string;
    saveIntegrations: string;
    saveWorking: string;
    saveError: string;
    saveSuccess: string;
    externalIntegrations: string;
    providerVault: string;
    providerVaultDescription: string;
    visitorModel: string;
    visitorModelValue: string;
    visitorModelDescription: string;
    secretHandling: string;
    secretHandlingValue: string;
    secretHandlingDescription: string;
    syncModel: string;
    syncModelValue: string;
    syncModelDescription: string;
    enabled: string;
    configured: string;
    needsSetup: string;
    requirements: string;
    region: string;
    apiBaseUrl: string;
    clientId: string;
    clientSecret: string;
    secretAlreadyStored: string;
    pasteNewSecret: string;
    secretConfigured: string;
    noSecretStored: string;
    clearStoredSecret: string;
    observabilityEyebrow: string;
    observabilityTitle: string;
    requestLoggingTitle: string;
    requestLoggingDescription: string;
    enableRequestLogs: string;
    publicConsultation: string;
    serverSideOnly: string;
    autoEveryTen: string;
    adminRefreshError: string;
    entityRefreshWorking: string;
    entityRefreshButton: string;
    entityRefreshError: string;
    entityRefreshProviders: string;
    entityRefreshSnapshots: string;
  };
  admin: {
    loginEyebrow: string;
    loginTitle: string;
    loginDescription: string;
    loginButton: string;
    loginUsername: string;
    loginPassword: string;
    logout: string;
    loginSceneTitle: string;
    loginSceneDescription: string;
    loginSceneBadge: string;
    loginInvalid: string;
    loginUnavailable: string;
    loginFailed: string;
    entering: string;
  };
};

const dictionaries: Record<SupportedLocale, Dictionary> = {
  "pt-BR": {
    shell: {
      eyebrow: "World of Warcraft Intelligence",
      summary: "Consulta publica de guildas, personagens, progresso de raid e sinais de Mythic+ com linguagem visual de warboard premium.",
      status: "Feed publico online",
      home: "Inicio",
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
      footerNote: "World of Warcraft e uma marca registrada da Blizzard Entertainment.",
    },
    shared: {
      yes: "Sim",
      no: "Nao",
      none: "Nenhum",
      noneYet: "Nenhum ainda",
      unknown: "Desconhecido",
      unavailable: "Indisponivel",
      estimated: "Estimado",
      scaffold: "Base",
      live: "Ao vivo",
      fallback: "Contingencia",
      stable: "Estavel",
      partial: "Parcial",
      technicalDetail: "Detalhe tecnico",
      publicDataUnavailable: "Dados publicos indisponiveis",
      awaitingQuery: "Aguardando consulta",
    },
    hero: {
      eyebrow: "World of Warcraft Intelligence",
      title: "Dados de ranking, progresso e scouting para Azeroth em um front realmente operacional.",
      description:
        "Guild progression, Mythic+ form, character power e leitura publica de atividade em uma interface mais limpa, mais afiada e muito mais confiavel.",
      readings: [
        { label: "Guildas visiveis", detail: "Entradas que chegaram no warboard atual" },
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
      archiveValue: "Busca",
    },
    home: {
      dataBannerTitle: "Parte dos dados esta indisponivel",
      dataBannerDescription:
        "Esta tela entrou em modo de contingencia. O layout continua operando, mas voce pode estar vendo dados vazios ou neutros enquanto a API se recompae.",
      rankingBannerTitle: "Warboard em modo de contingencia",
      rankingBannerDescription:
        "Os rankings publicos nao responderam a tempo. O warboard continua acessivel, mas os dados reais ainda nao chegaram nesta leitura.",
      intelligenceBannerTitle: "Inteligencia parcial",
      intelligenceBannerDescription:
        "A camada de feed e meta nao conseguiu preencher todos os paineis. O Nexus mostra estados seguros e neutros ate a proxima sincronizacao.",
      rankingsEyebrow: "World rankings",
      rankingsTitle: "Guild progression ladder",
      openWarboard: "Abrir warboard completo",
      intelligenceEyebrow: "Live intelligence",
      intelligenceTitle: "Realm feed",
      activityFeed: "Activity feed",
      eventsLabel: "eventos",
      noActivity: "Nenhum evento publico de atividade esta disponivel agora.",
      mythicMeta: "Mythic+ meta",
      timedSuffix: "timed",
      noMythicRoutes: "Os dados de rotas de Mythic+ nao estao disponiveis agora.",
      seasonWatch: "Season watch",
      currentRaid: "Raid atual",
      season: "Temporada",
      bossesVisible: "Bosses visiveis",
      mythicBossesTracked: "Bosses miticos rastreados",
      worldTracker: "World tracker",
      heatmapReady: "Heatmap pronto",
      mostPlayedRoute: "Rota mais jogada",
      topGuildTier: "Tier da guilda lider",
      signalState: "Estado do sinal",
      searchArchive: "Buscar no arquivo",
      compareEntities: "Comparar entidades",
      ctaTitle: "Compare guildas e personagens lado a lado",
      ctaDescription:
        "Relatorios de inteligencia, historico de score e comparativos diretos na mesma linguagem visual do novo warboard.",
      openCompare: "Abrir comparacao",
      adminPanel: "Painel admin",
    },
    searchPalette: {
      compactPlaceholder: "Buscar guilda, personagem ou reino...",
      openResults: "Abrir resultados",
      scanning: "Escaneando...",
      all: "Todos",
      guild: "Guilda",
      character: "Personagem",
      realm: "Reino",
      searchAndDiscovery: "Busca e descoberta",
      searchTitle: "Busque Azeroth Nexus por guilda, personagem, reino ou regiao.",
      publicLookupActive: "Consulta publica ativa",
      scanningRunes: "Escaneando runas",
      searchLabel: "Busca",
      regionLabel: "Regiao",
      typeLabel: "Tipo",
      allRegions: "Todas as regioes",
      allEntities: "Todas as entidades",
      guilds: "Guildas",
      characters: "Personagens",
      realms: "Reinos",
      regions: "Regioes",
      raids: "Raids",
      realmFilterLabel: "Filtro de reino",
      guildFilterLabel: "Filtro de guilda",
      realmPlaceholder: "stormrage, tarren-mill...",
      guildPlaceholder: "Void Vanguard...",
      searchNow: "Buscar agora",
      liveSuggestions: "Sugestoes ao vivo",
      suggestionsDescription: "Azeroth Nexus esta exibindo as correspondencias publicas mais proximas para esta consulta.",
      echoesFound: "ecos encontrados",
      noMatches: "Nenhuma correspondencia ainda. Tente o nome de uma guilda, campeao, reino ou regiao.",
      searchPagePlaceholder: "Void Vanguard, Aethryl, Stormrage...",
    },
    rankingTable: {
      eyebrow: "World rankings",
      visibleEntries: "entradas visiveis",
      allRegions: "Todas as regioes",
      guildWarboard: "Warboard de guildas",
      liveScore: "Score ao vivo",
      rankingReadout: "Leitura de ranking",
      columns: {
        rank: "#",
        guild: "Guilda",
        regionRealm: "Regiao · Reino",
        score: "Score",
        progress: "Progresso",
        tier: "Tier",
        trend: "Tendencia",
      },
      confidence: "Confianca",
      calibrating: "Calibrando",
      empty: "Nenhuma entrada de ranking esta disponivel nesta leitura.",
    },
    searchPage: {
      typeDescriptions: {
        guild: "Perfil de guilda e pagina de progressao",
        character: "Perfil de personagem e pagina de performance",
        realm: "Resultado focado em descoberta por reino",
        region: "Resultado focado em descoberta por regiao",
        raid: "Resultado de descoberta de raid",
      },
      bannerDescription:
        "A busca publica nao respondeu a tempo. Os resultados abaixo estao em estado neutro enquanto a API nao retorna a leitura real.",
      heroEyebrow: "Archive search",
      heroTitle: "Busque por nome, reino, guilda ou regiao em uma camara de pesquisa de verdade.",
      heroDescription:
        "Consulte paginas publicas de guildas e personagens com uma apresentacao ritualistica, premium e inequivocamente Azerothian.",
      sceneEyebrow: "Astral archive",
      sceneTitle: "Uma camara de busca feita em torno de mapas, tomos e descoberta iluminada por runas.",
      sceneDescription:
        "A arte da superficie de busca da um senso real de lugar, enquanto os novos sigilos fazem a pagina parecer parte do Azeroth Nexus.",
      sceneBadgeActive: "Runas alinhadas",
      sceneBadgeIdle: "Aguardando consulta",
      sceneAction: "Inspecionar o warboard",
      filterEyebrow: "Estado dos filtros",
      filterTitle: "Attunement atual",
      queryLabel: "Consulta",
      regionLabel: "Regiao",
      realmLabel: "Reino",
      guildLabel: "Guilda",
      typeLabel: "Tipo",
      all: "todas",
      any: "qualquer",
      groupPrompt: "Execute uma busca para revelar correspondencias agrupadas por tipo de entidade.",
      publicReturnsEyebrow: "Retornos publicos",
      publicReturnsTitle: "Resultados da busca",
      matchingResults: "resultados correspondentes encontrados na leitura publica atual.",
      matchingResult: "resultado correspondente encontrado na leitura publica atual.",
      liveLookup: "Consulta publica ao vivo",
      matchLabel: "Correspondencia",
      regionInfo: "Regiao",
      realmInfo: "Reino",
      guildInfo: "Guilda",
      genericResult: "Resultado publico de busca",
      noResults: "Nenhum resultado publico correspondeu a esta busca. Amplie os filtros e tente outra consulta.",
      noQuery: "Digite um nome, reino, regiao ou guilda acima para iniciar a leitura.",
      aligned: "Runas alinhadas",
      awaiting: "Aguardando consulta",
    },
    rankingsPage: {
      bannerDescription:
        "Os rankings publicos nao responderam a tempo. Esta pagina de warboard continua funcional, mas os valores reais ainda nao foram entregues neste ciclo.",
      heroEyebrow: "World rankings",
      heroTitle: "Ladders de guilda forjadas como um warboard astral.",
      heroDescription:
        "O ladder agora se comporta como uma camara de estrategia: ornamentado, claro e objetivo sobre quem esta subindo, quem esta pressionado e por que cada score ocupa seu lugar.",
      tierSystem: "Sistema de tiers",
      tierSystemValue: "Mythic Elite ate Aspirant",
      tierSystemDescription: "Uma escala desenhada para parecer cerimonial e legivel em vez de esteril.",
      currentEliteCount: "Elite atual",
      currentEliteDescription: "Guildas marcadas como Legend ou Mythic Elite no board carregado.",
      scoreDimensions: "Dimensoes do score",
      scoreDimensionsValue: "Progresso / Execucao / Roster / Atividade",
      scoreDimensionsDescription: "Cada entrada traz notas claras para lideranca, scouting e competitividade.",
      compareAction: "Abrir camara de comparacao",
      searchAction: "Buscar nos arquivos",
      sceneEyebrow: "High command",
      sceneTitle: "Uma superficie de ranking ancorada por uma command room de Azeroth.",
      sceneDescription:
        "Este painel cenico da ao ladder um senso de lugar e atmosfera antes do grid assumir o protagonismo.",
      sceneBadge: "World board",
      sceneAction: "Abrir comparacao",
      tableTitle: "Ranking mundial de guildas",
    },
    comparePage: {
      bannerDescription:
        "Uma ou mais comparacoes entraram em modo de contingencia. A pagina continua navegavel, mas os dados reais ainda nao foram entregues.",
      heroEyebrow: "Comparison chamber",
      heroTitle: "Inteligencia lado a lado com mais ritual, mais clareza e mais peso.",
      heroDescription:
        "Compare guildas ou campeoes dentro de uma camara de julgamento digna de raid leaders, recrutadores e obcecados por estatistica.",
      sceneEyebrow: "Judgement hall",
      sceneTitle: "Uma superficie de comparacao que se comporta como uma sala de veredito ceremonial.",
      sceneDescription:
        "A pagina abre com um senso mais forte de lugar antes dos scorecards, deixando a comparacao mais deliberada e prestigiosa.",
      sceneBadge: "Vereditos lado a lado",
      sceneAction: "Voltar aos rankings",
      guildTitle: "Guilda vs Guilda",
      characterTitle: "Personagem vs Personagem",
    },
    comparePanel: {
      eyebrow: "Leitura comparativa",
      verdict: "Veredito lado a lado",
      comparisonTarget: "Alvo da comparacao",
      delta: "Delta",
      momentum: "Momentum",
      sideBySideVerdict: "Veredito lado a lado",
      evenFooting: "Equilibrio total",
      sideEdge: "lado em vantagem",
      dimensionsUnavailable: "As dimensoes da comparacao nao estao disponiveis nesta leitura.",
    },
    guildPage: {
      bannerDescription:
        "O perfil desta guilda esta em modo seguro porque a leitura publica nao respondeu a tempo. Os campos neutros abaixo nao representam dados confirmados.",
      heroEyebrow: "Perfil da guilda",
      autoRefresh: "Auto refresh a cada 10 minutos",
      composite: "Composto",
      tier: "Tier",
      trend: "Tendencia",
      worldRank: "Rank mundial",
      sceneEyebrow: "Raid war hall",
      sceneTitle: "Uma camara de guilda digna de raid night em Azeroth.",
      sceneDescription:
        "A pagina agora abre com identidade MMO mais forte, com um hall de guilda apropriado antes dos blocos de dados.",
      historyTitle: "Historico de score da guilda",
      breakdownEyebrow: "Quebra da guilda",
      breakdownTitle: "Quebra do score",
      progressEyebrow: "Progresso de raid",
      progressTitle: "Ledger de bosses",
      defeated: "Derrotado",
      progressing: "Em progresso",
      pulls: "pulls",
      rosterEyebrow: "Roster da guilda",
      rosterTitle: "Roster da guilda",
      unknownSpec: "Spec desconhecida",
      unknownRole: "Funcao desconhecida",
      itemLevel: "Item level",
    },
    characterPage: {
      bannerDescription:
        "Este perfil entrou em modo seguro porque a leitura publica do personagem nao respondeu a tempo. O Nexus agora deixa isso explicito e evita preencher com dados ficticios.",
      heroEyebrow: "Perfil do personagem",
      autoRefresh: "Auto refresh a cada 10 minutos",
      composite: "Composto",
      classAndSpec: "Classe e spec",
      mythicPlus: "Mythic+",
      itemLevel: "Item level",
      sceneEyebrow: "Champion sanctum",
      sceneTitle: "Um sanctum heroico no estilo Warcraft para este campeao.",
      sceneDescription:
        "O perfil agora se aproxima mais de um class hall ou chamber de campeao, com identidade MMO antes dos numeros.",
      historyTitle: "Historico de score do personagem",
      breakdownEyebrow: "Quebra do personagem",
      breakdownTitle: "Quebra do score",
      snapshotEyebrow: "Fatos do snapshot",
      snapshotTitle: "Leitura atual",
      guild: "Guilda",
      unaffiliated: "Sem guilda",
      raidEstimate: "Estimativa de raid",
      tierAndTrend: "Tier e tendencia",
      raidLogsEyebrow: "Raid logs",
      raidLogsTitle: "Leitura do Warcraft Logs",
      liveParseSource: "Fonte de parse ao vivo",
      awaitingLiveLogs: "Aguardando logs ao vivo",
      bestAverage: "Melhor media",
      medianAverage: "Media mediana",
      bossesLogged: "Bosses logados",
      source: "Fonte",
      honorsEyebrow: "Honras",
      honorsTitle: "Achievements",
    },
    armory: {
      loadoutEyebrow: "Armory loadout",
      loadoutTitle: "Equipamento pronto para inspecao ao vivo.",
      loadoutDescription:
        "Equipamento slot a slot em um layout estilo Azeroth, com item level, enchants, sockets e tier pieces quando o sync da Blizzard estiver disponivel.",
      armorySync: "Sync da armory Blizzard",
      awaitingArmorySync: "Aguardando sync da armory",
      race: "Raca",
      faction: "Facao",
      level: "Nivel",
      achievementPoints: "Pontos de achievement",
      itemLevel: "Item level",
      enchant: "Enchant",
      sockets: "Sockets",
      effects: "Efeitos",
      loadoutSync: "Sync do loadout",
      loadoutSyncDescription:
        "Nenhum item equipado foi retornado ainda. Acione uma atualizacao manual ou aguarde o refresh automatico de 10 minutos depois de configurar as credenciais da Blizzard.",
      talentEyebrow: "Codex de talentos",
      talentTitle: "Loadout ativo e talentos selecionados.",
      talentDescription:
        "Dados de especializacao da Blizzard renderizados como build sheet, mais proximos do Armory e do Raider.IO do que de um box de stats simples.",
      talentSync: "Loadout alinhado",
      awaitingTalentSync: "Aguardando sync de talentos",
      activeSpec: "Spec ativa",
      currentLoadout: "Loadout atual",
      heroTree: "Hero tree",
      classTalents: "Talentos de classe",
      specTalents: "Talentos de spec",
      heroTalents: "Talentos heroicos",
      pvpTalents: "Talentos PvP",
      choice: "Escolha",
      unknown: "Desconhecido",
      talentSyncTitle: "Sync de talentos",
      talentSyncDescription:
        "Nenhum loadout foi retornado ainda. A Blizzard pode precisar expor novamente o perfil publico do personagem, e o proximo refresh do servidor vai tentar outra vez automaticamente.",
    },
    scoreHistory: {
      eyebrow: "Rastro temporal",
      description: "Uma leitura iluminada por runas do movimento recente de score entre snapshots capturados.",
      latestReading: "Ultima leitura",
      snapshot: "Snapshot",
      empty: "Nenhum historico de score capturado esta disponivel para esta entidade ainda.",
    },
    dataState: {
      technicalDetail: "Detalhe tecnico",
    },
    adminLayout: {
      eyebrow: "Administracao do Azeroth Nexus",
      title: "Comando, backups, logs e cofres de providers em um sanctum protegido.",
      description:
        "A nova area administrativa separa operacao diaria, observabilidade, backups e integracoes externas sem perder a identidade epica do sistema.",
      sceneEyebrow: "Ops nexus",
      sceneTitle: "Uma camara de controle que parece parte legitima de Azeroth.",
      sceneDescription:
        "O admin agora abre como um sanctum separado, com navegacao propria para overview, integracoes externas, backups persistidos e timeline de logs.",
      sceneBadge: "Operacao protegida",
      nav: {
        overview: "Visao geral",
        integrations: "Integracoes",
        backups: "Backups",
        logs: "Logs",
        controls: "Controles do sanctum",
        logout: "Sair",
      },
    },
    adminOverview: {
      bannerTitle: "Dashboard admin indisponivel",
      bannerDescription:
        "O frontend admin nao conseguiu buscar o dashboard protegido neste ciclo. Revise o login e a configuracao operacional do servidor web.",
      trackedGuilds: "Guildas rastreadas",
      trackedCharacters: "Personagens rastreados",
      configuredProviders: "Providers configurados",
      backups: "Backups",
      providerHealthEyebrow: "Saude dos providers",
      providerHealthTitle: "Servicos externos",
      providersCount: "providers",
      configuredAndReady: "Configurado e pronto",
      blockedOrMissing: "Bloqueado, desativado ou sem credenciais",
      ready: "Pronto",
      blocked: "Bloqueado",
      autoRefreshEyebrow: "Auto refresh",
      autoRefreshTitle: "Status do scheduler",
      latestCycle: "Ultimo ciclo",
      lastError: "Ultimo erro",
      latestJobsEyebrow: "Ultimos jobs",
      latestJobsTitle: "Atividade interna e de providers",
      recentJobs: "jobs recentes",
      quickActionsEyebrow: "Acoes rapidas",
      quickActionsTitle: "Runas operacionais",
      cadence: "cadencia",
      generateBackup: "Gerar backup imediato",
      integrations: "Integracoes",
      integrationsCopy: "Configurar Blizzard, Raider.IO e Warcraft Logs.",
      backupsCopy: "Gerar, listar e baixar snapshots completos do banco.",
      logs: "Logs",
      logsCopy: "Timeline unificada de requests, acoes admin e jobs de sync.",
      snapshotsEyebrow: "Snapshots e rankings",
      snapshotsTitle: "Ultimas recomposicoes do ladder",
      recentSnapshots: "snapshots recentes",
      backupAuditEyebrow: "Backup e auditoria",
      backupAuditTitle: "Arquivo de controle",
      recentLogEntries: "entradas recentes de log",
      latestBackup: "Ultimo backup",
      requestLogs: "Logs de request",
      adminActions: "Acoes admin",
      backupEvents: "Eventos de backup",
      accessWardEyebrow: "Ward de acesso",
      accessWardTitle: "Header protegido",
      protectedHeader: "Header protegido",
      notAvailable: "N/A",
    },
    adminBackups: {
      backupFiles: "Arquivos de backup",
      directory: "Diretorio",
      latestFile: "Ultimo arquivo",
      snapshotControlEyebrow: "Controle de snapshots",
      snapshotControlTitle: "Exportacoes do banco",
      snapshotControlDescription:
        "Cada backup gera um JSON completo com todas as tabelas conhecidas do Azeroth Nexus. O painel tambem permite restaurar um snapshot listado com backup de seguranca opcional.",
      archiveListEyebrow: "Lista do arquivo",
      archiveListTitle: "Snapshots persistidos",
      files: "arquivos",
      noBackups: "Nenhum backup ainda",
      noBackupsDescription: "Gere o primeiro snapshot para comecar a manter exportacoes completas do banco.",
    },
    adminIntegrations: {
      providerLabels: {
        blizzard: {
          label: "Blizzard Battle.net",
          auth: "Credenciais OAuth server-side",
          requirements: "Client ID + Client Secret",
        },
        raiderio: {
          label: "Raider.IO",
          auth: "API publica",
          requirements: "Apenas base URL",
        },
        warcraftlogs: {
          label: "Warcraft Logs",
          auth: "Credenciais OAuth server-side",
          requirements: "Client ID + Client Secret",
        },
      },
      bannerTitle: "Integracoes indisponiveis",
      bannerDescription:
        "O painel nao conseguiu carregar toda a configuracao protegida nesta leitura. Isso nao revela segredos, mas indica falha no proxy admin ou token ausente no servidor web.",
      visibleProviders: "Providers visiveis",
      readyProviders: "Providers prontos",
      requestLogging: "Request logging",
      active: "Ativo",
      disabled: "Desligado",
      autoRefresh: "Auto refresh",
      operationalEyebrow: "Modelo operacional",
      operationalTitle: "Site publico, operacao privada",
      visitorExperience: "Experiencia do visitante",
      visitorExperienceDescription:
        "Visitantes apenas pesquisam e consultam. Eles nunca autenticam com Blizzard, Raider.IO ou Warcraft Logs pelo navegador.",
      credentialModel: "Modelo de credenciais",
      credentialModelDescription:
        "Os segredos ficam no cofre admin e sao usados apenas por refreshes server-side, refreshes manuais e o ciclo automatico de 10 minutos.",
      syncControl: "Controle de sync",
      syncControlDescription:
        "Salve as integracoes aqui e depois acione um refresh imediato ou deixe o ciclo automatico absorver a nova configuracao.",
      runtimeEyebrow: "Saude em runtime",
      runtimeTitle: "Wards de runtime",
      readyForSync: "Pronto para sync",
      enabledMissingSetup: "Ativo, mas faltando configuracao",
      disabledProvider: "Desativado",
      disabledState: "Desativado",
      readyState: "Pronto",
      needsSetupState: "Precisa configurar",
      region: "Regiao",
      unavailableProviderHealth: "A saude dos providers nao esta disponivel agora. Verifique o ADMIN_API_TOKEN no ambiente web.",
      postureEyebrow: "Pressao recente",
      postureTitle: "Postura de sync",
      autoRefreshCadence: "Cadencia do auto refresh",
      everyMinutes: "a cada minutos",
      latestCycleStatus: "Status do ultimo ciclo",
      latestCycleAt: "Ultimo ciclo em",
      latestAutoRefreshError: "Ultimo erro do auto refresh",
      currentPosture: "Postura atual",
      currentPostureDescription:
        "Nenhum erro recente de auto refresh foi registrado. Salve mudancas aqui e use o refresh manual se quiser confirmacao imediata.",
    },
    adminLogs: {
      recentEntries: "Entradas recentes",
      requestLogs: "Logs de request",
      adminActions: "Acoes admin",
      backupActions: "Acoes de backup",
      timelineEyebrow: "Timeline unificada",
      timelineTitle: "Stream de auditoria e sync",
      timelineDescription:
        "Esta timeline mistura logs de request, acoes administrativas e jobs de sync em ordem cronologica reversa.",
      noEntries: "Nenhuma entrada ainda",
      noEntriesDescription:
        "Assim que o sistema receber requests, syncs ou acoes administrativas, a timeline comeca a preencher.",
      systemActor: "sistema",
    },
    adminComponents: {
      logoutWorking: "Saindo...",
      refreshAllButton: "Atualizar tudo agora",
      refreshAllWorking: "Sincronizando...",
      refreshAllError: "Falha ao atualizar entidades rastreadas.",
      refreshAllSuccess: "Refresh concluido",
      guildCountLabel: "guildas",
      characterCountLabel: "personagens",
      backupNow: "Gerar backup agora",
      backupWorking: "Gerando...",
      backupError: "Falha ao gerar backup.",
      backupCreated: "Backup criado",
      restoreWorking: "Restaurando...",
      restoreButton: "Restaurar backup",
      restoreError: "Falha ao restaurar backup.",
      restoreComplete: "Restore concluido.",
      restoreConfirm: "Restaurar o backup? Isso pode substituir os dados atuais.",
      replaceCurrentData: "Substituir dados atuais",
      createSafetyBackup: "Criar backup de seguranca antes",
      downloadBackup: "Baixar backup",
      saveIntegrations: "Salvar integracoes",
      saveWorking: "Salvando...",
      saveError: "Falha ao salvar integracoes.",
      saveSuccess: "Integracoes salvas. Os proximos refreshes ja usam a configuracao nova.",
      externalIntegrations: "Integracoes externas",
      providerVault: "Cofre de providers",
      providerVaultDescription:
        "O site continua publico para visitantes. Estas credenciais sao apenas server-side e usadas por refreshes agendados, refreshes admin e syncs em background.",
      visitorModel: "Modelo do visitante",
      visitorModelValue: "Consulta publica",
      visitorModelDescription: "Nao existe fluxo de login do usuario final para consulta de guilda ou personagem.",
      secretHandling: "Tratamento de segredos",
      secretHandlingValue: "Apenas server-side",
      secretHandlingDescription: "Valores secretos ficam mascarados no navegador. Campo vazio preserva o segredo salvo.",
      syncModel: "Modelo de sync",
      syncModelValue: "Auto a cada 10 min",
      syncModelDescription: "Refresh manual e o ciclo em background absorvem a nova configuracao depois do save.",
      enabled: "Ativado",
      configured: "Configurado",
      needsSetup: "Precisa configurar",
      requirements: "Requisitos",
      region: "Regiao",
      apiBaseUrl: "API base URL",
      clientId: "Client ID",
      clientSecret: "Client secret",
      secretAlreadyStored: "Segredo ja armazenado",
      pasteNewSecret: "Cole um novo segredo",
      secretConfigured: "Segredo configurado",
      noSecretStored: "Nenhum segredo salvo",
      clearStoredSecret: "Limpar segredo salvo",
      observabilityEyebrow: "Observabilidade",
      observabilityTitle: "Controles de log",
      requestLoggingTitle: "Request logging",
      requestLoggingDescription: "Registra chamadas da API no AuditLog, incluindo rota, latencia, status e request id.",
      enableRequestLogs: "Ativar logs de request",
      publicConsultation: "Consulta publica",
      serverSideOnly: "Apenas server-side",
      autoEveryTen: "Auto a cada 10 min",
      adminRefreshError: "Falha ao atualizar integracoes.",
      entityRefreshWorking: "Atualizando...",
      entityRefreshButton: "Atualizar dados",
      entityRefreshError: "Falha ao atualizar dados.",
      entityRefreshProviders: "Dados atualizados pelos providers.",
      entityRefreshSnapshots: "Snapshots locais recompostos.",
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
      loginSceneTitle: "Um portal dedicado para operadores, backups, logs e integracoes.",
      loginSceneDescription: "Esta entrada prepara a transicao do modelo so com token para um acesso admin realmente protegido.",
      loginSceneBadge: "Login admin",
      loginInvalid: "Usuario ou senha invalidos.",
      loginUnavailable: "O login admin nao esta configurado.",
      loginFailed: "Falha no login.",
      entering: "Entrando no sanctum...",
    },
  },
  en: {
    shell: {
      eyebrow: "World of Warcraft Intelligence",
      summary: "Public consultation for guilds, characters, raid progress, and Mythic+ signals in a sharper premium warboard interface.",
      status: "Public feed online",
      home: "Home",
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
      footerNote: "World of Warcraft is a trademark of Blizzard Entertainment.",
    },
    shared: {
      yes: "Yes",
      no: "No",
      none: "None",
      noneYet: "None yet",
      unknown: "Unknown",
      unavailable: "Unavailable",
      estimated: "Estimated",
      scaffold: "Scaffold",
      live: "Live",
      fallback: "Fallback",
      stable: "Stable",
      partial: "Partial",
      technicalDetail: "Technical detail",
      publicDataUnavailable: "Public data unavailable",
      awaitingQuery: "Awaiting a query",
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
    home: {
      dataBannerTitle: "Some data is unavailable",
      dataBannerDescription:
        "This surface has entered contingency mode. The layout still works, but you may be seeing empty or neutral data while the API recovers.",
      rankingBannerTitle: "Warboard in contingency mode",
      rankingBannerDescription:
        "The public rankings did not respond in time. The warboard remains accessible, but the real values have not arrived in this readout.",
      intelligenceBannerTitle: "Partial intelligence",
      intelligenceBannerDescription:
        "The feed and meta layer could not populate every panel. The Nexus is showing safe, neutral states until the next refresh cycle.",
      rankingsEyebrow: "World rankings",
      rankingsTitle: "Guild progression ladder",
      openWarboard: "Open full warboard",
      intelligenceEyebrow: "Live intelligence",
      intelligenceTitle: "Realm feed",
      activityFeed: "Activity feed",
      eventsLabel: "events",
      noActivity: "No public activity events are available right now.",
      mythicMeta: "Mythic+ meta",
      timedSuffix: "timed",
      noMythicRoutes: "Mythic+ route data is not available right now.",
      seasonWatch: "Season watch",
      currentRaid: "Current raid",
      season: "Season",
      bossesVisible: "Bosses visible",
      mythicBossesTracked: "Mythic bosses tracked",
      worldTracker: "World tracker",
      heatmapReady: "Heatmap ready",
      mostPlayedRoute: "Most played route",
      topGuildTier: "Top guild tier",
      signalState: "Signal state",
      searchArchive: "Search archive",
      compareEntities: "Compare entities",
      ctaTitle: "Compare guilds and characters side-by-side",
      ctaDescription:
        "Intelligence reports, score history, and head-to-head breakdowns in the same visual language as the new warboard.",
      openCompare: "Open compare",
      adminPanel: "Admin panel",
    },
    searchPalette: {
      compactPlaceholder: "Search guild, character, or realm...",
      openResults: "Open results",
      scanning: "Scanning...",
      all: "All",
      guild: "Guild",
      character: "Character",
      realm: "Realm",
      searchAndDiscovery: "Search and discovery",
      searchTitle: "Search Azeroth Nexus by guild, character, realm, or region.",
      publicLookupActive: "Public lookup active",
      scanningRunes: "Scanning the runes",
      searchLabel: "Search",
      regionLabel: "Region",
      typeLabel: "Type",
      allRegions: "All regions",
      allEntities: "All entities",
      guilds: "Guilds",
      characters: "Characters",
      realms: "Realms",
      regions: "Regions",
      raids: "Raids",
      realmFilterLabel: "Realm filter",
      guildFilterLabel: "Guild filter",
      realmPlaceholder: "stormrage, tarren-mill...",
      guildPlaceholder: "Void Vanguard...",
      searchNow: "Search now",
      liveSuggestions: "Live suggestions",
      suggestionsDescription: "Azeroth Nexus is surfacing the closest public matches for this query.",
      echoesFound: "echoes found",
      noMatches: "No matches yet. Try a guild name, champion, realm, or region.",
      searchPagePlaceholder: "Void Vanguard, Aethryl, Stormrage...",
    },
    rankingTable: {
      eyebrow: "World rankings",
      visibleEntries: "visible entries",
      allRegions: "All regions",
      guildWarboard: "Guild warboard",
      liveScore: "Live score",
      rankingReadout: "Ranking readout",
      columns: {
        rank: "#",
        guild: "Guild",
        regionRealm: "Region · Realm",
        score: "Score",
        progress: "Progress",
        tier: "Tier",
        trend: "Trend",
      },
      confidence: "Confidence",
      calibrating: "Calibrating",
      empty: "No ranking entries are available in this readout.",
    },
    searchPage: {
      typeDescriptions: {
        guild: "Guild profile and progression page",
        character: "Character profile and performance page",
        realm: "Realm-focused discovery result",
        region: "Region-focused discovery result",
        raid: "Raid discovery result",
      },
      bannerDescription:
        "Public search did not respond in time. The results below are in a neutral state while the API has not returned the live readout.",
      heroEyebrow: "Archive search",
      heroTitle: "Search by name, realm, guild, or region through a proper scrying chamber.",
      heroDescription:
        "Query public guild and character pages with a presentation that feels ritualistic, premium, and unmistakably Azerothian.",
      sceneEyebrow: "Astral archive",
      sceneTitle: "A search chamber built around maps, tomes, and rune-lit discovery.",
      sceneDescription:
        "The art gives the search surface a real sense of place, while the new sigils make it feel like a feature of Azeroth Nexus instead of a floating utility page.",
      sceneBadgeActive: "Runes aligned",
      sceneBadgeIdle: "Awaiting a query",
      sceneAction: "Survey the warboard",
      filterEyebrow: "Filter state",
      filterTitle: "Current attunement",
      queryLabel: "Query",
      regionLabel: "Region",
      realmLabel: "Realm",
      guildLabel: "Guild",
      typeLabel: "Type",
      all: "all",
      any: "any",
      groupPrompt: "Run a search to reveal grouped matches by entity type.",
      publicReturnsEyebrow: "Public returns",
      publicReturnsTitle: "Search results",
      matchingResults: "matching results found in the current public scan.",
      matchingResult: "matching result found in the current public scan.",
      liveLookup: "Live public lookup",
      matchLabel: "Match",
      regionInfo: "Region",
      realmInfo: "Realm",
      guildInfo: "Guild",
      genericResult: "Public search result",
      noResults: "No public results matched this search. Broaden the filters and try another scry.",
      noQuery: "Type a name, realm, region, or guild above to begin the scan.",
      aligned: "Runes aligned",
      awaiting: "Awaiting a query",
    },
    rankingsPage: {
      bannerDescription:
        "The public rankings did not respond in time. This warboard page remains functional, but the real values have not been delivered in this cycle.",
      heroEyebrow: "World rankings",
      heroTitle: "Guild ladders forged as an astral warboard.",
      heroDescription:
        "The ladder now reads like a chamber of strategy: ornate, clear, and explicit about who is rising, who is pressured, and why every score sits where it does.",
      tierSystem: "Tier system",
      tierSystemValue: "Mythic Elite to Aspirant",
      tierSystemDescription: "A scale designed to feel ceremonial and legible instead of sterile.",
      currentEliteCount: "Current elite count",
      currentEliteDescription: "Guilds currently marked as Legend or Mythic Elite in the loaded board.",
      scoreDimensions: "Score dimensions",
      scoreDimensionsValue: "Progression / Execution / Roster / Activity",
      scoreDimensionsDescription: "Each entry carries clear notes for leadership, scouting, and competition.",
      compareAction: "Open compare chamber",
      searchAction: "Search the archives",
      sceneEyebrow: "High command",
      sceneTitle: "A ranking surface anchored by a real Azerothian command room.",
      sceneDescription:
        "This scenic panel gives the ladder a place and a mood before the data grid takes over.",
      sceneBadge: "World board",
      sceneAction: "Open compare chamber",
      tableTitle: "World guild ranking",
    },
    comparePage: {
      bannerDescription:
        "One or more comparisons entered contingency mode. The page remains navigable, but the real data has not been delivered yet.",
      heroEyebrow: "Comparison chamber",
      heroTitle: "Side-by-side intelligence with more ritual, more clarity, and more consequence.",
      heroDescription:
        "Compare guilds or champions inside a judgement chamber worthy of raid leaders, recruiters, and stat-obsessed tacticians.",
      sceneEyebrow: "Judgement hall",
      sceneTitle: "A comparison surface that reads like a ceremonial verdict room.",
      sceneDescription:
        "The page opens with a stronger sense of place before the scorecards begin, making the comparison feel deliberate and prestigious.",
      sceneBadge: "Side-by-side verdicts",
      sceneAction: "Return to rankings",
      guildTitle: "Guild vs Guild",
      characterTitle: "Character vs Character",
    },
    comparePanel: {
      eyebrow: "Comparison readout",
      verdict: "Side-by-side verdict",
      comparisonTarget: "Comparison target",
      delta: "Delta",
      momentum: "Momentum",
      sideBySideVerdict: "Side-by-side verdict",
      evenFooting: "Even footing",
      sideEdge: "side edge",
      dimensionsUnavailable: "Comparison dimensions are unavailable for this readout.",
    },
    guildPage: {
      bannerDescription:
        "This guild profile is in safe mode because the public readout did not respond in time. The neutral fields below do not represent confirmed data.",
      heroEyebrow: "Guild profile",
      autoRefresh: "Auto refresh every 10 minutes",
      composite: "Composite",
      tier: "Tier",
      trend: "Trend",
      worldRank: "World rank",
      sceneEyebrow: "Raid war hall",
      sceneTitle: "A guild chamber worthy of Azeroth raid night.",
      sceneDescription:
        "The page now opens with stronger MMO identity, with a proper guild hall before the data slabs take over.",
      historyTitle: "Guild score history",
      breakdownEyebrow: "Guild breakdown",
      breakdownTitle: "Score breakdown",
      progressEyebrow: "Raid progress",
      progressTitle: "Boss ledger",
      defeated: "Defeated",
      progressing: "Progressing",
      pulls: "pulls",
      rosterEyebrow: "Guild roster",
      rosterTitle: "Guild roster",
      unknownSpec: "Unknown spec",
      unknownRole: "Unknown role",
      itemLevel: "Item level",
    },
    characterPage: {
      bannerDescription:
        "This profile entered safe mode because the public character readout did not respond in time. The Nexus now makes that explicit and avoids fake data.",
      heroEyebrow: "Character profile",
      autoRefresh: "Auto refresh every 10 minutes",
      composite: "Composite",
      classAndSpec: "Class and spec",
      mythicPlus: "Mythic+",
      itemLevel: "Item level",
      sceneEyebrow: "Champion sanctum",
      sceneTitle: "A heroic Warcraft-style sanctum for this champion.",
      sceneDescription:
        "The profile now feels closer to a class hall or champion chamber, giving the page a stronger MMO identity before the numbers.",
      historyTitle: "Character score history",
      breakdownEyebrow: "Character breakdown",
      breakdownTitle: "Score breakdown",
      snapshotEyebrow: "Snapshot facts",
      snapshotTitle: "Current reading",
      guild: "Guild",
      unaffiliated: "Unaffiliated",
      raidEstimate: "Raid estimate",
      tierAndTrend: "Tier and trend",
      raidLogsEyebrow: "Raid logs",
      raidLogsTitle: "Warcraft Logs reading",
      liveParseSource: "Live parse source",
      awaitingLiveLogs: "Awaiting live logs",
      bestAverage: "Best average",
      medianAverage: "Median average",
      bossesLogged: "Bosses logged",
      source: "Source",
      honorsEyebrow: "Honors",
      honorsTitle: "Achievements",
    },
    armory: {
      loadoutEyebrow: "Armory loadout",
      loadoutTitle: "Equipped for live inspection.",
      loadoutDescription:
        "Slot-by-slot equipment in an Azeroth-style layout, with item level, enchantments, sockets, and tier pieces when Blizzard sync is available.",
      armorySync: "Blizzard armory sync",
      awaitingArmorySync: "Awaiting armory sync",
      race: "Race",
      faction: "Faction",
      level: "Level",
      achievementPoints: "Achievement points",
      itemLevel: "Item level",
      enchant: "Enchant",
      sockets: "Sockets",
      effects: "Effects",
      loadoutSync: "Loadout sync",
      loadoutSyncDescription:
        "No equipped items were returned yet. Trigger a manual update or wait for the automatic 10-minute refresh after Blizzard credentials are configured.",
      talentEyebrow: "Talent codex",
      talentTitle: "Active loadout and selected talents.",
      talentDescription:
        "Blizzard specialization data rendered as a build sheet, closer to Armory and Raider.IO than a plain stat box.",
      talentSync: "Loadout attuned",
      awaitingTalentSync: "Awaiting talent sync",
      activeSpec: "Active spec",
      currentLoadout: "Current loadout",
      heroTree: "Hero tree",
      classTalents: "Class talents",
      specTalents: "Spec talents",
      heroTalents: "Hero talents",
      pvpTalents: "PvP talents",
      choice: "Choice",
      unknown: "Unknown",
      talentSyncTitle: "Talent sync",
      talentSyncDescription:
        "No loadout was returned yet. Blizzard may need the character profile to be freshly available in public data, and the next server refresh will keep trying automatically.",
    },
    scoreHistory: {
      eyebrow: "Temporal trace",
      description: "A rune-lit reading of recent score movement across captured snapshots.",
      latestReading: "Latest reading",
      snapshot: "Snapshot",
      empty: "No captured score history is available for this entity yet.",
    },
    dataState: {
      technicalDetail: "Technical detail",
    },
    adminLayout: {
      eyebrow: "Azeroth Nexus administration",
      title: "Command, backups, logs, and provider vaults in one protected sanctum.",
      description:
        "The new admin area separates day-to-day operations, observability, backups, and external integrations without losing the epic identity of the system.",
      sceneEyebrow: "Ops nexus",
      sceneTitle: "A control chamber that feels like a legitimate part of Azeroth.",
      sceneDescription:
        "The admin now opens as a separate sanctum, with dedicated navigation for overview, external integrations, persisted backups, and log timelines.",
      sceneBadge: "Protected operations",
      nav: {
        overview: "Overview",
        integrations: "Integrations",
        backups: "Backups",
        logs: "Logs",
        controls: "Sanctum controls",
        logout: "Logout",
      },
    },
    adminOverview: {
      bannerTitle: "Admin dashboard unavailable",
      bannerDescription:
        "The admin frontend could not fetch the protected dashboard in this cycle. Review the login and the operational setup of the web server.",
      trackedGuilds: "Tracked guilds",
      trackedCharacters: "Tracked characters",
      configuredProviders: "Configured providers",
      backups: "Backups",
      providerHealthEyebrow: "Provider health",
      providerHealthTitle: "External services",
      providersCount: "providers",
      configuredAndReady: "Configured and ready",
      blockedOrMissing: "Blocked, disabled, or missing credentials",
      ready: "Ready",
      blocked: "Blocked",
      autoRefreshEyebrow: "Auto refresh",
      autoRefreshTitle: "Scheduler status",
      latestCycle: "Latest cycle",
      lastError: "Last error",
      latestJobsEyebrow: "Latest jobs",
      latestJobsTitle: "Provider and internal activity",
      recentJobs: "recent jobs",
      quickActionsEyebrow: "Quick actions",
      quickActionsTitle: "Operational runes",
      cadence: "cadence",
      generateBackup: "Generate backup now",
      integrations: "Integrations",
      integrationsCopy: "Configure Blizzard, Raider.IO, and Warcraft Logs.",
      backupsCopy: "Generate, list, and download complete database snapshots.",
      logs: "Logs",
      logsCopy: "Unified timeline for requests, admin actions, and sync jobs.",
      snapshotsEyebrow: "Snapshots and rankings",
      snapshotsTitle: "Latest ladder rebuilds",
      recentSnapshots: "recent snapshots",
      backupAuditEyebrow: "Backup and audit",
      backupAuditTitle: "Control archive",
      recentLogEntries: "recent log entries",
      latestBackup: "Latest backup",
      requestLogs: "Request logs",
      adminActions: "Admin actions",
      backupEvents: "Backup events",
      accessWardEyebrow: "Access ward",
      accessWardTitle: "Protected header",
      protectedHeader: "Protected header",
      notAvailable: "N/A",
    },
    adminBackups: {
      backupFiles: "Backup files",
      directory: "Directory",
      latestFile: "Latest file",
      snapshotControlEyebrow: "Snapshot control",
      snapshotControlTitle: "Database exports",
      snapshotControlDescription:
        "Each backup generates a complete JSON with all known Azeroth Nexus tables. The panel also allows restoring a listed snapshot with an optional safety backup.",
      archiveListEyebrow: "Archive list",
      archiveListTitle: "Persisted snapshots",
      files: "files",
      noBackups: "No backups yet",
      noBackupsDescription: "Generate the first snapshot to start keeping complete database exports.",
    },
    adminIntegrations: {
      providerLabels: {
        blizzard: {
          label: "Blizzard Battle.net",
          auth: "Server-side OAuth app credentials",
          requirements: "Client ID + Client Secret",
        },
        raiderio: {
          label: "Raider.IO",
          auth: "Public API",
          requirements: "Base URL only",
        },
        warcraftlogs: {
          label: "Warcraft Logs",
          auth: "Server-side OAuth client credentials",
          requirements: "Client ID + Client Secret",
        },
      },
      bannerTitle: "Integrations unavailable",
      bannerDescription:
        "The panel could not load the full protected configuration in this readout. This does not reveal secrets, but it does indicate an admin proxy failure or a missing token in the web server.",
      visibleProviders: "Visible providers",
      readyProviders: "Ready providers",
      requestLogging: "Request logging",
      active: "Active",
      disabled: "Disabled",
      autoRefresh: "Auto refresh",
      operationalEyebrow: "Operational model",
      operationalTitle: "Public site, private operations",
      visitorExperience: "Visitor experience",
      visitorExperienceDescription:
        "Visitors only search and consult. They never authenticate against Blizzard, Raider.IO, or Warcraft Logs through the browser.",
      credentialModel: "Credential model",
      credentialModelDescription:
        "Secrets stay in the admin vault and are used only by server-side refresh jobs, manual admin refreshes, and the 10-minute sync cycle.",
      syncControl: "Sync control",
      syncControlDescription:
        "Save integration changes here, then trigger a refresh immediately or let the automatic cycle absorb the new configuration.",
      runtimeEyebrow: "Live provider health",
      runtimeTitle: "Runtime wards",
      readyForSync: "Ready for sync",
      enabledMissingSetup: "Enabled but missing setup",
      disabledProvider: "Disabled",
      disabledState: "Disabled",
      readyState: "Ready",
      needsSetupState: "Needs setup",
      region: "Region",
      unavailableProviderHealth: "Provider health is unavailable right now. Check ADMIN_API_TOKEN in the web environment.",
      postureEyebrow: "Recent pressure",
      postureTitle: "Sync posture",
      autoRefreshCadence: "Auto refresh cadence",
      everyMinutes: "every minutes",
      latestCycleStatus: "Latest cycle status",
      latestCycleAt: "Latest cycle at",
      latestAutoRefreshError: "Latest auto-refresh error",
      currentPosture: "Current posture",
      currentPostureDescription:
        "No recent auto-refresh error is recorded. Save integration changes here and use the manual refresh control above if you want immediate confirmation.",
    },
    adminLogs: {
      recentEntries: "Recent entries",
      requestLogs: "Request logs",
      adminActions: "Admin actions",
      backupActions: "Backup actions",
      timelineEyebrow: "Unified timeline",
      timelineTitle: "Audit and sync stream",
      timelineDescription:
        "This timeline mixes request logs, administrative actions, and sync jobs in reverse chronological order.",
      noEntries: "No log entries yet",
      noEntriesDescription:
        "As soon as the system receives requests, syncs, or administrative actions, the timeline will begin to fill.",
      systemActor: "system",
    },
    adminComponents: {
      logoutWorking: "Leaving...",
      refreshAllButton: "Refresh everything now",
      refreshAllWorking: "Synchronizing...",
      refreshAllError: "Failed to refresh tracked entities.",
      refreshAllSuccess: "Refresh completed",
      guildCountLabel: "guilds",
      characterCountLabel: "characters",
      backupNow: "Generate backup now",
      backupWorking: "Generating...",
      backupError: "Failed to generate backup.",
      backupCreated: "Backup created",
      restoreWorking: "Restoring...",
      restoreButton: "Restore backup",
      restoreError: "Restore failed.",
      restoreComplete: "Restore complete.",
      restoreConfirm: "Restore this backup? This can replace current data.",
      replaceCurrentData: "Replace current data",
      createSafetyBackup: "Create safety backup first",
      downloadBackup: "Download backup",
      saveIntegrations: "Save integrations",
      saveWorking: "Saving...",
      saveError: "Failed to save integrations.",
      saveSuccess: "Integrations saved. Upcoming refreshes now use the new configuration.",
      externalIntegrations: "External integrations",
      providerVault: "Provider vault",
      providerVaultDescription:
        "The site remains public for visitors. These credentials are server-side only and are used by scheduled refreshes, admin refreshes, and background syncs.",
      visitorModel: "Visitor model",
      visitorModelValue: "Public consultation",
      visitorModelDescription: "No end-user login flow is required for guild or character lookup.",
      secretHandling: "Secret handling",
      secretHandlingValue: "Server-side only",
      secretHandlingDescription: "Secret values are masked in the browser. Empty secret fields preserve the stored value.",
      syncModel: "Sync model",
      syncModelValue: "Auto every 10 min",
      syncModelDescription: "Manual refresh and the background cycle will pick up the new configuration after save.",
      enabled: "Enabled",
      configured: "Configured",
      needsSetup: "Needs setup",
      requirements: "Requirements",
      region: "Region",
      apiBaseUrl: "API base URL",
      clientId: "Client ID",
      clientSecret: "Client secret",
      secretAlreadyStored: "Secret already stored",
      pasteNewSecret: "Paste a new secret",
      secretConfigured: "Secret configured",
      noSecretStored: "No secret stored",
      clearStoredSecret: "Clear stored secret",
      observabilityEyebrow: "Observability",
      observabilityTitle: "Logging controls",
      requestLoggingTitle: "Request logging",
      requestLoggingDescription: "Records API calls into AuditLog, including route, latency, status, and request id.",
      enableRequestLogs: "Enable request logs",
      publicConsultation: "Public consultation",
      serverSideOnly: "Server-side only",
      autoEveryTen: "Auto every 10 min",
      adminRefreshError: "Failed to update integrations.",
      entityRefreshWorking: "Refreshing...",
      entityRefreshButton: "Refresh data",
      entityRefreshError: "Refresh failed.",
      entityRefreshProviders: "Providers refreshed the data.",
      entityRefreshSnapshots: "Local snapshots rebuilt.",
    },
    admin: {
      loginEyebrow: "Protected admin access",
      loginTitle: "Enter the Azeroth Nexus sanctum.",
      loginDescription:
        "The admin area now uses dedicated credentials generated during installation, protecting backups, provider secrets, and operational controls.",
      loginButton: "Enter admin sanctum",
      loginUsername: "Admin username",
      loginPassword: "Admin password",
      logout: "Logout",
      loginSceneTitle: "A dedicated gate for operators, backups, logs, and integrations.",
      loginSceneDescription: "This entry prepares the shift from token-only ops to a proper protected admin access flow.",
      loginSceneBadge: "Admin login",
      loginInvalid: "Invalid username or password.",
      loginUnavailable: "Admin login is not configured.",
      loginFailed: "Login failed.",
      entering: "Entering sanctum...",
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

export function formatDateTime(value: string | null | undefined, locale: SupportedLocale, fallback = "N/A") {
  if (!value) {
    return fallback;
  }

  return new Date(value).toLocaleString(locale);
}

export function formatDate(value: string | null | undefined, locale: SupportedLocale, fallback = "N/A") {
  if (!value) {
    return fallback;
  }

  return new Date(value).toLocaleDateString(locale);
}

export async function getDictionary() {
  const locale = await getLocale();
  return {
    locale,
    copy: dictionaries[locale],
  };
}
