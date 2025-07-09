import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FolderPlus } from 'lucide-react';
import type { TrainingVideo } from '@/hooks/useProducts';

interface CategorySelectorProps {
  video: TrainingVideo;
  existingCategories: string[];
  newCategoryName: string;
  showNewCategoryInput: boolean;
  onCategoryChange: (value: string) => void;
  onNewCategoryNameChange: (name: string) => void;
  onShowNewCategoryInput: (show: boolean) => void;
  onCreateCategory: () => void;
}

export function CategorySelector({
  video,
  existingCategories,
  newCategoryName,
  showNewCategoryInput,
  onCategoryChange,
  onNewCategoryNameChange,
  onShowNewCategoryInput,
  onCreateCategory
}: CategorySelectorProps) {
  const handleSelectChange = (value: string) => {
    if (value === 'create-new') {
      onShowNewCategoryInput(true);
    } else {
      onCategoryChange(value);
    }
  };

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      onCategoryChange(newCategoryName.trim());
      onNewCategoryNameChange('');
      onShowNewCategoryInput(false);
      onCreateCategory();
    }
  };

  const handleCancelNewCategory = () => {
    onNewCategoryNameChange('');
    onShowNewCategoryInput(false);
  };

  return (
    <div>
      <Label>Category</Label>
      <div className="space-y-2">
        <Select
          value={video.category || ''}
          onValueChange={handleSelectChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select or create category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No Category</SelectItem>
            {existingCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
            <SelectItem value="create-new">
              <div className="flex items-center gap-2">
                <FolderPlus className="h-4 w-4" />
                Create New Category
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        
        {showNewCategoryInput && (
          <div className="flex gap-2">
            <Input
              value={newCategoryName}
              onChange={(e) => onNewCategoryNameChange(e.target.value)}
              placeholder="Enter category name"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreateCategory();
                }
              }}
            />
            <Button
              size="sm"
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim()}
            >
              Create
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancelNewCategory}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}