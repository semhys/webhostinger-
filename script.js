// SEMHYS Global Script (Translations + Logic)

// 1. TRANSLATION DATABASE
const i18n = {
    es: {
        // Nav
        nav_home: "Inicio",
        nav_services: "Servicios",
        nav_shop: "Tienda",
        nav_blog: "Academia",
        // Hero
        hero_title: "Ingeniería Sostenible Global",
        hero_desc: "Soluciones avanzadas en hidráulica, tratamiento de agua y eficiencia energética industrial.",
        hero_cta: "Explorar Soluciones",
        // Services (Index)
        services_title: "Nuestros Servicios",
        srv_1_title: "Hidráulica Avanzada",
        srv_1_desc: "Diseño, mantenimiento y optimización de sistemas de bombeo.",
        srv_2_title: "Tratamiento de Agua",
        srv_2_desc: "Plantas de tratamiento (PTAR), gestión de lodos y recuperación.",
        srv_3_title: "Eficiencia Energética",
        srv_3_desc: "Auditorías y modernización de tableros eléctricos.",
        // Hydraulics Page
        hydr_title: "Hidráulica Avanzada",
        hydr_desc: "Soluciones integrales para sistemas de bombeo y fluidos.",
        hydr_sec1_title: "Diseño y Simulación",
        hydr_sec1_desc: "Utilizamos software CAD y CFD de última generación para modelar el comportamiento de fluidos. Esto nos permite predecir problemas como la cavitación o el golpe de ariete antes de la instalación.",
        hydr_sec2_title: "Mantenimiento Predictivo",
        hydr_sec2_desc: "Nuestros servicios incluyen análisis de vibraciones y termografía para detectar fallos inminentes en rodamientos y sellos mecánicos, maximizando el tiempo de actividad.",
        hydr_sec3_title: "Optimización de Bombeo",
        hydr_sec3_desc: "Realizamos auditorías de eficiencia para asegurar que sus bombas operen en su Punto de Mejor Eficiencia (BEP), reduciendo drásticamente el consumo eléctrico.",
        hydr_cta_title: "¿Necesita asesoramiento experto?",
        hydr_cta_desc: "Hable directamente con nuestros ingenieros especialistas.",
        hydr_cta_btn: "Contactar Ingeniero",
        // Water Page
        water_title: "Tratamiento de Agua",
        water_desc: "Ingeniería avanzada para gestión de recursos hídricos y efluentes.",
        water_sec1_title: "Plantas PTAR",
        water_sec1_desc: "Diseñamos plantas de tratamiento de aguas residuales personalizadas. Desde sistemas aerobios compactos hasta reactores biológicos de membrana (MBR) de alto rendimiento.",
        water_sec2_title: "Gestión de Lodos",
        water_sec2_desc: "Transforme un residuo costoso en un recurso. Implementamos sistemas de deshidratación y digestión anaerobia para la reducción de volumen y producción de biogás.",
        water_sec3_title: "Recuperación",
        water_sec3_desc: "Sistemas de osmosis inversa y ultrafiltración para reutilización de agua en procesos industriales (torres de enfriamiento, calderas), reduciendo su huella hídrica.",
        water_cta_title: "¿Tiene un proyecto hídrico?",
        water_cta_desc: "Analicemos su calidad de agua y necesidades de descarga.",
        water_cta_btn: "Contactar Especialista",
        // Energy Page
        energy_title: "Eficiencia Energética",
        energy_desc: "Reduzca costos operativos y cumpla normativas ambientales.",
        energy_sec1_title: "Auditorías ISO 50001",
        energy_sec1_desc: "Realizamos diagnósticos energéticos completos para identificar los mayores consumidores de su planta y proponer un plan de gestión energética conforme a ISO 50001.",
        energy_sec2_title: "Modernización de Tableros",
        energy_sec2_desc: "Actualizamos antiguos tableros de control con tecnología inteligente (IoT, PLCs modernos) que permite monitoreo en tiempo real y desconexión de cargas no críticas.",
        energy_sec3_title: "Variadores de Frecuencia",
        energy_sec3_desc: "La implementación de VFDs en motores de bombas y ventiladores es la medida de mayor retorno. Ajuste la velocidad a la demanda real del proceso y ahorre hasta un 40% de energía.",
        energy_cta_title: "¿Quiere bajar su factura eléctrica?",
        energy_cta_desc: "Solicite una pre-auditoría gratuita hoy mismo.",
        energy_cta_btn: "Agendar Auditoría",
        // Blog Page
        blog_art1_meta: "Hidráulica | Oct 12, 2024",
        blog_art1_title: "Cavitación en Bombas Centrífugas: El Enemigo Silencioso",
        blog_art1_p1: "La cavitación es uno de los fenómenos más destructivos en los sistemas de bombeo industrial. Ocurre cuando la presión del fluido cae por debajo de su presión de vapor, formando burbujas que colapsan violentamente al llegar a zonas de mayor presión.",
        blog_art1_h3_1: "Causas Principales",
        blog_art1_p2: "Frecuentemente, la cavitación es causada por un NPSH (Net Positive Suction Head) disponible insuficiente. Esto puede deberse a:",
        blog_art1_list: "<li>- Tuberías de succión obstruidas o mal dimensionadas.</li><li>- Alturas de succión excesivas.</li><li>- Fluido a temperatura demasiado alta.</li>",
        blog_art1_tech: "DIAGNÓSTICO TÉCNICO: Ruido similar a 'bombear grava', vibración excesiva en los rodamientos y caída repentina de la curva de presión-caudal.",
        blog_art1_h3_2: "Soluciones de Ingeniería",
        blog_art1_p3: "Para mitigar este problema, es crucial rediseñar la línea de succión para minimizar pérdidas por fricción, aumentar el nivel del tanque de succión o, en casos extremos, utilizar inductores en el impulsor de la bomba.",
        blog_art2_meta: "Eficiencia Energética | Sep 28, 2024",
        blog_art2_title: "Normativa ISO 50001 en Plantas de Tratamiento",
        blog_art2_p1: "Las plantas de tratamiento de aguas residuales (PTAR) son consumidores intensivos de energía, a menudo representando el 30-40% del presupuesto operativo municipal. La implementación de la ISO 50001 no es solo burocracia, es rentabilidad.",
        blog_art2_h3_1: "Estrategias de Optimización",
        blog_art2_p2: "El uso de variadores de frecuencia (VFD) en los sopladores de aireación puede reducir el consumo hasta un 25%. Ajustar el suministro de oxígeno a la demanda biológica real (DO control) es la medida más impactante.",
        blog_art2_tech: "ROI PROMEDIO: La implementación de sistemas de control inteligente en aireación tiene un retorno de inversión típico de 12 a 18 meses.",
        blog_art3_meta: "Mecánica | Sep 15, 2024",
        blog_art3_title: "Tecnologías de Sellado para Alta Presión",
        blog_art3_p1: "En aplicaciones industriales de más de 100 bar, los sellos mecánicos convencionales fallan prematuramente. La tecnología de sellos de gas seco y sellos de cartucho balanceados ofrece soluciones robustas.",
        blog_art3_p2: "Seleccionar la cara del sello correcta (Carburo de Silicio vs Carburo de Tungsteno) es crítico dependiendo de la abrasividad del fluido. Para aguas con sedimentos, se recomiendan sistemas de plan de lavado API 53 o similares.",
        // Shop Section (Home)
        shop_title: "Suministros Certificados",
        shop_cta: "Ver Tienda Completa",
        prod_1: "Rodamiento Industrial",
        prod_2: "Kit de Sellos",
        prod_3: "Bomba Centrifuga",
        prod_4: "Tablero de Control",
        // Blog Section (Home)
        blog_title: "Conocimiento Técnico",
        blog_btn: "Ir al Blog",
        read_more: "Leer más →",
        art_1: "Mantenimiento Predictivo con IA",
        art_2: "Optimización de Lodos en PTAR",
        art_3: "Nuevas Normativas ISO 50001",
        // Profile & Footer
        profile_role: "Director de Ingeniería & I+D",
        profile_bio: "+11 años de experiencia liderando proyectos críticos en SINTRA, BYR y Enel. Especialista en integración de tecnologías sostenibles.",
        contact: "Contacto",
        legal: "Legal",
        // Chat
        chat_welcome_msg: "Hola, soy el Ingeniero IA de Semhys. Describa su problema técnico o requerimiento y lo analizaré de inmediato.",
        chat_human_btn: "Hablar con Ingeniero Humano"
    },
    en: {
        nav_home: "Home",
        nav_services: "Services",
        nav_shop: "Store",
        nav_blog: "Academy",
        hero_title: "Global Sustainable Engineering",
        hero_desc: "Advanced solutions in hydraulics, water treatment, and industrial energy efficiency.",
        hero_cta: "Explore Solutions",
        services_title: "Our Services",
        srv_1_title: "Advanced Hydraulics",
        srv_1_desc: "Design, maintenance, and optimization of pumping systems.",
        srv_2_title: "Water Treatment",
        srv_2_desc: "Treatment plants (WWTP), sludge management, and recovery.",
        srv_3_title: "Energy Efficiency",
        srv_3_desc: "Audits and modernization of electric panels.",
        // Hydraulics Page
        hydr_title: "Advanced Hydraulics",
        hydr_desc: "Comprehensive solutions for pumping and fluid systems.",
        hydr_sec1_title: "Design and Simulation",
        hydr_sec1_desc: "We use state-of-the-art CAD and CFD software to model fluid behavior. This allows us to predict issues like cavitation or water hammer before installation.",
        hydr_sec2_title: "Predictive Maintenance",
        hydr_sec2_desc: "Our services include vibration analysis and thermography to detect impending failures in bearings and mechanical seals, maximizing uptime.",
        hydr_sec3_title: "Pumping Optimization",
        hydr_sec3_desc: "We conduct efficiency audits to ensure your pumps operate at their Best Efficiency Point (BEP), drastically reducing electrical consumption.",
        hydr_cta_title: "Need expert advice?",
        hydr_cta_desc: "Speak directly with our specialist engineers.",
        hydr_cta_btn: "Contact Engineer",
        // Water Page
        water_title: "Water Treatment",
        water_desc: "Advanced engineering for water resource and effluent management.",
        water_sec1_title: "WWTP Plants",
        water_sec1_desc: "We design custom wastewater treatment plants. From compact aerobic systems to high-performance Membrane Bioreactors (MBR).",
        water_sec2_title: "Sludge Management",
        water_sec2_desc: "Transform a costly waste into a resource. We implement dewatering and anaerobic digestion systems for volume reduction and biogas production.",
        water_sec3_title: "Recovery",
        water_sec3_desc: "Reverse osmosis and ultrafiltration systems for water reuse in industrial processes (cooling towers, boilers), reducing your water footprint.",
        water_cta_title: "Have a water project?",
        water_cta_desc: "Let's analyze your water quality and discharge needs.",
        water_cta_btn: "Contact Specialist",
        // Energy Page
        energy_title: "Energy Efficiency",
        energy_desc: "Reduce operating costs and comply with environmental regulations.",
        energy_sec1_title: "ISO 50001 Audits",
        energy_sec1_desc: "We perform complete energy diagnostics to identify your plant's largest consumers and propose an energy management plan compliant with ISO 50001.",
        energy_sec2_title: "Panel Modernization",
        energy_sec2_desc: "We upgrade old control panels with smart technology (IoT, modern PLCs) allowing real-time monitoring and shedding of non-critical loads.",
        energy_sec3_title: "Variable Frequency Drives",
        energy_sec3_desc: "Implementing VFDs on pump and fan motors offers the highest return. Adjust speed to real process demand and save up to 40% energy.",
        energy_cta_title: "Want to lower your electric bill?",
        energy_cta_desc: "Request a free pre-audit today.",
        energy_cta_btn: "Schedule Audit",
        // Blog Page
        blog_art1_meta: "Hydraulics | Oct 12, 2024",
        blog_art1_title: "Cavitation in Centrifugal Pumps: The Silent Enemy",
        blog_art1_p1: "Cavitation is one of the most destructive phenomena in industrial pumping systems. It occurs when fluid pressure drops below its vapor pressure, forming bubbles that collapse violently when reaching higher pressure zones.",
        blog_art1_h3_1: "Main Causes",
        blog_art1_p2: "Often, cavitation is caused by insufficient available NPSH (Net Positive Suction Head). This can be due to:",
        blog_art1_list: "<li>- Clogged or undersized suction pipes.</li><li>- Excessive suction lifts.</li><li>- Fluid temperature too high.</li>",
        blog_art1_tech: "TECHNICAL DIAGNOSIS: Noise similar to 'pumping gravel', excessive bearing vibration, and sudden drop in pressure-flow curve.",
        blog_art1_h3_2: "Engineering Solutions",
        blog_art1_p3: "To mitigate this, it is crucial to redesign the suction line to minimize friction losses, raise the suction tank level, or in extreme cases, use inducers on the pump impeller.",
        blog_art2_meta: "Energy Efficiency | Sep 28, 2024",
        blog_art2_title: "ISO 50001 Licensing in Treatment Plants",
        blog_art2_p1: "Wastewater treatment plants (WWTP) are intensive energy consumers, often representing 30-40% of municipal operating budgets. Implementing ISO 50001 is not just bureaucracy, it's profitability.",
        blog_art2_h3_1: "Optimization Strategies",
        blog_art2_p2: "Using Variable Frequency Drives (VFD) on aeration blowers can reduce consumption by up to 25%. Adjusting oxygen supply to real biological demand (DO control) is the most impactful measure.",
        blog_art2_tech: "AVERAGE ROI: Implementing smart control systems in aeration typically has a return on investment of 12 to 18 months.",
        blog_art3_meta: "Mechanics | Sep 15, 2024",
        blog_art3_title: "High Pressure Sealing Technologies",
        blog_art3_p1: "In industrial applications over 100 bar, conventional mechanical seals fail prematurely. Dry gas seal technology and balanced cartridge seals offer robust solutions.",
        blog_art3_p2: "Selecting the correct seal face (Silicon Carbide vs Tungsten Carbide) is critical depending on fluid abrasiveness. For water with sediments, API 53 flush plans or similar are recommended.",
        shop_title: "Certified Supplies",
        shop_cta: "Visit Full Store",
        prod_1: "Industrial Bearing",
        prod_2: "Seal Kit",
        prod_3: "Centrifugal Pump",
        prod_4: "Control Panel",
        blog_title: "Technical Knowledge",
        blog_btn: "Go to Blog",
        read_more: "Read more →",
        art_1: "AI Predictive Maintenance",
        art_2: "WWTP Sludge Optimization",
        art_3: "New ISO 50001 Standards",
        profile_role: "Engineering & R&D Director",
        profile_bio: "+11 years of experience leading critical projects at SINTRA, BYR, and Enel. Specialist in sustainable technology integration.",
        contact: "Contact",
        legal: "Legal",
        chat_welcome_msg: "Hello, I am the Semhys AI Engineer. Describe your technical problem or requirement and I will analyze it immediately.",
        chat_human_btn: "Talk to Human Engineer"
    },
    fr: {
        nav_home: "Accueil",
        nav_services: "Services",
        nav_shop: "Boutique",
        nav_blog: "Académie",
        hero_title: "Ingénierie Durable Mondiale",
        hero_desc: "Solutions avancées en hydraulique, traitement de l'eau et efficacité énergétique.",
        hero_cta: "Explorer Solutions",
        services_title: "Nos Services",
        srv_1_title: "Hydraulique Avancée",
        srv_1_desc: "Conception et optimisation des systèmes de pompage.",
        srv_2_title: "Traitement de l'Eau",
        srv_2_desc: "Stations d'épuration (STEP), gestion des boues.",
        srv_3_title: "Efficacité Énergétique",
        srv_3_desc: "Audits et modernisation des tableaux électriques.",
        // Hydraulics Page
        hydr_title: "Hydraulique Avancée",
        hydr_desc: "Solutions complètes pour les systèmes de pompage et de fluides.",
        hydr_sec1_title: "Conception et Simulation",
        hydr_sec1_desc: "Nous utilisons des logiciels CAO et CFD de pointe pour modéliser le comportement des fluides. Cela permet de prédire les problèmes comme la cavitation avant l'installation.",
        hydr_sec2_title: "Maintenance Prédictive",
        hydr_sec2_desc: "Nos services incluent l'analyse vibratoire et la thermographie pour détecter les pannes imminentes, maximisant la disponibilité.",
        hydr_sec3_title: "Optimisation du Pompage",
        hydr_sec3_desc: "Nous réalisons des audits d'efficacité pour garantir que vos pompes fonctionnent à leur Meilleur Point d'Efficacité (BEP), réduisant drastiquement la consommation électrique.",
        hydr_cta_title: "Besoin d'un conseil expert ?",
        hydr_cta_desc: "Parlez directement avec nos ingénieurs spécialistes.",
        hydr_cta_btn: "Contacter l'Ingénieur",
        // Water Page
        water_title: "Traitement de l'Eau",
        water_desc: "Ingénierie avancée pour la gestion des ressources hydriques et des effluents.",
        water_sec1_title: "Stations STEP",
        water_sec1_desc: "Nous concevons des stations d'épuration personnalisées. Des systèmes aérobies compacts aux bioréacteurs à membrane (MBR) haute performance.",
        water_sec2_title: "Gestion des Boues",
        water_sec2_desc: "Transformez un déchet coûteux en ressource. Nous mettons en œuvre des systèmes de déshydratation et de digestion anaérobie pour la production de biogaz.",
        water_sec3_title: "Récupération",
        water_sec3_desc: "Systèmes d'osmose inverse et d'ultrafiltration pour la réutilisation de l'eau dans les processus industriels, réduisant votre empreinte hydrique.",
        water_cta_title: "Vous avez un projet hydrique ?",
        water_cta_desc: "Analysons votre qualité d'eau et vos besoins de rejet.",
        water_cta_btn: "Contacter le Spécialiste",
        // Energy Page
        energy_title: "Efficacité Énergétique",
        energy_desc: "Réduisez les coûts d'exploitation et respectez les normes environnementales.",
        energy_sec1_title: "Audits ISO 50001",
        energy_sec1_desc: "Nous réalisons des diagnostics énergétiques complets pour identifier les plus gros consommateurs de votre usine et proposer un plan de gestion conforme à l'ISO 50001.",
        energy_sec2_title: "Modernisation des Tableaux",
        energy_sec2_desc: "Nous modernisons les anciens tableaux de commande avec une technologie intelligente (IoT, automates modernes) permettant une surveillance en temps réel.",
        energy_sec3_title: "Variateurs de Fréquence",
        energy_sec3_desc: "L'installation de VFD sur les moteurs de pompes et ventilateurs offre le meilleur retour. Ajustez la vitesse à la demande réelle et économisez jusqu'à 40% d'énergie.",
        energy_cta_title: "Vous voulez réduire votre facture ?",
        energy_cta_desc: "Demandez un pré-audit gratuit dès aujourd'hui.",
        energy_cta_btn: "Planifier un Audit",
        // Blog Page
        blog_art1_meta: "Hydraulique | 12 Oct 2024",
        blog_art1_title: "La Cavitation dans les Pompes Centrifuges",
        blog_art1_p1: "La cavitation est l'un des phénomènes les plus destructeurs dans les systèmes de pompage industriel. Elle se produit lorsque la pression du fluide chute en dessous de sa pression de vapeur.",
        blog_art1_h3_1: "Causes Principales",
        blog_art1_p2: "Souvent, la cavitation est causée par un NPSH disponible insuffisant. Cela peut être dû à :",
        blog_art1_list: "<li>- Tuyaux d'aspiration obstrués.</li><li>- Hauteurs d'aspiration excessives.</li><li>- Température du fluide trop élevée.</li>",
        blog_art1_tech: "DIAGNOSTIC TECHNIQUE : Bruit semblable à du gravier, vibrations excessives et chute soudaine de pression.",
        blog_art1_h3_2: "Solutions d'Ingénierie",
        blog_art1_p3: "Pour atténuer ce problème, il est crucial de redimensionner la ligne d'aspiration pour minimiser les pertes par friction.",
        blog_art2_meta: "Efficacité Énergétique | 28 Sep 2024",
        blog_art2_title: "Norme ISO 50001 dans les Stations d'Épuration",
        blog_art2_p1: "Les stations d'épuration (STEP) sont de gros consommateurs d'énergie. La mise en œuvre de l'ISO 50001 assure la rentabilité.",
        blog_art2_h3_1: "Stratégies d'Optimisation",
        blog_art2_p2: "L'utilisation de variateurs de fréquence (VFD) sur les surpresseurs d'aération peut réduire la consommation jusqu'à 25%.",
        blog_art2_tech: "ROI MOYEN : Le retour sur investissement typique est de 12 à 18 mois pour les systèmes de contrôle intelligent.",
        blog_art3_meta: "Mécanique | 15 Sep 2024",
        blog_art3_title: "Technologies d'Étanchéité Haute Pression",
        blog_art3_p1: "Dans les applications industrielles > 100 bar, les garnitures mécaniques conventionnelles échouent. Les garnitures à gaz sec sont la solution.",
        blog_art3_p2: "Le choix de la face de garniture (Carbure de Silicium vs Tungstène) est critique selon l'abrasivité du fluide.",
        shop_title: "Fournitures Certifiées",
        shop_cta: "Voir Toute la Boutique",
        prod_1: "Roulement Industriel",
        prod_2: "Kit d'Étanchéité",
        prod_3: "Pompe Centrifuge",
        prod_4: "Tableau de Commande",
        blog_title: "Connaissances Techniques",
        blog_btn: "Aller au Blog",
        read_more: "Lire la suite →",
        art_1: "Maintenance Prédictive par IA",
        art_2: "Optimisation des Boues (STEP)",
        art_3: "Nouvelles Normes ISO 50001",
        profile_role: "Directeur R&D & Ingénierie",
        profile_bio: "+11 ans d'expérience chez SINTRA, BYR et Enel. Spécialiste de l'intégration technologique durable.",
        contact: "Contact",
        legal: "Légal",
        chat_welcome_msg: "Bonjour, je suis l'ingénieur IA Semhys. Décrivez votre problème technique et je l'analyserai immédiatement.",
        chat_human_btn: "Parler à un Ingénieur Humain"
    },
    pt: {
        nav_home: "Início",
        nav_services: "Serviços",
        nav_shop: "Loja",
        nav_blog: "Academia",
        hero_title: "Engenharia Sustentável Global",
        hero_desc: "Soluções avançadas em hidráulica, tratamento de água e eficiência energética.",
        hero_cta: "Explorar Soluções",
        services_title: "Nossos Serviços",
        srv_1_title: "Hidráulica Avançada",
        srv_1_desc: "Design, manutenção e otimização de sistemas de bombeamento.",
        srv_2_title: "Tratamento de Água",
        srv_2_desc: "Estações de tratamento (ETE), gestão de lodo e recuperação.",
        srv_3_title: "Eficiência Energética",
        srv_3_desc: "Auditorias e modernização de painéis elétricos.",
        // Hydraulics Page
        hydr_title: "Hidráulica Avançada",
        hydr_desc: "Soluções abrangentes para sistemas de bombeamento e fluidos.",
        hydr_sec1_title: "Design e Simulação",
        hydr_sec1_desc: "Usamos software CAD e CFD de ponta para modelar o comportamento dos fluidos. Isso nos permite prever problemas como cavitação antes da instalação.",
        hydr_sec2_title: "Manutenção Preditiva",
        hydr_sec2_desc: "Nossos serviços incluem análise de vibração e termografia para detectar falhas iminentes em rolamentos e selos mecânicos, maximizando o tempo de atividade.",
        hydr_sec3_title: "Otimização de Bombeamento",
        hydr_sec3_desc: "Realizamos auditorias de eficiência para garantir que suas bombas operem em seu Ponto de Melhor Eficiência (BEP), reduzindo drasticamente o consumo elétrico.",
        hydr_cta_title: "Precisa de conselho especializado?",
        hydr_cta_desc: "Fale diretamente com nossos engenheiros especialistas.",
        hydr_cta_btn: "Contatar Engenheiro",
        // Water Page
        water_title: "Tratamento de Água",
        water_desc: "Engenharia avançada para gestão de recursos hídricos e efluentes.",
        water_sec1_title: "Estações ETE",
        water_sec1_desc: "Projetamos estações de tratamento de águas residuais personalizadas. De sistemas aeróbios compactos a Biorreatores de Membrana (MBR) de alto desempenho.",
        water_sec2_title: "Gestão de Lodo",
        water_sec2_desc: "Transforme um resíduo caro em um recurso. Implementamos sistemas de desidratação e digestão anaeróbia para redução de volume e produção de biogás.",
        water_sec3_title: "Recuperação",
        water_sec3_desc: "Sistemas de osmose reversa e ultrafiltração para reutilização de água em processos industriais (torres de resfriamento, caldeiras), reduzindo sua pegada hídrica.",
        water_cta_title: "Tem um projeto hídrico?",
        water_cta_desc: "Vamos analisar a qualidade da água e suas necessidades de descarte.",
        water_cta_btn: "Contatar Especialista",
        // Energy Page
        energy_title: "Eficiência Energética",
        energy_desc: "Reduza custos operacionais e cumpra as normas ambientais.",
        energy_sec1_title: "Auditorias ISO 50001",
        energy_sec1_desc: "Realizamos diagnósticos energéticos completos para identificar os maiores consumidores de sua planta e propor um plano de gestão conforme a ISO 50001.",
        energy_sec2_title: "Modernização de Painéis",
        energy_sec2_desc: "Atualizamos painéis de controle antigos com tecnologia inteligente (IoT, PLCs modernos) permitindo monitoramento em tempo real e corte de cargas não críticas.",
        energy_sec3_title: "Variadores de Frequência",
        energy_sec3_desc: "A implementação de VFDs em motores de bombas e ventiladores oferece o maior retorno. Ajuste a velocidade à demanda real e economize até 40% de energia.",
        energy_cta_title: "Quer baixar sua conta de luz?",
        energy_cta_desc: "Solicite uma pré-auditoria gratuita hoje mesmo.",
        energy_cta_btn: "Agendar Auditoria",
        // Blog Page
        blog_art1_meta: "Hidráulica | 12 Out 2024",
        blog_art1_title: "Cavitação em Bombas Centrífugas",
        blog_art1_p1: "A cavitação é um dos fenômenos mais destrutivos em sistemas de bombeamento industrial. Ocorre quando a pressão do fluido cai abaixo da pressão de vapor.",
        blog_art1_h3_1: "Causas Principais",
        blog_art1_p2: "Frequentemente, a cavitação é causada por NPSH insuficiente. Isso pode ser devido a:",
        blog_art1_list: "<li>- Tubulações de sucção obstruídas.</li><li>- Alturas de sucção excessivas.</li><li>- Fluido muito quente.</li>",
        blog_art1_tech: "DIAGNÓSTICO TÉCNICO: Ruído semelhante a 'bombear cascalho', vibração excessiva e queda repentina de pressão.",
        blog_art1_h3_2: "Soluções de Engenharia",
        blog_art1_p3: "Para mitigar esse problema, é crucial redimensionar a linha de sucção para minimizar perdas por atrito.",
        blog_art2_meta: "Eficiência Energética | 28 Set 2024",
        blog_art2_title: "Norma ISO 50001 em Estações de Tratamento",
        blog_art2_p1: "As estações de tratamento (ETE) são grandes consumidores de energia. A implementação da ISO 50001 garante rentabilidade.",
        blog_art2_h3_1: "Estratégias de Otimização",
        blog_art2_p2: "O uso de inversores de frequência (VFD) em sopradores de aeração pode reduzir o consumo em até 25%.",
        blog_art2_tech: "ROI MÉDIO: O retorno sobre o investimento típico é de 12 a 18 meses para sistemas de controle inteligente.",
        blog_art3_meta: "Mecânica | 15 Set 2024",
        blog_art3_title: "Tecnologias de Vedação de Alta Pressão",
        blog_art3_p1: "Em aplicações industriais > 100 bar, selos mecânicos convencionais falham. Selos a gás seco são a solução.",
        blog_art3_p2: "A escolha da face do selo (Carbeto de Silício vs Tungstênio) é crítica dependendo da abrasividade do fluido.",
        shop_title: "Suprimentos Certificados",
        shop_cta: "Ver Loja Completa",
        prod_1: "Rolamento Industrial",
        prod_2: "Kit de Vedação",
        prod_3: "Bomba Centrífuga",
        prod_4: "Painel de Controle",
        blog_title: "Conhecimento Técnico",
        blog_btn: "Ir para o Blog",
        read_more: "Leia mais →",
        art_1: "Manutenção Preditiva com IA",
        art_2: "Otimização de Lodo em ETE",
        art_3: "Novas Normas ISO 50001",
        profile_role: "Diretor de Engenharia & P&D",
        profile_bio: "+11 anos de experiência liderando projetos críticos na SINTRA, BYR e Enel. Especialista em integração de tecnologia sustentável.",
        contact: "Contato",
        legal: "Legal",
        chat_welcome_msg: "Olá, sou o Engenheiro de IA da Semhys. Descreva seu problema técnico ou requisito e eu o analisarei imediatamente.",
        chat_human_btn: "Falar com Engenheiro Humano"
    }
};

