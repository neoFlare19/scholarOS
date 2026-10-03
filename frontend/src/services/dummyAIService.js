/** Demo topic service for the Research Papers module. */

/**
 * Simulate AI processing time.
 *
 * @param {number} ms
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate dummy AI research recommendations.
 *
 * @returns {Promise<Array>}
 */
export async function getTrendingTopics() {
  // Simulate AI processing
  await delay(800);

  return [
    {
      id: 1,
      title: "Federated Climate Modeling",
      description:
        "Collaborative machine learning approaches for analyzing climate data while preserving data privacy.",
      researchArea: "Machine Learning",
      trend: "+42%",
      trendLabel: "Hot",
      keywords: [
        "Federated Learning",
        "Climate AI",
        "Climate Modeling",
      ],
    },
    {
      id: 2,
      title: "Post-Quantum Identity Systems",
      description:
        "Emerging approaches for protecting digital identity systems against future quantum computing threats.",
      researchArea: "Cybersecurity",
      trend: "+31%",
      trendLabel: "Rising",
      keywords: [
        "Post-Quantum Cryptography",
        "Digital Identity",
        "Security",
      ],
    },
    {
      id: 3,
      title: "Multimodal Diagnostic AI",
      description:
        "AI systems combining multiple types of medical data to improve diagnostic support and clinical research.",
      researchArea: "Health Informatics",
      trend: "+27%",
      trendLabel: "Rising",
      keywords: [
        "Multimodal AI",
        "Medical Imaging",
        "Diagnostics",
      ],
    },
    {
      id: 4,
      title: "Cross-Lab Knowledge Graphs",
      description:
        "Knowledge graph approaches for connecting datasets, researchers, and findings across research institutions.",
      researchArea: "Research Systems",
      trend: "+18%",
      trendLabel: "Rising",
      keywords: [
        "Knowledge Graphs",
        "Research Collaboration",
        "Data Integration",
      ],
    },
  ];
}