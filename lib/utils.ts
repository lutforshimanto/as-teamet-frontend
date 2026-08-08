import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeAssignedEmployeeIds(
  assignedEmployees: unknown,
): string[] {
  if (!Array.isArray(assignedEmployees)) return [];

  return assignedEmployees.reduce<string[]>((acc, employee) => {
    if (typeof employee === "string" && employee.trim()) {
      acc.push(employee);
    } else if (employee && typeof employee === "object" && "_id" in employee) {
      const id = (employee as { _id?: unknown })._id;
      if (typeof id === "string" && id.trim()) {
        acc.push(id);
      }
    }

    return acc;
  }, []);
}
