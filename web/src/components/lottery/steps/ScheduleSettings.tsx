import { useEffect } from 'react';
import { useTranslation } from '@/i18n';
import { useAppSelector } from '@/store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ScheduleSettingsProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  goToNextTab: () => void;
  setConstraintErrors: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ScheduleSettings = ({
  formData,
  setFormData,
  goToNextTab,
  setConstraintErrors,
}: ScheduleSettingsProps) => {
  const { t } = useTranslation('dashboard');
  const { templates } = useAppSelector((state) => state.lottery);

  // Get current template
  const currentTemplate = templates.find((t) => t.id === formData.templateId);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  // Validate duration constraints when dates change
  useEffect(() => {
    if (!currentTemplate || !formData.startTime || !formData.endTime) return;

    const errors: string[] = [];
    const existingErrors = setConstraintErrors((prevErrors) =>
      prevErrors.filter((err) => !err.includes('duration')),
    );

    // Check duration constraints
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    const durationDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (
      durationDays < currentTemplate.duration.minDays ||
      durationDays > currentTemplate.duration.maxDays
    ) {
      errors.push(
        t('lotteries.createForm.errors.durationRange', {
          min: currentTemplate.duration.minDays,
          max: currentTemplate.duration.maxDays,
        }),
      );
    }

    if (errors.length > 0) {
      setConstraintErrors((prevErrors) => [...prevErrors, ...errors]);
    }
  }, [
    formData.startTime,
    formData.endTime,
    currentTemplate,
    setConstraintErrors,
    t,
  ]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        {t('lotteries.createForm.timeline.title')}
      </h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">
            {t('lotteries.createForm.fields.startTime')}
          </Label>
          <Input
            id="startTime"
            name="startTime"
            type="datetime-local"
            value={formData.startTime}
            onChange={handleChange}
            min={new Date().toISOString().slice(0, 16)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">
            {t('lotteries.createForm.fields.endTime')}
          </Label>
          <Input
            id="endTime"
            name="endTime"
            type="datetime-local"
            value={formData.endTime}
            onChange={handleChange}
            min={formData.startTime}
            required
          />
          {currentTemplate && (
            <p className="text-xs text-muted-foreground">
              {t('lotteries.createForm.durationRange', {
                min: currentTemplate.duration.minDays,
                max: currentTemplate.duration.maxDays,
              })}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="drawTime">
            {t('lotteries.createForm.fields.drawTime')}
          </Label>
          <Input
            id="drawTime"
            name="drawTime"
            type="datetime-local"
            value={formData.drawTime}
            onChange={handleChange}
            min={formData.endTime}
            required
          />
          <p className="text-xs text-muted-foreground">
            {t('lotteries.createForm.drawTimeHint')}
          </p>
        </div>
      </div>

      <div className="pt-4 text-center">
        <Button type="button" onClick={goToNextTab}>
          {t('lotteries.createForm.nextStep')}
        </Button>
      </div>
    </div>
  );
};
