import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb-helpers";
import { trackDetailedActivity } from '@/lib/activity-tracking';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const db = await getDatabase();

    // Using MongoDB aggregation to join skill with its category
    const skills = await db.collection('Skill').aggregate([
      {
        $match: { _id: new ObjectId(id) }
      },
      {
        $lookup: {
          from: 'SkillCategory',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true
        }
      }
    ]).toArray();

    if (skills.length === 0) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    const skill = skills[0];

    // Transform the result to match expected format
    const formattedSkill = {
      ...skill,
      id: skill._id.toString(),
      categoryId: skill.categoryId.toString(),
      category: skill.category ? {
        ...skill.category,
        id: skill.category._id.toString(),
        _id: undefined
      } : undefined,
      _id: undefined
    };

    return NextResponse.json(formattedSkill);
  } catch (error) {
    console.error("Error fetching skill:", error);
    return NextResponse.json(
      { error: "Failed to fetch skill" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    // Check if user is authorized
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const data = await request.json();
    const { name, proficiency, icon, color, categoryId, featured } = data;
    const db = await getDatabase();

    // Verify the skill exists
    const existingSkill = await db.collection('Skill').findOne({
      _id: new ObjectId(id)
    });

    if (!existingSkill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    // If category is changing, verify the new category exists
    let newCategoryId = existingSkill.categoryId;
    if (categoryId && categoryId !== existingSkill.categoryId.toString()) {
      const category = await db.collection('SkillCategory').findOne({
        _id: new ObjectId(categoryId)
      });

      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }
      
      newCategoryId = new ObjectId(categoryId);
    }

    // Update the skill
    const updateData = {
      name: name !== undefined ? name : existingSkill.name,
      proficiency: proficiency !== undefined ? proficiency : existingSkill.proficiency,
      icon: icon !== undefined ? icon : existingSkill.icon,
      color: color !== undefined ? color : existingSkill.color,
      featured: featured !== undefined ? featured : existingSkill.featured,
      categoryId: newCategoryId,
      updatedAt: new Date()
    };
    
    const result = await db.collection('Skill').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    const updatedDoc: any = (result as any)?.value || result; // compatibility if driver returns { value }
    
    if (!updatedDoc) {
      return NextResponse.json({ error: "Failed to update skill" }, { status: 500 });
    }
    
    // Get the category to include in response
    const category = await db.collection('SkillCategory').findOne({
      _id: updatedDoc.categoryId
    });
    
    const formattedResult: any = {
      ...updatedDoc,
      id: updatedDoc._id.toString(),
      categoryId: updatedDoc.categoryId.toString(),
      category: category ? {
        ...category,
        id: category._id.toString(),
        _id: undefined
      } : undefined,
      _id: undefined
    };
    
    // Attempt to log activity
    try {
      await trackDetailedActivity(
        'skill',
        (formattedResult as any).name || 'Skill',
        'update',
        `Updated skill: ${(formattedResult as any).name}`,
        '/admin/skills',
        session.user.name || 'Admin'
      );
    } catch (err) {
      console.error('Failed to log skill update activity', err);
    }

    return NextResponse.json(formattedResult);
  } catch (error) {
    console.error("Error updating skill:", error);
    return NextResponse.json(
      { error: "Failed to update skill" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    // Check if user is authorized
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const db = await getDatabase();

    // Verify the skill exists
    const existingSkill = await db.collection('Skill').findOne({
      _id: new ObjectId(id)
    });

    if (!existingSkill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    // Remove the skill from any projects that reference it
    if (existingSkill.projectIds && existingSkill.projectIds.length > 0) {
      await db.collection('Project').updateMany(
        { skillIds: new ObjectId(id) },
        { $pull: { skillIds: new ObjectId(id) } } as any
      );
    }

    // Delete the skill
    const result = await db.collection('Skill').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Failed to delete skill" }, { status: 500 });
    }

    // Attempt to log delete activity
    try {
      await trackDetailedActivity(
        'skill',
        existingSkill.name || 'Skill',
        'delete',
        `Deleted skill: ${existingSkill.name}`,
        '/admin/skills',
        session.user.name || 'Admin'
      );
    } catch (err) {
      console.error('Failed to log skill delete activity', err);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting skill:", error);
    return NextResponse.json(
      { error: "Failed to delete skill" },
      { status: 500 }
    );
  }
}
