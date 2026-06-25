# Evaluation Interview Questions

Key review questions for aligning the evaluation framework with developer and business goals.

### 1. How do we prevent evaluator model bias?
* **Answer**: By implementing temperature-0 deterministic prompting, performing dual-model consensus checks, and setting clear, constrained score rubrics.

### 2. Why use a hybrid retrieval system for facets?
* **Answer**: Combined semantic embeddings and tag keyword filtering ensure relevant facets are found even when terminology differs.

### 3. What is the role of confidence thresholds?
* **Answer**: Facets with score confidence below the threshold (e.g., 0.85) are flagged for human review.
