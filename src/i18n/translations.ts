// ElectroVerse i18n — © 2026 Abiyyu Rafa Ramadhan

export type Lang = 'en' | 'id';

export const T = {
  en: {
    // Nav
    nav_home:        'Home',
    nav_theory:      'Theory',
    nav_components:  'Components',
    nav_lab:         'Laboratory',
    online:          'ONLINE',
    tagline:         'An immersive, interactive learning environment for electronics.',
    enter:           'ENTER',
    system_online:   'SYSTEM ONLINE',

    // Home cards
    theory_desc:     "Charge, Voltage, Current, Ohm's Law",
    components_desc: 'Resistors, Capacitors, Diodes, MOSFETs & more',
    lab_desc:        'Ohmic Lab, Stress Test, V=IR',

    // Theory
    theory_badge:    '📐 Fundamentals · Module 01',
    theory_title:    'Theory',
    theory_sub:      'From fundamental charge to circuit analysis — explore the physical laws that govern all electronics.',
    live_flow:       'Live Current Flow',
    core_concepts:   'Core Concepts',
    quick_ref:       'Quick Reference',

    // Components page
    comp_badge:      '🔧 Component Atlas · Module 02',
    comp_title:      'Component Atlas',
    comp_sub:        'Interact with every component. Visualize physics in real time.',
    tab_all:         'All',
    tab_passive:     'Passive',
    tab_active:      'Active',
    tab_semi:        'Semiconductor',
    tab_signal:      'Signal',
    tab_protection:  'Protection',
    discovery_tl:    'Discovery Timeline',
    history_title:   '📜 History',
    features_title:  '🎓 Learning Features',
    how_to_use:      'How to use this module:',
    collapse:        '▲ Collapse',
    expand:          '▼ Expand',

    // Lab
    lab_badge:       '🔬 Interactive Laboratory · Module 03',
    lab_title:       'Ohmic Laboratory',
    lab_sub:         'Real-time V=IR simulation with stress-test burnout mode.',
    voltage_label:   'Voltage (V)',
    current_label:   'Current (A)',
    resistance_label:'Resistance (Ω)',
    power_label:     'Power (W)',
    stress_mode:     'Stress Test Mode',
    stress_off:      'Normal Mode',
    reset_comp:      'Reset Component',
    burnout_warn:    '⚠ Component Burnout!',
    burnout_msg:     'Power limit exceeded. Component destroyed.',
    watt_rating:     'Power Rating',
    component_ok:    'Component OK',
    component_burnt: 'BURNT',
    results_panel:   'Live Results',
    ohm_law:         "Ohm's Law: V = I × R",
    power_law:       'Power Law: P = V × I',

    // Ghost Protocol
    ghost_title:     'GHOST PROTOCOL',
    ghost_sub:       'Classified Access — Identity Vault',
    ghost_name:      'Abiyyu Rafa Ramadhan',
    ghost_role:      'Tech Visionary & Digital Architect',
    ghost_bio:       'A 2026 graduate of SMK Negeri 1 Purwakarta, majoring in Industrial Electronics Engineering. Passionate about the intersection of technology and human experience — building digital systems that educate, inspire, and endure.',
    ghost_exit:      '← EXIT VAULT',
    ghost_edu:       'Education',
    ghost_edu_val:   'SMK Negeri 1 Purwakarta · Industrial Electronics Engineering · Class of 2026',
    ghost_cert:      'Certifications',
    ghost_cert1:     'LSP — Industrial Electronics Engineering (2026)',
    ghost_cert2:     'Google Project Management — Coursera',
    ghost_vision:    '"Engineering the future of knowledge — one interface at a time."',
    ghost_skills:    'Core Competencies',

    // Footer
    footer_copy:     'Engineering the Future of Knowledge.',

    // Shared UI
    voltage:   'Voltage',
    current:   'Current',
    resistance:'Resistance',
    power:     'Power',
    expand_details: 'Expand details',
    close:     'Close',
  },

  id: {
    // Nav
    nav_home:        'Beranda',
    nav_theory:      'Teori',
    nav_components:  'Komponen',
    nav_lab:         'Laboratorium',
    online:          'AKTIF',
    tagline:         'Lingkungan belajar elektronika yang interaktif dan imersif.',
    enter:           'MASUK',
    system_online:   'SISTEM AKTIF',

    // Home cards
    theory_desc:     'Muatan, Tegangan, Arus, Hukum Ohm',
    components_desc: 'Resistor, Kapasitor, Dioda, MOSFET & lainnya',
    lab_desc:        'Lab Ohm, Uji Stres, V=IR',

    // Theory
    theory_badge:    '📐 Dasar-Dasar · Modul 01',
    theory_title:    'Teori',
    theory_sub:      'Dari muatan dasar hingga analisis rangkaian — jelajahi hukum fisika yang mengatur seluruh elektronika.',
    live_flow:       'Aliran Arus Langsung',
    core_concepts:   'Konsep Inti',
    quick_ref:       'Referensi Cepat',

    // Components page
    comp_badge:      '🔧 Atlas Komponen · Modul 02',
    comp_title:      'Atlas Komponen',
    comp_sub:        'Berinteraksi dengan setiap komponen. Visualisasikan fisika secara real-time.',
    tab_all:         'Semua',
    tab_passive:     'Pasif',
    tab_active:      'Aktif',
    tab_semi:        'Semikonduktor',
    tab_signal:      'Sinyal',
    tab_protection:  'Proteksi',
    discovery_tl:    'Garis Waktu Penemuan',
    history_title:   '📜 Sejarah',
    features_title:  '🎓 Fitur Belajar',
    how_to_use:      'Cara menggunakan modul ini:',
    collapse:        '▲ Tutup',
    expand:          '▼ Perluas',

    // Lab
    lab_badge:       '🔬 Laboratorium Interaktif · Modul 03',
    lab_title:       'Laboratorium Ohm',
    lab_sub:         'Simulasi V=IR real-time dengan mode uji stres komponen.',
    voltage_label:   'Tegangan (V)',
    current_label:   'Arus (A)',
    resistance_label:'Hambatan (Ω)',
    power_label:     'Daya (W)',
    stress_mode:     'Mode Uji Stres',
    stress_off:      'Mode Normal',
    reset_comp:      'Reset Komponen',
    burnout_warn:    '⚠ Komponen Hangus!',
    burnout_msg:     'Batas daya terlampaui. Komponen rusak.',
    watt_rating:     'Rating Daya',
    component_ok:    'Komponen OK',
    component_burnt: 'HANGUS',
    results_panel:   'Hasil Langsung',
    ohm_law:         'Hukum Ohm: V = I × R',
    power_law:       'Hukum Daya: P = V × I',

    // Ghost Protocol
    ghost_title:     'PROTOKOL BAYANGAN',
    ghost_sub:       'Akses Terklasifikasi — Brankas Identitas',
    ghost_name:      'Abiyyu Rafa Ramadhan',
    ghost_role:      'Visioner Teknologi & Arsitek Digital',
    ghost_bio:       'Lulusan 2026 dari SMK Negeri 1 Purwakarta, jurusan Teknik Elektronika Industri. Bersemangat pada perpaduan teknologi dan pengalaman manusia — membangun sistem digital yang mendidik, menginspirasi, dan bertahan lama.',
    ghost_exit:      '← KELUAR BRANKAS',
    ghost_edu:       'Pendidikan',
    ghost_edu_val:   'SMK Negeri 1 Purwakarta · Teknik Elektronika Industri · Angkatan 2026',
    ghost_cert:      'Sertifikasi',
    ghost_cert1:     'LSP — Teknik Elektronika Industri (2026)',
    ghost_cert2:     'Google Project Management — Coursera',
    ghost_vision:    '"Merekayasa masa depan ilmu pengetahuan — satu antarmuka pada satu waktu."',
    ghost_skills:    'Kompetensi Utama',

    // Footer
    footer_copy:     'Merekayasa Masa Depan Pengetahuan.',

    // Shared
    voltage:   'Tegangan',
    current:   'Arus',
    resistance:'Hambatan',
    power:     'Daya',
    expand_details: 'Perluas detail',
    close:     'Tutup',
  },
} as const;

export type TKeys = keyof typeof T.en;
