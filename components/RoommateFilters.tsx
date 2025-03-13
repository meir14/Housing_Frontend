import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface RoommateFiltersProps {
  filters: {
    school: string
    location: string
    degree: string
  }
  setFilters: (filters: {
    school: string
    location: string
    degree: string
  }) => void
}

export function RoommateFilters({ filters, setFilters }: RoommateFiltersProps) {
  return (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label>School</Label>
        <Input
          placeholder="Enter school name"
          value={filters.school}
          onChange={(e) => setFilters({ ...filters, school: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Location</Label>
        <Input
          placeholder="Enter preferred location"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Degree Level</Label>
        <Select
          value={filters.degree}
          onValueChange={(value) => setFilters({ ...filters, degree: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select degree level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="undergraduate">Undergraduate</SelectItem>
            <SelectItem value="postgraduate">Postgraduate</SelectItem>
            <SelectItem value="phd">PhD</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

