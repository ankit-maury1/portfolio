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
