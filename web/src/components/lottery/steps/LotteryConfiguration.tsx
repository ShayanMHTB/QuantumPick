import { useEffect } from 'react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/lib/utils';
import { useAppSelector } from '@/store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LotteryConfigurationProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  goToNextTab: () => void;
  setConstraintErrors: React.Dispatch<React.SetStateAction<string[]>>;
}

export const LotteryConfiguration = ({
  formData,
  setFormData,
  goToNextTab,
  setConstraintErrors,
}: LotteryConfigurationProps) => {
  const { t } = useTranslation('dashboard');
  const { templates } = useAppSelector((state) => state.lottery);

  // Get current template
  const currentTemplate = templates.find((t) => t.id === formData.templateId);

  // Validate constraints when values change
  useEffect(() => {
    if (!currentTemplate) return;

    const errors = [];

    // Check ticket price constraints
    if (
      formData.ticketPrice < currentTemplate.ticketPrice.min ||
      formData.ticketPrice > currentTemplate.ticketPrice.max
    ) {
      errors.push(
        t('lotteries.createForm.errors.ticketPriceRange', {
          min: formatCurrency(currentTemplate.ticketPrice.min),
          max: formatCurrency(currentTemplate.ticketPrice.max),
        }),
      );
    }

    // Check prize pool constraints
    if (
      formData.prizePool < currentTemplate.prizeRange.min ||
      formData.prizePool > currentTemplate.prizeRange.max
    ) {
      errors.push(
        t('lotteries.createForm.errors.prizePoolRange', {
          min: formatCurrency(currentTemplate.prizeRange.min),
          max: formatCurrency(currentTemplate.prizeRange.max),
        }),
      );
    }

    setConstraintErrors(errors);
  }, [
    formData.ticketPrice,
    formData.prizePool,
    currentTemplate,
    setConstraintErrors,
    t,
  ]);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setFormData((prev: any) => ({ ...prev, [name]: numValue }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        {t('lotteries.createForm.configuration.title')}
      </h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="chainId">
            {t('lotteries.createForm.fields.network')}
          </Label>
          <Select
            value={formData.chainId.toString()}
            onValueChange={(value) => handleSelectChange('chainId', value)}
          >
            <SelectTrigger id="chainId">
              <SelectValue placeholder="Select network" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Ethereum</SelectItem>
              <SelectItem value="137">Polygon</SelectItem>
              <SelectItem value="56">Binance Smart Chain</SelectItem>
              <SelectItem value="1337">Local (Development)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ticketPrice">
            {t('lotteries.createForm.fields.ticketPrice')}
          </Label>
          <Input
            id="ticketPrice"
            name="ticketPrice"
            type="number"
            min={currentTemplate?.ticketPrice.min || 0.1}
            max={currentTemplate?.ticketPrice.max || 1000}
            step="0.1"
            value={formData.ticketPrice}
            onChange={handleNumberChange}
            placeholder={t('lotteries.createForm.placeholders.ticketPrice')}
            required
          />
          {currentTemplate && (
            <p className="text-xs text-muted-foreground">
              {t('lotteries.createForm.ticketPriceRange', {
                min: formatCurrency(currentTemplate.ticketPrice.min),
                max: formatCurrency(currentTemplate.ticketPrice.max),
              })}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="prizePool">
            {t('lotteries.createForm.fields.prizePool')}
          </Label>
          <Input
            id="prizePool"
            name="prizePool"
            type="number"
            min={currentTemplate?.prizeRange.min || 100}
            max={currentTemplate?.prizeRange.max || 1000000}
            value={formData.prizePool}
            onChange={handleNumberChange}
            placeholder={t('lotteries.createForm.placeholders.prizePool')}
            required
          />
          {currentTemplate && (
            <p className="text-xs text-muted-foreground">
              {t('lotteries.createForm.prizePoolRange', {
                min: formatCurrency(currentTemplate.prizeRange.min),
                max: formatCurrency(currentTemplate.prizeRange.max),
              })}
            </p>
          )}
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
