'use client';
import React, { useState } from 'react';

import DrawingLayer from '../drawingLayer/DrawingLayer';
import ColorPick from '../controller/ColorPick';
import AvailableClickRatioSlider from '../controller/AvailableClickRatioSlider';

/** canvas set component */
export default function Canvas() {
  /** selected color */
  const [selectedColor, setSelectedColor] = useState<string>('#CECECE');
  /** available click area ratio (0.02 ~ 0.4) */
  const [availableClickRatio, setAvailableClickRatio] = useState<number>(0.12);

  // TODO: DrawingLayer를 여러겹으로 구조 개선 예정
  return (
    <>
      <section className="flex items-center justify-evenly p-24">
        <ColorPick selectedColor={selectedColor} setSelectedColor={setSelectedColor} />
        <DrawingLayer selectedColor={selectedColor} availableClickRatio={availableClickRatio} />
      </section>
      <AvailableClickRatioSlider
        availableClickRatio={availableClickRatio}
        setAvailableClickRatio={setAvailableClickRatio}
      />
    </>
  );
}
