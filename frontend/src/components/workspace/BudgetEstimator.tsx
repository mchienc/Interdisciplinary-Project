import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  ChevronDown, 
  ChevronUp, 
  Users, 
  Utensils, 
  Ticket, 
  Navigation, 
  Hotel,
  Sparkles,
  Info
} from 'lucide-react';
import { PlanResponse, POI } from '../../types';

interface BudgetEstimatorProps {
  plan: PlanResponse | null;
  days: number;
  transportMode?: 'walking' | 'bike' | 'driving';
  pois?: POI[];
}

type DiningTier = 'budget' | 'standard' | 'luxury';

const DINING_TIERS: Record<DiningTier, { label: string; pricePerPersonDay: number; desc: string }> = {
  budget: {
    label: 'Tiết kiệm',
    pricePerPersonDay: 150000,
    desc: 'Phở gánh, bánh mì, bún chả, trà đá vỉa hè'
  },
  standard: {
    label: 'Tiêu chuẩn',
    pricePerPersonDay: 300000,
    desc: 'Quán ăn đặc sản Hà Nội, cafe trứng, kem Tràng Tiền'
  },
  luxury: {
    label: 'Trải nghiệm',
    pricePerPersonDay: 500000,
    desc: 'Nhà hàng ẩm thực Tràng An, rooftop bar view hồ'
  }
};