// 2. LANGUAGE LOGIC
function initLanguage() {
    let lang = localStorage.getItem('semhys_lang');

    // Auto-detect if no saved preference
    if (!lang) {
        const browserLang = navigator.language || navigator.userLanguage;
        console.log("Detected browser lang:", browserLang); // Debug
        if (browserLang.startsWith('en')) lang = 'en';
        else if (browserLang.startsWith('pt')) lang = 'pt';
        else if (browserLang.startsWith('fr')) lang = 'fr';
        else lang = 'es'; // Default

        // Save initial detection so it persists
        localStorage.setItem('semhys_lang', lang);
    }

    // Set dropdown value
    const select = document.getElementById('languageSelect');
    if (select) {
        select.value = lang;
    }

    // Apply
    changeLanguage(lang);
}

function changeLanguage(forcedLang) {
    try {
        const lang = forcedLang || document.getElementById('languageSelect').value;

        // Save preference
        localStorage.setItem('semhys_lang', lang);
        document.documentElement.lang = lang;

        // Apply translations
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (i18n[lang] && i18n[lang][key]) {
                // If it contains HTML tags (like <li>), use innerHTML
                if (key.includes('list')) {
                    el.innerHTML = i18n[lang][key];
                } else {
                    el.innerText = i18n[lang][key];
                }
            }
        });
    } catch (e) {
        console.error("Error switching language:", e);
    }
}

