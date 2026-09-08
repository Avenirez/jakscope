import docx
from docx.shared import Pt, Inches, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def create_makalah_docx(output_path):
    doc = docx.Document()
    
    # Page setup: A4, Margins: Top 4cm, Left 4cm, Bottom 3cm, Right 3cm
    section = doc.sections[0]
    section.page_width = Cm(21.0)
    section.page_height = Cm(29.7)
    section.top_margin = Cm(4.0)
    section.bottom_margin = Cm(3.0)
    section.left_margin = Cm(4.0)
    section.right_margin = Cm(3.0)
    
    # Base Normal Style
    normal_style = doc.styles['Normal']
    normal_font = normal_style.font
    normal_font.name = 'Times New Roman'
    normal_font.size = Pt(12)
    normal_font.color.rgb = RGBColor(0, 0, 0)
    normal_style.paragraph_format.line_spacing = 1.5
    normal_style.paragraph_format.space_after = Pt(6)
    normal_style.paragraph_format.space_before = Pt(0)
    
    # Helper to add heading
    def add_heading_1(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(12)
        p.paragraph_format.line_spacing = 1.5
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(14)
        run.bold = True
        run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_heading_2(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.5
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        run.bold = True
        run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_heading_3(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.5
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        run.bold = True
        run.italic = True
        run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_body_p(text, bold_prefix="", indent=False):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_after = Pt(6)
        if indent:
            p.paragraph_format.first_line_indent = Cm(1.0)
            
        if bold_prefix:
            r_bold = p.add_run(bold_prefix)
            r_bold.font.name = 'Times New Roman'
            r_bold.font.size = Pt(12)
            r_bold.bold = True
            r_bold.font.color.rgb = RGBColor(0, 0, 0)
            
        r_text = p.add_run(text)
        r_text.font.name = 'Times New Roman'
        r_text.font.size = Pt(12)
        r_text.font.color.rgb = RGBColor(0, 0, 0)
        return p

    # --- COVER / TITLE ---
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_p.paragraph_format.space_before = Pt(24)
    title_p.paragraph_format.space_after = Pt(18)
    title_run = title_p.add_run("MAKALAH TUGAS PROJECT INDIVIDU 2\nMATA KULIAH: IMPACTPRENEURSHIP\n\nPERANCANGAN MODEL BISNIS SOSIAL BERBASIS CIVIC TECH:\n“JAKSCOPE” (PETA DISTRIBUSI & TRANSPARANSI FASILITAS PUBLIK DKI JAKARTA MEMAKAI BUSINESS MODEL CANVAS)")
    title_run.font.name = 'Times New Roman'
    title_run.font.size = Pt(14)
    title_run.bold = True
    
    doc.add_page_break()

    # --- DAFTAR ISI ---
    add_heading_1("DAFTAR ISI")
    daftar_isi = [
        "BAB I: PENDAHULUAN ............................................................................................................ 1",
        "   1.1 Latar Belakang ............................................................................................................. 1",
        "BAB II: LANDASAN TEORI ..................................................................................................... 2",
        "   2.1 Pengertian Intrepreneur & Intrepreneurship ................................................................. 2",
        "   2.2 Pengertian Impactpreneurship & Socialpreneurship ...................................................... 2",
        "   2.3 Pengertian Bisnis Model & Business Model Canvas (BMC) ........................................ 3",
        "BAB III: PEMBAHASAN ........................................................................................................... 4",
        "   3.1 Deskripsi Impactpreneurship/Socialpreneurship 'JakScope' ........................................ 4",
        "   3.2 Latar Belakang / Alasan Memilih Usaha 'JakScope' ..................................................... 4",
        "   3.3 Bidang Usaha Impactpreneurship/Socialpreneurship ..................................................... 5",
        "   3.4 Bentuk Kepemilikan Impactpreneurship/Socialpreneurship .......................................... 5",
        "   3.5 Rencana Business Model Canvas (BMC) JakScope (9 Blok Canva) ............................... 5",
        "BAB IV: PENUTUP .................................................................................................................. 8",
        "   4.1 Kesimpulan .................................................................................................................... 8",
        "   4.2 Saran .............................................................................................................................. 8",
        "DAFTAR PUSTAKA .................................................................................................................... 9"
    ]
    for item in daftar_isi:
        add_body_p(item)

    doc.add_page_break()

    # --- BAB I ---
    add_heading_1("BAB I\nPENDAHULUAN")
    add_heading_2("1.1 Latar Belakang")
    add_body_p(
        "DKI Jakarta sebagai megapolitan dengan jumlah penduduk melebihi 10 juta jiwa menghadapi tantangan kompleks dalam tata kelola perkotaan (urban governance), khususnya terkait dengan pemerataan dan pemeliharaan fasilitas publik (yang mencakup fasilitas sosial seperti kesehatan, pendidikan, dan ruang terbuka hijau, serta layanan keamanan & masyarakat). Fasilitas seperti Pusat Kesehatan Masyarakat (Puskesmas), Ruang Terbuka Hijau (RTH), Pos Polisi/Keamanan, dan Sekolah Dasar hingga Menengah merupakan instrumen vital dalam menjamin kesejahteraan dan kualitas hidup warga kota.",
        indent=True
    )
    add_body_p(
        "Namun, fakta di lapangan menunjukkan adanya disparitas aksesibilitas dan kualitas layanan publik antar-wilayah kelurahan di Jakarta. Di beberapa kelurahan, keberadaan RTH dan fasilitas kesehatan sangat memadai dan terawat, sementara di wilayah kelurahan terpencil atau berpendapatan rendah, warga kesulitan mengakses layanan dasar atau menemukan fasilitas publik yang terbengkalai. Permasalahan ini diperparah oleh keterbatasan saluran partisipasi warga (citizen engagement) yang transparan dan dapat dipantau secara langsung (real-time). Warga seringkali tidak memiliki media terbuka untuk memberikan ulasan (review), penilaian (rating), maupun pelaporan mengenai kondisi riil fasilitas di tingkat lingkungan mereka.",
        indent=True
    )
    add_body_p(
        "Di sisi lain, era digitalisasi memunculkan paradigma baru yang dikenal sebagai Civic Tech (Teknologi Kewargaan), yaitu pemanfaatan perangkat lunak dan data terbuka (open data) untuk memberdayakan warga negara serta meningkatkan efisiensi dan transparansi tata kelola pemerintahan. Fenomena ini melahirkan konsep Impactpreneurship atau Socialpreneurship, di mana inovasi teknologi digabungkan dengan model bisnis yang berkelanjutan guna memecahkan permasalahan sosial perkotaan tanpa berorientasi semata-mata pada profit maksimal.",
        indent=True
    )
    add_body_p(
        "Atas dasar dinamika tersebut, dirancanglah sebuah usaha berorientasi dampak sosial (impactpreneurship) bernama “JakScope”. JakScope hadir sebagai platform web berbasis geospasial (Civic Tech) yang memetakan secara interaktif sebaran fasilitas publik (mencakup fasilitas sosial dan layanan umum) hingga ke tingkat kelurahan di DKI Jakarta. Platform ini menggabungkan data berbasis OpenStreetMap (OSM) dengan sistem rating dan ulasan warga, serta mekanisme pendanaan berbasis donasi QRIS dinamis dan kemitraan analytics data. Untuk memastikan keberlanjutan dampak dan efektivitas strategis operasionalnya, perencanaan usaha JakScope ini dipetakan dan dianalisis secara komprehensif menggunakan kerangka kerja Business Model Canvas (BMC).",
        indent=True
    )

    # --- BAB II ---
    add_heading_1("BAB II\nLANDASAN TEORI")
    add_heading_2("2.1 Pengertian Intrepreneur & Intrepreneurship")
    add_body_p(
        "Secara etimologis dan kontekstual, konsep kewirausahaan telah berkembang pesat dari sekadar pendirian bisnis baru menuju kewirausahaan internal di dalam organisasi. Menurut Pinchot (1985), Intrepreneur (singkatan dari Intra-corporate Entrepreneur) adalah seorang individu dalam organisasi atau perusahaan yang memiliki jiwa kewirausahaan, berani mengambil risiko terkalkulasi, memicu inovasi, dan mengoperasikan ide-ide baru dari dalam struktur yang sudah ada.",
        indent=True
    )
    add_body_p(
        "Sementara itu, Intrepreneurship adalah proses atau sistem yang memungkinkan karyawan atau anggota organisasi mengeksekusi inisiatif inovatif, menguji ide bisnis baru, dan mengalokasikan sumber daya organisasi guna menciptakan nilai tambah baru (value creation) tanpa harus keluar dari entitas tempat mereka bernaung. Intrepreneurship menjadi kunci adaptabilitas organisasi modern dalam menghadapi dinamika pasar dan perubahan kebutuhan sosial.",
        indent=True
    )

    add_heading_2("2.2 Pengertian Impactpreneurship & Socialpreneurship")
    add_body_p(
        "Istilah Socialpreneurship (Kewirausahaan Sosial) dan Impactpreneurship merujuk pada pendekatan kewirausahaan yang menempatkan pemecahan masalah sosial, lingkungan, atau kemasyarakatan sebagai tujuan utama (mission-driven), disamping menjaga keberlanjutan finansial (financial sustainability).",
        indent=True
    )
    add_body_p(
        "Menurut Bornstein (2004) dan Dees (2001), Socialpreneurship adalah proses di mana individu atau kelompok menggunakan prinsip-prinsip bisnis dan kewirausahaan untuk menciptakan perubahan sosial yang signifikan (systemic social change). Wirausahawan sosial (social entrepreneurs) mengidentifikasi masalah sosial yang terabaikan oleh pasar komersial maupun sektor publik, kemudian merancang solusi inovatif yang berdaya guna tinggi.",
        indent=True
    )
    add_body_p(
        "Adapun Impactpreneurship menekankan pada penciptaan dampak positif yang terukur (measurable impact) sesuai dengan prinsip Triple Bottom Line (People, Planet, Profit). Berbeda dengan lembaga amil atau nirlaba murni yang bergantung 100% pada hibah (grants), wirausaha dampak (impact enterprise) menghasilkan pendapatan mandiri (earned income) melalui produk atau layanan berharga yang dijual ke pasar, namun seluruh profitnya direinvestasikan kembali untuk memperluas jangkauan dampak sosial.",
        indent=True
    )

    add_heading_2("2.3 Pengertian Bisnis Model & Business Model Canvas (BMC)")
    add_body_p(
        "Menurut Osterwalder & Pigneur (2010), Bisnis Model (Model Bisnis) menggambarkan rasionalisasi tentang bagaimana sebuah organisasi menciptakan (creates), menyampaikan (delivers), dan menangkap (captures) nilai (value). Model bisnis bukan sekadar rencana keuangan, melainkan sistem hubungan yang saling melengkapi antar elemen usaha.",
        indent=True
    )
    add_body_p(
        "Untuk mempermudah perancangan dan analisis model bisnis, Osterwalder & Pigneur mengembangkan alat visual intuitif yang disebut Business Model Canvas (BMC). BMC membagi arsitektur strategi bisnis ke dalam 9 (sembilan) blok dasar, yaitu:",
        indent=True
    )
    
    bmc_blocks = [
        ("1. Value Propositions: ", "Proposisi nilai atau solusi unik yang ditawarkan kepada pelanggan/penerima manfaat."),
        ("2. Customer Segments: ", "Kelompok target pengguna, pelanggan, atau segmen masyarakat yang dilayani."),
        ("3. Channels: ", "Saluran komunikasi dan distribusi untuk mengontak dan menyampaikan proposisi nilai."),
        ("4. Customer Relationships: ", "Bentuk hubungan dan interaksi yang dibangun dengan setiap segmen pengguna."),
        ("5. Revenue Streams: ", "Arus pendapatan yang diperoleh dari pengiriman proposisi nilai."),
        ("6. Key Resources: ", "Aset utama (fisik, intelektual, manusia, finansial) yang dibutuhkan agar usaha berjalan."),
        ("7. Key Activities: ", "Aktivitas operasional paling krusial yang harus dilakukan untuk menghasilkan value proposition."),
        ("8. Key Partnerships: ", "Jaringan pemasok, mitra strategis, dan aliansi yang mendukung operasional usaha."),
        ("9. Cost Structure: ", "Seluruh struktur biaya yang dikeluarkan untuk mengoperasikan model bisnis.")
    ]
    for b_title, b_desc in bmc_blocks:
        add_body_p(b_desc, bold_prefix=b_title)

    # --- BAB III ---
    add_heading_1("BAB III\nPEMBAHASAN")
    add_heading_2("3.1 Deskripsi Impactpreneurship/Socialpreneurship 'JakScope'")
    add_body_p(
        "JakScope (Peta Distribusi Fasilitas Publik DKI Jakarta) adalah sebuah social enterprise / inisiatif Civic Tech yang dirancang untuk memetakan, memantau, dan mengevaluasi distribusi serta kondisi fasilitas publik (mencakup fasilitas sosial seperti kesehatan, pendidikan, taman/RTH, serta keamanan) di tingkat Kelurahan DKI Jakarta secara interaktif dan transparan.",
        indent=True
    )
    add_body_p(
        "Melalui platform berbasis web yang diakses publik secara gratis, warga Jakarta dapat melihat koordinat spasial fasilitas publik di wilayahnya, memberikan ulasan (review) dan penilaian (rating), serta melihat indeks ketersediaan fasilitas berbasis data OpenStreetMap (OSM). Di samping layanan publik gratis, JakScope menyediakan modul donasi QRIS dinamis untuk partisipasi publik, serta layanan pengolahan data geospasial (urban analytics) bagi sektor swasta, akademisi, dan lembaga pemerintah.",
        indent=True
    )

    add_heading_2("3.2 Latar Belakang / Alasan Memilih Usaha 'JakScope'")
    add_body_p("Pemilihan JakScope sebagai objek usaha impactpreneurship didasari oleh tiga pertimbangan utama:", indent=True)
    add_body_p("Banyak kelurahan padat penduduk di Jakarta kekurangan fasilitas kesehatan dasar atau RTH yang memadai. JakScope membantu menyingkap data ketimpangan ini agar menjadi perhatian publik dan pembuat kebijakan.", bold_prefix="1. Ketimpangan Fasilitas Urban: ")
    add_body_p("Sistem pengaduan publik yang ada seringkali bersifat satu arah. JakScope menghadirkan saluran pengawasan berbasis komunitas (community review) yang independen dan terbuka.", bold_prefix="2. Kebutuhan Partisipasi Warga (Crowdsourced Accountability): ")
    add_body_p("Kemajuan teknologi web modern (Next.js, Supabase, Geospasial OSM) memungkinkan pembangunan platform berbiaya efisien (scalable) yang memiliki daya jangkau luas untuk seluruh warga Jakarta.", bold_prefix="3. Peluang Inovasi Civic Tech: ")

    add_heading_2("3.3 Bidang Usaha Impactpreneurship/Socialpreneurship")
    add_body_p(
        "Bidang usaha JakScope masuk ke dalam kategori Teknologi Informasi Kewargaan (Civic Technology) & Layanan Data Perkotaan (Urban Data Analytics). Usaha ini menggabungkan sektor teknologi lunak (software development), analisis data geospasial, serta pemberdayaan masyarakat sosial-perkotaan.",
        indent=True
    )

    add_heading_2("3.4 Bentuk Kepemilikan Impactpreneurship/Socialpreneurship")
    add_body_p("JakScope mengadopsi Bentuk Kepemilikan Entitas Hybrid (Hybrid Social Enterprise):", indent=True)
    add_body_p("Mengelola platform web publik gratis, menjaga netralitas data, serta mengurus kegiatan pemberdayaan komunitas warga.", bold_prefix="- Sayap Sosial (Yayasan Nirlaba / Inisiatif Komunitas): ")
    add_body_p("Bertindak sebagai unit bisnis yang mengelola kontrak kemitraan analisis data B2B/B2G, riset tata ruang kota untuk pengembang, serta konsultasi data bagi institusi. Profit dari unit komersial disalurkan untuk membiayai operasional dan pengembangan platform publik.", bold_prefix="- Sayap Komersial (Perseroan Terbatas / PT Wirausaha Sosial): ")

    add_heading_2("3.5 Rencana Business Model Canvas (BMC) JakScope")
    add_body_p("Berikut adalah rincian perancangan 9 Blok Business Model Canvas pada usaha sosial JakScope:", indent=True)

    # TABLE FOR BMC
    table = doc.add_table(rows=5, cols=5)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    # Styling BMC Table Grid
    bmc_data = [
        [
            "KEY PARTNERS\n- Komunitas OpenStreetMap (OSM)\n- Pemprov DKI (Bappeda & Diskominfo)\n- Pengurus RT/RW & Komunitas Warga\n- Payment Gateway QRIS Dinamis\n- Institusi Riset / Universitas",
            "KEY ACTIVITIES\n- Caching & Pre-warm Data OSM Geospasial\n- Maintenance Web & API Security (RLS)\n- Ingestion Ulasan & Validasi Moderasi\n- Sosialisasi Civic Tech & Edukasi",
            "VALUE PROPOSITIONS\n1. Warga Publik:\n   Transparansi & Peta Interaktif Fasilitas Publik Kelurahan.\n2. Pemprov / Akademisi:\n   Indeks Ketimpangan & Analytics Data.\n3. Sektor Swasta:\n   Layanan Konsultasi Lokasi Spasial.",
            "CUSTOMER RELATIONSHIPS\n- Community Review & Crowdsourced Rating\n- Transparansi Data Terbuka & Akuntabel\n- Platform Interaktif Real-time (Web Map)",
            "CUSTOMER SEGMENTS\n1. Beneficiaries:\n   Warga DKI Jakarta per Kelurahan.\n2. Clients (B2G):\n   Dinas Pemprov / Bappeda.\n3. Clients (B2B):\n   Peneliti, NGO & Urban Planner."
        ],
        [
            "",
            "KEY RESOURCES\n- Tech Stack (Next.js 15, Supabase PostgreSQL, Leaflet API)\n- Data Geospasial OpenStreetMap (OSM)\n- Tim pengembang Web, Data Analyst, & Moderasi Komunitas",
            "",
            "CHANNELS\n- Platform Web (jakscope.org / Web App)\n- Media Sosial (Instagram, LinkedIn, X)\n- Workshop Komunitas & Forum Warga RT/RW",
            ""
        ],
        [
            "COST STRUCTURE\n- Biaya Server, Infrastructure Hosting, & Database Supabase\n- Biaya Pemeliharaan API & Cache OSM (Pre-warm Script)\n- Operasional Tim Teknis & Komunikasi Komunitas",
            "",
            "",
            "REVENUE STREAMS\n- Donasi QRIS Dinamis (Partisipasi Publik)\n- Layanan API Premium / Urban Data Analytics B2G & B2B\n- Grant / Hibah Kebijakan Publik & Social Impact Fund",
            ""
        ]
    ]

    # Populate basic 9-box style table layout
    # Row 0: KP, KA, VP, CR, CS
    for col_idx in range(5):
        cell = table.rows[0].cells[col_idx]
        cell.text = bmc_data[0][col_idx]
        set_cell_background(cell, "F2F4F7")
        for p in cell.paragraphs:
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_after = Pt(2)
            for r in p.runs:
                r.font.name = 'Times New Roman'
                r.font.size = Pt(9.5)

    # Row 1: Key Resources (span cols 0-2), Channels (span cols 3-4)
    cell_kr = table.rows[1].cells[0]
    cell_kr.text = bmc_data[1][1]
    set_cell_background(cell_kr, "EAECF0")
    for p in cell_kr.paragraphs:
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(2)
        for r in p.runs:
            r.font.name = 'Times New Roman'
            r.font.size = Pt(9.5)

    cell_ch = table.rows[1].cells[3]
    cell_ch.text = bmc_data[1][3]
    set_cell_background(cell_ch, "EAECF0")
    for p in cell_ch.paragraphs:
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(2)
        for r in p.runs:
            r.font.name = 'Times New Roman'
            r.font.size = Pt(9.5)

    # Row 2: Cost Structure (span cols 0-2), Revenue Streams (span cols 3-4)
    cell_cost = table.rows[2].cells[0]
    cell_cost.text = bmc_data[2][0]
    set_cell_background(cell_cost, "E4E7EC")
    for p in cell_cost.paragraphs:
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(2)
        for r in p.runs:
            r.font.name = 'Times New Roman'
            r.font.size = Pt(9.5)

    cell_rev = table.rows[2].cells[3]
    cell_rev.text = bmc_data[2][3]
    set_cell_background(cell_rev, "E4E7EC")
    for p in cell_rev.paragraphs:
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(2)
        for r in p.runs:
            r.font.name = 'Times New Roman'
            r.font.size = Pt(9.5)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # Detailed Explanations
    add_heading_3("Rincian Penjelasan 9 Blok BMC JakScope:")
    
    bmc_details = [
        ("1. Value Propositions (Proposisi Nilai):\n", " Bagi Warga Umum: Akses gratis ke peta interaktif sebaran fasilitas publik (fasilitas sosial seperti kesehatan, pendidikan, RTH, serta layanan keamanan) di tingkat kelurahan beserta sistem ulasan publik transparan.\n Bagi Pembuat Kebijakan (Bappeda/Dinas): Laporan berbasis data aktual mengenai indeks ketimpangan fasilitas publik untuk perbaikan prioritas anggaran pembangunan.\n Bagi Peneliti & Swasta: Akses API data geospasial terintegrasi yang sudah ter-filter dan tervalidasi."),
        ("2. Customer Segments (Segmen Pengguna & Pelanggan):\n", " Penerima Manfaat (Beneficiaries): Warga DKI Jakarta di 267 Kelurahan yang membutuhkan informasi dan saluran pengawasan fasilitas publik.\n Pelanggan Komersial (Clients B2G/B2B): Institusi pemerintah daerah, Lembaga Swadaya Masyarakat (NGO), peneliti tata ruang, serta pengembang properti (urban planner)."),
        ("3. Channels (Saluran Distribusi):\n", " Platform Aplikasi Web Utama (Next.js Web App), kampanye edukasi publik melalui media sosial, serta forum Musrenbang tingkat kelurahan/kecamatan dan workshop komunitas warga."),
        ("4. Customer Relationships (Hubungan Pengguna):\n", " Crowdsourcing & Co-creation: Mendorong warga aktif memberikan ulasan dan rating tempat secara independen. Transparansi & Kepercayaan: Menjamin kebebasan ulasan warga dengan perlindungan sistem keamanan data (Supabase RLS)."),
        ("5. Revenue Streams (Sumber Pendapatan & Keberlanjutan):\n", " Donasi QRIS Dinamis: Fitur donasi sukarela langsung dari platform web untuk mendukung biaya operasional server.\n Kemitraan Data & Analytics (B2G/B2B): Penjualan laporan analitik tata ruang terstruktur dan akses API kustom bagi entitas riset atau bisnis.\n Hibah Impact Fund (Social Grants): Pendanaan dari yayasan donor internasional/nasional yang berfokus pada transparansi publik dan civic tech."),
        ("6. Key Activities (Aktivitas Utama):\n", " Pemeliharaan platform web dan otomatisasi caching data OSM (Pre-warming OSM Cache), moderasi ulasan warga, pengolahan data geospasial, serta kegiatan sosialisasi dan riset lapangan bersama komunitas lokal."),
        ("7. Key Resources (Sumber Daya Kunci):\n", " Infrastruktur Teknologi: Framework Next.js, Database Supabase PostgreSQL, Leaflet Engine.\n Asset Data: Basis data geospasial OpenStreetMap terintegrasi.\n Sumber Daya Manusia: Pengembang web, analis data spasial, dan manajer komunitas sosial."),
        ("8. Key Partnerships (Mitra Kunci):\n", " Komunitas OpenStreetMap Indonesia, Pemerintah Provinsi DKI Jakarta, Penyedia Payment Gateway (QRIS dinamis), serta Pengurus RT/RW & Komunitas Warga."),
        ("9. Cost Structure (Struktur Biaya):\n", " Biaya sewa server hosting, database cloud, domain web, biaya pemeliharaan API & cache OSM, serta operasional tim teknis dan kegiatan komunitas.")
    ]

    for d_title, d_text in bmc_details:
        add_body_p(d_text, bold_prefix=d_title, indent=True)

    # --- BAB IV ---
    add_heading_1("BAB IV\nPENUTUP")
    add_heading_2("4.1 Kesimpulan")
    add_body_p("Berdasarkan pembahasan di atas, dapat disimpulkan bahwa:", indent=True)
    add_body_p("JakScope merupakan wujud inovasi Impactpreneurship / Socialpreneurship berbasis Civic Tech yang dirancang untuk mengatasi permasalahan ketimpangan dan kurangnya transparansi fasilitas publik di tingkat kelurahan DKI Jakarta.", bold_prefix="1. ")
    add_body_p("Penerapan Business Model Canvas (BMC) terbukti efektif dalam memetakan elemen strategis JakScope. JakScope tidak hanya berfokus pada penciptaan dampak sosial (social impact) melalui peta interaktif dan partisipasi ulasan warga, namun juga memiliki strategi keberlanjutan finansial (financial sustainability) melalui donasi QRIS dinamis, hibah dampak sosial, serta kemitraan analitik data B2B/B2G.", bold_prefix="2. ")
    add_body_p("Bentuk kepemilikan entitas hybrid memberikan fleksibilitas bagi JakScope untuk menjaga integritas netralitas data publik sekaligus menjalankan aktivitas bisnis yang menghasilkan pendapatan mandiri.", bold_prefix="3. ")

    add_heading_2("4.2 Saran")
    add_body_p("Memperluas cakupan pemetaan fasilitas publik tidak hanya di DKI Jakarta, melainkan hingga wilayah penyangga BODETABEK (Bogor, Depok, Tangerang, Bekasi).", bold_prefix="1. Pengembangan Fitur: ", indent=True)
    add_body_p("Memperkuat integrasi sistem JakScope dengan kanal pengaduan resmi pemerintah daerah agar ulasan warga dapat langsung ditindaklanjuti oleh dinas terkait.", bold_prefix="2. Kemitraan Pemerintah: ", indent=True)

    # --- DAFTAR PUSTAKA ---
    doc.add_page_break()
    add_heading_1("DAFTAR PUSTAKA")
    
    pustaka = [
        "Bornstein, D. (2004). How to Change the World: Social Entrepreneurs and the Power of New Ideas. Oxford University Press.",
        "Dees, J. G. (2001). The Meaning of Social Entrepreneurship. Stanford University Graduate School of Business.",
        "Osterwalder, A., & Pigneur, Y. (2010). Business Model Generation: A Handbook for Visionaries, Game Changers, and Challengers. John Wiley & Sons.",
        "Pinchot, G. (1985). Intrapreneuring: Why You Don't Have to Leave the Corporation to Become an Entrepreneur. Harper & Row.",
        "Yunus, M. (2010). Building Social Business: The New Kind of Capitalism that Serves Humanity's Most Pressing Needs. PublicAffairs."
    ]
    for p_item in pustaka:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.left_indent = Cm(1.0)
        p.paragraph_format.first_line_indent = Cm(-1.0) # Hanging indent
        run = p.add_run(p_item)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)

    doc.save(output_path)
    print(f"File berhasil dibuat di: {output_path}")

if __name__ == '__main__':
    import sys
    out = sys.argv[1] if len(sys.argv) > 1 else "Makalah_Impactpreneurship_JakScope.docx"
    create_makalah_docx(out)
