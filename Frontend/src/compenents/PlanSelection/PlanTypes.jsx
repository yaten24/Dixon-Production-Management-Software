export const planTypes = [
  {
    id: 'daily',
    name: 'Daily Production Plan',
    icon: 'Calendar',
    description: 'Create a production plan for a single day.',
    useCases: ['Daily Target', 'Daily Production', 'Daily Manpower', 'Daily Shift Planning'],
    estimatedTime: '2-3 minutes',
    benefits: [
      "Fastest way to lock a single day's targets",
      'Auto-pulls machine and operator availability',
      'Ideal for quick shift-level adjustments',
    ],
    requiredInfo: ['Production date', 'Shift', 'Machine allocation', 'Target output'],
    recommendedFor: 'Shift supervisors planning day-to-day floor operations.',
  },
  {
    id: 'monthly',
    name: 'Monthly Production Plan',
    icon: 'CalendarRange',
    description: 'Plan complete monthly production.',
    useCases: ['Production Forecast', 'Machine Utilization', 'Capacity Management', 'Monthly Target'],
    estimatedTime: '5-7 minutes',
    benefits: [
      'Forecasts output against monthly commitments',
      'Surfaces machine utilization gaps early',
      'Aligns capacity with sales and dispatch targets',
    ],
    requiredInfo: ['Month', 'Machine-wise forecast', 'Utilization targets', 'Monthly target volume'],
    recommendedFor: 'Plant managers setting monthly targets across all halls.',
  },
];