import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb-helpers';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();

    // Using MongoDB aggregation to join project with skills
    const projects = await db.collection('Project').aggregate([
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

    // Transform the results to match the expected format
    const formattedProject = {
      ...project,
      id: project._id.toString(),
      skills: project.skills.map((skill: any) => ({
        ...skill,
        id: skill._id.toString(),
        _id: undefined
      })),
      _id: undefined
    };

    return NextResponse.json(formattedProject);
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
    const newSkillObjectIds = skillIds?.map((id: string) => new ObjectId(id)) || [];
    
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
          { $pull: { projectIds: new ObjectId(params.id) } } as any
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
        { $push: { projectIds: new ObjectId(params.id) } } as any
      );
    }

    // Update the project
    const updateData = {
      title,
      slug,
      description,
      content,
      featured,
      githubUrl,
      liveUrl,
      coverImage,
      skillIds: newSkillObjectIds,
      updatedAt: new Date()
    };

    await db.collection('Project').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    );

    // Fetch updated project with skills
    const updatedProjects = await db.collection('Project').aggregate([
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

    const formattedProject = {
      ...updatedProject,
      id: updatedProject._id.toString(),
      skills: updatedProject.skills.map((skill: any) => ({
        ...skill,
        id: skill._id.toString(),
        _id: undefined
      })),
      _id: undefined
    };

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
        { $pull: { projectIds: new ObjectId(params.id) } } as any
      );
    }

    // Delete project
    await db.collection('Project').deleteOne({ 
      _id: new ObjectId(params.id) 
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
