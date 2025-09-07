import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

// Connection URI
const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

// Create a new MongoClient
const client = new MongoClient(uri);

async function seedDatabase() {
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB server');

    // Get reference to the database
    const db = client.db();

    // Clear existing data (optional)
    await clearCollections(db);

    // Seed users
    const userId = await seedUsers(db);

    // Seed skill categories
    const categoryIds = await seedSkillCategories(db);

    // Seed skills
    const skillIds = await seedSkills(db, categoryIds);

    // Seed projects
    await seedProjects(db, userId, skillIds);

    // Seed experiences
    await seedExperiences(db);

    // Seed education
    await seedEducation(db);

    // Seed blog tags
    const tagIds = await seedBlogTags(db);

    // Seed blog posts
    await seedBlogPosts(db, userId, tagIds);

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the connection
    await client.close();
    console.log('Connection closed');
  }
}

async function clearCollections(db) {
  const collections = [
    'User', 'Account', 'Session', 'VerificationToken',
    'SkillCategory', 'Skill', 'Project',
    'Experience', 'Education', 'BlogTag', 'BlogPost'
  ];
  
  for (const collection of collections) {
    try {
      await db.collection(collection).deleteMany({});
      console.log(`Cleared collection: ${collection}`);
    } catch (error) {
      console.error(`Error clearing collection ${collection}:`, error);
    }
  }
}

async function seedUsers(db) {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const user = {
    name: 'Admin User',
    email: 'admin@example.com',
    emailVerified: new Date(),
    password: hashedPassword,
    image: 'https://ui-avatars.com/api/?name=Admin+User',
    role: 'ADMIN',
    createdAt: new Date(),
    updatedAt: new Date(),
    twoFactorEnabled: false
  };
  
  const result = await db.collection('User').insertOne(user);
  console.log('Admin user created');
  
  return result.insertedId;
}

