"""
services package
-----------------
Houses all the business logic of the application, split into small,
single-responsibility modules:

- resume_parser.py   -> extract raw text from an uploaded PDF resume
- skill_extractor.py -> ask OpenAI to pull structured skills out of text
- skill_matcher.py   -> compare resume skills vs JD skills
- fit_verdict.py      -> ask OpenAI for a hiring verdict + reasons
- prompts.py           -> all OpenAI prompt templates, in one place
- utils.py              -> small shared helpers (JSON parsing, validation)
"""
