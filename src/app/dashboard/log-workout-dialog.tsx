"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
  const [workoutDate, setWorkoutDate] = React.useState<Date>(date)
  const [datePickerOpen, setDatePickerOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [exerciseValue, setExerciseValue] = React.useState<string>("")
  const [customExercise, setCustomExercise] = React.useState("")
  const [sets, setSets] = React.useState<SetInput[]>([
    { reps: "", weight: "" },
  ])

  function resetForm() {
    setWorkoutDate(date)
    setTitle("")
    setExerciseValue("")
    setCustomExercise("")
    setSets([{ reps: "", weight: "" }])
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const exerciseName =
      exerciseValue === CUSTOM_EXERCISE_VALUE ? customExercise : exerciseValue

    const result = await logWorkout({
      date: workoutDate,
      title: title.trim() || null,
      exerciseName,
      sets: sets.map((set) => ({
        reps: Number(set.reps),
        weight: set.weight === "" ? null : Number(set.weight),
      })),
    })

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
        if (nextOpen) setWorkoutDate(date)
        if (!nextOpen) resetForm()
      }}
    >
      <DialogTrigger
        render={
          <Button className="gap-2">
            <PlusIcon className="size-4" />
            Create workout
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log workout</DialogTitle>
          <DialogDescription>
            Add an exercise for {format(workoutDate, "do MMM yyyy")}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Push day"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="date">Date</Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger
                render={
                  <Button
                    id="date"
                    type="button"
                    variant="outline"
                    className="w-full justify-start gap-2 font-normal"
                  >
                    <CalendarIcon className="size-4" />
                    {format(workoutDate, "do MMM yyyy")}
                  </Button>
                }
              />
              <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={workoutDate}
                  onSelect={(nextDate) => {
                    if (nextDate) {
                      setWorkoutDate(nextDate)
                      setDatePickerOpen(false)
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

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
