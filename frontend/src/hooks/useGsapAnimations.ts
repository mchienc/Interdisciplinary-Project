import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Hook tween một giá trị số theo phong cách Odometer / Telemetry HUD
 * @param targetValue Giá trị số đích
 * @param decimals Số chữ số thập phân
 * @param duration Thời gian chuyển động (mặc định 0.55s, ease: power3.out)
 */
export const useGsapNumericRoll = (
  targetValue: number,
  decimals: number = 1,
  duration: number = 0.55
) => {
  const ref = useRef<HTMLSpanElement>(null);
  const prevValRef = useRef<number>(0);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const startVal = prevValRef.current;
    const obj = { val: startVal };

    const tween = gsap.to(obj, {
      val: targetValue,
      duration,
      ease: 'power3.out',
      onUpdate: () => {
        if (el) {
          el.innerText = decimals === 0 ? Math.round(obj.val).toString() : obj.val.toFixed(decimals);
        }
      }
    });

    prevValRef.current = targetValue;

    return () => {
      tween.kill();
    };
  }, [targetValue, decimals, duration]);

  return ref;
};

/**
 * Hook quản lý Stagger Entrance cho danh sách cards với dọn dẹp DOM an toàn
 */
export const useGsapStaggerEntrance = (
  containerRef: React.RefObject<HTMLElement>,
  itemClass: string,
  dependencies: any[] = []
) => {
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const items = containerRef.current?.querySelectorAll(itemClass);
      if (items && items.length > 0) {
        gsap.fromTo(
          items,
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.04,
            duration: 0.35,
            ease: 'power2.out',
            clearProps: 'transform,opacity'
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, dependencies);
};
