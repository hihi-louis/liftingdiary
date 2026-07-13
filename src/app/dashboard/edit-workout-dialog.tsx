"use client"

import * as React from "react"
import { format } from "date-fns"
import { PencilIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Exercise } from "@/data/exercises"
import type { WorkoutWithExercises } from "@/data/workouts"
import { deleteWorkout, editWorkout } from "./actions"
import {
  CUSTOM_EXERCISE_VALUE,
  WorkoutFormFields,
  combineDateAndTime,
  type SetInput,
} from "./workout-form-fields"

function buildInitialState(workout: WorkoutWithExercises) {
  const workoutExercise = workout.workoutExercises[0]
  return {
    title: workout.name ?? "",
    workoutDate: workout.startedAt,
    startTime: format(workout.startedAt, "HH:mm"),
    endTime: workout.completedAt ? format(workout.completedAt, "HH:mm") : "",
    exerciseValue: workoutExercise?.exercise.name ?? "",
    customExercise: "",
    sets: (workoutExercise?.sets ?? []).map(
      (set): SetInput => ({
        reps: String(set.reps),
        weight: set.weight !== null ? String(set.weight) : "",
      }),
    ),
  }
}

export function EditWorkoutDialog({
  workout,
  exercises,
}: {
  workout: WorkoutWithExercises
  exercises: Exercise[]
}) {
  const [open, setOpen] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [state, setState] = React.useState(() => buildInitialState(workout))

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const exerciseName =
      state.exerciseValue === CUSTOM_EXERCISE_VALUE
        ? state.customExercise
        : state.exerciseValue

    const startedAt = combineDateAndTime(state.workoutDate, state.startTime)
    if (!startedAt) {
      setError("Please enter a start time.")
      setPending(false)
      return
    }
    const endedAt = combineDateAndTime(state.workoutDate, state.endTime)

    const result = await editWorkout({
      workoutId: workout.id,
      startedAt,
      endedAt,
      title: state.title.trim() || null,
      exerciseName,
      sets: state.sets.map((set) => ({
        reps: Number(set.reps),
        weight: set.weight === "" ? null : Number(set.weight),
      })),
    })

    setPending(false)
    if (result.error) {
      setError(result.error)
      return
    }

    setOpen(false)
  }

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteWorkout({ workoutId: workout.id })
    setDeleting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (nextOpen) {
          setState(buildInitialState(workout))
          setError(null)
        }
      }}
    >
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm">
            <PencilIcon className="size-4" />
            <span className="sr-only">Edit workout</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit workout</DialogTitle>
          <DialogDescription>
            Update this workout for {format(state.workoutDate, "do MMM yyyy")}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <WorkoutFormFields
            title={state.title}
            onTitleChange={(title) => setState((s) => ({ ...s, title }))}
            workoutDate={state.workoutDate}
            onWorkoutDateChange={(workoutDate) =>
              setState((s) => ({ ...s, workoutDate }))
            }
            startTime={state.startTime}
            onStartTimeChange={(startTime) =>
              setState((s) => ({ ...s, startTime }))
            }
            endTime={state.endTime}
            onEndTimeChange={(endTime) =>
              setState((s) => ({ ...s, endTime }))
            }
            exerciseValue={state.exerciseValue}
            onExerciseValueChange={(exerciseValue) =>
              setState((s) => ({ ...s, exerciseValue }))
            }
            customExercise={state.customExercise}
            onCustomExerciseChange={(customExercise) =>
              setState((s) => ({ ...s, customExercise }))
            }
            sets={state.sets}
            onSetsChange={(sets) => setState((s) => ({ ...s, sets }))}
            exercises={exercises}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter className="sm:justify-between">
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-1.5 text-destructive hover:text-destructive"
                    disabled={deleting}
                  >
                    <Trash2Icon className="size-4" />
                    Delete workout
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this workout?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove the workout, its exercise,
                    and all logged sets. This can&apos;t be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting…" : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
