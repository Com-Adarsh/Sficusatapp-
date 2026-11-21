"use client";

import { useMemo } from "react";
import {
  CUSAT_DEPARTMENTS,
  CUSAT_PROGRAMMES,
  programmesForDepartment,
} from "@/lib/cusat-catalog";

type AcademicSelectorsProps = {
  departmentId: string;
  programmeId: string;
  onDepartmentChange: (value: string) => void;
  onProgrammeChange: (value: string) => void;
  departmentRequired?: boolean;
  programmeRequired?: boolean;
  showCourseName?: boolean;
  courseName?: string;
  onCourseNameChange?: (value: string) => void;
  courseNameRequired?: boolean;
  showSemester?: boolean;
  semester?: string;
  onSemesterChange?: (value: string) => void;
  semesterRequired?: boolean;
};

export default function AcademicSelectors({
  departmentId,
  programmeId,
  onDepartmentChange,
  onProgrammeChange,
  departmentRequired = true,
  programmeRequired = true,
  showCourseName = false,
  courseName = "",
  onCourseNameChange,
  courseNameRequired = false,
  showSemester = false,
  semester = "",
  onSemesterChange,
  semesterRequired = false,
}: AcademicSelectorsProps) {
  const programmes = useMemo(
    () => programmesForDepartment(departmentId),
    [departmentId],
  );

  const selectedProgramme = CUSAT_PROGRAMMES.find(
    (programme) => programme.id === programmeId,
  );

  function changeDepartment(value: string) {
    onDepartmentChange(value);
    onProgrammeChange("");
  }

  return (
    <>
      <label className="upload-field">
        <span>Department {departmentRequired && <b>*</b>}</span>
        <select
          required={departmentRequired}
          value={departmentId}
          onChange={(event) => changeDepartment(event.target.value)}
        >
          <option value="">Select department</option>
          {CUSAT_DEPARTMENTS.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
      </label>

      <label className="upload-field">
        <span>Programme {programmeRequired && <b>*</b>}</span>
        <select
          required={programmeRequired}
          value={programmeId}
          onChange={(event) => onProgrammeChange(event.target.value)}
          disabled={!departmentId}
        >
          <option value="">
            {departmentId ? "Select programme" : "Select department first"}
          </option>
          {programmes.map((programme) => (
            <option key={programme.id} value={programme.id}>
              {programme.name}
              {programme.category ? ` · ${programme.category}` : ""}
            </option>
          ))}
        </select>
        {selectedProgramme && (
          <small style={{ display: "block", marginTop: 6, opacity: 0.65 }}>
            {selectedProgramme.category} · {selectedProgramme.durationYears} year
            {selectedProgramme.durationYears === 1 ? "" : "s"}
          </small>
        )}
      </label>

      {showSemester && (
        <label className="upload-field">
          <span>Semester {semesterRequired && <b>*</b>}</span>
          <select
            required={semesterRequired}
            value={semester}
            onChange={(event) => onSemesterChange?.(event.target.value)}
          >
            <option value="">Select semester</option>
            {Array.from({ length: 10 }, (_, index) => {
              const value = String(index + 1);
              return <option key={value} value={value}>{value}</option>;
            })}
          </select>
        </label>
      )}

      {showCourseName && (
        <label className="upload-field">
          <span>Course / subject name {courseNameRequired && <b>*</b>}</span>
          <input
            required={courseNameRequired}
            value={courseName}
            onChange={(event) => onCourseNameChange?.(event.target.value)}
            placeholder="e.g. Probability Theory"
          />
        </label>
      )}
    </>
  );
}
