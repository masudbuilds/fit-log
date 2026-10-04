"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { Workout } from "@/types/workout";
import { getWorkoutById } from "@/utils/api";
import { useWorkout } from "@/context/WorkoutContext";
import WorkoutSpecs from "@/components/details/WorkoutSpecs";
import Instructions from "@/components/details/Instructions";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addToPlan, addToSaved, isPlanFull, planList, savedList } =
    useWorkout();

  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        const data = await getWorkoutById(id);
        setWorkout(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Workout not found");
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-red-400 font-medium">
          {error || "Workout not found"}
        </p>
        <Link
          href="/"
          className="px-5 py-2.5 bg-[#ccff00] text-black font-bold rounded-md text-sm hover:bg-[#b8e600] transition-colors"
        >
          Back to Workouts
        </Link>
      </div>
    );
  }

  const isAlreadyInPlan = planList.some(
    (item) => String(item.id) === String(workout.id),
  );
  const isAlreadyInSaved = savedList.some(
    (item) => String(item.id) === String(workout.id),
  );

  const handleAddToPlan = () => {
    if (isPlanFull) {
      toast.error("Plan limit reached (Maximum 5 lifts)!");
      return;
    }
    if (isAlreadyInPlan) {
      toast.error("Already added to today's plan!");
      return;
    }

    const success = addToPlan(workout);
    if (success) {
      toast.success("Added to today's plan!");
    }
  };

  const handleAddToSaved = () => {
    if (isAlreadyInSaved) {
      toast.error("Already in your saved list!");
      return;
    }

    const success = addToSaved(workout);
    if (success) {
      toast.success("Saved for later!");
    }
  };

  return (
    <div className="w-full py-8 sm:py-10 md:py-16 bg-[#0f1115]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-400 hover:text-[#ccff00] transition-colors mb-6 sm:mb-8"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Library
        </Link>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left Column: Visual/Media */}
          <div className="lg:col-span-5 w-full lg:sticky lg:top-28">
            <div className="relative w-full aspect-4/3 sm:aspect-video lg:aspect-9/10 rounded-2xl overflow-hidden border border-[#262b36] bg-[#161920]">
              <Image
                src={workout.image}
                alt={workout.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Right Column: Info & Action Sections */}
          <div className="lg:col-span-7 min-w-0 flex flex-col justify-start">
            {/* Category / MuscleGroups Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {workout.muscleGroups?.map((group, idx) => (
                <span
                  key={idx}
                  className="text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-[#242a36] text-gray-300"
                >
                  {group}
                </span>
              ))}
            </div>

            {/* Workout Title */}
            <h1 className="wrap-break-words text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-white font-(family-name:--font-oswald)">
              {workout.name}
            </h1>

            {/* Description */}
            <p className="text-gray-400 text-sm sm:text-base mt-4 leading-relaxed">
              {workout.description}
            </p>

            {/* Key Specs Table */}
            <WorkoutSpecs workout={workout} />

            {/* Instructions */}
            <Instructions instructions={workout.instructions} />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4 pt-4 border-t border-[#222732]">
              {/* Add to today's plan */}
              <button
                onClick={handleAddToPlan}
                disabled={isPlanFull || isAlreadyInPlan}
                className="flex-1 inline-flex items-center justify-center gap-2.5 bg-[#ccff00] text-black font-bold text-sm sm:text-base py-3.5 px-6 rounded-lg transition-all hover:bg-[#b8e600] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>
                  {isAlreadyInPlan
                    ? "Added to Plan"
                    : isPlanFull
                      ? "Plan Cap Reached (5)"
                      : "Add to today's plan"}
                </span>
              </button>

              {/* Save for later */}
              <button
                onClick={handleAddToSaved}
                disabled={isAlreadyInSaved}
                className="flex-1 inline-flex items-center justify-center gap-2.5 bg-transparent border border-gray-600 text-white font-bold text-sm sm:text-base py-3.5 px-6 rounded-lg transition-colors hover:border-[#ccff00] hover:text-[#ccff00] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
                <span>{isAlreadyInSaved ? "Saved" : "Save for later"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
