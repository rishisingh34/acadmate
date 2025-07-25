"use client";

import React, { FC } from "react";
import Link from "next/link";
// import { useRouter } from "next/navigation";
import { ArrowUp, Trash2 } from "lucide-react";

interface SemesterCardProps {
  department: string;
  semester: string;
  studentCount?: number;
  actualDepartment?: string;
  onDelete: (department: string, semester: string) => void;
  section?: string; // Optional, used to differentiate between "students" and "results"
}

const SemesterCard: FC<SemesterCardProps> = ({
  department,
  semester,
  studentCount,
  actualDepartment,
  onDelete,
  section = "students"
}) => {
  // const router = useRouter();

  const getSemesterLink = () => {
    const formattedSemester = semester.replace(/\s+/g, "").toLowerCase();
    const deptSlug =
      department === "COMPUTER SCIENCE"
        ? "cse"
        : department === "ELECTRONICS & COMMUNICATION"
        ? "ece"
        : department.toLowerCase().replace(/\s+/g, "-");

    const finalDeptSlug =
      deptSlug === "all" && actualDepartment
        ? actualDepartment.toLowerCase().replace(/\s+/g, "-")
        : deptSlug;

    const basePath =
      section === "results"
        ? "/admin/results"
        : section === "attendance"
        ? "/admin/attendance"
        : "/admin/users/students";

    return `${basePath}/${finalDeptSlug}/${formattedSemester}`;
  };

  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 flex flex-col justify-between shadow-md hover:shadow-teal-900/20 hover:border-zinc-600 transition-all duration-300 cursor-pointer">
      <div>
        <h3 className="text-lg font-bold text-zinc-100">{semester}</h3>
        <p className="text-sm text-zinc-400">
          {department === "ALL" && actualDepartment ? (
            <span className="italic text-teal-400">{actualDepartment}</span>
          ) : (
            department
          )}
        </p>

        {typeof studentCount === "number" && (
          <p className="text-sm text-zinc-300 mt-1">
            👥 {studentCount} student{studentCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Link href={getSemesterLink()}>
          <button
            className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 ${
              section === "students"
                ? "bg-teal-800 hover:bg-teal-700 focus:ring-teal-500"
                : section === "results"
                ? "bg-purple-800 hover:bg-purple-700 focus:ring-purple-500"
                : section === "attendance"
                ? "bg-blue-800 hover:bg-blue-700 focus:ring-blue-500"
                : "bg-zinc-700 hover:bg-zinc-600 focus:ring-zinc-500"
            }`}
          >
            Navigate
            <ArrowUp className="w-4 h-4 rotate-45" />
          </button>
        </Link>

        {/* Show delete if not from "ALL" tab */}
        {/* Show delete if not from "ALL" tab */}
        {section === "students" && department !== "ALL" && (
          <button
            onClick={() => onDelete(department, semester)}
            className="p-2 text-zinc-400 bg-zinc-700 rounded-md hover:bg-red-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-zinc-950"
            aria-label={`Delete ${semester} from ${department}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SemesterCard;