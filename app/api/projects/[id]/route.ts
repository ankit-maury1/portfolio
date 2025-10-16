import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ObjectId, WithId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb-helpers';
import { trackDetailedActivity } from '@/lib/activity-tracking';
import type { MongoProject, MongoSkill } from '@/types/mongodb';

// Local helper types (formatted versions returned to client)
interface ApiSkill extends Omit<MongoSkill, '_id' | 'projectIds' | 'categoryId' | 'createdAt' | 'updatedAt'> {
  id: string;
  categoryId?: string; // optionally expose if needed later
  createdAt?: string;
  updatedAt?: string;
}

interface ApiProject extends Omit<MongoProject, '_id' | 'userId' | 'skillIds' | 'createdAt' | 'updatedAt'> {
  id: string;
  skillIds: string[]; // still return referenced ids
  skills: ApiSkill[];
  createdAt?: string;
  updatedAt?: string;
}

function mapSkill(doc: WithId<Partial<MongoSkill>>): ApiSkill {
  return {
    id: doc._id.toString(),
    name: doc.name || '',
    proficiency: doc.proficiency ?? 0,
    icon: doc.icon,
    color: doc.color,
    featured: !!doc.featured,
  };
}

function mapProjectWithSkills(project: WithId<MongoProject & { skills: WithId<MongoSkill>[] }>): ApiProject {
  return {
    id: project._id.toString(),
    title: project.title,
    slug: project.slug,
    description: project.description,
    content: project.content,
    featured: project.featured,
    publishedAt: project.publishedAt,
    githubUrl: project.githubUrl,
    liveUrl: project.liveUrl,
    coverImage: project.coverImage,
    order: project.order,
    skillIds: project.skillIds.map(id => id.toString()),
    gallery: project.gallery,
    status: project.status,
    category: project.category,
    createdAt: project.createdAt?.toISOString(),
    updatedAt: project.updatedAt?.toISOString(),
    skills: (project.skills || []).map(mapSkill)
  };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();

    // Using MongoDB aggregation to join project with skills
    const projects = await db.collection('Project').aggregate<WithId<MongoProject & { skills: WithId<MongoSkill>[] }>>([
      {
        $match: { _id: new ObjectId(params.id) }
      },
      {
        $lookup: {
          from: 'Skill',
          localField: 'skillIds',
          foreignField: '_id',
          as: 'skills'
        }
      }
    ]).toArray();

    if (projects.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = projects[0];
    return NextResponse.json(mapProjectWithSkills(project));
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const {
      title,
      description,
      content,
      featured,
      githubUrl,
      liveUrl,
      coverImage,
      status,
      category,
      skills: skillIds,
    } = body;

    // Update slug if title changed
    let slug;
    if (title) {
      slug = title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
    }

    const db = await getDatabase();
    
    // First, get current project to find current skills
    const currentProject = await db.collection('Project').findOne({ 
      _id: new ObjectId(params.id) 
    });

    if (!currentProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Convert new skill IDs to ObjectIds
  const newSkillObjectIds = Array.isArray(skillIds) ? skillIds.map((id: string) => new ObjectId(id)) : [];
    
    // Remove this project from skills that are no longer associated
    if (currentProject.skillIds?.length > 0) {
      // Find skills to remove (in old list but not in new list)
      const skillsToRemove = currentProject.skillIds.filter(
        (id: ObjectId) => !newSkillObjectIds.some(
          (newId: ObjectId) => newId.toString() === id.toString()
        )
      );
      
      if (skillsToRemove.length > 0) {
        await db.collection('Skill').updateMany(
          { _id: { $in: skillsToRemove } },
          { $pull: { projectIds: new ObjectId(params.id) } }
        );
      }
    }
    
    // Add this project to new skills that weren't previously associated
    const skillsToAdd = newSkillObjectIds.filter(
      (newId: ObjectId) => !currentProject.skillIds?.some(
        (id: ObjectId) => id.toString() === newId.toString()
      )
    );
    
    if (skillsToAdd.length > 0) {
      await db.collection('Skill').updateMany(
        { _id: { $in: skillsToAdd } },
        { $push: { projectIds: new ObjectId(params.id) } }
      );
    }

    // Update the project
    const normalizeUrl = (val?: string) => {
      if (!val) return undefined;
      const trimmed = val.trim();
      if (!trimmed) return undefined;
      if (/^https?:\/\//i.test(trimmed)) return trimmed;
      return `https://${trimmed}`;
    };

    const updateData: {
      updatedAt: Date;
      skillIds: ObjectId[];
      title?: string;
      slug?: string;
      description?: string;
      content?: string;
      featured?: boolean;
      githubUrl?: string | null;
      liveUrl?: string | null;
      coverImage?: string;
      status?: string;
      category?: string;
    } = {
      updatedAt: new Date(),
      skillIds: newSkillObjectIds
    };
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (content !== undefined) updateData.content = content;
    if (featured !== undefined) updateData.featured = featured;
    if (githubUrl !== undefined) updateData.githubUrl = normalizeUrl(githubUrl);
    if (liveUrl !== undefined) updateData.liveUrl = normalizeUrl(liveUrl);
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (status !== undefined) updateData.status = status;
    if (category !== undefined) updateData.category = category;

    await db.collection('Project').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    );

    // Fetch updated project with skills
    const updatedProjects = await db.collection('Project').aggregate<WithId<MongoProject & { skills: WithId<MongoSkill>[] }>>([
      {
        $match: { _id: new ObjectId(params.id) }
      },
      {
        $lookup: {
          from: 'Skill',
          localField: 'skillIds',
          foreignField: '_id',
          as: 'skills'
        }
      }
    ]).toArray();

    const updatedProject = updatedProjects[0];

    const formattedProject = mapProjectWithSkills(updatedProject);

    // Track update activity
    try {
      await trackDetailedActivity(
        'project',
        formattedProject.title || 'Project',
        'update',
        `Updated project: ${formattedProject.title}`,
        `/admin/projects`,
        session.user.name || 'Admin'
      );
    } catch (err) {
      console.error('Failed to log project update activity', err);
    }

    return NextResponse.json(formattedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    
    // Get project to find associated skills
    const project = await db.collection('Project').findOne({ 
      _id: new ObjectId(params.id) 
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Remove project from skills
    if (project.skillIds?.length > 0) {
      await db.collection('Skill').updateMany(
        { _id: { $in: project.skillIds } },
        { $pull: { projectIds: new ObjectId(params.id) } }
      );
    }

    // Delete project
    await db.collection('Project').deleteOne({ 
      _id: new ObjectId(params.id) 
    });

    // Track delete activity
    try {
      await trackDetailedActivity(
        'project',
        project.title || 'Project',
        'delete',
        `Deleted project: ${project.title}`,
        `/admin/projects`,
        session.user.name || 'Admin'
      );
    } catch (err) {
      console.error('Failed to log project delete activity', err);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
