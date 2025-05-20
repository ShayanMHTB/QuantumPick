import { useTranslation } from '@/i18n';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface BasicInformationProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  goToNextTab: () => void;
}

export const BasicInformation = ({
  formData,
  setFormData,
  goToNextTab,
}: BasicInformationProps) => {
  const { t } = useTranslation('dashboard');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        {t('lotteries.createForm.basicInfo.title')}
      </h3>

      <div className="space-y-2">
        <Label htmlFor="name">{t('lotteries.createForm.fields.title')}</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder={t('lotteries.createForm.placeholders.title')}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          {t('lotteries.createForm.fields.description')}
        </Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder={t('lotteries.createForm.placeholders.description')}
          rows={3}
        />
      </div>

      <div className="pt-4 text-center">
        <Button type="button" onClick={goToNextTab}>
          {t('lotteries.createForm.nextStep')}
        </Button>
      </div>
    </div>
  );
};
