import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ObjectId } from 'mongodb';
import { findMany, getDatabase } from '@/lib/mongodb-helpers';

export async function GET() {
  try {
    const db = await getDatabase();
    
    // Using MongoDB aggregation to join projects with skills
    const projects = await db.collection('Project').aggregate([
      {
        $lookup: {
          from: 'Skill',
          localField: 'skillIds',
          foreignField: '_id',
          as: 'skills'
        }
      },
      {
        $sort: { order: 1 }
      }
    ]).toArray();

    // Transform the results to match the expected format
    const formattedProjects = projects.map(project => ({
      ...project,
      id: project._id.toString(),
      status: project.status || 'planned',
      category: project.category || 'general',
      skills: project.skills.map((skill: any) => ({
        ...skill,
        id: skill._id.toString(),
        _id: undefined
      })),
      _id: undefined
    }));

    return NextResponse.json(formattedProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Import the activity tracking function
    const { trackDetailedActivity } = await import('@/lib/activity-tracking');

    const body = await request.json();
    
    const {
      title,
      description,
      content,
      featured,
      githubUrl,
      liveUrl,
      coverImage,
      status, // new optional field
      category, // new optional field
      skills: skillIds,
    } = body;

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');

    // Convert skill string IDs to ObjectIds
    const skillObjectIds = skillIds?.map((id: string) => new ObjectId(id)) || [];

    const db = await getDatabase();
    
    // Normalize URL fields (prepend https:// if user omitted protocol)
    const normalizeUrl = (val?: string) => {
      if (!val) return undefined;
      const trimmed = val.trim();
      if (!trimmed) return undefined;
      if (/^https?:\/\//i.test(trimmed)) return trimmed;
      return `https://${trimmed}`;
    };

    const newProject = {
      title,
      slug,
      description,
      content,
      featured: featured || false,
      githubUrl: normalizeUrl(githubUrl),
      liveUrl: normalizeUrl(liveUrl),
      coverImage,
      status: status || 'planned',
      category: category || 'general',
      publishedAt: new Date(),
      userId: new ObjectId(session.user.id),
      skillIds: skillObjectIds,
      gallery: [],
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('Project').insertOne(newProject);

    // Update the skills to include this project
    if (skillObjectIds.length > 0) {
      await db.collection('Skill').updateMany(
        { _id: { $in: skillObjectIds } },
        { $push: { projectIds: result.insertedId } } as any
      );
    }
    
    // Fetch the skills to include in response
    const skills = skillObjectIds.length > 0 
      ? await db.collection('Skill').find({ _id: { $in: skillObjectIds } }).toArray()
      : [];

    const project = {
      ...newProject,
      id: result.insertedId.toString(),
      skills: skills.map((skill: any) => ({
        ...skill,
        id: skill._id.toString(),
        _id: undefined
      })),
      _id: undefined
    };

    // Track detailed activity for project creation
    await trackDetailedActivity(
      'project',
      title,
      'create',
      `Created new project: ${title}`,
      `/admin/projects`,
      session.user.name || 'Admin'
    );

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
