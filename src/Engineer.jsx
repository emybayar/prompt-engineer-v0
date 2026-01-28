import React, { useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Copy,
  Check,
} from "lucide-react";

import Logo from "./assets/logo.png";

export default function Demo() {
  const [prompt, setPrompt] = useState("");
  const [userType, setUserType] = useState("jobseeker");
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [copiedImproved, setCopiedImproved] = useState(false);
  const [error, setError] = useState(null);

  const analyzePrompt = async () => {
    if (!prompt.trim()) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const systemPrompt = `You are ivee's Prompt Rewrite Engine.
Your task is to:
1. Analyze and grade the user's prompt across multiple dimensions
2. Rewrite it into an expert-level prompt using ivee's method
3. Explain the key weaknesses in a cohesive paragraph

You must return VALID JSON ONLY. No markdown. No backticks. No commentary outside the JSON.

--------------------------------
GRADING CRITERIA
--------------------------------
Evaluate the prompt on these dimensions (1-10 scale):

SPECIFICITY (1-10):
- 1-3: Extremely vague ("write something", "help me")
- 4-6: General direction but lacks concrete details
- 7-8: Clear task with some specifics
- 9-10: Precise goals, scope, constraints, and success criteria

CONTEXT (1-10):
- 1-3: No background information provided
- 4-6: Minimal context, missing key details
- 7-8: Good context, enough to understand the situation
- 9-10: Complete context with all relevant background, audience, and constraints

FORMAT (1-10):
- 1-3: No output structure specified
- 4-6: Vague format hints ("make it good")
- 7-8: Clear format expectations (length, sections, style)
- 9-10: Detailed format specification with examples or templates

HALLUCINATION_RISK:
- Low: Prompt provides enough constraints and context that AI is unlikely to invent facts
- Medium: Some ambiguity that might lead to assumptions
- High: Vague enough that AI will likely make things up or miss the mark

OVERALL_SCORE (1-10):
- Weighted average emphasizing real-world usefulness
- Consider: Will this prompt reliably produce the desired output?
- Account for: clarity, completeness, and professional applicability

--------------------------------
IVEE PROMPTING METHOD (MANDATORY)
--------------------------------
All rewritten prompts must follow these principles:
1) Clarity beats cleverness - Make the task explicit, replace vague language
2) Context precedes constraints - Background first, then rules and formatting
3) Specificity drives performance - Use concrete goals, numbers, examples, criteria
4) Structure guides outcomes - Define output format, sections, or steps explicitly
5) Professional framing - Write as instructions to a capable colleague

--------------------------------
OUTPUT SCHEMA (STRICT)
--------------------------------
Return exactly this JSON structure:
{
  "overall_score": <number 1-10>,
  "specificity_score": <number 1-10>,
  "context_score": <number 1-10>,
  "format_score": <number 1-10>,
  "hallucination_risk": "<Low|Medium|High>",
  "expert_prompt": "<rewritten prompt>",
  "whats_wrong_and_how_to_fix": "<paragraph>"
}

--------------------------------
FIELD RULES
--------------------------------
expert_prompt:
- A single, copy-paste-ready prompt
- Preserve the user's original intent
- Do NOT invent facts or assume missing information
- Include: clear task, required context/inputs, constraints, output format
- Use explicit placeholders for missing info (e.g. [JOB DESCRIPTION], [DATA])
- Must silently resolve issues identified in the analysis

whats_wrong_and_how_to_fix:
- One cohesive paragraph (2-4 sentences)
- Written for the user in plain language
- Explain main weaknesses without listing steps
- If prompt is strong, acknowledge it and explain refinements
- Must align with the scores and changes in expert_prompt

--------------------------------
SCORING GUIDELINES
--------------------------------
- Be honest and consistent in scoring
- A truly vague prompt ("write me a CV") should score 1-3 on most metrics
- An excellent prompt with context, format, and specifics should score 8-10
- Most real-world prompts will score 4-7
- Hallucination risk should directly correlate with specificity and context scores

User context: The user is using AI for ${userType === "jobseeker" ? "job hunting tasks" : "work-related tasks"}.`;

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              {
                role: "user",
                content: `Analyze and rewrite this prompt: "${prompt}"`,
              },
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const analysis = JSON.parse(data.choices[0].message.content);

      // Use AI-provided scores directly
      setResult({
        scores: {
          specificity: analysis.specificity_score || 5,
          context: analysis.context_score || 5,
          format: analysis.format_score || 5,
          hallucination: analysis.hallucination_risk || "Medium",
        },
        overall: analysis.overall_score || 5,
        improvedPrompt: analysis.expert_prompt,
        analysis: {
          issues: [analysis.whats_wrong_and_how_to_fix],
          strengths: [],
        },
      });
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message || "Failed to analyze. Check your API key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEmailSubmit = () => {
    if (email.trim() && email.includes("@")) {
      setEmailSubmitted(true);
      console.log("Email submitted:", email);
    }
  };

  const copyImprovedPrompt = () => {
    navigator.clipboard.writeText(result.improvedPrompt);
    setCopiedImproved(true);
    setTimeout(() => setCopiedImproved(false), 2000);
  };

  return (
    <div className="bg-[#25397a] font-poppins min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <img
            src={Logo}
            alt="ivee logo"
            className="h-14 w-auto mx-auto  mb-6"
          />
          {/* <div className="inline-block text-white px-4 py-1 text-sm font-bold mb-4">
            emy for ivee.
          </div> */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#e9ff70]">
            Prompt Checker
          </h1>
          <p className="text-xl text-[#ffffff]">
            Bad prompts cost you time. We'll fix them.
          </p>
        </div>

        {!result ? (
          <>
            {/* Input Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6 border border-white/20">
              <label className="block text-sm font-semibold mb-2 text-white">
                I'm using AI for:
              </label>
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setUserType("jobseeker")}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                    userType === "jobseeker"
                      ? "bg-[#e9ff70] text-[#25397A]"
                      : "bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  Job Hunting
                </button>
                <button
                  onClick={() => setUserType("employed")}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                    userType === "employed"
                      ? "bg-[#e9ff70] text-[#25397A]"
                      : "bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  Work-Related Tasks
                </button>
              </div>

              <label className="block text-sm font-semibold mb-2 text-white">
                Paste a prompt you recently used:
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  userType === "jobseeker"
                    ? "e.g., 'Write me a cover letter for a marketing position'"
                    : "e.g., 'Write a summary of this meeting brief'"
                }
                className="w-full h-40 bg-white/5 border border-white/20 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e9ff70] resize-none"
              />

              {error && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                  <strong>Error:</strong> {error}
                </div>
              )}

              <button
                onClick={analyzePrompt}
                disabled={!prompt.trim() || isAnalyzing}
                className="w-full mt-4 bg-[#e9ff70] text-black font-bold py-4 px-8 rounded-lg hover:shadow-lg hover:shadow-yellow-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? "Analysing..." : "Analyse My Prompt"}
              </button>
            </div>

            {/* Example Prompts */}
            {/* <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h3 className="font-semibold mb-3 text-white">
                Try these examples:
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setPrompt("Write me a CV")}
                  className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-all"
                >
                  "Write me a CV"
                </button>
                <button
                  onClick={() =>
                    setPrompt(
                      "Help me prepare for an interview at a tech startup",
                    )
                  }
                  className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-all"
                >
                  "Help me prepare for an interview at a tech startup"
                </button>
              </div>
            </div> */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h3 className="font-semibold mb-3 text-white">
                Try these examples:
              </h3>
              <div className="space-y-2">
                {userType === "jobseeker" ? (
                  <>
                    <button
                      onClick={() => setPrompt("Write me a CV")}
                      className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-all"
                    >
                      "Write me a CV"
                    </button>
                    <button
                      onClick={() =>
                        setPrompt(
                          "Help me prepare for an interview at a tech startup",
                        )
                      }
                      className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-all"
                    >
                      "Help me prepare for an interview at a tech startup"
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() =>
                        setPrompt("Summarise this meeting for my team")
                      }
                      className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-all"
                    >
                      "Summarise this meeting for my team"
                    </button>
                    <button
                      onClick={() =>
                        setPrompt(
                          "Create a workflow to automate my monthly reports",
                        )
                      }
                      className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-all"
                    >
                      "Create a workflow to automate my monthly reports"
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Results Section */}
            <div className="space-y-6">
              {/* Analysis */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="font-bold text-lg mb-4">
                  What's Wrong (And How to Fix It)
                </h3>

                {result.analysis.issues.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-white font-semibold">
                        Analysis:
                      </div>
                    </div>
                    <div className="ml-7 text-sm text-white">
                      {result.analysis.issues[0]}
                    </div>
                  </div>
                )}

                {result.analysis.strengths.length > 0 && (
                  <div>
                    <div className="flex items-start gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-white font-semibold">
                        What You Did Well:
                      </div>
                    </div>
                    <ul className="space-y-2 ml-7">
                      {result.analysis.strengths.map((strength, i) => (
                        <li key={i} className="text-sm text-white">
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Before/After Comparison */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="font-bold text-lg mb-4">
                  Your Prompt vs. Expert Prompt
                </h3>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm font-semibold text-red-400 mb-2">
                      ❌ Your Version
                    </div>
                    <div className="bg-black/30 rounded-lg p-4 text-sm text-white border border-red-400/30">
                      {prompt}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-green-400 mb-2">
                      ✅ Expert Version
                    </div>
                    <div className="bg-black/30 rounded-lg p-4 text-sm text-white border border-green-400/30 max-h-64 overflow-y-auto">
                      {result.improvedPrompt}
                    </div>
                  </div>
                </div>

                <button
                  onClick={copyImprovedPrompt}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold transition-all"
                >
                  {copiedImproved ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Expert Prompt
                    </>
                  )}
                </button>
              </div>
              {/* Try Another */}
              <button
                onClick={() => {
                  setResult(null);
                  setPrompt("");
                  setEmailSubmitted(false);
                  setEmail("");
                  setError(null);
                }}
                className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-semibold transition-all"
              >
                ← Try Another Prompt
              </button>
              {/* Overall Score */}
              <div className="bg-gradient-to-br from-yellow-400/20 to-orange-400/20 backdrop-blur-lg rounded-2xl p-8 border border-yellow-400/30">
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2">
                    {result.overall}
                    <span className="text-4xl text-white-300">/10</span>
                  </div>
                  <div className="text-xl text-white">
                    {result.overall < 4
                      ? "⚠️ Needs Major Improvement"
                      : result.overall < 7
                        ? "🔧 Room for Improvement"
                        : "✨ Pretty Good!"}
                  </div>
                </div>
              </div>

              {/* Individual Scores */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="text-sm text-white mb-1">Specificity</div>
                  <div className="text-3xl font-bold">
                    {result.scores.specificity}/10
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="text-sm text-white mb-1">
                    Context Provided
                  </div>
                  <div className="text-3xl font-bold">
                    {result.scores.context}/10
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="text-sm text-white mb-1">Output Format</div>
                  <div className="text-3xl font-bold">
                    {result.scores.format}/10
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="text-sm text-white mb-1">
                    Hallucination Risk
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      result.scores.hallucination === "Low"
                        ? "text-green-400"
                        : result.scores.hallucination === "Medium"
                          ? "text-yellow-400"
                          : "text-red-400"
                    }`}
                  >
                    {result.scores.hallucination}
                  </div>
                </div>
              </div>

              {/* Email Capture */}
              {/* {!emailSubmitted ? (
                <div className="bg-[#6ba9ff] backdrop-blur-lg rounded-xl p-8 border border-[#e9ff70]">
                  <div className="flex items-start gap-3 mb-4">
                    <TrendingUp className="w-6 h-6 text-[#e9ff70] flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg text-[#e9ff70] mb-2">
                        Want 50+ Expert Prompt Templates?
                      </h3>
                      <p className="text-sm text-white mb-4">
                        Access our library of proven prompts for{" "}
                        {userType === "jobseeker"
                          ? "CV writing, cover letters, interview prep, and more"
                          : "reports, emails, data analysis, and more"}
                        .
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-[#e9ff70] focus:outline-none focus:ring-2 focus:ring-[#e9ff70]"
                    />
                    <button
                      onClick={handleEmailSubmit}
                      className="cursor-pointer bg-[#e9ff70] text-black font-bold px-6 py-3 rounded-lg hover:bg-[#25397A] hover:text-white transition-all"
                    >
                      Send Templates
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-green-600/20 backdrop-blur-lg rounded-xl p-6 border border-green-400/30 text-center">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <h3 className="font-bold text-lg mb-2">Check Your Inbox!</h3>
                  <p className="text-sm text-white">
                    We've sent 50+ expert prompt templates to {email}
                  </p>
                </div>
              )} */}

              {/* CTA to Course */}
              <div className="bg-[#e9ff70] backdrop-blur-lg rounded-xl p-8 border border-purple-400/30 text-center">
                <h3 className="font-bold text-2xl text-[#25397A] mb-3">
                  Ready to Master AI Skills?
                </h3>
                <p className="text-[#25397A] mb-6">
                  Prompt engineering is just a small part of ivee's 3-week AI
                  Masterclass Series. Learn the skills that'll keep you employed
                  (or get you hired).
                </p>
                <button
                  onClick={() => {
                    window.open(
                      "https://km8e88imo76.typeform.com/to/zERKuxci",
                      "_blank",
                    );
                  }}
                  className="cursor-pointer bg-[#25397A] text-white font-bold py-4 px-8 rounded-lg hover:shadow-lg hover:shadow-yellow-400/50 transition-all"
                >
                  Become AI-fluent with ivee →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// 1. treackoing
// 2. typefporm
// 3. back buttomn higher
// promptsy promptify
// check my prompt
// move the scores lower
