import { useEffect, useState } from 'react';
import { useTranslation } from '@/i18n';
import { ethers } from 'ethers';
import { useAppSelector } from '@/store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RiAlertLine } from 'react-icons/ri';
import lotteryService from '@/services/lottery/lotteryService';

interface PrizeDistributionProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  setConstraintErrors: React.Dispatch<React.SetStateAction<string[]>>;
}

export const PrizeDistribution = ({
  formData,
  setFormData,
  setConstraintErrors,
}: PrizeDistributionProps) => {
  const { t } = useTranslation('dashboard');
  const { templates } = useAppSelector((state) => state.lottery);

  // Get current template
  const currentTemplate = templates.find((t) => t.id === formData.templateId);

  // Fee display state
  const [creationFee, setCreationFee] = useState<string>('');
  const [platformAddress, setPlatformAddress] = useState<string>('');

  // Update fee when template or prize pool changes
  useEffect(() => {
    const updateCreationFee = async () => {
      try {
        // If we have a flat fee template
        if (currentTemplate?.creationFee.flat) {
          setCreationFee(
            ethers
              .parseEther(currentTemplate.creationFee.flat.toString())
              .toString(),
          );
        }
        // If we have a percentage fee template
        else if (currentTemplate?.creationFee.percentOfPrize) {
          const feeAmount =
            (currentTemplate.creationFee.percentOfPrize / 100) *
            formData.prizePool;
          setCreationFee(ethers.parseEther(feeAmount.toString()).toString());
        }
        // Fallback to API
        else {
          const feeData = await lotteryService.getCreationFee(
            formData.templateId,
            formData.chainId,
          );
          setCreationFee(feeData.fee);
          setPlatformAddress(feeData.platformAddress);
        }
      } catch (error) {
        console.error('Failed to update creation fee:', error);
      }
    };

    // Get platform address if not set
    const getPlatformAddress = async () => {
      if (!platformAddress) {
        try {
          const feeData = await lotteryService.getCreationFee(
            formData.templateId,
            formData.chainId,
          );
          setPlatformAddress(feeData.platformAddress);
        } catch (error) {
          console.error('Failed to get platform address:', error);
        }
      }
    };

    updateCreationFee();
    getPlatformAddress();
  }, [
    currentTemplate,
    formData.prizePool,
    formData.templateId,
    formData.chainId,
    platformAddress,
  ]);

  // Check if prize distribution totals 100%
  const isPrizeDistributionValid =
    formData.prizeDistribution.first +
      formData.prizeDistribution.second +
      formData.prizeDistribution.third ===
    100;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        {t('lotteries.createForm.prizeDistribution.title')}
      </h3>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first">
            {t('lotteries.createForm.fields.firstPrize')}
          </Label>
          <Input
            id="first"
            type="number"
            min="1"
            max="100"
            value={formData.prizeDistribution.first}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value)) {
                setFormData((prev: any) => ({
                  ...prev,
                  prizeDistribution: {
                    ...prev.prizeDistribution,
                    first: value,
                  },
                }));
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            {t('lotteries.createForm.percentOfPrize')}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="second">
            {t('lotteries.createForm.fields.secondPrize')}
          </Label>
          <Input
            id="second"
            type="number"
            min="0"
            max="99"
            value={formData.prizeDistribution.second}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value)) {
                setFormData((prev: any) => ({
                  ...prev,
                  prizeDistribution: {
                    ...prev.prizeDistribution,
                    second: value,
                  },
                }));
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            {t('lotteries.createForm.percentOfPrize')}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="third">
            {t('lotteries.createForm.fields.thirdPrize')}
          </Label>
          <Input
            id="third"
            type="number"
            min="0"
            max="99"
            value={formData.prizeDistribution.third}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value)) {
                setFormData((prev: any) => ({
                  ...prev,
                  prizeDistribution: {
                    ...prev.prizeDistribution,
                    third: value,
                  },
                }));
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            {t('lotteries.createForm.percentOfPrize')}
          </p>
        </div>
      </div>

      {/* Prize distribution validation */}
      {!isPrizeDistributionValid && (
        <Alert variant="warning" className="mt-4">
          <RiAlertLine className="h-4 w-4" />
          <AlertDescription>
            {t('lotteries.createForm.errors.prizeDistribution')}
          </AlertDescription>
        </Alert>
      )}

      {/* Creation Fee */}
      <div className="p-4 mt-4 bg-muted/40 rounded-md">
        <div className="flex flex-col space-y-1">
          <span className="text-sm font-medium">
            {t('lotteries.createForm.creationFee')}
          </span>
          <span className="text-xl font-bold">
            {creationFee ? ethers.formatEther(creationFee) : '0'} ETH
          </span>
          <span className="text-xs text-muted-foreground">
            {t('lotteries.createForm.platformWallet')}:{' '}
            {platformAddress
              ? `${platformAddress.slice(0, 6)}...${platformAddress.slice(-4)}`
              : t('common.loading')}
          </span>
        </div>
      </div>
    </div>
  );
};