export const BudgetEstimator: React.FC<BudgetEstimatorProps> = ({
  plan,
  days,
  transportMode = 'driving',
  pois = []
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [splitPeople, setSplitPeople] = useState<number>(1);
  const [diningTier, setDiningTier] = useState<DiningTier>('standard');

  const budget = useMemo(() => {
    if (!plan) return null;

    // 1. Khoản 1: Vé tham quan từ các POI trong lịch trình
    const visitedPois: POI[] = [];
    const visitedIds = new Set<number>();

    plan.daily_itineraries?.forEach(d => {
      d.visit_sequence?.forEach(p => {
        if (!visitedIds.has(p.id)) {
          visitedIds.add(p.id);
          visitedPois.push(p);
        }
      });
    });

    const ticketPerPerson = visitedPois.reduce((acc, p) => acc + (p.ticket_price || 0), 0);
    const totalTicketCost = ticketPerPerson * splitPeople;

    // 2. Khoản 2: Chi phí di chuyển theo công thức xe công nghệ Hà Nội
    // Công thức: 12.000đ (1km đầu) + (tổng_km - 1) * 9.500đ/km
    const totalDistance = plan.total_trip_distance_km || 0;
    let transportCost = 0;
    const mode = plan.transport_mode || transportMode;

    if (mode === 'driving') {
      if (totalDistance > 0) {
        transportCost = 12000 + Math.max(0, totalDistance - 1) * 9500;
      }
    } else if (mode === 'bike') {
      if (totalDistance > 0) {
        transportCost = 10000 + Math.max(0, totalDistance - 1) * 4500;
      }
    } else {
      transportCost = 0; // Đi bộ
    }
    transportCost = Math.round(transportCost);

    // 3. Khoản 3: Ước tính ẩm thực theo định mức/người/ngày
    const dailyDiningRate = DINING_TIERS[diningTier].pricePerPersonDay;
    const diningPerPerson = dailyDiningRate * days;
    const totalDiningCost = diningPerPerson * splitPeople;

    // 4. Khoản 4: Chỗ ở / Khách sạn (Dùng chung cho cả nhóm)
    const nights = Math.max(1, days - 1);
    // Tính số phòng: 1-2 người = 1 phòng, 4 người = 2 phòng
    const roomCount = splitPeople >= 4 ? 2 : 1;
    const hotelPricePerNight = plan.selected_hotel?.price_per_night || 0;
    const totalHotelCost = hotelPricePerNight * nights * roomCount;

    // 5. Tổng kết & Chia bình quân
    const grandTotal = totalTicketCost + transportCost + totalDiningCost + totalHotelCost;
    const costPerPerson = Math.round(grandTotal / splitPeople);

    return {
      visitedPois,
      ticketPerPerson,
      totalTicketCost,
      totalDistance,
      transportCost,
      mode,
      diningPerPerson,
      totalDiningCost,
      nights,
      roomCount,
      totalHotelCost,
      grandTotal,
      costPerPerson
    };
  }, [plan, days, transportMode, splitPeople, diningTier]);

  if (!plan || !budget) return null;

  return (
    <div className="rounded-2xl bg-[#FDFCF7] border border-stone-200/90 shadow-xs overflow-hidden transition-all">
      {/* Header bar with toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3.5 flex items-center justify-between bg-[#FAF7F0] hover:bg-stone-100/80 transition cursor-pointer text-left"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#B85D3B]/10 text-[#B85D3B] flex items-center justify-center text-xs font-bold">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1C382B] uppercase tracking-wider">
              Dự toán Ngân sách Toàn diện
            </h4>
            <div className="text-[10px] text-stone-500">
              Tổng ~{budget.grandTotal.toLocaleString('vi-VN')} đ ({splitPeople} người)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-serif text-sm font-bold text-[#B85D3B]">
            ~{budget.costPerPerson.toLocaleString('vi-VN')} đ/người
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-stone-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-400" />
          )}
        </div>
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="p-4 space-y-4 text-xs font-sans border-t border-stone-200/70">
          
          {/* Segmented Controls: Chia tiền nhóm */}
          <div className="flex items-center justify-between bg-stone-100/80 p-1 rounded-xl border border-stone-200/70">
            <span className="text-[11px] font-semibold text-stone-600 pl-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#B85D3B]" />
              Số lượng du khách:
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSplitPeople(num)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    splitPeople === num
                      ? 'bg-[#1C382B] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {num} người
                </button>
              ))}
            </div>
          </div>

          {/* Chọn định mức Ẩm thực */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-stone-700">
              <span className="flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-[#B85D3B]" />
                Định mức ẩm thực Hà Nội:
              </span>
              <span className="text-[#B85D3B] font-bold">
                {DINING_TIERS[diningTier].pricePerPersonDay.toLocaleString('vi-VN')} đ/ngày
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(DINING_TIERS) as DiningTier[]).map((tierKey) => {
                const tier = DINING_TIERS[tierKey];
                const isSelected = diningTier === tierKey;
                return (
                  <button
                    key={tierKey}
                    type="button"
                    onClick={() => setDiningTier(tierKey)}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-[#1C382B] text-white border-[#1C382B] shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-[#B85D3B]/40'
                    }`}
                  >
                    <span className="text-[11px] font-bold leading-tight">{tier.label}</span>
                    <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                      {tier.pricePerPersonDay / 1000}k/ngày
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-stone-500 italic pl-1">
              Gợi ý: {DINING_TIERS[diningTier].desc}.
            </p>
          </div>

          {/* Chi tiết từng khoản chi */}
          <div className="space-y-2 pt-2 border-t border-stone-100 text-stone-600">
            {/* 1. Vé tham quan */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-stone-400" />
                <span>Vé tham quan ({budget.visitedPois.length} điểm):</span>
              </span>
              <div className="text-right">
                <span className="font-semibold text-stone-800">
                  {budget.totalTicketCost.toLocaleString('vi-VN')} đ
                </span>
                {splitPeople > 1 && (
                  <span className="text-[10px] text-stone-400 block">
                    ({budget.ticketPerPerson.toLocaleString('vi-VN')} đ/người)
                  </span>
                )}
              </div>
            </div>

            {/* 2. Di chuyển */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-stone-400" />
                <span>Di chuyển cước công nghệ ({budget.totalDistance} km):</span>
              </span>
              <div className="text-right">
                <span className="font-semibold text-stone-800">
                  {budget.transportCost === 0 ? 'Miễn phí' : `${budget.transportCost.toLocaleString('vi-VN')} đ`}
                </span>
                <span className="text-[10px] text-stone-400 block">
                  {budget.mode === 'walking' ? 'Đi bộ' : '12k mở cửa + 9.5k/km'}
                </span>
              </div>
            </div>

            {/* 3. Ẩm thực */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-stone-400" />
                <span>Ẩm thực ({days} ngày):</span>
              </span>
              <div className="text-right">
                <span className="font-semibold text-stone-800">
                  {budget.totalDiningCost.toLocaleString('vi-VN')} đ
                </span>
                {splitPeople > 1 && (
                  <span className="text-[10px] text-stone-400 block">
                    ({budget.diningPerPerson.toLocaleString('vi-VN')} đ/người)
                  </span>
                )}
              </div>
            </div>

            {/* 4. Khách sạn */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Hotel className="w-3.5 h-3.5 text-stone-400" />
                <span>Chỗ nghỉ ({budget.nights} đêm, {budget.roomCount} phòng):</span>
              </span>
              <div className="text-right">
                <span className="font-semibold text-stone-800">
                  {budget.totalHotelCost.toLocaleString('vi-VN')} đ
                </span>
                <span className="text-[10px] text-stone-400 block">
                  {plan.selected_hotel?.name || 'Khách sạn đề xuất'}
                </span>
              </div>
            </div>
          </div>

          {/* Hộp Tổng kết & Chia tiền */}
          <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#B85D3B]/30 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
                Dự toán bình quân / người
              </div>
              <div className="font-serif text-xl font-bold text-[#B85D3B] mt-0.5">
                ~{budget.costPerPerson.toLocaleString('vi-VN')} đ
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-stone-500 uppercase tracking-wider">
                Tổng nhóm ({splitPeople} khách)
              </div>
              <div className="font-bold text-sm text-[#1C382B]">
                {budget.grandTotal.toLocaleString('vi-VN')} đ
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
