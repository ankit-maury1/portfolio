import { NextResponse } from "next/server";
import { checkDatabaseConnection } from "@/lib/mongodb-connection";
import { auth } from "@/auth";

export async function GET() {
  try {
    // Only allow admin users to check database status
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check MongoDB connection
    const connectionStatus = await checkDatabaseConnection();

    // Check if .env has MONGODB_URI set
    const envStatus = {
      MONGODB_URI: process.env.MONGODB_URI ? "configured" : "missing",
    };

    return NextResponse.json({
      database: connectionStatus,
      environment: envStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("Error checking database status:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Error checking database status",
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
