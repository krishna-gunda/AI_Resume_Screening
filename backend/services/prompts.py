"""
prompts.py
----------
Every prompt sent to OpenAI lives in this file. Keeping prompts in one
place makes them easy to review, version, and tweak without touching
business logic elsewhere.

All prompts explicitly ask OpenAI to return ONLY raw JSON (no markdown
fences, no commentary) so the response can be parsed directly.
"""

SKILL_EXTRACTION_PROMPT = """You are an expert technical recruiter and skills-extraction engine.

Read the text below and extract ONLY concrete, technical, hireable skills.
This includes programming languages, frameworks, libraries, databases,
cloud platforms, tools, and well-known technical methodologies
(e.g. "REST APIs", "CI/CD", "Agile").

Do NOT include:
- Soft skills (e.g. "communication", "teamwork")
- Job titles, company names, or degrees
- Vague or non-technical phrases

Rules:
- Return skill names in their common, properly capitalized form
  (e.g. "JavaScript" not "javascript").
- Do NOT invent skills that are not present in the text.
- De-duplicate skills.
- Return STRICT JSON ONLY. No markdown fences, no explanations, no extra text.

Return exactly this JSON shape:
{{
  "skills": ["Skill1", "Skill2", "Skill3"]
}}

TEXT TO ANALYZE:
\"\"\"
{text}
\"\"\"
"""


VERDICT_PROMPT = """You are a senior technical hiring manager evaluating a candidate
for a specific job opening.

Resume Skills: {resume_skills}
Job Description Skills: {jd_skills}
Matched Skills: {matched_skills}
Missing Skills: {missing_skills}
Match Percentage: {match_percentage}%

Based strictly on this skill overlap, decide a hiring verdict and explain it.

Verdict rules:
- "Qualified"     -> match percentage is high and few/no critical skills missing
- "Almost There"  -> solid overlap but some meaningful gaps remain
- "Not Yet"       -> match percentage is low or major gaps remain

Return STRICT JSON ONLY, no markdown fences, no extra text, in exactly this shape:
{{
  "verdict": "Qualified" | "Almost There" | "Not Yet",
  "reasons": ["reason one", "reason two", "reason three"]
}}

Requirements for "reasons":
- Return EXACTLY three reasons.
- Each reason must be a short, specific, plain-English sentence.
- At least one reason should reference a concrete matched skill (if any exist).
- At least one reason should reference a concrete missing skill (if any exist).
"""
