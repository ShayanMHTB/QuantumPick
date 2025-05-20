import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchTemplates } from '@/store/slices/lotterySlice';
import { useTranslation } from '@/i18n';
import { LotteryTemplate } from '@/types/lottery.types';

interface TemplateSelectionProps {
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
}

export const TemplateSelection = ({
  selectedTemplate,
  onSelectTemplate,
}: TemplateSelectionProps) => {
  const { t } = useTranslation('dashboard');
  const dispatch = useAppDispatch();
  const { templates, isLoading } = useAppSelector((state) => state.lottery);

  useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  if (isLoading && templates.length === 0) {
    return <TemplateSelectionSkeleton />;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        {t('lotteries.createForm.templateSelection.title')}
      </h3>
      <p className="text-sm text-muted-foreground">
        {t('lotteries.createForm.templateSelection.description')}
      </p>

      <RadioGroup
        value={selectedTemplate}
        onValueChange={onSelectTemplate}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2"
      >
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedTemplate === template.id}
          />
        ))}
      </RadioGroup>
    </div>
  );
};

const TemplateCard = ({
  template,
  isSelected,
}: {
  template: LotteryTemplate;
  isSelected: boolean;
}) => {
  const { t } = useTranslation('dashboard');

  return (
    <label htmlFor={`template-${template.id}`}>
      <Card
        className={`cursor-pointer hover:border-primary transition-colors ${
          isSelected ? 'border-primary bg-primary/5' : ''
        }`}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <RadioGroupItem
              value={template.id}
              id={`template-${template.id}`}
              className="mr-2"
            />
            {template.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="text-sm space-y-1">
            <li className="flex justify-between">
              <span className="text-muted-foreground">
                {t('lotteries.createForm.fields.prizeRange')}:
              </span>
              <span className="font-medium">
                {formatCurrency(template.prizeRange.min)} -{' '}
                {formatCurrency(template.prizeRange.max)}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">
                {t('lotteries.createForm.fields.ticketPrice')}:
              </span>
              <span className="font-medium">
                {formatCurrency(template.ticketPrice.min)} -{' '}
                {formatCurrency(template.ticketPrice.max)}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">
                {t('lotteries.createForm.fields.duration')}:
              </span>
              <span className="font-medium">
                {template.duration.minDays}-{template.duration.maxDays}{' '}
                {t('common.days')}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">
                {t('lotteries.createForm.fields.winners')}:
              </span>
              <span className="font-medium">
                {template.minWinners === template.maxWinners
                  ? template.minWinners
                  : `${template.minWinners}-${template.maxWinners}`}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">
                {t('lotteries.createForm.fields.fee')}:
              </span>
              <span className="font-medium">
                {template.creationFee.flat
                  ? formatCurrency(template.creationFee.flat)
                  : `${template.creationFee.percentOfPrize}%`}
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </label>
  );
};

const TemplateSelectionSkeleton = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-full" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="cursor-not-allowed opacity-70">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
