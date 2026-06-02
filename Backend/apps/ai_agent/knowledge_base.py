from __future__ import annotations


NEXALEARN_KNOWLEDGE_BASE: dict[str, dict[str, dict[str, object]]] = {
    "physics": {
        "electric field": {
            "core_concept": (
                "Electric field at a point is the force experienced by a unit "
                "positive charge placed at that point."
            ),
            "formula": "E = F/q",
            "unit": "N/C",
            "common_mistakes": [
                "Multiplying force and charge instead of dividing.",
                "Writing wrong unit.",
                "Confusing electric force with electric field.",
                "Forgetting that electric field is force per unit charge.",
            ],
            "solution_pattern": (
                "Given force F and charge q, use E = F/q. Substitute the values, "
                "divide force by charge, and write the final answer with unit N/C."
            ),
            "practice_tasks": [
                "Solve 3 questions using E = F/q.",
                "Write the definition and SI unit of electric field.",
                "Create a small formula card: E = F/q, F = Eq, q = F/E.",
            ],
        },
        "pressure": {
            "core_concept": (
                "Pressure is the force acting normally per unit area of a surface."
            ),
            "formula": "P = F/A",
            "unit": "Pa",
            "common_mistakes": [
                "Multiplying force and area instead of dividing.",
                "Confusing force with pressure.",
                "Forgetting that smaller area gives greater pressure.",
            ],
            "solution_pattern": (
                "Use P = F/A. Substitute force and area carefully. If area is smaller, "
                "pressure becomes larger."
            ),
            "practice_tasks": [
                "Solve 3 numerical questions using P = F/A.",
                "Write 3 daily-life examples where pressure increases due to small area.",
            ],
        },
        "newton third law": {
            "core_concept": (
                "For every action, there is an equal and opposite reaction."
            ),
            "formula": "",
            "unit": "",
            "common_mistakes": [
                "Thinking action and reaction act on the same body.",
                "Thinking reaction happens after action.",
                "Forgetting forces are equal and opposite.",
            ],
            "solution_pattern": (
                "Identify the action force and the reaction force. They act on two "
                "different bodies and are equal in magnitude but opposite in direction."
            ),
            "practice_tasks": [
                "Write 5 examples of action-reaction pairs.",
                "Explain why a gun recoils after firing.",
            ],
        },
    },
    "chemistry": {
        "acid base": {
            "core_concept": (
                "An acid gives H+ ions in aqueous solution, while a base gives OH- ions "
                "or accepts H+ ions depending on the theory."
            ),
            "formula": "",
            "unit": "",
            "common_mistakes": [
                "Confusing acid and base properties.",
                "Forgetting examples of strong acids and bases.",
                "Writing incomplete neutralization reaction.",
            ],
            "solution_pattern": (
                "Identify whether the substance donates H+ or gives OH-. For neutralization, "
                "acid reacts with base to form salt and water."
            ),
            "practice_tasks": [
                "Write 5 acids and 5 bases.",
                "Balance 3 neutralization equations.",
            ],
        },
        "mole concept": {
            "core_concept": (
                "One mole is the amount of substance containing Avogadro's number "
                "of particles."
            ),
            "formula": "n = m/M",
            "unit": "mol",
            "common_mistakes": [
                "Confusing mass and molar mass.",
                "Forgetting units.",
                "Using multiplication instead of division.",
            ],
            "solution_pattern": (
                "Use n = m/M. Divide given mass by molar mass and write answer in mol."
            ),
            "practice_tasks": [
                "Solve 5 mole concept numericals.",
                "Make a formula triangle for n = m/M.",
            ],
        },
    },
    "biology": {
        "photosynthesis": {
            "core_concept": (
                "Photosynthesis is the process by which green plants prepare food using "
                "carbon dioxide and water in the presence of sunlight and chlorophyll."
            ),
            "formula": "6CO2 + 6H2O → C6H12O6 + 6O2",
            "unit": "",
            "common_mistakes": [
                "Forgetting chlorophyll or sunlight.",
                "Writing incomplete equation.",
                "Confusing respiration with photosynthesis.",
            ],
            "solution_pattern": (
                "Mention raw materials, conditions, products, and balanced equation."
            ),
            "practice_tasks": [
                "Draw a labeled chloroplast diagram.",
                "Write the balanced photosynthesis equation 3 times.",
            ],
        },
        "genetics": {
            "core_concept": (
                "Genetics is the study of heredity and variation in living organisms."
            ),
            "formula": "",
            "unit": "",
            "common_mistakes": [
                "Confusing gene, allele, chromosome, and trait.",
                "Wrong Punnett square setup.",
                "Confusing genotype with phenotype.",
            ],
            "solution_pattern": (
                "Identify dominant and recessive alleles, set up the Punnett square, "
                "then calculate genotype and phenotype ratios."
            ),
            "practice_tasks": [
                "Solve 3 monohybrid cross problems.",
                "Define gene, allele, genotype, and phenotype.",
            ],
        },
    },
    "math": {
        "linear equation": {
            "core_concept": (
                "A linear equation represents a straight-line relationship between variables."
            ),
            "formula": "y = mx + c",
            "unit": "",
            "common_mistakes": [
                "Wrong sign while moving terms.",
                "Confusing slope and intercept.",
                "Calculation mistake during substitution.",
            ],
            "solution_pattern": (
                "Arrange the equation, identify slope and intercept, then solve step by step."
            ),
            "practice_tasks": [
                "Solve 5 linear equations.",
                "Graph 2 equations using slope and intercept.",
            ],
        },
        "quadratic equation": {
            "core_concept": (
                "A quadratic equation is a second-degree equation of the form ax² + bx + c = 0."
            ),
            "formula": "x = (-b ± √(b² - 4ac)) / 2a",
            "unit": "",
            "common_mistakes": [
                "Wrong discriminant calculation.",
                "Forgetting ± sign.",
                "Substitution mistake in formula.",
            ],
            "solution_pattern": (
                "Identify a, b, and c. Calculate discriminant b² - 4ac, then apply the quadratic formula."
            ),
            "practice_tasks": [
                "Solve 3 quadratic equations using formula.",
                "Find discriminant for 5 equations.",
            ],
        },
    },
    "english": {
        "transition words": {
            "core_concept": (
                "Transition words show logical relationships between ideas, such as contrast, "
                "continuation, cause-result, example, sequence, and concession."
            ),
            "formula": "",
            "unit": "",
            "common_mistakes": [
                "Choosing a transition by meaning of word only.",
                "Ignoring the relationship between two ideas.",
                "Confusing contrast with continuation.",
            ],
            "solution_pattern": (
                "Read before and after the blank, summarize both ideas, name the relationship, "
                "then choose the transition that matches the logic."
            ),
            "practice_tasks": [
                "Classify 10 transition questions by relationship type.",
                "Practice contrast vs continuation examples.",
            ],
        },
        "vocabulary in context": {
            "core_concept": (
                "Vocabulary-in-context questions ask for the meaning of a word based on how it is used in the sentence."
            ),
            "formula": "",
            "unit": "",
            "common_mistakes": [
                "Choosing the common meaning instead of the contextual meaning.",
                "Looking at answer choices before predicting meaning.",
                "Ignoring tone and clue words.",
            ],
            "solution_pattern": (
                "Read the full sentence, cover choices, predict simple meaning, then match the closest option."
            ),
            "practice_tasks": [
                "Solve 10 vocabulary-in-context questions using prediction before options.",
            ],
        },
    },
}


