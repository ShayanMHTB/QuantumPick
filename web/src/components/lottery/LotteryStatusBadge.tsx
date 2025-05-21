import { Badge } from '@/components/ui/badge';
import {
  RiCheckLine,
  RiCloseCircleLine,
  RiPulseLine,
  RiTimeLine,
} from 'react-icons/ri';

type LotteryStatus = 'active' | 'pending' | 'completed' | 'cancelled';

interface LotteryStatusBadgeProps {
  status: LotteryStatus | string;
}

export const LotteryStatusBadge = ({ status }: LotteryStatusBadgeProps) => {
  switch (status) {
    case 'active':
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          <RiPulseLine className="mr-1 h-3 w-3" />
          Active
        </Badge>
      );
    case 'pending':
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          <RiTimeLine className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      );
    case 'completed':
      return (
        <Badge variant="outline" className="border-gray-300 text-gray-500">
          <RiCheckLine className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge variant="destructive">
          <RiCloseCircleLine className="mr-1 h-3 w-3" />
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
