"use client";
import { X, BookOpen, Clock, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

interface MicroCourseStep {
  title?: string;
  durationSec: number;
  content?: string;
  example?: string;
  resources?: string[];
}

interface MicroCourseData {
  microCourseId?: string;
  problemType?: string;
  summary?: string;
  steps: MicroCourseStep[];
  disclaimer?: string;
}

interface MicroCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseData: MicroCourseData | null;
  isLoading?: boolean;
}

export default function MicroCourseModal({ isOpen, onClose, courseData, isLoading }: MicroCourseModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) setCurrentStep(0);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-lg border border-border bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-primary" />
            <h2 className="font-display text-lg font-semibold">AI Learning Guide</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 140px)" }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : courseData ? (
            <>
              {/* Problem Type Badge */}
              {courseData.problemType && (
                <div className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
                  <span className="font-mono text-xs font-semibold text-primary">
                    {courseData.problemType.toUpperCase()}
                  </span>
                </div>
              )}

              {/* Summary */}
              {courseData.summary && (
                <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <p className="text-sm text-foreground/80">{courseData.summary}</p>
                </div>
              )}

              {/* Steps Navigation */}
              {courseData.steps.length > 1 && (
                <div className="mb-6 flex gap-2">
                  {courseData.steps.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentStep(idx)}
                      className={`flex-1 rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                        idx === currentStep
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-white text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      Step {idx + 1}
                    </button>
                  ))}
                </div>
              )}

              {/* Current Step */}
              {courseData.steps[currentStep] && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-semibold">
                      {courseData.steps[currentStep].title}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock size={14} />
                      <span>{courseData.steps[currentStep].durationSec}s</span>
                    </div>
                  </div>

                  {courseData.steps[currentStep].content && (
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <p className="text-sm leading-relaxed text-foreground/80">
                        {courseData.steps[currentStep].content}
                      </p>
                    </div>
                  )}

                  {courseData.steps[currentStep].example && (
                    <div className="rounded-lg border border-success/20 bg-success/5 p-4">
                      <div className="mb-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-success">
                        EXAMPLE
                      </div>
                      <p className="text-sm text-foreground/80">
                        {courseData.steps[currentStep].example}
                      </p>
                    </div>
                  )}

                  {courseData.steps[currentStep].resources && courseData.steps[currentStep].resources!.length > 0 && (
                    <div className="rounded-lg border border-border bg-white p-4">
                      <div className="mb-3 font-mono text-[10px] font-semibold tracking-[0.2em] text-muted-foreground">
                        LEARNING RESOURCES
                      </div>
                      <ul className="space-y-2">
                        {courseData.steps[currentStep].resources!.map((resource, idx) => {
                          // Check if resource is a URL
                          const isUrl = resource.startsWith('http://') || resource.startsWith('https://');
                          
                          // Extract domain for display (e.g., "arxiv.org", "MIT OCW")
                          let displayName = resource;
                          if (isUrl) {
                            try {
                              const url = new URL(resource);
                              const hostname = url.hostname.replace('www.', '');
                              
                              // Map domains to readable names
                              const domainMap: Record<string, string> = {
                                'arxiv.org': 'arXiv',
                                'dl.acm.org': 'ACM Digital Library',
                                'ieeexplore.ieee.org': 'IEEE Xplore',
                                'ocw.mit.edu': 'MIT OpenCourseWare',
                                'en.wikipedia.org': 'Wikipedia',
                                'geeksforgeeks.org': 'GeeksforGeeks',
                              };
                              
                              displayName = domainMap[hostname] || hostname;
                            } catch (e) {
                              displayName = resource;
                            }
                          }
                          
                          return (
                            <li key={idx} className="flex items-start gap-2">
                              {isUrl ? (
                                <a
                                  href={resource}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex items-center gap-1.5 text-sm text-primary underline decoration-primary/30 hover:text-[#C62828] hover:decoration-[#C62828] transition-colors"
                                >
                                  <ExternalLink size={14} className="flex-shrink-0 mt-0.5" />
                                  <span className="break-all">{displayName}</span>
                                </a>
                              ) : (
                                <span className="flex items-center gap-1.5 text-sm text-foreground/80">
                                  <span className="text-primary">•</span>
                                  {resource}
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Disclaimer */}
              {courseData.disclaimer && (
                <div className="mt-6 rounded-lg border border-[var(--warning)]/30 bg-[var(--warning)]/10 p-3">
                  <p className="text-xs text-muted-foreground">{courseData.disclaimer}</p>
                </div>
              )}

              {/* Navigation Buttons */}
              {courseData.steps.length > 1 && (
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                    disabled={currentStep === 0}
                    className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentStep((prev) => Math.min(courseData.steps.length - 1, prev + 1))}
                    disabled={currentStep === courseData.steps.length - 1}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-[#C62828] disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <p>Unable to load learning guide. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
