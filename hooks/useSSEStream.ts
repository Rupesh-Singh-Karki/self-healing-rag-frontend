"use client";

import { useState, useCallback, useRef } from "react";
import { Chunk, CriticResult, TraceStep } from "@/types";
import { MOCK_CHUNKS, MOCK_CRITIC } from "@/lib/mock-data";

// Simulated answer tokens for a successful response
const SUCCESS_TOKENS =
  "Full-time employees receive 20 days of paid time off per calendar year, accruing at 1.67 days per month. You can carry over up to 10 unused days into the following year. Requests must be submitted at least 5 business days in advance via the HR portal.".split(
    " "
  );

// Simulated answer tokens for a refused response
const REFUSED_TOKENS =
  "I could not find sufficient evidence in the indexed documents to answer this question confidently. Please try rephrasing, or ensure the relevant document has been uploaded.".split(
    " "
  );

interface UseSSEStreamReturn {
  ask: (question: string) => void;
  answer: string;
  chunks: Chunk[];
  trace: TraceStep[];
  critic: CriticResult | null;
  status: "idle" | "streaming" | "done" | "error";
  activeNode: string | null;
  reset: () => void;
}

export function useSSEStream(): UseSSEStreamReturn {
  const [answer, setAnswer] = useState("");
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [trace, setTrace] = useState<TraceStep[]>([]);
  const [critic, setCritic] = useState<CriticResult | null>(null);
  const [status, setStatus] = useState<
    "idle" | "streaming" | "done" | "error"
  >("idle");
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const abortRef = useRef(false);

  const reset = useCallback(() => {
    setAnswer("");
    setChunks([]);
    setTrace([]);
    setCritic(null);
    setStatus("idle");
    setActiveNode(null);
    abortRef.current = false;
  }, []);

  const delay = (ms: number) =>
    new Promise<void>((resolve) => {
      setTimeout(resolve, ms);
    });

  const ask = useCallback(
    async (question: string) => {
      // Reset state
      setAnswer("");
      setChunks([]);
      setTrace([]);
      setCritic(null);
      setStatus("streaming");
      setActiveNode(null);
      abortRef.current = false;

      const shouldRefuse =
        question.toLowerCase().includes("parental") ||
        question.toLowerCase().includes("retirement");

      try {
        // ─── Phase 1: Retrieve ───
        await delay(300);
        if (abortRef.current) return;
        setTrace([{ node: "retrieve", status: "started" }]);
        setActiveNode("retrieve");

        await delay(800);
        if (abortRef.current) return;
        setTrace([{ node: "retrieve", status: "done" }]);
        setChunks(shouldRefuse ? [] : MOCK_CHUNKS);

        // ─── Phase 2: Generate ───
        await delay(200);
        if (abortRef.current) return;
        setTrace((prev) => [...prev, { node: "generate", status: "started" }]);
        setActiveNode("generate");

        // Stream tokens
        const tokens = shouldRefuse ? REFUSED_TOKENS : SUCCESS_TOKENS;
        let accumulated = "";
        for (let i = 0; i < tokens.length; i++) {
          if (abortRef.current) return;
          accumulated += (i === 0 ? "" : " ") + tokens[i];
          setAnswer(accumulated);
          await delay(50);
        }

        await delay(200);
        if (abortRef.current) return;
        setTrace((prev) =>
          prev.map((s) =>
            s.node === "generate" && s.status === "started"
              ? { ...s, status: "done" }
              : s
          )
        );

        // ─── Phase 3: Critic ───
        await delay(300);
        if (abortRef.current) return;
        setTrace((prev) => [...prev, { node: "critic", status: "started" }]);
        setActiveNode("critic");

        await delay(500);
        if (abortRef.current) return;
        setTrace((prev) =>
          prev.map((s) =>
            s.node === "critic" && s.status === "started"
              ? { ...s, status: "done" }
              : s
          )
        );

        if (shouldRefuse) {
          // ─── Retry cycle ───
          const criticResultBad: CriticResult = {
            score: 0.42,
            grounded: false,
            issues: ["missing_evidence", "unsupported_claims"],
          };
          setCritic(criticResultBad);

          // Rewrite
          await delay(300);
          if (abortRef.current) return;
          setTrace((prev) => [
            ...prev,
            { node: "rewrite", status: "started" },
          ]);
          setActiveNode("rewrite");

          await delay(400);
          if (abortRef.current) return;
          setTrace((prev) =>
            prev.map((s, i) =>
              i === prev.length - 1 ? { ...s, status: "done" } : s
            )
          );

          // Second retrieve
          await delay(200);
          if (abortRef.current) return;
          setTrace((prev) => [
            ...prev,
            { node: "retrieve", status: "started" },
          ]);
          setActiveNode("retrieve");

          await delay(600);
          if (abortRef.current) return;
          setTrace((prev) =>
            prev.map((s, i) =>
              i === prev.length - 1 ? { ...s, status: "done" } : s
            )
          );

          // Second generate
          await delay(200);
          if (abortRef.current) return;
          setTrace((prev) => [
            ...prev,
            { node: "generate", status: "started" },
          ]);
          setActiveNode("generate");

          await delay(400);
          if (abortRef.current) return;
          setTrace((prev) =>
            prev.map((s, i) =>
              i === prev.length - 1 ? { ...s, status: "done" } : s
            )
          );

          // Second critic
          await delay(300);
          if (abortRef.current) return;
          setTrace((prev) => [
            ...prev,
            { node: "critic", status: "started" },
          ]);
          setActiveNode("critic");

          await delay(500);
          if (abortRef.current) return;
          setTrace((prev) =>
            prev.map((s, i) =>
              i === prev.length - 1 ? { ...s, status: "done" } : s
            )
          );

          // Refuse
          await delay(200);
          if (abortRef.current) return;
          setTrace((prev) => [
            ...prev,
            { node: "refuse", status: "started" },
          ]);
          setActiveNode("refuse");

          await delay(300);
          if (abortRef.current) return;
          setTrace((prev) =>
            prev.map((s, i) =>
              i === prev.length - 1 ? { ...s, status: "done" } : s
            )
          );

          setCritic({
            score: 0.28,
            grounded: false,
            issues: ["missing_evidence"],
          });
          setActiveNode(null);
          setStatus("done");
        } else {
          // ─── Success ───
          setCritic(MOCK_CRITIC);
          setActiveNode(null);
          setStatus("done");
        }
      } catch {
        setStatus("error");
        setActiveNode(null);
      }
    },
    []
  );

  return {
    ask,
    answer,
    chunks,
    trace,
    critic,
    status,
    activeNode,
    reset,
  };
}
