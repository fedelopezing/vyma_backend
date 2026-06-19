import { MemberStatus, FeeType } from '../../members/entities/member.entity';
import { Company } from '../../companies/entities/company.entity';

export interface MemberSeedItem {
  company: Company;
  companyName: string;
  email: string;
  feeType: FeeType;
  taxId: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  category: string;
  representativeName: string;
  representativeEmail: string;
  representativePhone: string;
  socialLinks: Record<string, string>;
  marketingContact: { name: string; email: string; phone?: string };
  logoUrl: string;
  isFeatured: boolean;
  status: MemberStatus;
}

export const buildMembersSeedData = (
  companiesMap: Record<string, Company>,
): MemberSeedItem[] => {
  const ccps = companiesMap['CCPS'];
  const biolimpieza = companiesMap['biolimpieza'];
  const natynails = companiesMap['natynails'];

  return [
    // --- CCPS Members ---
    {
      company: ccps,
      companyName: 'Swiss Tech Solutions S.A.',
      email: 'contact@swisstech.com.py',
      feeType: FeeType.ANNUAL,
      taxId: '80000001-1',
      address: 'Aviadores del Chaco 2050',
      city: 'Asunción',
      country: 'Paraguay',
      phone: '+59521600100',
      category: 'Tecnología',
      representativeName: 'Hans Müller',
      representativeEmail: 'h.mueller@swisstech.com.py',
      representativePhone: '+595981100200',
      socialLinks: {
        website: 'https://swisstech.com.py',
        linkedin: 'https://linkedin.com/company/swisstech-sa',
      },
      marketingContact: {
        name: 'Karin Keller',
        email: 'marketing@swisstech.com.py',
        phone: '+595981100201',
      },
      logoUrl:
        'https://res.cloudinary.com/demo/image/upload/v1621234567/sample.jpg',
      isFeatured: true,
      status: MemberStatus.APPROVED,
    },
    {
      company: ccps,
      companyName: 'Alpine Logistics SRL',
      email: 'info@alpinelogistics.com.py',
      feeType: FeeType.ANNUAL,
      taxId: '80000002-2',
      address: 'Ruta Transchaco Km 12',
      city: 'Mariano Roque Alonso',
      country: 'Paraguay',
      phone: '+59521750250',
      category: 'Logística',
      representativeName: 'Beat Keller',
      representativeEmail: 'b.keller@alpinelogistics.com.py',
      representativePhone: '+595982200300',
      socialLinks: {
        website: 'https://alpinelogistics.com.py',
      },
      marketingContact: {
        name: 'Carlos Benitez',
        email: 'logistica@alpinelogistics.com.py',
      },
      logoUrl:
        'https://res.cloudinary.com/demo/image/upload/v1621234568/sample.jpg',
      isFeatured: true,
      status: MemberStatus.APPROVED,
    },
    {
      company: ccps,
      companyName: 'Zurich Seguros Paraguay',
      email: 'consultas@zurich.com.py',
      feeType: FeeType.ANNUAL,
      taxId: '80000003-3',
      address: 'Santa Teresa 1827',
      city: 'Asunción',
      country: 'Paraguay',
      phone: '+595216183000',
      category: 'Seguros',
      representativeName: 'Sandra Egger',
      representativeEmail: 'sandra.egger@zurich.com.py',
      representativePhone: '+595983300400',
      socialLinks: {
        website: 'https://zurich.com.py',
        linkedin: 'https://linkedin.com/company/zurich-seguros-py',
      },
      marketingContact: {
        name: 'Marta Ortiz',
        email: 'marta.ortiz@zurich.com.py',
        phone: '+595983300401',
      },
      logoUrl:
        'https://res.cloudinary.com/demo/image/upload/v1621234569/sample.jpg',
      isFeatured: false,
      status: MemberStatus.APPROVED,
    },
    {
      company: ccps,
      companyName: 'Bern Chocolates Finos',
      email: 'ventas@bernchocolates.com.py',
      feeType: FeeType.SEMIANNUAL,
      taxId: '80000004-4',
      address: 'Mariscal López 3450',
      city: 'Asunción',
      country: 'Paraguay',
      phone: '+59521660990',
      category: 'Alimentos y Bebidas',
      representativeName: 'Ursula Widmer',
      representativeEmail: 'u.widmer@bernchocolates.com.py',
      representativePhone: '+595984400500',
      socialLinks: {
        website: 'https://bernchocolates.com.py',
        instagram: 'https://instagram.com/bernchocolates',
      },
      marketingContact: {
        name: 'Lucas Ferreira',
        email: 'ventas@bernchocolates.com.py',
      },
      logoUrl:
        'https://res.cloudinary.com/demo/image/upload/v1621234570/sample.jpg',
      isFeatured: false,
      status: MemberStatus.APPROVED,
    },
    {
      company: ccps,
      companyName: 'Geneva Wealth Management',
      email: 'info@geneva-wm.com.py',
      feeType: FeeType.ANNUAL,
      taxId: '80000005-5',
      address: 'Paseo La Galería, Torre 1',
      city: 'Asunción',
      country: 'Paraguay',
      phone: '+59521658800',
      category: 'Finanzas',
      representativeName: 'Pierre Dubois',
      representativeEmail: 'p.dubois@geneva-wm.com.py',
      representativePhone: '+595985500600',
      socialLinks: {
        website: 'https://geneva-wm.com.py',
      },
      marketingContact: {
        name: 'Sophie Martin',
        email: 's.martin@geneva-wm.com.py',
      },
      logoUrl:
        'https://res.cloudinary.com/demo/image/upload/v1621234571/sample.jpg',
      isFeatured: false,
      status: MemberStatus.PENDING,
    },
    {
      company: ccps,
      companyName: 'Basel Biotech Paraguay',
      email: 'lab@baselbiotech.com.py',
      feeType: FeeType.ANNUAL,
      taxId: '80000006-6',
      address: 'Avda. Venezuela 980',
      city: 'Asunción',
      country: 'Paraguay',
      phone: '+59521290290',
      category: 'Salud y Biotecnología',
      representativeName: 'Dr. Arthur Fischer',
      representativeEmail: 'a.fischer@baselbiotech.com.py',
      representativePhone: '+595986600700',
      socialLinks: {
        website: 'https://baselbiotech.com.py',
      },
      marketingContact: {
        name: 'Gabriela Duarte',
        email: 'gduarte@baselbiotech.com.py',
        phone: '+595986600701',
      },
      logoUrl:
        'https://res.cloudinary.com/demo/image/upload/v1621234572/sample.jpg',
      isFeatured: false,
      status: MemberStatus.PENDING,
    },
    {
      company: ccps,
      companyName: 'Lucerne Agro SA',
      email: 'admin@lucerneagro.com.py',
      feeType: FeeType.ANNUAL,
      taxId: '80000007-7',
      address: 'Ruta 6, Km 45',
      city: 'Obligado',
      country: 'Paraguay',
      phone: '+59571720100',
      category: 'Agricultura',
      representativeName: 'Walter Giger',
      representativeEmail: 'w.giger@lucerneagro.com.py',
      representativePhone: '+595987700800',
      socialLinks: {
        website: 'https://lucerneagro.com.py',
      },
      marketingContact: {
        name: 'Roberto Rojas',
        email: 'rrojas@lucerneagro.com.py',
      },
      logoUrl:
        'https://res.cloudinary.com/demo/image/upload/v1621234573/sample.jpg',
      isFeatured: false,
      status: MemberStatus.REJECTED,
    },
    {
      company: ccps,
      companyName: 'Swiss Consult Group',
      email: 'contacto@swissconsult.com.py',
      feeType: FeeType.SEMIANNUAL,
      taxId: '80000008-8',
      address: 'España 1420',
      city: 'Asunción',
      country: 'Paraguay',
      phone: '+59521200300',
      category: 'Consultoría',
      representativeName: 'Marc Lehmann',
      representativeEmail: 'm.lehmann@swissconsult.com.py',
      representativePhone: '+595988800900',
      socialLinks: {
        website: 'https://swissconsult.com.py',
        linkedin: 'https://linkedin.com/company/swissconsult-py',
      },
      marketingContact: {
        name: 'Laura Gimenez',
        email: 'lgimenez@swissconsult.com.py',
      },
      logoUrl:
        'https://res.cloudinary.com/demo/image/upload/v1621234574/sample.jpg',
      isFeatured: false,
      status: MemberStatus.INACTIVE,
    },

    // --- Biolimpieza Members ---
    {
      company: biolimpieza,
      companyName: 'BioSafe Cleaning',
      email: 'ventas@biosafe.com.py',
      feeType: FeeType.ANNUAL,
      taxId: '80054321-1',
      address: 'Avda. Eusebio Ayala 2450',
      city: 'Asunción',
      country: 'Paraguay',
      phone: '+59521555111',
      category: 'Servicios de Limpieza',
      representativeName: 'Gustavo Maidana',
      representativeEmail: 'gmaidana@biosafe.com.py',
      representativePhone: '+595971111222',
      socialLinks: {
        website: 'https://biosafe.com.py',
        facebook: 'https://facebook.com/biosafepy',
      },
      marketingContact: {
        name: 'Andrea Cáceres',
        email: 'marketing@biosafe.com.py',
      },
      logoUrl:
        'https://res.cloudinary.com/demo/image/upload/v1621234575/sample.jpg',
      isFeatured: true,
      status: MemberStatus.APPROVED,
    },
    {
      company: biolimpieza,
      companyName: 'EcoWash Solutions',
      email: 'ecowash@mail.com',
      feeType: FeeType.SEMIANNUAL,
      taxId: '80054321-2',
      address: 'Madame Lynch 1025',
      city: 'Asunción',
      country: 'Paraguay',
      phone: '+59521670980',
      category: 'Servicios de Limpieza',
      representativeName: 'Esteban Valenzuela',
      representativeEmail: 'evalenzuela@ecowash.com.py',
      representativePhone: '+595972222333',
      socialLinks: {
        website: 'https://ecowash.com.py',
      },
      marketingContact: {
        name: 'Patricia Benitez',
        email: 'pbenitez@ecowash.com.py',
      },
      logoUrl:
        'https://res.cloudinary.com/demo/image/upload/v1621234576/sample.jpg',
      isFeatured: false,
      status: MemberStatus.APPROVED,
    },
    {
      company: biolimpieza,
      companyName: 'Green Dust Co.',
      email: 'greendust@mail.com',
      feeType: FeeType.ANNUAL,
      taxId: '80054321-3',
      address: 'Ruta 1 Km 15',
      city: 'San Lorenzo',
      country: 'Paraguay',
      phone: '+59521585200',
      category: 'Gestión de Residuos',
      representativeName: 'Alejandro Domínguez',
      representativeEmail: 'adominguez@greendust.com.py',
      representativePhone: '+595973333444',
      socialLinks: {},
      marketingContact: {
        name: 'Julia Peralta',
        email: 'jperalta@greendust.com.py',
      },
      logoUrl:
        'https://res.cloudinary.com/demo/image/upload/v1621234577/sample.jpg',
      isFeatured: false,
      status: MemberStatus.PENDING,
    },
    {
      company: biolimpieza,
      companyName: 'PureAir Systems',
      email: 'pureair@mail.com',
      feeType: FeeType.ANNUAL,
      taxId: '80054321-4',
      address: 'Boggiani 5540',
      city: 'Asunción',
      country: 'Paraguay',
      phone: '+59521600800',
      category: 'Climatización y Ventilación',
      representativeName: 'Federico Acosta',
      representativeEmail: 'facosta@pureair.com.py',
      representativePhone: '+595974444555',
      socialLinks: {},
      marketingContact: {
        name: 'Juan Torres',
        email: 'jtorres@pureair.com.py',
      },
      logoUrl:
        'https://res.cloudinary.com/demo/image/upload/v1621234578/sample.jpg',
      isFeatured: false,
      status: MemberStatus.REJECTED,
    },
    {
      company: biolimpieza,
      companyName: 'CleanSpace Inc.',
      email: 'cleanspace@mail.com',
      feeType: FeeType.SEMIANNUAL,
      taxId: '80054321-5',
      address: 'Artigas 3010',
      city: 'Asunción',
      country: 'Paraguay',
      phone: '+59521288900',
      category: 'Gestión de Instalaciones',
      representativeName: 'Milena Ruiz',
      representativeEmail: 'mruiz@cleanspace.com.py',
      representativePhone: '+595975555666',
      socialLinks: {
        website: 'https://cleanspace.com.py',
      },
      marketingContact: {
        name: 'Carlos Ruiz',
        email: 'cruiz@cleanspace.com.py',
      },
      logoUrl:
        'https://res.cloudinary.com/demo/image/upload/v1621234579/sample.jpg',
      isFeatured: false,
      status: MemberStatus.INACTIVE,
    },

    // --- NatyNails Members ---
    {
      company: natynails,
      companyName: 'Glamour Nails & Spa',
      email: 'glamour@mail.com',
      feeType: FeeType.SEMIANNUAL,
      taxId: '1234567-1',
      address: 'Senador Long 430',
      city: 'Asunción',
      country: 'Paraguay',
      phone: '+59521608400',
      category: 'Estética y Bienestar',
      representativeName: 'Natalia Benitez',
      representativeEmail: 'nbenitez@glamournails.com.py',
      representativePhone: '+595991111222',
      socialLinks: {
        instagram: 'https://instagram.com/glamournailsspa',
      },
      marketingContact: {
        name: 'Natalia Benitez',
        email: 'nbenitez@glamournails.com.py',
      },
      logoUrl:
        'https://res.cloudinary.com/demo/image/upload/v1621234580/sample.jpg',
      isFeatured: false,
      status: MemberStatus.APPROVED,
    },
    {
      company: natynails,
      companyName: 'ColorMe Bright',
      email: 'colorme@mail.com',
      feeType: FeeType.SEMIANNUAL,
      taxId: '1234567-2',
      address: 'Avda. Molas López 1420',
      city: 'Asunción',
      country: 'Paraguay',
      phone: '+59521622340',
      category: 'Cosméticos',
      representativeName: 'Verónica Alvarenga',
      representativeEmail: 'valvarenga@colorme.com.py',
      representativePhone: '+595992222333',
      socialLinks: {
        website: 'https://colorme.com.py',
      },
      marketingContact: {
        name: 'Verónica Alvarenga',
        email: 'valvarenga@colorme.com.py',
      },
      logoUrl:
        'https://res.cloudinary.com/demo/image/upload/v1621234581/sample.jpg',
      isFeatured: false,
      status: MemberStatus.PENDING,
    },
    {
      company: natynails,
      companyName: 'Nails & Beyond',
      email: 'beyond@mail.com',
      feeType: FeeType.ANNUAL,
      taxId: '1234567-3',
      address: 'Villa Morra, Malutín 250',
      city: 'Asunción',
      country: 'Paraguay',
      phone: '+59521660120',
      category: 'Estética y Bienestar',
      representativeName: 'Carla Ortiz',
      representativeEmail: 'cortiz@nailsbeyond.com.py',
      representativePhone: '+595993333444',
      socialLinks: {
        instagram: 'https://instagram.com/nailsbeyond',
      },
      marketingContact: {
        name: 'Gabriela Cardozo',
        email: 'gcardozo@nailsbeyond.com.py',
      },
      logoUrl:
        'https://res.cloudinary.com/demo/image/upload/v1621234582/sample.jpg',
      isFeatured: false,
      status: MemberStatus.REJECTED,
    },
    {
      company: natynails,
      companyName: 'Polish & Shine',
      email: 'polish@mail.com',
      feeType: FeeType.SEMIANNUAL,
      taxId: '1234567-4',
      address: 'Lillo 2045',
      city: 'Asunción',
      country: 'Paraguay',
      phone: '+59521600770',
      category: 'Cosméticos',
      representativeName: 'Diana Giménez',
      representativeEmail: 'dgimenez@polishshine.com.py',
      representativePhone: '+595994444555',
      socialLinks: {},
      marketingContact: {
        name: 'Diana Giménez',
        email: 'dgimenez@polishshine.com.py',
      },
      logoUrl:
        'https://res.cloudinary.com/demo/image/upload/v1621234583/sample.jpg',
      isFeatured: false,
      status: MemberStatus.INACTIVE,
    },
  ];
};
