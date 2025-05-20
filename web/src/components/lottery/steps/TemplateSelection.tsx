import { useEffect } from 'react';
import { useTranslation } from '@/i18n';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchTemplates } from '@/store/slices/lotterySlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatCurrency } from '@/lib/utils';

interface TemplateSelectionProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSelectTemplate: () => void;
  setConstraintErrors: React.Dispatch<React.SetStateAction<string[]>>;
}

export const TemplateSelection = ({
  formData,
  setFormData,
  onSelectTemplate,
  setConstraintErrors,
}: TemplateSelectionProps) => {
  const { t } = useTranslation('dashboard');
  const dispatch = useAppDispatch();
  const { templates, isLoading } = useAppSelector((state) => state.lottery);

  // Fetch templates on mount
  useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  const handleTemplateSelect = (templateId: string) => {
    setFormData((prev) => ({ ...prev, templateId }));
    setConstraintErrors([]);
    onSelectTemplate();
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">
        {t('lotteries.createForm.templateSelection.title')}
      </h3>
      <p className="text-sm text-muted-foreground">
        {t('lotteries.createForm.templateSelection.description')}
      </p>

      <RadioGroup
        value={formData.templateId}
        onValueChange={handleTemplateSelect}
        className="grid grid-cols-1 gap-4 pt-2"
      >
        {templates.map((template) => (
          <label
            key={template.id}
            htmlFor={`template-${template.id}`}
            className="cursor-pointer"
          >
            <Card
              className={`hover:border-primary transition-colors ${
                formData.templateId === template.id
                  ? 'border-primary bg-primary/5'
                  : ''
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <RadioGroupItem
                    value={template.id}
                    id={`template-${template.id}`}
                    className="mr-2"
                  />
                  <CardTitle className="text-base">{template.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">
                      {t('lotteries.createForm.fields.prizeRange')}
                    </h4>
                    <p className="text-sm">
                      {formatCurrency(template.prizeRange.min)} -{' '}
                      {formatCurrency(template.prizeRange.max)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">
                      {t('lotteries.createForm.fields.ticketPrice')}
                    </h4>
                    <p className="text-sm">
                      {formatCurrency(template.ticketPrice.min)} -{' '}
                      {formatCurrency(template.ticketPrice.max)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">
                      {t('lotteries.createForm.fields.duration')}
                    </h4>
                    <p className="text-sm">
                      {template.duration.minDays}-{template.duration.maxDays}{' '}
                      {t('common.days')}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">
                      {t('lotteries.createForm.fields.winners')}
                    </h4>
                    <p className="text-sm">
                      {template.minWinners}-{template.maxWinners}{' '}
                      {t('lotteries.createForm.winners')}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-1">
                    {t('lotteries.createForm.fields.fee')}
                  </h4>
                  <p className="text-sm">
                    {template.creationFee.flat
                      ? formatCurrency(template.creationFee.flat)
                      : template.creationFee.percentOfPrize
                      ? `${template.creationFee.percentOfPrize}% ${t(
                          'lotteries.createForm.ofPrizePool',
                        )}`
                      : t('common.loading')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
};
