"use client"

import * as React from "react"
import { format, set } from "date-fns"
import { CalendarIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

export const CUSTOM_EXERCISE_VALUE = "__custom__"

export type SetInput = { reps: string; weight: string }

export function combineDateAndTime(date: Date, time: string): Date | null {
  if (!time) return null
  const [hours, minutes] = time.split(":").map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
  return set(date, { hours, minutes, seconds: 0, milliseconds: 0 })
}

export function WorkoutFormFields({
  title,
  onTitleChange,
  workoutDate,
  onWorkoutDateChange,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
  exerciseValue,
  onExerciseValueChange,
  customExercise,
  onCustomExerciseChange,
  sets,
  onSetsChange,
  exercises,
}: {
  title: string
  onTitleChange: (value: string) => void
  workoutDate: Date
  onWorkoutDateChange: (value: Date) => void
  startTime: string
  onStartTimeChange: (value: string) => void
  endTime: string
  onEndTimeChange: (value: string) => void
  exerciseValue: string
  onExerciseValueChange: (value: string) => void
  customExercise: string
  onCustomExerciseChange: (value: string) => void
  sets: SetInput[]
  onSetsChange: (value: SetInput[]) => void
  exercises: Exercise[]
}) {
  const [datePickerOpen, setDatePickerOpen] = React.useState(false)

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
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
                  onWorkoutDateChange(nextDate)
                  setDatePickerOpen(false)
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="startTime">Start time</Label>
          <Input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="endTime">End time</Label>
          <Input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="exercise">Exercise</Label>
        <Select
          value={exerciseValue}
          onValueChange={(value) => onExerciseValueChange(value ?? "")}
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
            onChange={(e) => onCustomExerciseChange(e.target.value)}
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
                onSetsChange(
                  sets.map((s, i) => (i === index ? { ...s, reps: value } : s)),
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
                onSetsChange(
                  sets.map((s, i) =>
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
              onClick={() => onSetsChange(sets.filter((_, i) => i !== index))}
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
          onClick={() => onSetsChange([...sets, { reps: "", weight: "" }])}
        >
          <PlusIcon className="size-4" />
          Add set
        </Button>
      </div>
    </>
  )
}
