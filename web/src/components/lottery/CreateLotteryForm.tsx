// src/components/lottery/CreateLotteryForm.tsx
import { useState } from 'react';
import { useTranslation } from '@/i18n';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  RiAlertLine,
  RiCalendarLine,
  RiSettings4Line,
  RiTicketLine,
  RiTrophyLine,
} from 'react-icons/ri';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppDispatch } from '@/store';
import { createLottery } from '@/store/slices/lotterySlice';
import { useRouter } from 'next/navigation';

// Import step components
import { TemplateSelection } from './steps/TemplateSelection';
import { BasicInformation } from './steps/BasicInformation';
import { LotteryConfiguration } from './steps/LotteryConfiguration';
import { ScheduleSettings } from './steps/ScheduleSettings';
import { PrizeDistribution } from './steps/PrizeDistribution';

// Import utilities and types
import { processLotteryPayment } from '@/lib/lottery/paymetnUtils';
import { validateLotteryForm } from '@/lib/lottery/validationUtils';
import { Permission } from '@/types/permission.types';
import profileService from '@/services/user/profileService';

interface CreateLotteryFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateLotteryForm = ({
  onSuccess,
  onCancel,
}: CreateLotteryFormProps) => {
  const { t } = useTranslation('dashboard');
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Form state
  const [formData, setFormData] = useState(() => {
    const startDate = new Date();

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const drawDate = new Date();
    drawDate.setDate(drawDate.getDate() + 8);

    return {
      templateId: 'basic',
      name: '',
      description: '',
      chainId: 1337,
      tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      ticketPrice: 5,
      prizePool: 5000,
      startTime: startDate.toISOString().slice(0, 16),
      endTime: endDate.toISOString().slice(0, 16),
      drawTime: drawDate.toISOString().slice(0, 16),
      prizeDistribution: {
        first: 70,
        second: 20,
        third: 10,
      },
    };
  });

  // UI state
  const [activeTab, setActiveTab] = useState('template');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [constraintErrors, setConstraintErrors] = useState<string[]>([]);

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Check permission first
      const { hasPermission } = await profileService.checkPermission(
        Permission.CREATE_LOTTERY,
      );
      if (!hasPermission) {
        throw new Error(t('permissions.errors.noCreatePermission'));
      }

      // Validate the form
      const validationResult = validateLotteryForm(formData, constraintErrors);
      if (!validationResult.isValid) {
        throw new Error(validationResult.error || t('common.validationError'));
      }

      // Process payment if needed
      let paymentDetails = {
        paymentTxHash: '',
        paymentFromAddress: '',
      };

      if (!validationResult.isAdmin) {
        setIsPaymentProcessing(true);
        try {
          paymentDetails = await processLotteryPayment(
            formData.templateId,
            formData.prizePool,
            formData.chainId,
          );
        } catch (paymentError) {
          throw new Error(
            paymentError instanceof Error
              ? paymentError.message
              : t('lotteries.createForm.paymentFailed'),
          );
        } finally {
          setIsPaymentProcessing(false);
        }
      }

      // Format data for API
      const lotteryData = {
        templateId: formData.templateId,
        name: formData.name,
        description: formData.description,
        chainId:
          typeof formData.chainId === 'string'
            ? parseInt(formData.chainId)
            : formData.chainId,
        tokenAddress: formData.tokenAddress,
        ticketPrice: formData.ticketPrice,
        prizePool: formData.prizePool,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        drawTime: new Date(formData.drawTime).toISOString(),
        prizeDistribution: {
          first: formData.prizeDistribution.first,
          second: formData.prizeDistribution.second,
          third: formData.prizeDistribution.third,
        },
        // Add payment info if payment was made
        ...paymentDetails,
      };

      // Dispatch create lottery action
      await dispatch(createLottery(lotteryData)).unwrap();

      // Handle success
      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect to lotteries page
        router.push('/dashboard/lotteries');
      }
    } catch (err) {
      console.error('Error creating lottery:', err);
      setError(err instanceof Error ? err.message : 'Failed to create lottery');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigate to next tab
  const goToNextTab = () => {
    const tabs = ['template', 'basics', 'config', 'schedule', 'prizes'];
    const currentIndex = tabs.indexOf(activeTab);
    const nextTab = tabs[currentIndex + 1];
    if (nextTab) {
      setActiveTab(nextTab);
    }
  };

  const isFormValid =
    constraintErrors.length === 0 &&
    formData.name &&
    formData.prizeDistribution.first +
      formData.prizeDistribution.second +
      formData.prizeDistribution.third ===
      100;

  return (
    <div className="w-full max-h-[80vh] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>{t('lotteries.createForm.title')}</CardTitle>
        <CardDescription>
          {t('lotteries.createForm.description')}
        </CardDescription>
      </CardHeader>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <div className="px-6">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="template" className="flex items-center gap-2">
              <RiTicketLine /> {t('lotteries.createForm.tabs.template')}
            </TabsTrigger>
            <TabsTrigger value="basics" className="flex items-center gap-2">
              <RiSettings4Line /> {t('lotteries.createForm.tabs.basics')}
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <RiSettings4Line /> {t('lotteries.createForm.tabs.config')}
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <RiCalendarLine /> {t('lotteries.createForm.tabs.schedule')}
            </TabsTrigger>
            <TabsTrigger value="prizes" className="flex items-center gap-2">
              <RiTrophyLine /> {t('lotteries.createForm.tabs.prizes')}
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 pb-4">
            <TabsContent value="template" className="m-0 py-2">
              <TemplateSelection
                formData={formData}
                setFormData={setFormData}
                onSelectTemplate={() => setActiveTab('basics')}
                setConstraintErrors={setConstraintErrors}
              />
            </TabsContent>

            <TabsContent value="basics" className="m-0 py-2">
              <BasicInformation
                formData={formData}
                setFormData={setFormData}
                goToNextTab={goToNextTab}
              />
            </TabsContent>

            <TabsContent value="config" className="m-0 py-2">
              <LotteryConfiguration
                formData={formData}
                setFormData={setFormData}
                goToNextTab={goToNextTab}
                setConstraintErrors={setConstraintErrors}
              />
            </TabsContent>

            <TabsContent value="schedule" className="m-0 py-2">
              <ScheduleSettings
                formData={formData}
                setFormData={setFormData}
                goToNextTab={goToNextTab}
                setConstraintErrors={setConstraintErrors}
              />
            </TabsContent>

            <TabsContent value="prizes" className="m-0 py-2">
              <PrizeDistribution
                formData={formData}
                setFormData={setFormData}
                setConstraintErrors={setConstraintErrors}
              />
            </TabsContent>
          </div>
        </ScrollArea>

        {/* Error Display */}
        {error && (
          <div className="px-6 pt-2">
            <Alert variant="destructive">
              <RiAlertLine className="h-4 w-4" />
              <AlertTitle>{t('common.error')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Template constraints validation */}
        {constraintErrors.length > 0 && (
          <div className="px-6 pt-2">
            <Alert variant="destructive">
              <RiAlertLine className="h-4 w-4" />
              <AlertTitle>
                {t('lotteries.createForm.warnings.constraintsTitle')}
              </AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  {constraintErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-6 py-4 flex justify-between border-t mt-auto">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || isPaymentProcessing}
          >
            {t('common.cancel')}
          </Button>

          {activeTab === 'prizes' ? (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                isPaymentProcessing ||
                constraintErrors.length > 0 ||
                !isFormValid
              }
            >
              {isSubmitting
                ? t('common.creating')
                : isPaymentProcessing
                ? t('lotteries.createForm.processingPayment')
                : t('common.create')}
            </Button>
          ) : (
            <Button type="button" onClick={goToNextTab}>
              {t('lotteries.createForm.nextStep')}
            </Button>
          )}
        </div>
      </Tabs>
    </div>
  );
};
