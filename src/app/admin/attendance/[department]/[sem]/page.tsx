"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import StudentTableSkeleton from "@/components/students/StudentListSkeleton";
import { useParams } from "next/navigation";

interface Subject {
  _id: string;
  name: string;
  code: string;
}

interface Student {
  _id: string;
  name: string;
  roll: string;
  branch: string;
  semester: string;
  section: string;
}

interface AttendanceRecord {
  _id: string;
  studentId: string;
  isPresent: boolean;
  subjectName: string;
  professor: string;
  subjectCode: string;
  date: string;
  sem: number;
  createdAt: string;
  updatedAt: string;
}

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const params = useParams();
  const branch = params.department as string;
  const semester = params.sem as string;
  // Fetch Subjects
  useEffect(() => {
    if (!branch || !semester) return;

    const fetchSubjects = async () => {
      try {
        const res = await fetch(
          `/api/subject-allotment?branch=${branch}&semester=${semester[3]}`
        );
        const data = await res.json();

        if (res.ok && Array.isArray(data.subjects)) {
          setSubjects(data.subjects);
          setSelectedSubject(data.subjects[0]?._id || "");
        } else {
          toast.error(data.error || "Failed to load subjects");
        }
      } catch (err) {
        console.log(err);
        toast.error("Failed to fetch subject allotments");
      }
    };

    fetchSubjects();
  }, [branch, semester]);

  // const getAttendanceStatus = (
  //   studentId: string
  // ): "present" | "absent" | null => {
  //   const record = attendanceList.find((a) => a.studentId === studentId);
  //   if (!record) return null;
  //   return record.isPresent ? "present" : "absent";
  // };


  // Fetch Students & Attendance
  useEffect(() => {
    if (!selectedSubject || !selectedDate) return;

    const subject = subjects.find((s) => s._id === selectedSubject);
    if (!subject) return;

    console.log("Selected Subject:", subject);

    const semester = subject.code[3];
    console.log(subject.code, "asdasda");
    const batchCode = subject.code;

    const fetchAttendanceData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          ...(search && { search }),
          ...(branch.toLowerCase() !== "all" && { department: branch.toUpperCase() }),
          ...(semester &&
            branch.toLowerCase() !== "all" && { sem: `sem${semester}` }),
        });

        console.log("Fetching students with params:", params.toString());

        const studentRes = await fetch(`/api/user-mgmt/student?${params}`);
        const studentData = await studentRes.json();

        console.log("Student Data:", studentData);
        setStudents(studentData.students || []);
        setTotalPages(studentData.totalPages || 1);

        const attendanceRes = await fetch(
          `/api/attendance?batchCode=${batchCode}&semester=${semester}&date=${selectedDate}`
        );
        const attendanceData = await attendanceRes.json();

        console.log("Attendance Data:", attendanceData);

        if (
          attendanceData.success &&
          Array.isArray(attendanceData.attendance)
        ) {
          setAttendanceList(attendanceData.attendance as AttendanceRecord[]);
        }
      } catch (err) {
        console.log(err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [branch, subjects, selectedSubject, selectedDate, search, page]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold text-white">Attendance Sheet</h2>

        <div className="flex gap-4 flex-wrap">
          {/* Subject Dropdown */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Date Picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
          />
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name or roll..."
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
        />
      </div>

      {/* Table */}
      {/* Conditional Content */}
      {loading ? (
        <StudentTableSkeleton />
      ) : students.length === 0 ? (
        <div className="text-center text-white py-8 bg-zinc-900/60 rounded-lg border border-white/10">
          No students found.
        </div>
      ) : (
        <div className="bg-zinc-900/80 overflow-x-auto border border-white/10 rounded-lg">
          <table className="min-w-full text-sm text-left divide-y divide-white/10">
            <thead className="bg-white/5 text-gray-300">
              <tr>
                <th className="px-6 py-3 whitespace-nowrap">Name</th>
                <th className="px-6 py-3 whitespace-nowrap">Roll</th>
                <th className="px-6 py-3 whitespace-nowrap">Branch</th>
                <th className="px-6 py-3 whitespace-nowrap text-center">
                  Attendance
                </th>
              </tr>
            </thead>
            <tbody className="text-white divide-y divide-white/10">
              {students.map((student) => {
                const status = attendanceList.find(
                  (a) => a.studentId === student._id
                )?.isPresent;

                console.log("Attendance Status for", student._id, ":", status);

                return (
                  <tr
                    key={student._id}
                    className="hover:bg-white/10 transition"
                  >
                    <td className="px-6 py-3">{student.name}</td>
                    <td className="px-6 py-3">{student.roll}</td>
                    <td className="px-6 py-3">{student.branch}</td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-4">
                        <div
                          className={`w-5 h-5 rounded-full ${
                            status === true ? "bg-green-500" : "bg-gray-700"
                          }`}
                          title="Present"
                        />
                        <div
                          className={`w-5 h-5 rounded-full ${
                            status === false ? "bg-red-500" : "bg-gray-700"
                          }`}
                          title="Absent"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {attendanceList.length === 0 && (
            <div className="text-center text-white py-6">
              No attendance found for this batch.
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 pt-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-1 border rounded-full text-sm text-white disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm text-white/80">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-4 py-1 border rounded-full text-sm text-white disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
