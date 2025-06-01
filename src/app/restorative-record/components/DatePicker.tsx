import React, { useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface DatePickerProps {
  value: string;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  label: string;
}

export const DatePickerField: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "mm/dd/yyyy",
  required = false,
  disabled = false,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDateChange = (date: Date | undefined) => {
    onChange(date);
    setIsOpen(false);
  };

  return (
    <div>
      <label className="block font-medium text-black mb-2">
        {label} {required && "*"}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          value={value}
          readOnly
          className="border border-gray-200 px-4 py-2 rounded-lg w-full pr-10 cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          placeholder={placeholder}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-black transition-colors"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          tabIndex={-1}
          disabled={disabled}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3.75 7.5h16.5M4.5 21h15a.75.75 0 00.75-.75V7.5a.75.75 0 00-.75-.75h-15a.75.75 0 00-.75.75v12.75c0 .414.336.75.75.75z"
            />
          </svg>
        </button>
        {isOpen && !disabled && (
          <div className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg left-0">
            <DayPicker
              mode="single"
              selected={value ? new Date(value) : undefined}
              onSelect={handleDateChange}
              initialFocus
            />
          </div>
        )}
      </div>
    </div>
  );
};
