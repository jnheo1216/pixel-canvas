import * as React from 'react';

/** pixel click area ratio setting component */
export default function AvailableClickRatioSlider({
  availableClickRatio,
  setAvailableClickRatio,
}: {
  availableClickRatio: number;
  setAvailableClickRatio: React.Dispatch<React.SetStateAction<number>>;
}) {
  /** ratio change handler */
  const handleRatioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvailableClickRatio(parseFloat(e.target.value));
  };

  return (
    <div className="flex justify-center">
      <div className="">
        <input
          type="range"
          min="0.02"
          max="0.4"
          step="0.01"
          value={availableClickRatio}
          onChange={handleRatioChange}
          className="slider"
        />
        <div className="text-center">Ratio: {availableClickRatio}</div>
      </div>
    </div>
  );
}
