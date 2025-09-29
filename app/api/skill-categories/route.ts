import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { findMany, getDatabase } from "@/lib/mongodb-helpers";

export async function GET() {
  try {
    const db = await getDatabase();
    
    // Using MongoDB aggregation to join categories with skills
    const categories = await db.collection('SkillCategory').aggregate([
      {
        $lookup: {
          from: 'Skill',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'skills'
        }
      },
      {
        $sort: { order: 1 }
      }
    ]).toArray();

    // Transform the results to match expected format
    const formattedCategories = categories.map(category => ({
      ...category,
      id: category._id.toString(),
      skills: category.skills.map((skill: any) => ({
        ...skill,
        id: skill._id.toString(),
        categoryId: skill.categoryId.toString(),
        _id: undefined
      })),
      _id: undefined
    }));

    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error("Error fetching skill categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch skill categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is authorized
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { name, description, icon, order } = data;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    const newCategory = {
      name,
      description,
      icon,
      order: order || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('SkillCategory').insertOne(newCategory);
    
    return NextResponse.json({
      ...newCategory,
      id: result.insertedId.toString(),
      skills: [],
      _id: undefined
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating skill category:", error);
    return NextResponse.json(
      { error: "Failed to create skill category" },
      { status: 500 }
    );
  }
}

// PUT - Update a category
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description, icon, order } = body;

    if (!id) {
      return NextResponse.json({ error: 'Category id is required' }, { status: 400 });
    }

    const db = await getDatabase();
    const objectId = typeof id === 'string' ? new (await import('mongodb')).ObjectId(id) : id;

    const updateDoc: any = { updatedAt: new Date() };
    if (name !== undefined) updateDoc.name = name;
    if (description !== undefined) updateDoc.description = description;
    if (icon !== undefined) updateDoc.icon = icon;
    if (order !== undefined) updateDoc.order = order;

    await db.collection('SkillCategory').updateOne({ _id: objectId }, { $set: updateDoc });

    const updated = await db.collection('SkillCategory').findOne({ _id: objectId });
    if (!updated) return NextResponse.json({ error: 'Category not found' }, { status: 404 });

    return NextResponse.json({
      ...updated,
      id: updated._id.toString(),
      _id: undefined
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE - Delete a category
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'Category id is required' }, { status: 400 });

    const db = await getDatabase();
    const objectId = typeof id === 'string' ? new (await import('mongodb')).ObjectId(id) : id;

    // Before deleting, optionally reassign or remove skills referencing this category.
    // For now, we'll prevent deletion if skills exist.
    const skillCount = await db.collection('Skill').countDocuments({ categoryId: objectId });
    if (skillCount > 0) {
      return NextResponse.json({ error: 'Cannot delete category with skills. Reassign or delete skills first.' }, { status: 400 });
    }

    await db.collection('SkillCategory').deleteOne({ _id: objectId });

    return NextResponse.json({ success: true, deleted: id });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
