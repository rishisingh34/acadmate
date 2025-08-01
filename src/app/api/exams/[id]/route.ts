import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import Exam from "@/models/exams/exam.model";
import authOptions from "@/lib/authOptions";
import { connectToDB } from "@/lib/db";

export async function GET(_req: NextRequest) {
  const searchParams = _req.nextUrl.searchParams;
  const id = searchParams.get("id");

  try {
    await connectToDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const exam = await Exam.findById(id).populate("paperSetter", "name email");

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json(exam);
  } catch (error) {
    console.error("Error fetching exam:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get("id");

  try {
    await connectToDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const exam = await Exam.findById(id);

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    if (exam.paperSetter.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "You are not authorized to update this exam" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updatedExam = await Exam.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    ).populate("paperSetter", "name email");

    return NextResponse.json(updatedExam);
  } catch (error) {
    console.error("Error updating exam:", error);
    return NextResponse.json(
      { error: "Failed to update exam" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get("id");

  try {
    await connectToDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const exam = await Exam.findById(id);

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    if (exam.paperSetter.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "You are not authorized to delete this exam" },
        { status: 403 }
      );
    }

    await Exam.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Exam deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting exam:", error);
    return NextResponse.json(
      { error: "Failed to delete exam" },
      { status: 500 }
    );
  }
}
