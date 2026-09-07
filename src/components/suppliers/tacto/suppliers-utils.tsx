"use client";

import * as React from "react";
import { ChevronDown, Inbox, ArrowUp, ArrowDown, ChevronsUpDown, Check, Plus, Search, X, RotateCcw, Flag, Users, Building, Globe, FileText, Shield, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/currency";
import { flagEmoji, countryName } from "@/lib/utils/countryFlags";
import { type Supplier } from "./suppliers-model"; // No change needed

export interface ColumnDef {
  id: string;
  label: string;
  width: number;
  type: string;
  align?: "left" | "right" | "center";
  defaultHidden?: boolean;
}

export function renderTableCell(
  row: Supplier,
  columnId: string,
  columnDefs: Record<string, ColumnDef>
) {
  const column = columnDefs[columnId];
  const value = row[columnId as keyof Supplier];

  if (columnId === "supplier") {
    return (
      <div>
        <p className="text-sm font-bold text-slate-950">{row.name}</p>
        <p className="text-xs text-slate-500">{row.id}</p>
      </div>
    );
  }

  if (columnId === "country") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg leading-none">{row.country ? flagEmoji(row.country) : ""}</span>
        <span className="font-medium text-slate-900">{row.country ? countryName(row.country) : "—"}</span>
      </div>
    );
  }

  if (columnId === "orderVolume2025" || columnId === "orderVolume2024") {
    const is2025 = columnId === "orderVolume2025";
    const volume = is2025 ? row.orderVolume2025 : row.orderVolume2024;
    return (
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-900">{formatCurrency(volume)}</span>
        <span className="text-xs text-slate-400">· {is2025 ? "2025" : "2024"}</span>
      </div>
    );
  }

  if (columnId === "status") {
    const status = row.supplierStatus;
    const statusColors = {
      "Potential Supplier": "bg-amber-50 text-amber-700 border-amber-200",
      "Evaluation Process": "bg-blue-50 text-blue-700 border-blue-200",
      "Active": "bg-emerald-50 text-emerald-700 border-emerald-200",
      "Rejected Supplier": "bg-rose-50 text-rose-700 border-rose-200",
    };

    return (
      <Badge variant="outline" className={cn("font-medium", statusColors[status as keyof typeof statusColors] || "bg-slate-50 text-slate-700 border-slate-200")}>
        {status}
      </Badge>
    );
  }

  if (columnId === "strategicClassification") {
    const classification = row.strategicClassification;
    const isPreferred = classification.includes("Preferred Supplier");
    const isStrategic = classification.includes("Strategic Supplier");
    const isInternal = classification.includes("Internal");

    let bgColor = "bg-slate-50";
    let textColor = "text-slate-700";
    let borderColor = "border-slate-200";

    if (isPreferred) {
      bgColor = "bg-green-50";
      textColor = "text-green-700";
      borderColor = "border-green-200";
    } else if (isStrategic) {
      bgColor = "bg-blue-50";
      textColor = "text-blue-700";
      borderColor = "border-blue-200";
    } else if (isInternal) {
      bgColor = "bg-purple-50";
      textColor = "text-purple-700";
      borderColor = "border-purple-200";
    }

    return (
      <Badge variant="outline" className={cn("font-medium", bgColor, textColor, borderColor)}>
        {classification}
      </Badge>
    );
  }

  if (columnId === "abc") {
    const classLetter = row.abcClassification;
    const colors = {
      "A": "bg-emerald-100 text-emerald-800",
      "B": "bg-amber-100 text-amber-800",
      "C": "bg-blue-100 text-blue-800",
    };

    return (
      <Badge className={cn("font-bold", colors[classLetter as keyof typeof colors])}>
        {classLetter}
      </Badge>
    );
  }

  if (columnId.startsWith("certIso")) {
    const certKey = columnId as keyof typeof row.certificates;
    const state = row.certificates[certKey];

    if (state === "Existent") {
      return (
        <Check className="h-4 w-4 text-emerald-600" />
      );
    }

    return (
      <span className="italic text-slate-400">Non-existent</span>
    );
  }

  if (columnId === "reachRelevance" || columnId === "rohsRelevance") {
    const isReach = columnId === "reachRelevance";
    const value = isReach ? row.reach.relevance : row.rohs.relevance;

    return value ? (
      <Check className="h-4 w-4 text-emerald-600" />
    ) : (
      <X className="h-4 w-4 text-slate-400" />
    );
  }

  if (columnId === "egbAnalysisProgress" || columnId === "egbRiskStatus" || columnId === "esgAnalysisProgress" || columnId === "esgRiskStatus") {
    const isEgb = columnId.startsWith("egb");
    const field = isEgb ? (columnId === "egbAnalysisProgress" ? row.ownBusinessArea.analysisProgress : row.ownBusinessArea.riskStatus) : (columnId === "esgAnalysisProgress" ? row.esg.analysisProgress : row.esg.riskStatus);

    const getPillClass = (field: string, type: string) => {
      if (type === "progress") {
        if (field === "Completed") return "bg-emerald-50 text-emerald-700 border-emerald-200";
        if (field === "In progress") return "bg-blue-50 text-blue-700 border-blue-200";
        if (field === "Waiting for SSA") return "bg-amber-50 text-amber-700 border-amber-200";
        return "bg-slate-50 text-slate-500 border-slate-200";
      } else {
        if (field === "Low risk") return "bg-emerald-50 text-emerald-700 border-emerald-200";
        if (field === "Medium risk") return "bg-amber-50 text-amber-700 border-amber-200";
        if (field === "High risk") return "bg-rose-50 text-rose-700 border-rose-200";
        if (field === "Unknown") return "bg-slate-50 text-slate-500 border-slate-200";
        return "bg-slate-50 text-slate-500 border-slate-200";
      }
    };

    return (
      <Badge variant="outline" className={cn("font-medium", getPillClass(field, columnId.includes("Progress") ? "progress" : "risk"))}>
        {field}
      </Badge>
    );
  }

  return <span className="text-slate-600">{String(value)}</span>;
}

