import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { ObjectId } from "mongodb";
import { findMany, getDatabase } from "@/lib/mongodb-helpers";

export async function GET() {
  try {
    const db = await getDatabase();
    
    // Using MongoDB aggregation to join skills with their categories
    const skills = await db.collection('Skill').aggregate([
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
      },
      {
        $sort: { name: 1 }
      }
    ]).toArray();

    // Transform the results to match expected format
    const formattedSkills = skills.map(skill => ({
      ...skill,
      id: skill._id.toString(),
      categoryId: skill.categoryId.toString(),
      category: skill.category ? {
        ...skill.category,
        id: skill.category._id.toString(),
        _id: undefined
      } : undefined,
      _id: undefined
    }));

    return NextResponse.json(formattedSkills);
  } catch (error) {
    console.error("Error fetching skills:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
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
    const { name, proficiency, icon, color, categoryId, featured } = data;

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if the category exists
    const category = await db.collection('SkillCategory').findOne({
      _id: new ObjectId(categoryId)
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const newSkill = {
      name,
      proficiency: proficiency || 50,
      icon,
      color,
      featured: featured || false,
      categoryId: new ObjectId(categoryId),
      projectIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('Skill').insertOne(newSkill);

    return NextResponse.json({
      ...newSkill,
      id: result.insertedId.toString(),
      categoryId: categoryId,
      category: {
        ...category,
        id: category._id.toString(),
        _id: undefined
      },
      _id: undefined
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating skill:", error);
    return NextResponse.json(
      { error: "Failed to create skill" },
      { status: 500 }
    );
  }
}