INTEREST_EXPLANATION_TEMPLATES: dict[str, str] = {
    "anime": (
        "Think of {topic} like an anime power system. A character's ability works only "
        "when the correct rule is used. In the same way, this concept becomes easier "
        "when you identify the rule and apply it step by step."
    ),
    "cricket": (
        "Think of {topic} like cricket strategy. A batter first reads the ball, then "
        "chooses the correct shot. Similarly, first identify the given information, "
        "then choose the correct formula or concept."
    ),
    "gaming": (
        "Think of {topic} like a game level. To clear a level, you need the right skill "
        "at the right time. Here, the formula or concept is that skill."
    ),
    "movies": (
        "Think of {topic} like a movie scene. A scene makes sense only when you understand "
        "cause and effect. In this topic, every given value has a role in the final answer."
    ),
    "real_life": (
        "Connect {topic} to a real-life situation. First understand what is given, decide "
        "which rule applies, and then solve it step by step."
    ),
    "textbook": (
        "Use textbook style: write the definition, formula or concept, substitution, "
        "calculation, final answer, and unit where required."
    ),
}


CLASS_LEVEL_TEMPLATES: dict[str, str] = {
    "6": "Use very simple language and daily-life examples.",
    "7": "Use simple explanation, examples, and short steps.",
    "8": "Use concept explanation with easy examples.",
    "9": "Use school-level explanation with formula and example.",
    "10": "Use SEE-focused explanation with definition, formula, and example.",
    "SEE": "Use SEE-focused explanation with definition, formula, and exam style.",
    "11": "Use exam-focused explanation with formula, substitution, and reasoning.",
    "12": "Use NEB-style explanation with definition, formula, steps, unit, and conclusion.",
    "NEB": "Use NEB-style explanation with definition, formula, steps, unit, and conclusion.",
    "SAT": "Use test-prep strategy, evidence, elimination, and trap analysis.",
    "IELTS": "Use language-skill feedback, clarity, grammar, and improvement task.",
    "PTE": "Use test-skill feedback, fluency, grammar, and practice task.",
}
