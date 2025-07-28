// Mindmap data structure for CBSE Commerce Big picture
const mindmapData = {
  label: "CBSE Commerce Big picture",
  children: [
    {
      label: "KnowledgeCompass",
      children: [
        { label: "Short story" },
        { label: "Long Story" }
      ]
    },
    {
      label: "Accountancy",
      children: [
        { label: "Partnership" },
        { label: "Companies" },
        { label: "Financial Statements" },
        { label: "Cashflow Statement" }
      ]
    },
    {
      label: "Business Studies",
      children: [
        { label: "Principles and functions of Management" },
        { label: "Business Finance and Marketing" }
      ]
    },
    {
      label: "Economics",
      children: [
        { label: "Macro Economics" },
        { label: "Indian Economy" }
      ]
    }
  ]
};

// Export for UI usage
window.mindmapData = mindmapData;
