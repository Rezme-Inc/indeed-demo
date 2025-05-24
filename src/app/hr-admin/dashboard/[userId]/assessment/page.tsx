"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { useState } from "react";

interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  dependsOn?: {
    id: string;
    value: string;
  };
  context?: string;
  guidelines?: string[];
  helpText?: string;
  warning?: string;
}

export default function AssessmentPage({
  params,
}: {
  params: { userId: string };
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");

  const questions: AssessmentQuestion[] = [
    {
      id: "conditional_offer",
      question:
        "Has a conditional offer of employment been made to the candidate?",
      options: ["Yes", "No"],
      context:
        "Before conducting a criminal history assessment, employers must first make a conditional offer of employment to the candidate.",
      guidelines: [
        "The offer must be in writing",
        "The offer must be contingent only on the criminal history assessment",
        "The offer must include the job title, salary, and start date",
      ],
      helpText:
        "A conditional offer is a formal job offer that is contingent upon the successful completion of the criminal history assessment.",
      warning:
        "Without a conditional offer, you cannot proceed with the assessment.",
    },
    {
      id: "criminal_history",
      question: "Does the candidate have a criminal history?",
      options: ["Yes", "No"],
      dependsOn: { id: "conditional_offer", value: "Yes" },
      context:
        "Criminal history includes any record of arrests, charges, or convictions.",
      guidelines: [
        "Only consider convictions that have not been sealed, expunged, or statutorily eradicated",
        "Do not consider arrests that did not result in conviction",
        "Do not consider participation in diversion programs",
      ],
      helpText:
        "Criminal history refers to any past convictions that have not been legally expunged or sealed.",
      warning:
        "Be thorough in your review of the candidate's criminal history.",
    },
    {
      id: "conviction_type",
      question: "If yes, what type of conviction?",
      options: ["Felony", "Misdemeanor", "Infraction"],
      dependsOn: { id: "criminal_history", value: "Yes" },
      context:
        "The type of conviction can affect how it is evaluated in the assessment process.",
      guidelines: [
        "Felonies are the most serious type of conviction",
        "Misdemeanors are less serious than felonies",
        "Infractions are the least serious type of conviction",
      ],
      helpText:
        "The severity of the conviction type helps determine the level of consideration needed.",
    },
    {
      id: "conviction_age",
      question: "How old is the conviction?",
      options: [
        "Less than 1 year",
        "1-3 years",
        "3-5 years",
        "More than 5 years",
      ],
      dependsOn: { id: "criminal_history", value: "Yes" },
      context:
        "The age of the conviction is an important factor in the assessment.",
      guidelines: [
        "More recent convictions may require additional consideration",
        "Older convictions may be less relevant to current job performance",
        "Consider the nature of the conviction in relation to its age",
      ],
      helpText:
        "The time elapsed since the conviction can indicate rehabilitation and reduced risk.",
    },
    {
      id: "job_related",
      question: "Is the conviction directly related to the job?",
      options: ["Yes", "No"],
      dependsOn: { id: "criminal_history", value: "Yes" },
      context:
        "A conviction is directly related to the job if it has a direct and specific negative bearing on the candidate's ability to perform the job duties.",
      guidelines: [
        "Consider the nature of the conviction",
        "Evaluate the job duties and responsibilities",
        "Assess the potential risk to others",
      ],
      helpText:
        "Job-relatedness is a key factor in determining if a conviction should affect employment.",
      warning:
        "Carefully evaluate the relationship between the conviction and job duties.",
    },
    {
      id: "rehabilitation",
      question: "Has the candidate shown evidence of rehabilitation?",
      options: ["Yes", "No", "Not Applicable"],
      dependsOn: { id: "criminal_history", value: "Yes" },
      context:
        "Evidence of rehabilitation can include various factors that demonstrate the candidate's efforts to move forward positively.",
      guidelines: [
        "Consider completion of probation or parole",
        "Look for evidence of good conduct",
        "Evaluate efforts at rehabilitation",
        "Consider character references",
      ],
      helpText:
        "Rehabilitation shows the candidate's commitment to positive change.",
    },
    {
      id: "time_elapsed",
      question: "Has sufficient time elapsed since the conviction?",
      options: ["Yes", "No", "Not Applicable"],
      dependsOn: { id: "criminal_history", value: "Yes" },
      context:
        "The amount of time that has passed since the conviction is an important consideration.",
      guidelines: [
        "Consider the nature and severity of the conviction",
        "Evaluate the candidate's conduct since the conviction",
        "Assess the relevance of the conviction to the current time",
      ],
      helpText:
        "Time elapsed can indicate reduced risk and successful rehabilitation.",
    },
  ];

  const handleAnswer = (questionId: string, answer: string) => {
    console.log("Setting answer:", questionId, answer);
    setAnswers((prev) => {
      const newAnswers = { ...prev, [questionId]: answer };
      console.log("New answers state:", newAnswers);
      return newAnswers;
    });
  };

  const handleNext = () => {
    console.log("Moving to next step from:", currentStep);
    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Determine decision based on answers
    let decision = "proceed";
    let reason = "";

    if (answers.conditional_offer !== "Yes") {
      decision = "review";
      reason = "Conditional offer must be made before assessment";
    } else if (answers.criminal_history === "Yes") {
      if (
        answers.conviction_type === "Felony" &&
        answers.conviction_age === "Less than 1 year"
      ) {
        decision = "review";
        reason = "Recent felony conviction";
      } else if (answers.job_related === "Yes") {
        decision = "review";
        reason = "Conviction directly related to job";
      } else if (answers.rehabilitation === "No") {
        decision = "review";
        reason = "No evidence of rehabilitation";
      } else if (answers.time_elapsed === "No") {
        decision = "review";
        reason = "Insufficient time elapsed since conviction";
      }
    }

    // Log results and redirect
    console.log("Assessment completed:", { decision, reason, answers, notes });
    window.location.href = "/hr-admin/dashboard";
  };

  const currentQuestion = questions[currentStep - 1];
  console.log("Current question:", currentQuestion);
  console.log("Current step:", currentStep);
  console.log("Current answers:", answers);

  const showQuestion =
    !currentQuestion.dependsOn ||
    answers[currentQuestion.dependsOn.id] === currentQuestion.dependsOn.value;

  const canGoNext =
    currentStep < questions.length && answers[currentQuestion.id];
  const canGoBack = currentStep > 1;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            LA Fair Chance Initiative Assessment
          </h1>
          <p className="text-gray-600">
            Step {currentStep} of {questions.length}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Questions */}
          <Card className="bg-white shadow-lg border-0">
            <div className="p-8">
              <div className="space-y-8">
                {showQuestion ? (
                  <>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">
                        {currentQuestion.question}
                      </h3>
                      <div className="space-y-4">
                        {currentQuestion.options.map((option) => (
                          <div
                            key={option}
                            className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors cursor-pointer"
                            onClick={() =>
                              handleAnswer(currentQuestion.id, option)
                            }
                          >
                            <input
                              type="radio"
                              name={currentQuestion.id}
                              value={option}
                              checked={answers[currentQuestion.id] === option}
                              onChange={() => {}}
                              className="h-5 w-5 text-blue-600"
                            />
                            <Label className="text-lg cursor-pointer text-gray-900">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-6">
                      <Button
                        onClick={handleBack}
                        disabled={!canGoBack}
                        className="flex items-center space-x-2 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                        <span>Back</span>
                      </Button>

                      {currentStep === questions.length ? (
                        <Button
                          onClick={handleComplete}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 px-8 rounded-lg transition-colors"
                        >
                          Complete Assessment
                        </Button>
                      ) : (
                        <Button
                          onClick={handleNext}
                          disabled={!canGoNext}
                          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span>Next</span>
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      )}
                    </div>

                    {currentStep === questions.length && (
                      <div className="space-y-6 mt-8">
                        <h3 className="text-xl font-semibold text-gray-900">
                          Additional Notes
                        </h3>
                        <Textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add any additional notes about the assessment..."
                          className="min-h-[150px] text-lg p-4 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-6">
                      No further questions based on previous answers.
                    </p>
                    <Button
                      onClick={handleComplete}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 px-8 rounded-lg transition-colors"
                    >
                      Complete Assessment
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Right Panel - Context and Guidelines */}
          <Card className="bg-white shadow-lg border-0">
            <div className="p-8">
              <div className="space-y-8">
                <div className="flex items-center space-x-2 text-blue-600 mb-4">
                  <Info className="h-5 w-5" />
                  <h2 className="text-xl font-semibold">
                    Guidance and Context
                  </h2>
                </div>

                {showQuestion && (
                  <>
                    <div className="space-y-6">
                      {currentQuestion.helpText && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                            <p className="text-blue-800">
                              {currentQuestion.helpText}
                            </p>
                          </div>
                        </div>
                      )}

                      {currentQuestion.warning && (
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <p className="text-yellow-800">
                              {currentQuestion.warning}
                            </p>
                          </div>
                        </div>
                      )}

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Context
                        </h3>
                        <p className="text-gray-700">
                          {currentQuestion.context}
                        </p>
                      </div>

                      {currentQuestion.guidelines && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Guidelines
                          </h3>
                          <ul className="list-disc list-inside space-y-2 text-gray-700">
                            {currentQuestion.guidelines.map(
                              (guideline, index) => (
                                <li key={index}>{guideline}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Your Progress
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(answers).map(([questionId, answer]) => {
                          const question = questions.find(
                            (q) => q.id === questionId
                          );
                          return (
                            <div
                              key={questionId}
                              className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg"
                            >
                              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {question?.question}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  Answer: {answer}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
