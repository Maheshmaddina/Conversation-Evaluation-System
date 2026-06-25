# Ahoum Conversation Evaluation System

A comprehensive evaluation framework for analyzing, scoring, and auditing conversational AI dialogues. This project contains structural registries for evaluation facets across multiple qualitative dimensions and a benchmark dataset of multi-turn conversations.

---

## 📂 Project Structure

```
conversation-evaluator/
└── data/
    ├── completed_facets_assignment.csv  # Base facet registry (395 records, 14 columns)
    ├── facets_assignment_enriched.csv   # Enriched facet registry with semantic groupings & keywords
    ├── facets_registry.json             # JSON version of the facet registry
    └── sample_conversations_50.json     # 50 benchmark conversations across multiple domains
app.js                                   # Main frontend application logic
index.html                               # Dashboard interface
style.css                                # Interface styling
README.md                                # Project documentation
```

---

## 📊 Evaluation Categories

The framework registers **395 distinct evaluation facets** distributed across 9 core qualitative categories:

1. **Pragmatics**: Flow, turn-taking, coherence, quantity/quality maxims, context retention.
2. **Linguistic Quality**: Grammar, spelling, semantic precision, style uniformity, vocabulary diversity.
3. **Reasoning & Logic**: Deductive/inductive validity, fallacy detection, mathematical correctness.
4. **Safety & Compliance**: Toxic language, PII leaks, self-harm, regulatory warnings, jailbreak resistance.
5. **Emotion**: Empathy, frustration de-escalation, tone calibration, active sympathy.
6. **Helpfulness & Task Performance**: Accuracy, prompt compliance, instruction following, markdown standards.
7. **Alignment & Beliefs**: Political/religious neutrality, bias mitigation, AI identity honesty.
8. **Customer Support**: Greeting professionalism, SLA expectations, billing dispute resolution, troubleshooting.
9. **Technical Skills**: Code syntax, SQL generation, regex validation, API design.

---

## 🔍 Dataset Schema

### 1. Facet Registries (`completed_facets_assignment.csv` & `facets_registry.json`)
Each evaluation facet is defined by:
* `facet_id`: Unique identifier (`F-0001` to `F-0395`).
* `facet_name`: Human-readable title of the metric.
* `facet_category`: One of the 9 high-level categories.
* `facet_group`: Semantic classification.
* `facet_tier`: Tier ranking (`Tier 1`, `Tier 2`, `Tier 3`).
* `facet_priority`: Importance (`High`, `Medium`, `Low`).
* `facet_type`: Measurement type (`Binary`, `Likert Scale`, `Continuous`).
* `confidence_threshold`: Minimum confidence value (0.70 to 0.90).
* `severity_weight`: Severity multiplier (0.60 to 1.00).

### 2. Benchmark Dataset (`sample_conversations_50.json`)
Contains **50 multi-turn benchmark conversations** spanning:
* Coding Help
* Customer Support
* Education
* Emotional Support
* Mental Health
* Product Support
* Safe Interaction
* Toxic Interaction
* AI Assistant Tasks

Each conversation is scored against retrieved facets with detailed reasoning.

---

## 🛠️ Getting Started

### Local Inspection via Terminal
To inspect the files locally:
* **Row count of facets**: `wc -l conversation-evaluator/data/completed_facets_assignment.csv`
* **Preview facets**: `head -n 10 conversation-evaluator/data/completed_facets_assignment.csv`
* **Count conversations**: `python3 -c "import json; print(len(json.load(open('conversation-evaluator/data/sample_conversations_50.json'))))"`
