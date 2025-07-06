export interface Category {
  id: string;
  name: string;
  usage_count: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  categories: Category[];
  priority: number;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContextEntry {
  id: string;
  content: string;
  source_type: string;
  insights: {
    keywords: string[];
    sentiment: string;
  } | null;
  timestamp: string;
}

export interface AISuggestions {
  enhanced_description?: string;
  suggested_categories?: string[];
  suggested_deadline?: string;
  priority_score?: number;
  scheduling_suggestion?: string;
}