// 3. CHAT WIDGET LOGIC (Centralized)
const chatConfig = {
    aiName: "Ingeniero IA Semhys",
    backendUrl: "http://76.13.116.120:8082"
};

const aiResponses = {
    es: {
        thinking: "Entendido. Estoy analizando su consulta técnica...",
        pump_issue: "Detecto un problema potencial en su sistema de bombeo. ¿Podría especificar si el equipo presenta vibraciones, ruido excesivo o caída de presión?",
        price_query: "Para cotizaciones precisas, necesito conocer el modelo exacto. Sin embargo, puede consultar nuestra sección de 'Tienda' para precios de referencia.",
        default: "Gracias por su consulta. Un ingeniero especialista revisará su caso y le responderá a la brevedad."
    },
    en: {
        thinking: "Understood. I am analyzing your technical query...",
        pump_issue: "I detect a potential issue in your pumping system. Could you specify if the equipment shows vibrations, excessive noise, or pressure drop?",
        price_query: "For precise quotes, I need to know the exact model. However, you can check our 'Store' section for reference prices.",
        default: "Thank you for your query. A specialist engineer will review your case and respond shortly."
    },
    fr: {
        thinking: "Compris. J'analyse votre demande technique...",
        pump_issue: "Je détecte un problème potentiel dans votre système de pompage. Pourriez-vous préciser si l'équipement présente des vibrations, un bruit excessif ou une chute de pression ?",
        price_query: "Pour des devis précis, j'ai besoin de connaître le modèle exact. Cependant, vous pouvez consulter notre section 'Boutique' pour des prix de référence.",
        default: "Merci pour votre demande. Un ingénieur spécialiste examinera votre cas et vous répondra sous peu."
    }
};