async function seedSkillCategories(db) {
  const categories = [
    {
      name: 'Frontend',
      description: 'Frontend development technologies',
      icon: 'code',
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Backend',
      description: 'Backend development technologies',
      icon: 'server',
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Database',
      description: 'Database technologies',
      icon: 'database',
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  const result = await db.collection('SkillCategory').insertMany(categories);
  console.log(`${result.insertedCount} skill categories inserted`);
  
  // Return mapping of category names to IDs
  const categoryIds = {};
  let index = 0;
  for (const id of Object.values(result.insertedIds)) {
    categoryIds[categories[index].name] = id;
    index++;
  }
  
  return categoryIds;
}

async function seedSkills(db, categoryIds) {
  const skills = [
    {
      name: 'React',
      proficiency: 90,
      icon: 'react',
      color: '#61DAFB',
      featured: true,
      categoryId: categoryIds['Frontend'],
      projectIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'TypeScript',
      proficiency: 85,
      icon: 'typescript',
      color: '#3178C6',
      featured: true,
      categoryId: categoryIds['Frontend'],
      projectIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Node.js',
      proficiency: 80,
      icon: 'nodejs',
      color: '#339933',
      featured: true,
      categoryId: categoryIds['Backend'],
      projectIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'MongoDB',
      proficiency: 75,
      icon: 'mongodb',
      color: '#47A248',
      featured: true,
      categoryId: categoryIds['Database'],
      projectIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  const result = await db.collection('Skill').insertMany(skills);
  console.log(`${result.insertedCount} skills inserted`);
  
  // Return array of skill IDs
  return Object.values(result.insertedIds);
}

async function seedProjects(db, userId, skillIds) {
  const projects = [
    {
      title: 'Portfolio Website',
      slug: 'portfolio-website',
      description: 'Personal portfolio website built with Next.js',
      content: '# Portfolio Website\n\nThis is my personal portfolio website built with Next.js, TypeScript, and Tailwind CSS. It features a responsive design, dark mode, and admin panel for content management.',
      featured: true,
      publishedAt: new Date(),
      githubUrl: 'https://github.com/username/portfolio',
      liveUrl: 'https://portfolio.example.com',
      coverImage: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5',
      order: 1,
      userId: userId,
      skillIds: skillIds.slice(0, 2), // Use first two skills
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'E-commerce Platform',
      slug: 'ecommerce-platform',
      description: 'Full-stack e-commerce platform with payment integration',
      content: '# E-commerce Platform\n\nA full-stack e-commerce platform built with MERN stack (MongoDB, Express.js, React, Node.js). Features include product catalog, shopping cart, user authentication, and payment processing.',
      featured: true,
      publishedAt: new Date(),
      githubUrl: 'https://github.com/username/ecommerce',
      liveUrl: 'https://ecommerce.example.com',
      coverImage: 'https://images.unsplash.com/photo-1557821552-17105176677c',
      order: 2,
      userId: userId,
      skillIds: skillIds.slice(1, 4), // Use last three skills
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  const result = await db.collection('Project').insertMany(projects);
  console.log(`${result.insertedCount} projects inserted`);
  
  // Update skills with project IDs
  const projectIds = Object.values(result.insertedIds);
  await db.collection('Skill').updateOne(
    { _id: skillIds[0] },
    { $push: { projectIds: projectIds[0] } }
  );
  await db.collection('Skill').updateOne(
    { _id: skillIds[1] },
    { $push: { projectIds: { $each: projectIds } } }
  );
  await db.collection('Skill').updateOne(
    { _id: skillIds[2] },
    { $push: { projectIds: projectIds[1] } }
  );
  await db.collection('Skill').updateOne(
    { _id: skillIds[3] },
    { $push: { projectIds: projectIds[1] } }
  );
}

async function seedExperiences(db) {
  const experiences = [
    {
      title: 'Senior Frontend Developer',
      company: 'Tech Solutions Inc.',
      location: 'Remote',
      description: 'Led frontend development for enterprise applications using React, TypeScript, and GraphQL.',
      startDate: new Date('2020-01-01'),
      endDate: null,
      current: true,
      logo: 'https://ui-avatars.com/api/?name=Tech+Solutions',
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Full Stack Developer',
      company: 'Innovative Apps LLC',
      location: 'New York, NY',
      description: 'Developed full-stack web applications using MERN stack (MongoDB, Express.js, React, Node.js).',
      startDate: new Date('2018-03-01'),
      endDate: new Date('2019-12-31'),
      current: false,
      logo: 'https://ui-avatars.com/api/?name=Innovative+Apps',
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  const result = await db.collection('Experience').insertMany(experiences);
  console.log(`${result.insertedCount} experiences inserted`);
}

async function seedEducation(db) {
  const education = [
    {
      institution: 'University of Technology',
      degree: 'Master of Science',
      field: 'Computer Science',
      location: 'Boston, MA',
      description: 'Specialized in Artificial Intelligence and Machine Learning',
      startDate: new Date('2016-09-01'),
      endDate: new Date('2018-05-31'),
      current: false,
      logo: 'https://ui-avatars.com/api/?name=University',
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      institution: 'State University',
      degree: 'Bachelor of Science',
      field: 'Software Engineering',
      location: 'Chicago, IL',
      description: 'Focused on web development and software architecture',
      startDate: new Date('2012-09-01'),
      endDate: new Date('2016-05-31'),
      current: false,
      logo: 'https://ui-avatars.com/api/?name=State+University',
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  const result = await db.collection('Education').insertMany(education);
  console.log(`${result.insertedCount} education entries inserted`);
}

async function seedBlogTags(db) {
  const tags = [
    {
      name: 'React',
      slug: 'react',
      postIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'JavaScript',
      slug: 'javascript',
      postIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Web Development',
      slug: 'web-development',
      postIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Career',
      slug: 'career',
      postIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  const result = await db.collection('BlogTag').insertMany(tags);
  console.log(`${result.insertedCount} blog tags inserted`);
  
  return Object.values(result.insertedIds);
}

async function seedBlogPosts(db, userId, tagIds) {
  const blogPosts = [
    {
      title: 'Getting Started with React Hooks',
      slug: 'getting-started-with-react-hooks',
      summary: 'Learn the basics of React Hooks and how to use them in your applications',
      content: `# Getting Started with React Hooks

React Hooks have revolutionized the way we write React components. In this post, we'll explore the most commonly used hooks and how they can simplify your code.

## useState

The useState hook allows you to add state to functional components. Here's a simple example:

\`\`\`jsx
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## useEffect

The useEffect hook lets you perform side effects in function components. It's similar to lifecycle methods like componentDidMount, componentDidUpdate, and componentWillUnmount combined.

\`\`\`jsx
function Example() {
  const [count, setCount] = useState(0);

  // Similar to componentDidMount and componentDidUpdate
  useEffect(() => {
    document.title = \`You clicked \${count} times\`;
    
    // Optional cleanup function (similar to componentWillUnmount)
    return () => {
      document.title = 'React App';
    };
  }, [count]); // Only re-run if count changes
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

Stay tuned for more React hook tutorials!`,
      coverImage: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd',
      published: true,
      publishedAt: new Date(),
      featured: true,
      userId: userId,
      tagIds: [tagIds[0], tagIds[1], tagIds[2]], // React, JavaScript, Web Development tags
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Tips for Junior Developers',
      slug: 'tips-for-junior-developers',
      summary: 'Career advice and programming tips for developers who are just starting out',
      content: `# Tips for Junior Developers

Starting your career as a software developer can be both exciting and overwhelming. Here are some tips to help you navigate your journey.

## 1. Master the Fundamentals

Before diving into the latest frameworks or libraries, make sure you have a solid understanding of the fundamentals. For web development, this means HTML, CSS, and JavaScript.

## 2. Build Projects

Theory is important, but nothing beats practical experience. Build projects that interest you, even if they're small. This will help you apply what you've learned and build a portfolio.

## 3. Don't Be Afraid to Ask Questions

In software development, no one knows everything. Don't be afraid to ask questions when you're stuck. Most senior developers are happy to help, and asking good questions is a skill in itself.

## 4. Learn Version Control

Git is an essential tool for every developer. Learn how to use it effectively, including branching, merging, and resolving conflicts.

## 5. Practice Debugging

Debugging is a crucial skill. Learn how to use browser developer tools, console.log, and other debugging techniques to find and fix issues in your code.

## 6. Be Patient with Yourself

Learning to code takes time. Don't get discouraged if you don't understand something immediately. Keep practicing, and eventually, things will start to click.

Remember, every experienced developer was once a beginner. Stay curious, keep learning, and enjoy the process!`,
      coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
      published: true,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      featured: false,
      userId: userId,
      tagIds: [tagIds[2], tagIds[3]], // Web Development, Career tags
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  ];
  
  // Insert blog posts
  const result = await db.collection('BlogPost').insertMany(blogPosts);
  console.log(`${result.insertedCount} blog posts inserted`);
  
  // Update tags with post IDs
  const postIds = Object.values(result.insertedIds);
  
  // Update first post tags
  await db.collection('BlogTag').updateOne(
    { _id: tagIds[0] }, // React
    { $push: { postIds: postIds[0] } }
  );
  await db.collection('BlogTag').updateOne(
    { _id: tagIds[1] }, // JavaScript
    { $push: { postIds: postIds[0] } }
  );
  await db.collection('BlogTag').updateOne(
    { _id: tagIds[2] }, // Web Development
    { $push: { postIds: { $each: postIds } } }
  );
  
  // Update second post tags
  await db.collection('BlogTag').updateOne(
    { _id: tagIds[3] }, // Career
    { $push: { postIds: postIds[1] } }
  );
}

// Run the seed function
seedDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error seeding database:', err);
    process.exit(1);
  });
