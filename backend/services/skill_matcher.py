"""
skill_matcher.py
-----------------
Pure logic (no AI calls) that compares two skill lists — resume skills
vs job-description skills — and produces matched/missing/extra sets
plus a match percentage.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from services.utils import normalize_skill


@dataclass
class MatchResult:
    """Result of comparing resume skills against job description skills."""

    matched_skills: list[str] = field(default_factory=list)
    missing_skills: list[str] = field(default_factory=list)
    extra_skills: list[str] = field(default_factory=list)
    match_percentage: int = 0

    def to_dict(self) -> dict:
        return {
            "matchedSkills": self.matched_skills,
            "missingSkills": self.missing_skills,
            "extraSkills": self.extra_skills,
            "matchPercentage": self.match_percentage,
        }


def match_skills(resume_skills: list[str], jd_skills: list[str]) -> MatchResult:
    """Compare resume skills against job-description skills.

    Matching is case-insensitive and whitespace-normalized, but the
    ORIGINAL casing from the job description / resume is preserved in
    the output for a nicer UI.

    Formula (as specified):
        match_percentage = (matched_skills / jd_skills) * 100, rounded.
        If the JD has zero skills, match_percentage is 0.

    Args:
        resume_skills: Skills extracted from the candidate's resume.
        jd_skills: Skills extracted from the job description.

    Returns:
        A MatchResult with matched, missing, extra skills, and match %.
    """
    resume_lookup = {normalize_skill(s): s for s in resume_skills}
    jd_lookup = {normalize_skill(s): s for s in jd_skills}

    resume_keys = set(resume_lookup.keys())
    jd_keys = set(jd_lookup.keys())

    matched_keys = resume_keys & jd_keys
    missing_keys = jd_keys - resume_keys
    extra_keys = resume_keys - jd_keys

    matched_skills = [jd_lookup[k] for k in matched_keys]
    missing_skills = [jd_lookup[k] for k in missing_keys]
    extra_skills = [resume_lookup[k] for k in extra_keys]

    # Sort alphabetically for stable, predictable UI output.
    matched_skills.sort(key=str.lower)
    missing_skills.sort(key=str.lower)
    extra_skills.sort(key=str.lower)

    if jd_keys:
        match_percentage = round((len(matched_keys) / len(jd_keys)) * 100)
    else:
        match_percentage = 0

    return MatchResult(
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        extra_skills=extra_skills,
        match_percentage=match_percentage,
    )