// 4. CHAT WIDGET LOGIC
function injectChatWidget() {
    const threadId = crypto.randomUUID(); // Unique session ID

    // Create Widget HTML
    const widget = document.createElement('div');
    widget.id = 'semhys-chat-widget';
    widget.innerHTML = `
        <div id="chat-bubble" onclick="toggleChat()">
            💬
        </div>
        <div id="chat-window" class="hidden">
            <div class="chat-header">
                <span>${chatConfig.aiName}</span>
                <button onclick="toggleChat()">×</button>
            </div>
            <div class="chat-messages" id="chat-messages">
                <div class="message ai">
                    ${aiResponses[document.documentElement.lang || 'es'].chat_welcome_msg}
                </div>
            </div>
            <div class="chat-input">
                <input type="text" id="user-input" placeholder="Escriba su consulta..." onkeypress="handleKeyPress(event)">
                <button onclick="sendMessage()">➤</button>
            </div>
            <div class="chat-footer">
                <a href="contact.html" class="human-link">${aiResponses[document.documentElement.lang || 'es'].chat_human_btn}</a>
            </div>
        </div>
    `;
    document.body.appendChild(widget);

    // Add Styles
    const style = document.createElement('style');
    style.innerHTML = `
        #semhys-chat-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            font-family: var(--font-main);
        }
        #chat-bubble {
            width: 60px;
            height: 60px;
            background: var(--color-primary);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: transform 0.3s;
        }
        #chat-bubble:hover { transform: scale(1.1); }
        #chat-window {
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: absolute;
            bottom: 80px;
            right: 0;
            transition: opacity 0.3s, transform 0.3s;
        }
        #chat-window.hidden {
            opacity: 0;
            pointer-events: none;
            transform: translateY(20px);
        }
        .chat-header {
            background: var(--color-primary);
            color: white;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: bold;
        }
        .chat-header button {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
        }
        .chat-messages {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            background: #f9f9f9;
        }
        .message {
            margin-bottom: 10px;
            padding: 10px 15px;
            border-radius: 15px;
            max-width: 80%;
            font-size: 0.9rem;
            line-height: 1.4;
        }
        .message.ai {
            background: white;
            border: 1px solid #eee;
            align-self: flex-start;
            margin-right: auto;
        }
        .message.user {
            background: var(--color-secondary);
            color: white;
            align-self: flex-end;
            margin-left: auto;
        }
        .chat-input {
            padding: 15px;
            border-top: 1px solid #eee;
            display: flex;
            gap: 10px;
        }
        .chat-input input {
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 20px;
            outline: none;
        }
        .chat-input button {
            background: var(--color-primary);
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
        }
        .chat-footer {
            padding: 10px;
            text-align: center;
            background: #f1f1f1;
            font-size: 0.8rem;
        }
        .human-link {
            color: var(--color-gray-dark);
            text-decoration: underline;
        }
    `;
    document.head.appendChild(style);
}

