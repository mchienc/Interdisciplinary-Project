import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  CurrentWeather, 
  HourlyForecastItem, 
  TrafficStatus, 
  SimulationScenario, 
  ContextSuggestion, 
  PlanResponse 
} from '../types';
import { fetchLiveWeather, getSimulatedWeather } from '../services/weatherService';
import { getSimulatedTraffic } from '../services/trafficService';
import { evaluateAdaptiveItinerary } from '../services/adaptiveRouting';

interface ContextAwareContextType {
  weather: CurrentWeather;
  forecast: HourlyForecastItem[];
  traffic: TrafficStatus;
  scenario: SimulationScenario;
  setScenario: (scenario: SimulationScenario) => void;
  basePlan: PlanResponse | null;
  setBasePlan: (plan: PlanResponse | null) => void;
  effectivePlan: PlanResponse | null;
  suggestion: ContextSuggestion | null;
  isAdapted: boolean;
  applySuggestion: () => void;
  dismissSuggestion: () => void;
  refresh: () => Promise<void>;
  isLoading: boolean;
}

const ContextAwareContext = createContext<ContextAwareContextType | null>(null);

export const ContextAwareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scenario, setScenarioState] = useState<SimulationScenario>('LIVE');
  const [weatherData, setWeatherData] = useState<{
    weather: CurrentWeather;
    forecast: HourlyForecastItem[];
  }>(() => getSimulatedWeather('AUTUMN_PERFECT'));
  const [traffic, setTraffic] = useState<TrafficStatus>(() => getSimulatedTraffic('AUTUMN_PERFECT'));
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Kế hoạch du lịch ban đầu và Kế hoạch sau khi thích ứng
  const [basePlan, setBasePlan] = useState<PlanResponse | null>(null);
  const [adaptedPlan, setAdaptedPlan] = useState<PlanResponse | null>(null);
  const [suggestion, setSuggestion] = useState<ContextSuggestion | null>(null);
  const [isAdapted, setIsAdapted] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  // 1. Tải dữ liệu thời tiết & giao thông theo kịch bản
  const loadContextData = useCallback(async (sc: SimulationScenario) => {
    setIsLoading(true);
    try {
      if (sc === 'LIVE') {
        const live = await fetchLiveWeather();
        setWeatherData(live);
        setTraffic(getSimulatedTraffic('LIVE'));
      } else {
        setWeatherData(getSimulatedWeather(sc));
        setTraffic(getSimulatedTraffic(sc));
      }
    } catch {
      // Fallback
      setWeatherData(getSimulatedWeather('AUTUMN_PERFECT'));
      setTraffic(getSimulatedTraffic('AUTUMN_PERFECT'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. Chuyển đổi kịch bản giả lập
  const setScenario = useCallback((newScenario: SimulationScenario) => {
    setScenarioState(newScenario);
    setIsDismissed(false);
    setIsAdapted(false);
    loadContextData(newScenario);
  }, [loadContextData]);

  // 3. Tự động polling dữ liệu thời tiết mỗi 10 phút một lần (cho chế độ LIVE)
  useEffect(() => {
    loadContextData(scenario);

    if (scenario === 'LIVE') {
      const tenMinutesMs = 10 * 60 * 1000;
      const interval = setInterval(() => {
        loadContextData('LIVE');
      }, tenMinutesMs);
      return () => clearInterval(interval);
    }
  }, [scenario, loadContextData]);

  // 4. Đánh giá tính thích ứng của lộ trình mỗi khi basePlan, weather hoặc traffic thay đổi
  useEffect(() => {
    if (!basePlan) {
      setAdaptedPlan(null);
      setSuggestion(null);
      setIsAdapted(false);
      return;
    }

    const { adaptedPlan: newAdapted, suggestion: newSugg } = evaluateAdaptiveItinerary(
      basePlan,
      weatherData.weather,
      traffic
    );

    setAdaptedPlan(newAdapted);
    if (!isDismissed) {
      setSuggestion(newSugg);
    }
  }, [basePlan, weatherData.weather, traffic, isDismissed]);

  // 5. Áp dụng gợi ý thay đổi lộ trình
  const applySuggestion = useCallback(() => {
    setIsAdapted(true);
    if (suggestion) {
      setSuggestion({ ...suggestion, applied: true });
    }
  }, [suggestion]);

  // 6. Bỏ qua gợi ý (giữ nguyên lộ trình gốc)
  const dismissSuggestion = useCallback(() => {
    setIsDismissed(true);
    setIsAdapted(false);
    setSuggestion(null);
  }, []);

  // Kế hoạch đang có hiệu lực hiển thị trên bản đồ và sidebar
  const effectivePlan = useMemo(() => {
    if (isAdapted && adaptedPlan) {
      return adaptedPlan;
    }
    return basePlan;
  }, [isAdapted, adaptedPlan, basePlan]);

  const value = useMemo<ContextAwareContextType>(() => ({
    weather: weatherData.weather,
    forecast: weatherData.forecast,
    traffic,
    scenario,
    setScenario,
    basePlan,
    setBasePlan,
    effectivePlan,
    suggestion: !isDismissed && !isAdapted ? suggestion : null,
    isAdapted,
    applySuggestion,
    dismissSuggestion,
    refresh: () => loadContextData(scenario),
    isLoading
  }), [
    weatherData,
    traffic,
    scenario,
    setScenario,
    basePlan,
    effectivePlan,
    suggestion,
    isDismissed,
    isAdapted,
    applySuggestion,
    dismissSuggestion,
    loadContextData,
    isLoading
  ]);

  return (
    <ContextAwareContext.Provider value={value}>
      {children}
    </ContextAwareContext.Provider>
  );
};

export const useContextAwareness = (): ContextAwareContextType => {
  const context = useContext(ContextAwareContext);
  if (!context) {
    throw new Error('useContextAwareness must be used within a ContextAwareProvider');
  }
  return context;
};