export function filterSupplier(supplier: Supplier, filter: any): boolean {
  const { field, operator, value } = filter;

  switch (field) {
    case "supplierStatus": {
      const supplierStatus = supplier.supplierStatus;
      if (operator === "is_one_of") {
        return (value as string[]).includes(supplierStatus);
      }
      if (operator === "is_none_of") {
        return !(value as string[]).includes(supplierStatus);
      }
      return false;
    }

    case "ssaCompleted": {
      const ssaCompleted = supplier.ssaCompleted;
      if (operator === "equals") {
        return ssaCompleted === value;
      }
      return false;
    }

    case "supplierCreatedIn": {
      const supplierCreatedIn = supplier.supplierCreatedIn;
      if (operator === "equals") {
        return supplierCreatedIn === value;
      }
      return false;
    }

    case "reachRelevance": {
      const reachRelevance = supplier.reach.relevance;
      if (operator === "equals") {
        return reachRelevance === value;
      }
      return false;
    }

    case "rohsRelevance": {
      const rohsRelevance = supplier.rohs.relevance;
      if (operator === "equals") {
        return rohsRelevance === value;
      }
      return false;
    }

    case "esgRiskStatus": {
      const esgRiskStatus = supplier.esg.riskStatus;
      if (operator === "is_one_of") {
        return (value as string[]).includes(esgRiskStatus);
      }
      if (operator === "is_none_of") {
        return !(value as string[]).includes(esgRiskStatus);
      }
      return false;
    }

    case "esgRiskStatusLast": {
      const esgRiskStatusLast = supplier.esg.riskStatusLast;
      if (operator === "is_one_of") {
        return (value as string[]).includes(esgRiskStatusLast);
      }
      if (operator === "is_none_of") {
        return !(value as string[]).includes(esgRiskStatusLast);
      }
      return false;
    }

    case "esgAnalysisProgress": {
      const esgAnalysisProgress = supplier.esg.analysisProgress;
      if (operator === "is_one_of") {
        return (value as string[]).includes(esgAnalysisProgress);
      }
      return false;
    }

    case "incidentStatus": {
      const incidentStatus = supplier.publicIncidents[0]?.status || "";
      if (operator === "is_one_of") {
        return (value as string[]).includes(incidentStatus);
      }
      return false;
    }

    case "internal": {
      const internal = supplier.internal;
      if (operator === "equals") {
        return internal === value;
      }
      if (operator === "is_blank") {
        return !internal;
      }
      return false;
    }

    case "supplierSpend": {
      const supplierSpend = supplier.supplierSpend;
      if (operator === "greater_than_or_equal_to") {
        return supplierSpend >= (value as number);
      }
      return false;
    }

    default:
      return true;
  }
}

export function sortSuppliers(a: Supplier, b: Supplier, sortField: string, direction: "asc" | "desc") {
  let aValue: any, bValue: any;

  switch (sortField) {
    case "supplier":
      aValue = a.name.toLowerCase();
      bValue = b.name.toLowerCase();
      break;
    case "country":
      aValue = a.country;
      bValue = b.country;
      break;
    case "orderVolume2025":
      aValue = a.orderVolume2025;
      bValue = b.orderVolume2025;
      break;
    case "orderVolume2024":
      aValue = a.orderVolume2024;
      bValue = b.orderVolume2024;
      break;
    case "abc":
      aValue = a.abcClassification;
      bValue = b.abcClassification;
      break;
    case "status":
      aValue = a.supplierStatus;
      bValue = b.supplierStatus;
      break;
    case "egbAnalysisProgress":
      aValue = a.ownBusinessArea.analysisProgress;
      bValue = b.ownBusinessArea.analysisProgress;
      break;
    case "egbRiskStatus":
      aValue = a.ownBusinessArea.riskStatus;
      bValue = b.ownBusinessArea.riskStatus;
      break;
    case "esgAnalysisProgress":
      aValue = a.esg.analysisProgress;
      bValue = b.esg.analysisProgress;
      break;
    case "esgRiskStatus":
      aValue = a.esg.riskStatus;
      bValue = b.esg.riskStatus;
      break;
    default:
      return 0;
  }

  if (aValue < bValue) return direction === "asc" ? -1 : 1;
  if (aValue > bValue) return direction === "asc" ? 1 : -1;
  return 0;
}