// Global scope functions for HTML events
window.toggleChat = function () {
    const win = document.getElementById('chat-window');
    win.classList.toggle('hidden');
};

window.handleKeyPress = function (e) {
    if (e.key === 'Enter') sendMessage();
};

window.sendMessage = async function () {
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    if (!msg) return;

    // Add User Message
    addMessage(msg, 'user');
    input.value = '';

    // Show Thinking
    const lang = document.documentElement.lang || 'es';
    const thinkMsgId = addMessage(aiResponses[lang].thinking, 'ai');

    try {
        // CALL BACKEND API
        const response = await fetch(`${chatConfig.backendUrl}/agent2/run`, { // Using Agent 2 (Privacy/RAG) as default chatter
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': 'your-secret-api-key' // TODO: Replace with env var or secure token
            },
            body: JSON.stringify({ topic: msg })
        });

        const data = await response.json();

        // Remove Thinking
        document.getElementById('chat-messages').lastElementChild.remove();

        if (data.error) {
            addMessage("Error: " + data.error, 'ai');
        } else {
            // Display RAG result (simplified)
            addMessage(data.article ? data.article.full_text.substring(0, 500) + "..." : "Respuesta procesada.", 'ai');
        }

    } catch (e) {
        console.error("Chat Error:", e);
        // Remove Thinking
        document.getElementById('chat-messages').lastElementChild.remove();
        addMessage("Error de conexión. Intente más tarde.", 'ai');
    }
};

