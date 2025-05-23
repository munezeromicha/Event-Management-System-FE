import { NextResponse } from "next/server";

// Mock database of attendees (in a real app, this would be in a database)
const mockAttendees = [
  {
    id: "att-001",
    name: "John Doe",
    email: "john.doe@example.com",
    company: "RNIT",
    position: "CEO",
    badgeCode: "BADGE-1001",
  },
  {
    id: "att-002",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    company: "Bank of Kigali",
    position: "Manager",
    badgeCode: "BADGE-1002",
  },
  {
    id: "att-003",
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    company: "MTN Rwanda",
    position: "Director",
    badgeCode: "BADGE-1003",
  },
];

// Mock attendance records
const attendanceRecords: Record<string, string[]> = {
  "1": [], // Event 1 attendance
  "2": [], // Event 2 attendance
};

export async function POST(request: Request) {
  try {
    // Verify authorization (in a real app, you would validate JWT token)
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { badgeCode, eventId } = body;

    if (!badgeCode || !eventId) {
      return NextResponse.json(
        { success: false, message: "Badge code and event ID are required" },
        { status: 400 }
      );
    }

    // Find attendee by badge code
    const attendee = mockAttendees.find((a) => a.badgeCode === badgeCode);

    if (!attendee) {
      return NextResponse.json(
        { success: false, message: "Badge not found" },
        { status: 404 }
      );
    }

    // Check if attendee already scanned for this event
    if (attendanceRecords[eventId]?.includes(attendee.id)) {
      return NextResponse.json({
        success: true,
        id: attendee.id,
        attendeeName: attendee.name,
        attendeeEmail: attendee.email,
        eventId,
        message: "Attendee already scanned",
        alreadyScanned: true,
      });
    }

    // Record attendance
    if (!attendanceRecords[eventId]) {
      attendanceRecords[eventId] = [];
    }
    attendanceRecords[eventId].push(attendee.id);

    // Return success with attendee info
    return NextResponse.json({
      success: true,
      id: attendee.id,
      attendeeName: attendee.name,
      attendeeEmail: attendee.email,
      company: attendee.company,
      position: attendee.position,
      eventId,
      scannedAt: new Date().toISOString(),
      message: "Badge scanned successfully",
    });
  } catch (error) {
    console.error("Error scanning badge:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
} 