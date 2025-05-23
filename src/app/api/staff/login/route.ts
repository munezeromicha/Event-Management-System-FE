import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate credentials (in a real app, you would check against a database)
    if (username !== "staff" || password !== "staff123") {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate a simple mock token (in a real app, you would use JWT)
    const token = btoa(`${username}-${Date.now()}`);

    // Return success response with token
    return NextResponse.json({
      success: true,
      token,
      staff: {
        id: "staff-001",
        name: "Staff User",
        role: "Event Staff",
      },
    });
  } catch (error) {
    console.error("Error in staff login:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
} 