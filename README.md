# ResumeIQ

ResumeIQ is an AI-powered resume analysis platform that helps job seekers evaluate, optimize, and improve their resumes for ATS systems and job descriptions.

## Features

### ATS Resume Analysis
- ATS score calculation
- Resume section evaluation
- Skills assessment
- Experience analysis
- Project quality scoring
- Actionable improvement suggestions

### Job Description Matching
- Compare resume against job descriptions
- Keyword extraction from JDs
- Skill gap identification
- Match percentage calculation
- Missing keyword detection
- Resume tailoring recommendations

### Resume Optimization
- Weak section detection
- Bullet point enhancement suggestions
- Keyword improvement recommendations
- Impact and metric guidance
- ATS-focused optimization insights

### Resume Parsing
- Automatic section extraction
- Skills extraction
- Project extraction
- Experience extraction
- Education parsing
- Structured resume data generation

## Tech Stack

### Frontend
- Next.js 16
- React
- TypeScript
- Tailwind CSS
- Framer Motion

### Backend
- Next.js API Routes
- JavaScript

### Resume Processing
- PDF Parsing
- Natural Language Processing
- Compromise NLP
- Natural.js

## Project Structure

```text
app/
├── api/
├── upload/
└── results/

components/
├── ats/
├── jd/
├── optimizer/
└── ui/

lib/
├── ats/
├── jd/
├── optimizer/
├── parser/
└── metrics/

services/
```

## How It Works

1. Upload a resume (PDF)
2. ResumeIQ extracts structured resume data
3. ATS scoring engine evaluates the resume
4. JD matching engine compares resume against job requirements
5. Optimizer generates actionable recommendations
6. Results are displayed in an interactive dashboard

## ATS Scoring Factors

- Resume formatting
- Skills coverage
- Project quality
- Experience quality
- Readability
- Keyword optimization

## JD Matching Factors

- Technical skills
- Experience requirements
- Project relevance
- Soft skills
- Industry keywords

## Installation

```bash
git clone https://github.com/alphasaurabh/ResumeIQ.git

cd ResumeIQ

npm install

npm run dev
```

Open:

```text
http://localhost:3000
```

## Future Improvements

- AI-powered resume rewriting
- Multi-resume comparison
- Resume version tracking
- Cover letter generation
- Industry-specific scoring
- Interview preparation suggestions
- LinkedIn profile analysis
- Advanced ATS simulation

## Author

Saurabh Chandravanshi

GitHub:
https://github.com/alphasaurabh

---

Built to help candidates create stronger resumes, improve ATS performance, and increase interview opportunities.