function addMessage(text, type) {
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.innerText = text;
    document.getElementById('chat-messages').appendChild(div);
    // Scroll to bottom
    const container = document.getElementById('chat-messages');
    container.scrollTop = container.scrollHeight;
    return div;
}

// 5. SCROLL HEADER LOGIC
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// 3. UI LOGIC (Menu)
function toggleMenu() {
    const nav = document.getElementById('mainNav');
    const toggle = document.querySelector('.menu-toggle');
    if (nav && toggle) {
        nav.classList.toggle('active');
        toggle.classList.toggle('active');
    }
}

// 4. BLOG LOGIC (n8n Integration)
async function loadBlogPosts() {
    const loader = document.getElementById('blog-loader');
    const grid = document.getElementById('blog-grid');
    if (!grid) return; // Not on blog page

    try {
        // Replace with your production n8n webhook URL
        const response = await fetch('https://n8n.semhys.com/webhook/blog-posts');

        if (!response.ok) throw new Error('Error loading posts');

        let posts = await response.json();

        // Fix: If n8n returns a single object (dict), wrap it in an array
        if (posts && !Array.isArray(posts)) {
            posts = [posts];
        }

        loader.style.display = 'none';

        if (posts.length === 0) {
            grid.innerHTML = '<p style="text-align:center">No hay artículos disponibles por el momento.</p>';
            return;
        }

        grid.innerHTML = posts.map(post => `
            <article class="article">
                <span class="article-meta">${post.category || 'General'} | ${post.date || ''}</span>
                <h2>${post.title}</h2>
                <p>${post.summary}</p>
                <div class="tech-box">
                    ${post.tech_note || ''}
                </div>
            </article>
        `).join('');

    } catch (error) {
        console.error("Blog Error:", error);
        loader.innerHTML = '<p style="color:red">Error al cargar noticias. Por favor intente más tarde.</p>';
    }
}

// Initialize on Load
window.addEventListener('DOMContentLoaded', () => {
    initLanguage();

    // START: Security Update - Chat Enabled
    injectChatWidget();
    // END: Security Update

    // Load Blog if on blog page
    loadBlogPosts();

    // Re-apply language after injection
    const savedLang = localStorage.getItem('semhys_lang');
    if (savedLang) changeLanguage(savedLang);
});
