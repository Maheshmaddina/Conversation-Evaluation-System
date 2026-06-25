# Prompt Log

This document records the prompts used for evaluating conversation facets using Large Language Models (LLMs).

## Prompt Templates

### 1. Zero-Shot Facet Evaluator
```
You are an expert conversation evaluator. Analyze the following turn-by-turn dialogue and rate the assistant's performance on the facet: {facet_name}.

Category: {facet_category}
Description: {facet_description}

Dialogue:
{dialogue}

Provide a score matching the definition:
{score_definition}

Explain your reasoning.
```

### 2. Few-Shot In-Context Learning Evaluator
```
Use the following examples of evaluations to score the user dialogue:
[Insert Few-Shot Examples]

Now score:
{dialogue}
```
