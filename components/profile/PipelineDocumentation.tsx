import {
  FileText,
  LayoutGrid,
  Database,
  Sparkles,
  Microscope,
  RefreshCcw,
} from "lucide-react";
export default function PipelineDocumentation() {
  const steps = [
    {
      id: "1",
      title: "Upload Document",
      description: "PDFs are uploaded and text is extracted.",
      icon: <FileText size={18} />,
    },
    {
      id: "2",
      title: "Chunking",
      description: "Text is broken into semantic blocks for precision.",
      icon: <LayoutGrid size={18} />,
    },
    {
      id: "3",
      title: "Vector Retrieval",
      description: "Embeddings are used to find relevant context.",
      icon: <Database size={18} />,
    },
    {
      id: "4",
      title: "LLM Generation",
      description: "AI model drafts an answer based on retrieved context.",
      icon: <Sparkles size={18} />,
    },
    {
      id: "5",
      title: "Critique",
      description: "Answer is evaluated for confidence and accuracy.",
      icon: <Microscope size={18} />,
    },
  ];
  return (
    <div className="px-6 py-5">
      <div className="mb-6">
        <h3
          className="font-display text-[18px] font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Self-Healing RAG Pipeline
        </h3>
        <p
          className="mt-1 font-body text-[13px]"
          style={{ color: "var(--text-secondary)" }}
        >
          How Eidos processes documents and ensures high-confidence answers.
        </p>
      </div>
      <div className="relative border-l-2 ml-4" style={{ borderColor: "var(--bg-border)" }}>
        {steps.map((step, index) => (
          <div key={step.id} className="relative mb-8 pl-6 last:mb-0">
            {/* Connection Node */}
            <div
              className="absolute left-[-11px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--accent)",
                color: "var(--accent)",
              }}
            >
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "var(--accent)" }}
              />
            </div>
            <div
              className="rounded-xl border p-4 transition-colors duration-200"
              style={{
                backgroundColor: "var(--bg-raised)",
                borderColor: "var(--bg-border)",
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: "var(--accent-dim)",
                    color: "var(--accent)",
                  }}
                >
                  {step.icon}
                </div>
                <h4
                  className="font-display text-[15px] font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {step.id}. {step.title}
                </h4>
              </div>
              <p
                className="font-body text-[13px] ml-11"
                style={{ color: "var(--text-muted)" }}
              >
                {step.description}
              </p>
            </div>
            {/* Self-Healing Loop for the Critique step */}
            {index === steps.length - 1 && (
              <div className="mt-6 flex items-center gap-3 pl-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: "var(--status-warn)",
                    color: "var(--bg-surface)",
                  }}
                >
                  <RefreshCcw size={16} />
                </div>
                <div>
                  <h4
                    className="font-display text-[14px] font-medium"
                    style={{ color: "var(--status-warn)" }}
                  >
                    Self-Healing Loop
                  </h4>
                  <p
                    className="font-body text-[12px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    If confidence is low, the system loops back to retrieval.
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
