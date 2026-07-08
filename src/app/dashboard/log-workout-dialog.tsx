"use client"

import * as React from "react"
import { format } from "date-fns"
import { PlusIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Exercise } from "@/data/exercises"
import { logWorkout } from "./actions"

const CUSTOM_EXERCISE_VALUE = "__custom__"

type SetInput = { reps: string; weight: string }

export function LogWorkoutDialog({
  date,
  exercises,
}: {
  date: Date
  exercises: Exercise[]
}) {
  const [open, setOpen] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [exerciseValue, setExerciseValue] = React.useState<string>("")
  const [customExercise, setCustomExercise] = React.useState("")
  const [sets, setSets] = React.useState<SetInput[]>([
    { reps: "", weight: "" },
  ])

  function resetForm() {
    setExerciseValue("")
    setCustomExercise("")
    setSets([{ reps: "", weight: "" }])
    setError(null)
  }

  async function handleSubmit(formData: FormData) {
    setError(null)
    setPending(true)

    formData.set("date", date.toISOString())
    formData.set("exercise", exerciseValue)
    formData.set("customExercise", customExercise)
    formData.set("setCount", String(sets.length))
    sets.forEach((set, index) => {
      formData.set(`sets[${index}].reps`, set.reps)
      formData.set(`sets[${index}].weight`, set.weight)
    })

    const result = await logWorkout(formData)

    setPending(false)
    if (result.error) {
      setError(result.error)
      return
    }

    resetForm()
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) resetForm()
      }}
    >
      <DialogTrigger
        render={
          <Button className="gap-2">
            <PlusIcon className="size-4" />
            Log workout
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log workout</DialogTitle>
          <DialogDescription>
            Add an exercise for {format(date, "do MMM yyyy")}.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="exercise">Exercise</Label>
            <Select
              value={exerciseValue}
              onValueChange={(value) => setExerciseValue(value ?? "")}
            >
              <SelectTrigger id="exercise" className="w-full">
                <SelectValue placeholder="Choose an exercise" />
              </SelectTrigger>
              <SelectContent>
                {exercises.map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.name}>
                    {exercise.name}
                  </SelectItem>
                ))}
                <SelectItem value={CUSTOM_EXERCISE_VALUE}>
                  Custom exercise…
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {exerciseValue === CUSTOM_EXERCISE_VALUE && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="customExercise">Custom exercise name</Label>
              <Input
                id="customExercise"
                value={customExercise}
                onChange={(e) => setCustomExercise(e.target.value)}
                placeholder="e.g. Bulgarian split squat"
                required
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label>Sets</Label>
            {sets.map((set, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  placeholder="Reps"
                  value={set.reps}
                  onChange={(e) => {
                    const value = e.target.value
                    setSets((prev) =>
                      prev.map((s, i) =>
                        i === index ? { ...s, reps: value } : s,
                      ),
                    )
                  }}
                  required
                />
                <Input
                  type="number"
                  min={0}
                  step="0.5"
                  inputMode="decimal"
                  placeholder="Weight (kg)"
                  value={set.weight}
                  onChange={(e) => {
                    const value = e.target.value
                    setSets((prev) =>
                      prev.map((s, i) =>
                        i === index ? { ...s, weight: value } : s,
                      ),
                    )
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={sets.length === 1}
                  onClick={() =>
                    setSets((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  <Trash2Icon className="size-4" />
                  <span className="sr-only">Remove set</span>
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start gap-1.5"
              onClick={() =>
                setSets((prev) => [...prev, { reps: "", weight: "" }])
              }
            >
              <PlusIcon className="size-4" />
              Add set
            </Button>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save workout"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
