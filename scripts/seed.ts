/**
 * Database seed script
 * Run: npx tsx scripts/seed.ts
 */
import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/internvault';

async function seed() {
  console.log(MONGODB_URI)
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const db = mongoose.connection.db!;

  // Clear existing data
  const collections = ['users', 'categories', 'mentors', 'internships', 'testimonials', 'faqs', 'themes'];
  for (const coll of collections) {
    await db.collection(coll).deleteMany({});
  }

  // Seed categories
  const cats = await db.collection('categories').insertMany([
    { name: 'Web Development', slug: 'web-development', icon: '💻', color: '#6366f1', isActive: true },
    { name: 'Data Science', slug: 'data-science', icon: '📊', color: '#06b6d4', isActive: true },
    { name: 'UI/UX Design', slug: 'ui-ux-design', icon: '🎨', color: '#8b5cf6', isActive: true },
    { name: 'Mobile Development', slug: 'mobile-development', icon: '📱', color: '#10b981', isActive: true },
    { name: 'Cloud & DevOps', slug: 'cloud-devops', icon: '☁️', color: '#f97316', isActive: true },
    { name: 'Product Management', slug: 'product-management', icon: '📋', color: '#ef4444', isActive: true },
  ]);

  // Seed admin user
  const bcrypt = require('bcryptjs');
  const hashedPw = await bcrypt.hash('Admin@123', 12);
  const users = await db.collection('users').insertMany([
    {
      name: 'Super Admin',
      email: 'admin@internvault.com',
      password: hashedPw,
      role: 'super_admin',
      isActive: true,
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Operations Admin',
      email: 'admin.ops@internvault.com',
      password: hashedPw,
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Rahul Mentor',
      email: 'mentor@internvault.com',
      password: hashedPw,
      role: 'mentor',
      isActive: true,
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Priya Student',
      email: 'student@internvault.com',
      password: hashedPw,
      role: 'student',
      isActive: true,
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const mentorUserId = users.insertedIds[2];

  // Seed mentor profile
  const mentors = await db.collection('mentors').insertMany([
    {
      userId: mentorUserId,
      title: 'Senior Full-Stack Engineer',
      specialization: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
      experience: 8,
      bio: 'Former engineer at Google & Flipkart. Passionate about building scalable applications and mentoring the next generation of developers.',
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      rating: 4.9,
      reviewCount: 127,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const mentorId = mentors.insertedIds[0];
  const categoryIds = Object.values(cats.insertedIds);

  // Seed internships
  await db.collection('internships').insertMany([
    {
      title: 'Full-Stack Web Development Bootcamp',
      slug: 'full-stack-web-development-bootcamp',
      shortDescription: 'Master MERN stack with real-world projects and get mentored by ex-Google engineers.',
      description: 'A comprehensive 12-week virtual internship covering React, Node.js, MongoDB, and TypeScript. Build 3 production-grade projects and get interview-ready.',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      mentorId,
      categoryId: categoryIds[0],
      duration: 12,
      price: 9999,
      discountPrice: 6999,
      currency: 'INR',
      status: 'published',
      isFeatured: true,
      enrollmentCount: 1247,
      rating: 4.8,
      reviewCount: 342,
      certificate: true,
      skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'REST APIs', 'Authentication'],
      requirements: ['Basic HTML/CSS knowledge', 'Understanding of JavaScript fundamentals'],
      outcomes: ['Build full-stack apps', 'Deploy to cloud', 'Write clean code', 'Work in teams'],
      curriculum: [
        { week: 1, title: 'Frontend Foundations', description: 'React basics, hooks, and state management.', topics: ['JSX', 'Components', 'Props', 'Hooks', 'Context API'] },
        { week: 2, title: 'Advanced React', description: 'Performance optimization and advanced patterns.', topics: ['Memo', 'useMemo', 'useCallback', 'Custom Hooks'] },
        { week: 3, title: 'Backend with Node.js', description: 'Build REST APIs with Express and MongoDB.', topics: ['Express.js', 'MongoDB', 'Mongoose', 'JWT Auth'] },
        { week: 4, title: 'TypeScript Deep Dive', description: 'Add type safety to your full-stack app.', topics: ['Types', 'Interfaces', 'Generics', 'Decorators'] },
      ],
      faqs: [
        { question: 'Is this for beginners?', answer: 'Basic JS knowledge required. We cover everything else.' },
        { question: 'What projects will I build?', answer: 'A job board, e-commerce app, and a social platform.' },
      ],
      tags: ['react', 'nodejs', 'mongodb', 'fullstack', 'javascript'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: 'Data Science & Machine Learning',
      slug: 'data-science-machine-learning',
      shortDescription: 'From Python basics to deploying ML models. Get hands-on with real datasets.',
      description: 'Learn data science end-to-end: data cleaning, visualization, machine learning, and deployment. Work on Kaggle competitions and real industry datasets.',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      mentorId,
      categoryId: categoryIds[1],
      duration: 16,
      price: 12999,
      discountPrice: 8999,
      currency: 'INR',
      status: 'published',
      isFeatured: true,
      enrollmentCount: 892,
      rating: 4.9,
      reviewCount: 201,
      certificate: true,
      skills: ['Python', 'Pandas', 'Scikit-learn', 'TensorFlow', 'SQL', 'Data Visualization'],
      requirements: ['Basic Python knowledge', 'High school math'],
      outcomes: ['Build ML models', 'Analyze datasets', 'Create dashboards', 'Deploy models'],
      curriculum: [
        { week: 1, title: 'Python for Data Science', description: 'NumPy, Pandas, and data manipulation.', topics: ['NumPy', 'Pandas', 'Data Cleaning'] },
        { week: 2, title: 'Data Visualization', description: 'Matplotlib, Seaborn, and Plotly.', topics: ['Charts', 'Plots', 'Dashboards'] },
      ],
      faqs: [
        { question: 'Do I need math skills?', answer: 'High school math is sufficient. We explain all concepts.' },
      ],
      tags: ['python', 'machine-learning', 'data-science', 'ai', 'tensorflow'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: 'UI/UX Design Masterclass',
      slug: 'ui-ux-design-masterclass',
      shortDescription: 'Design stunning user interfaces with Figma. Build a portfolio of 5 real projects.',
      description: 'Master the entire UX process: research, wireframing, prototyping, and handoff. Learn Figma, design systems, and accessibility best practices.',
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
      mentorId,
      categoryId: categoryIds[2],
      duration: 10,
      price: 7999,
      discountPrice: 4999,
      currency: 'INR',
      status: 'published',
      isFeatured: true,
      enrollmentCount: 634,
      rating: 4.7,
      reviewCount: 156,
      certificate: true,
      skills: ['Figma', 'Wireframing', 'Prototyping', 'User Research', 'Design Systems'],
      requirements: ['No prior experience needed', 'A computer with Figma installed'],
      outcomes: ['Create complete UI designs', 'Build design systems', 'Present to stakeholders'],
      curriculum: [
        { week: 1, title: 'Design Fundamentals', description: 'Color, typography, and layout.', topics: ['Color Theory', 'Typography', 'Grid Systems'] },
        { week: 2, title: 'Figma Mastery', description: 'Figma components, auto-layout, and variables.', topics: ['Components', 'Auto Layout', 'Variables'] },
      ],
      faqs: [],
      tags: ['figma', 'ui-design', 'ux', 'design'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  // Seed theme
  await db.collection('themes').insertOne({
    siteName: 'NajTech',
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    accentColor: '#06b6d4',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 'md',
    borderRadius: 'md',
    darkMode: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Seed FAQ
  await db.collection('faqs').insertMany([
    { question: 'How do virtual internships work?', answer: 'You get access to structured weekly curriculum, live sessions with mentors, and practical assignments. Everything is online.', order: 0, isActive: true },
    { question: 'Is a certificate provided?', answer: 'Yes! Upon completion, you receive a verified digital certificate with a QR code that employers can scan to verify.', order: 1, isActive: true },
    { question: 'Can I get a refund?', answer: 'Yes, within 7 days of enrollment if less than 10% of content is accessed.', order: 2, isActive: true },
    { question: 'What payment methods are accepted?', answer: 'We accept UPI, credit/debit cards, net banking via Razorpay and PhonePe.', order: 3, isActive: true },
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Test Credentials Across All 4 Roles:');
  console.log('  1. Super Admin: admin@internvault.com     / Admin@123 (role: super_admin)');
  console.log('  2. Ops Admin:   admin.ops@internvault.com / Admin@123 (role: admin)');
  console.log('  3. Mentor:      mentor@internvault.com    / Admin@123 (role: mentor)');
  console.log('  4. Student:     student@internvault.com   / Admin@123 (role: student)');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
