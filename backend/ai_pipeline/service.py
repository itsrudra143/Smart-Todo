import google.generativeai as genai
from django.conf import settings
import json


def _get_gemini_model():
    """Helper to configure and return a Gemini model instance."""
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.5-flash")
        return model
    except Exception as e:
        print(f"Error configuring Gemini or finding model: {e}")
        return None


def get_ai_suggestions(
    task_title: str,
    task_description: str = "",
    context_entries: list = None,
    active_task_count: int = 0,
):
    """
    Analyzes task details, context, and user workload to provide AI-powered suggestions.
    """
    model = _get_gemini_model()
    if not model:
        return {"error": "Failed to configure Gemini API. Please check your API key."}

    context_lines = []
    if context_entries:
        for entry in context_entries:
            line = f"- {entry.content} (from {entry.source_type})"
            if entry.insights and isinstance(entry.insights, dict):
                sentiment = entry.insights.get("sentiment")
                keywords = entry.insights.get("keywords")
                if sentiment and sentiment != "neutral":
                    line += f" [Sentiment: {sentiment}]"
                if keywords:
                    line += f" [Keywords: {', '.join(keywords)}]"
            context_lines.append(line)
    context_str = (
        "\n".join(context_lines) if context_lines else "No additional context."
    )

    prompt = f"""
    Based on the following task, user context, and current workload, provide suggestions in JSON format.
    
    **Task Title:** {task_title}
    **Task Description:** {task_description}

    **User's Current Workload:**
    - The user currently has {active_task_count} active tasks (To Do or In Progress).

    **Context from recent notes and messages (with AI analysis):**
    {context_str}

    **Instructions:**
    1.  **Enhance Description:** Briefly improve the task description.
    2.  **Suggest Categories:** Provide up to 3 relevant categories (tags).
    3.  **Estimate Deadline:** Suggest a realistic deadline. Use a simple, relative format like "today", "tomorrow", "in 3 days", or "next Friday".
    4.  **Determine Priority:** Assign a priority score from 1 (lowest) to 5 (highest).
    5.  **Suggest Schedule:** Recommend a specific time block to work on this task (e.g., "Tomorrow morning for 2 hours", "Friday afternoon", "30 minutes before lunch today").

    **Output ONLY the following JSON structure:**
    {{
        "enhanced_description": "<your-enhanced-description>",
        "suggested_categories": ["<tag1>", "<tag2>"],
        "suggested_deadline": "<your-deadline-suggestion>",
        "priority_score": <your-priority-score>,
        "scheduling_suggestion": "<your-scheduling-suggestion>"
    }}
    """

    try:
        response = model.generate_content(prompt)
        cleaned_response_text = (
            response.text.strip().replace("```json", "").replace("```", "")
        )
        suggestions = json.loads(cleaned_response_text)
        return suggestions
    except Exception as e:
        print(f"Error during Gemini API call or JSON parsing: {e}")
        return {"error": "Failed to get suggestions from AI model."}


def analyze_context_entry(content: str):
    """
    Analyzes a piece of context to extract sentiment and keywords.
    """
    model = _get_gemini_model()
    if not model:
        return {"error": "Failed to configure Gemini API."}

    prompt = f"""
    Analyze the following text and provide its sentiment and key topics.

    Text: "{content}"

    Instructions:
    1.  **Sentiment Analysis:** Determine if the sentiment is "positive", "negative", or "neutral".
    2.  **Keyword Extraction:** Identify up to 5 of the most important keywords or topics.

    **Output ONLY the following JSON structure:**
    {{
        "sentiment": "<sentiment>",
        "keywords": ["<keyword1>", "<keyword2>"]
    }}
    """
    try:
        response = model.generate_content(prompt)
        cleaned_response_text = (
            response.text.strip().replace("```json", "").replace("```", "")
        )
        insights = json.loads(cleaned_response_text)
        return insights
    except Exception as e:
        print(f"Error during Gemini API call for context analysis: {e}")
        return {"error": "Failed to get insights from AI model."}

